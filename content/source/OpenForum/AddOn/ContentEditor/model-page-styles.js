/*
* ContentEditorPageStyles
* Works out a real page's applicable styling for the isolated canvas
* (CON-T-007, FR-EDIT-001, section 7.3): the stylesheets and template
* style blocks from the page's own rendered page.html, plus the template
* wrapper elements that sit around its content, so selectors like
* ".row .columns p" still match inside the canvas.
*
* Only the page's own site is trusted for styles: a stylesheet from any
* other origin is dropped here and is also blocked by the canvas CSP built
* by buildCanvasCsp(), so the two checks back each other up. Nothing from
* page.html is executed - extract() reads a DOMParser document, which never
* runs scripts, and only copies stylesheet URLs, style text and a small set
* of wrapper attributes out of it.
*
* The pure helpers (resolveStylesheetUrl, buildCanvasCsp, escapeStyleText,
* filterWrapperAttributes, buildWrapperHtml) are covered by
* page-styles.test.js; extract() needs a real DOM and is checked in the
* browser via ?selftest=pagestyles.
*/
var ContentEditorPageStyles = (function() {

  var CONTENT_START_MARKER = "PageContent Start";

  // Wrapper elements are rebuilt as plain containers only. Anything else
  // in the chain (a form, a table cell) becomes a div with the same class.
  var WRAPPER_TAGS = [ "div", "main", "section", "article", "header", "footer", "aside", "nav", "span" ];

  // Attributes copied onto rebuilt html/body/wrapper elements. Event
  // handlers, src/href and data-* are never copied.
  var WRAPPER_ATTRIBUTES = [ "class", "id", "style", "lang", "dir", "role" ];

  // Returns the absolute URL of an allowed stylesheet, or null if it is not
  // on the page's own origin (or is not an http(s) URL at all).
  function resolveStylesheetUrl( href, baseUrl, origin ) {
    if( !href ) return null;
    var url;
    try {
      url = new URL( href, baseUrl );
    } catch( e ) {
      return null;
    }
    if( url.protocol !== "https:" && url.protocol !== "http:" ) return null;
    if( url.origin !== origin ) return null;
    return url.href;
  }

  function buildCanvasCsp( origin, nonce ) {
    return "default-src 'none'; " +
      "img-src " + origin + " https: data:; " +
      "style-src " + origin + " 'unsafe-inline'; " +
      "font-src " + origin + " https: data:; " +
      "script-src 'nonce-" + nonce + "'; " +
      "script-src-attr 'none'; " +
      "object-src 'none'; " +
      "base-uri " + origin + ";";
  }

  // Style text is put back inside a <style> element, so it must not be able
  // to close that element early.
  function escapeStyleText( text ) {
    return ( "" + ( text || "" ) ).replace( /<\/(style)/gi, "<\\/$1" );
  }

  function escapeAttribute( value ) {
    return ( "" + value )
      .replace( /&/g, "&amp;" )
      .replace( /"/g, "&quot;" )
      .replace( /</g, "&lt;" )
      .replace( />/g, "&gt;" );
  }

  // attributes: [{name, value}] -> only the allowed ones, names lower-cased.
  function filterWrapperAttributes( attributes ) {
    var kept = [];
    for( var i = 0; i < ( attributes || [] ).length; i++ ) {
      var name = ( "" + attributes[ i ].name ).toLowerCase();
      if( WRAPPER_ATTRIBUTES.indexOf( name ) === -1 ) continue;
      kept.push( { name: name, value: "" + attributes[ i ].value } );
    }
    return kept;
  }

  function attributesToHtml( attributes ) {
    var html = "";
    var kept = filterWrapperAttributes( attributes );
    for( var i = 0; i < kept.length; i++ ) {
      html += " " + kept[ i ].name + "=\"" + escapeAttribute( kept[ i ].value ) + "\"";
    }
    return html;
  }

  // chain: [{tag, attributes}] outermost first (body's children down to the
  // element that directly holds the content). Returns {open, close}.
  function buildWrapperHtml( chain ) {
    var open = "";
    var close = "";
    for( var i = 0; i < ( chain || [] ).length; i++ ) {
      var tag = ( "" + chain[ i ].tag ).toLowerCase();
      if( WRAPPER_TAGS.indexOf( tag ) === -1 ) tag = "div";
      open += "<" + tag + attributesToHtml( chain[ i ].attributes ) + ">";
      close = "</" + tag + ">" + close;
    }
    return { open: open, close: close };
  }

  function findContentMarker( doc ) {
    var walker = doc.createTreeWalker( doc.body, 128 /* NodeFilter.SHOW_COMMENT */ );
    var node;
    while( ( node = walker.nextNode() ) ) {
      if( node.nodeValue.indexOf( CONTENT_START_MARKER ) !== -1 ) return node;
    }
    return null;
  }

  function copyAttributes( element ) {
    var list = [];
    for( var i = 0; i < element.attributes.length; i++ ) {
      list.push( { name: element.attributes[ i ].name, value: element.attributes[ i ].value } );
    }
    return list;
  }

  // doc: a DOMParser document of the page's page.html.
  // pageUrl: the page's own URL (used to resolve relative hrefs).
  // origin: the only origin stylesheets may come from.
  function extract( doc, pageUrl, origin ) {
    var result = {
      styles: [],
      dropped: [],
      htmlAttributes: filterWrapperAttributes( copyAttributes( doc.documentElement ) ),
      bodyAttributes: doc.body ? filterWrapperAttributes( copyAttributes( doc.body ) ) : [],
      wrapperChain: [],
      foundContentMarker: false
    };

    // Document order matters for the cascade, so links and style blocks are
    // collected in a single pass and kept in one ordered list.
    var nodes = doc.querySelectorAll( "link[rel~='stylesheet'], style" );
    for( var i = 0; i < nodes.length; i++ ) {
      var node = nodes[ i ];
      if( node.tagName.toLowerCase() === "style" ) {
        result.styles.push( { type: "inline", text: node.textContent } );
        continue;
      }
      var href = node.getAttribute( "href" );
      var resolved = resolveStylesheetUrl( href, pageUrl, origin );
      if( resolved === null ) {
        result.dropped.push( href );
        continue;
      }
      result.styles.push( { type: "link", href: resolved, media: node.getAttribute( "media" ) || "" } );
    }

    var marker = doc.body ? findContentMarker( doc ) : null;
    if( marker ) {
      result.foundContentMarker = true;
      var chain = [];
      for( var element = marker.parentNode; element && element !== doc.body; element = element.parentNode ) {
        chain.unshift( { tag: element.tagName, attributes: copyAttributes( element ) } );
      }
      result.wrapperChain = chain;
    }
    return result;
  }

  // Builds the <head> style tags for an extract() result.
  function buildHeadHtml( extracted ) {
    var html = "";
    var styles = ( extracted && extracted.styles ) || [];
    for( var i = 0; i < styles.length; i++ ) {
      if( styles[ i ].type === "link" ) {
        html += "<link rel=\"stylesheet\" href=\"" + escapeAttribute( styles[ i ].href ) + "\"" +
          ( styles[ i ].media ? " media=\"" + escapeAttribute( styles[ i ].media ) + "\"" : "" ) + ">";
      } else {
        html += "<style>" + escapeStyleText( styles[ i ].text ) + "</style>";
      }
    }
    return html;
  }

  var api = {
    CONTENT_START_MARKER: CONTENT_START_MARKER,
    resolveStylesheetUrl: resolveStylesheetUrl,
    buildCanvasCsp: buildCanvasCsp,
    escapeStyleText: escapeStyleText,
    filterWrapperAttributes: filterWrapperAttributes,
    attributesToHtml: attributesToHtml,
    buildWrapperHtml: buildWrapperHtml,
    buildHeadHtml: buildHeadHtml,
    extract: extract
  };

  if( typeof module !== "undefined" && module.exports ) module.exports = api;
  if( typeof window !== "undefined" ) window.ContentEditorPageStyles = api;
  return api;
})();
