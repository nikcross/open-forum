/*
* ContentEditorExistingHtml
* An existing site page's own markup, kept intact (PHW-T-002): the page's
* classes, ids, images, forms and &insert: parts stay exactly as they are,
* so a hand-written page keeps its design in the editor and when it is
* published again.
*
* It is cleaned for safety, not reshaped: scripts, styles, frames and other
* active tags are removed, as are inline event handlers and javascript:,
* vbscript: or non-image data: addresses. External <script src> tags of
* the original page are returned separately as protected page scripts; the
* editor never runs or edits them and publishes them back unchanged.
* Characters that start OpenForum wiki markup ([ and (() are written as
* character references, so the site's page renderer leaves the markup
* alone on servers whose renderer has no no-markup block.
*
* Plain string code with no DOM, so the same rules run in node tests, in
* the browser and on the server (Rhino).
*
* clean(html) -> { html, scripts: [ src ], report: [ text ] }
* inserts(html) -> [ path ]                  the &insert: parts, in order
* forCanvas(html, fragments) -> html          &insert: parts expanded
* fromCanvas(html) -> html                    expanded parts back to &insert:
*/
var ContentEditorExistingHtml = (function() {

  // Removed with everything inside them.
  var DROP_WITH_CONTENT = { script: 1, style: 1, iframe: 1, object: 1, embed: 1, noscript: 1, template: 1, frameset: 1, frame: 1, applet: 1, title: 1 };
  // Removed, content kept (they have no closing tag or no content).
  var DROP_TAG = { base: 1, meta: 1, link: 1, html: 1, head: 1, body: 1 };
  var URL_ATTRIBUTES = { href: 1, src: 1, action: 1, formaction: 1, poster: 1, "xlink:href": 1, background: 1, cite: 1, data: 1 };
  var SAFE_SCRIPT_SRC = /^(https:\/\/[^\s"'<>]+|\/[A-Za-z0-9_\-\/.]+(\?[^\s"'<>]*)?)$/;
  var INSERT = /&insert:(\/[A-Za-z0-9_\-\/.]+);/g;
  var CANVAS_START = "<!--ce-insert:";
  var CANVAS_END = "<!--/ce-insert-->";

  function count( report, key ) { report[ key ] = ( report[ key ] || 0 ) + 1; }

  // [ and (( would become wiki links and paragraphs; HTML decodes the
  // character references back, in text and in attribute values alike.
  function wikiSafe( text ) {
    return String( text ).replace( /\[/g, "&#91;" ).replace( /\(\(/g, "&#40;&#40;" );
  }

  function unsafeUrl( value ) {
    var compact = String( value || "" ).replace( /[\u0000- ]+/g, "" ).replace( /&#(x0*9|0*9|x0*a|0*10|x0*d|0*13);?/gi, "" ).toLowerCase();
    if( /^(javascript|vbscript|livescript):/.test( compact ) ) return true;
    if( /^data:/.test( compact ) && !/^data:image\/(png|jpe?g|gif|webp);/.test( compact ) ) return true;
    return false;
  }

  // Rewrites one start tag's attributes; returns the cleaned attribute text.
  function cleanAttributes( text, report ) {
    var out = "";
    var pattern = /([^\s=\/>"']+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/g, match;
    while( ( match = pattern.exec( text ) ) ) {
      var name = match[ 1 ], lower = name.toLowerCase();
      var raw = match[ 2 ];
      var value = raw === undefined ? null : raw.replace( /^["']|["']$/g, "" );
      if( /^on/.test( lower ) ) { count( report, "event handler attribute" ); continue; }
      if( lower === "srcdoc" ) { count( report, "srcdoc attribute" ); continue; }
      if( lower === "style" && value !== null && /expression\s*\(|javascript\s*:|url\s*\(\s*['"]?\s*javascript/i.test( value ) ) { count( report, "unsafe style attribute" ); continue; }
      if( URL_ATTRIBUTES[ lower ] && value !== null && unsafeUrl( value ) ) { count( report, "unsafe address" ); continue; }
      out += " " + name + ( value === null ? "" : "=\"" + wikiSafe( value.replace( /"/g, "&quot;" ) ) + "\"" );
    }
    return out;
  }

  function clean( html ) {
    var source = String( html || "" );
    var counts = {};
    var scripts = [];
    var out = "";
    var pattern = /<!--[\s\S]*?-->|<\/?([A-Za-z][A-Za-z0-9:-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>|[^<]+|</g, match;
    while( ( match = pattern.exec( source ) ) ) {
      var token = match[ 0 ];
      // Comments are kept unless they could turn into wiki markup or hide
      // old conditional markup.
      if( token.indexOf( "<!--" ) === 0 ) {
        if( /\[|\(\(/.test( token ) ) count( counts, "comment" ); else out += token;
        continue;
      }
      if( !match[ 1 ] ) { out += wikiSafe( token === "<" ? "&lt;" : token ); continue; }
      var tag = match[ 1 ].toLowerCase(), closing = token.charAt( 1 ) === "/";
      if( DROP_WITH_CONTENT[ tag ] ) {
        if( closing ) continue;
        if( tag === "script" ) {
          var src = ( /\ssrc\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i.exec( match[ 2 ] ) || [] );
          var value = src[ 2 ] || src[ 3 ] || src[ 4 ] || "";
          if( value && SAFE_SCRIPT_SRC.test( value ) && !unsafeUrl( value ) ) scripts.push( value );
          else count( counts, "inline or unsafe script" );
        } else {
          count( counts, tag + " block" );
        }
        if( !/\/\s*$/.test( match[ 2 ] ) ) {
          var end = new RegExp( "</" + tag + "\\s*>", "ig" );
          end.lastIndex = pattern.lastIndex;
          var found = end.exec( source );
          pattern.lastIndex = found ? end.lastIndex : source.length;
        }
        continue;
      }
      if( DROP_TAG[ tag ] ) { if( !closing && tag !== "html" && tag !== "head" && tag !== "body" ) count( counts, tag + " tag" ); continue; }
      if( closing ) { out += "</" + match[ 1 ] + ">"; continue; }
      // A tag that needs no change is kept exactly as written, so a page
      // that is already safe comes back byte for byte.
      var before = JSON.stringify( counts );
      var selfClosing = /\/\s*$/.test( match[ 2 ] );
      var rebuilt = "<" + match[ 1 ] + cleanAttributes( match[ 2 ].replace( /\/\s*$/, "" ), counts ) + ( selfClosing ? " />" : ">" );
      out += JSON.stringify( counts ) === before && !/\[|\(\(/.test( token ) ? token : rebuilt;
    }
    var reportList = Object.keys( counts ).map( function( key ) {
      return "Removed " + counts[ key ] + " " + key + ( counts[ key ] === 1 ? "" : "s" );
    } );
    return { html: out, scripts: scripts, report: reportList };
  }

  function inserts( html ) {
    var found = [], match;
    INSERT.lastIndex = 0;
    while( ( match = INSERT.exec( String( html || "" ) ) ) ) found.push( match[ 1 ] );
    return found;
  }

  // fragments: { path: cleaned fragment html } (missing ones show a note).
  // Each part is wrapped in marker comments so fromCanvas can put the
  // directive back, whatever the fragment's own markup is.
  function forCanvas( html, fragments ) {
    fragments = fragments || {};
    return String( html || "" ).replace( INSERT, function( all, path ) {
      var inner = fragments.hasOwnProperty( path ) ? fragments[ path ] : "<em>" + path + "</em>";
      return CANVAS_START + path + "--><div class=\"ce-insert\" data-insert=\"" + path + "\" contenteditable=\"false\">" + inner + "</div>" + CANVAS_END;
    } );
  }

  function fromCanvas( html ) {
    var text = String( html || "" ), out = "", at = 0;
    while( true ) {
      var start = text.indexOf( CANVAS_START, at );
      if( start === -1 ) break;
      var close = text.indexOf( "-->", start );
      var end = text.indexOf( CANVAS_END, close );
      if( close === -1 || end === -1 ) break;
      out += text.substring( at, start ) + "&insert:" + text.substring( start + CANVAS_START.length, close ) + ";";
      at = end + CANVAS_END.length;
    }
    out += text.substring( at );
    // A part whose markers were lost while editing is dropped, not kept as
    // a copy of the fragment.
    return out.replace( /<div class="ce-insert"[^>]*data-insert="[^"]*"[^>]*>[\s\S]*?<\/div>/g, "" );
  }

  var api = {
    clean: clean,
    inserts: inserts,
    forCanvas: forCanvas,
    fromCanvas: fromCanvas,
    wikiSafe: wikiSafe
  };

  if( typeof module !== "undefined" && module.exports ) module.exports = api;
  if( typeof window !== "undefined" ) window.ContentEditorExistingHtml = api;
  return api;
})();
