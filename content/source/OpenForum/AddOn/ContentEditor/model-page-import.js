/*
* ContentEditorPageImport
* Turns an existing OpenForum page's rendered HTML (page.html.fragment)
* into the content for a Content Editor template, for the PageConverter
* (importing older pages into the editor).
*
* Plain string code with its own small HTML parser, so the same conversion
* runs in node tests, in the browser and on the server (Rhino has no DOM).
* The rich text it produces keeps to the editor's own allowlist (see
* cleanRichText in page.js), and everything left out is listed in a report
* so nothing disappears silently.
*
* convert({ html, title, pageName }, templateId)
*   -> { content: createPage content, slug, report: [ text ] }
*/
var ContentEditorPageImport = (function() {

  var VOID = { area: 1, base: 1, br: 1, col: 1, embed: 1, hr: 1, img: 1, input: 1, link: 1, meta: 1, param: 1, source: 1, track: 1, wbr: 1 };
  // Dropped with everything inside them.
  var DROP = { script: 1, style: 1, iframe: 1, object: 1, embed: 1, noscript: 1, template: 1, svg: 1, canvas: 1, video: 1, audio: 1,
    form: 1, button: 1, select: 1, textarea: 1, input: 1, nav: 1, head: 1, title: 1, link: 1, meta: 1 };
  var BLOCK = { p: 1, div: 1, h1: 1, h2: 1, h3: 1, h4: 1, h5: 1, h6: 1, ul: 1, ol: 1, li: 1, blockquote: 1, pre: 1, table: 1,
    section: 1, article: 1, header: 1, footer: 1, aside: 1, main: 1, center: 1, dl: 1, dt: 1, dd: 1, tr: 1, td: 1, th: 1, figure: 1, figcaption: 1,
    html: 1, body: 1 }; // html and body: pasted clipboard HTML (CON-T-053) comes as a whole document
  var INLINE_KEEP = { strong: "strong", b: "strong", em: "em", i: "em", a: "a", br: "br" };
  var SAFE_HREF = /^(https?:\/\/|mailto:|\/)/i;
  // OpenForum marks links to pages that do not exist yet with an editor link.
  var MISSING_PAGE_LINK = /^\/OpenForum\/Editor\?/i;
  var SLUG_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;

  // --- Parsing ------------------------------------------------------------------

  function parseAttributes( text ) {
    var attributes = {}, pattern = /([^\s=\/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g, match;
    while( ( match = pattern.exec( text ) ) ) {
      attributes[ match[ 1 ].toLowerCase() ] = match[ 2 ] !== undefined ? match[ 2 ] : match[ 3 ] !== undefined ? match[ 3 ] : match[ 4 ] !== undefined ? match[ 4 ] : "";
    }
    return attributes;
  }

  // A forgiving tree builder: unknown nesting is tolerated, unclosed tags are
  // closed at the end, and a new block closes an open paragraph.
  function parse( html ) {
    var root = { tag: "#root", children: [] }, stack = [ root ];
    var pattern = /<!--[\s\S]*?-->|<\/?([A-Za-z][A-Za-z0-9-]*)([^>]*)>|[^<]+|</g, match;
    function current() { return stack[ stack.length - 1 ]; }
    function closeTo( tag ) {
      for( var i = stack.length - 1; i > 0; i-- ) {
        if( stack[ i ].tag === tag ) { stack.length = i; return true; }
      }
      return false;
    }
    while( ( match = pattern.exec( html ) ) ) {
      var token = match[ 0 ];
      if( token.indexOf( "<!--" ) === 0 ) continue;
      if( !match[ 1 ] ) { current().children.push( { text: token === "<" ? "&lt;" : token } ); continue; }
      var tag = match[ 1 ].toLowerCase();
      if( token.charAt( 1 ) === "/" ) { closeTo( tag ); continue; }
      if( DROP[ tag ] && !VOID[ tag ] && !/\/\s*$/.test( match[ 2 ] ) ) {
        // Skip to the matching close tag, content and all.
        var end = new RegExp( "</" + tag + "\\s*>", "ig" );
        end.lastIndex = pattern.lastIndex;
        var found = end.exec( html );
        pattern.lastIndex = found ? end.lastIndex : html.length;
        current().children.push( { tag: tag, dropped: true, children: [] } );
        continue;
      }
      if( BLOCK[ tag ] && tag !== "li" ) {
        for( var i = stack.length - 1; i > 0; i-- ) {
          if( stack[ i ].tag === "p" ) { stack.length = i; break; }
          if( BLOCK[ stack[ i ].tag ] ) break;
        }
      }
      if( tag === "li" ) {
        for( var j = stack.length - 1; j > 0; j-- ) {
          if( stack[ j ].tag === "li" ) { stack.length = j; break; }
          if( stack[ j ].tag === "ul" || stack[ j ].tag === "ol" ) break;
        }
      }
      var node = { tag: tag, attributes: parseAttributes( match[ 2 ] ), children: [] };
      current().children.push( node );
      if( !VOID[ tag ] && !/\/\s*$/.test( match[ 2 ] ) ) stack.push( node );
    }
    return root;
  }

  // --- Cleaning -----------------------------------------------------------------

  function textOf( node ) {
    if( node.text !== undefined ) return node.text;
    return ( node.children || [] ).map( textOf ).join( "" );
  }

  function plain( html ) {
    return String( html || "" ).replace( /<[^>]*>/g, "" ).replace( /&nbsp;/g, " " ).replace( /&amp;/g, "&" ).replace( /&lt;/g, "<" ).replace( /&gt;/g, ">" ).replace( /&quot;/g, "\"" ).replace( /&#39;/g, "'" ).replace( /\s+/g, " " ).trim();
  }

  function escapeAttribute( value ) {
    return String( value ).replace( /&(?![a-zA-Z#][a-zA-Z0-9]*;)/g, "&amp;" ).replace( /"/g, "&quot;" ).replace( /</g, "&lt;" );
  }

  // Walks the tree into a flat list of top-level blocks:
  // { kind: "heading", level, text } or { kind: "html", tag, html }.
  function toBlocks( root, report, images ) {
    var blocks = [], counts = {};
    function note( key ) { counts[ key ] = ( counts[ key ] || 0 ) + 1; }

    function inline( node ) {
      if( node.text !== undefined ) return node.text.replace( /\s+/g, " " );
      if( node.dropped ) { note( node.tag ); return ""; }
      if( node.tag === "img" ) { images.push( node.attributes ); return ""; }
      var inner = node.children.map( inline ).join( "" );
      var keep = INLINE_KEEP[ node.tag ];
      if( node.tag === "a" ) {
        var href = node.attributes.href || "";
        if( MISSING_PAGE_LINK.test( href ) ) { note( "link to a page that does not exist" ); return inner; }
        if( !SAFE_HREF.test( href ) ) { if( href && href.charAt( 0 ) !== "#" ) note( "link that is not a site path or web address" ); return inner; }
        return inner ? "<a href=\"" + escapeAttribute( href ) + "\">" + inner + "</a>" : "";
      }
      if( keep === "br" ) return "<br>";
      if( keep ) return inner.trim() ? "<" + keep + ">" + inner + "</" + keep + ">" : inner;
      if( BLOCK[ node.tag ] ) return " " + inner + " ";
      return inner;
    }

    var paragraph = "";
    function flush() {
      var html = paragraph.replace( /^(\s|<br>)+|(\s|<br>)+$/g, "" );
      if( plain( html ) ) blocks.push( { kind: "html", tag: "p", html: "<p>" + html + "</p>" } );
      paragraph = "";
    }

    function list( node ) {
      var items = node.children.filter( function( child ) { return child.tag === "li"; } ).map( function( li ) {
        var nested = "";
        var own = li.children.filter( function( child ) {
          if( child.tag === "ul" || child.tag === "ol" ) { nested += list( child ); return false; }
          return true;
        } ).map( inline ).join( "" ).trim();
        return own || nested ? "<li>" + own + nested + "</li>" : "";
      } ).join( "" );
      return items ? "<" + node.tag + ">" + items + "</" + node.tag + ">" : "";
    }

    function block( node ) {
      if( node.text !== undefined ) { paragraph += node.text.replace( /\s+/g, " " ); return; }
      if( node.dropped ) { note( node.tag ); return; }
      var tag = node.tag;
      if( /^h[1-6]$/.test( tag ) ) {
        flush();
        var text = plain( node.children.map( inline ).join( "" ) );
        if( text ) blocks.push( { kind: "heading", level: Number( tag.charAt( 1 ) ), text: text } );
        return;
      }
      if( tag === "p" ) { flush(); paragraph = node.children.map( inline ).join( "" ); flush(); return; }
      if( tag === "ul" || tag === "ol" ) { flush(); var html = list( node ); if( html ) blocks.push( { kind: "html", tag: tag, html: html } ); return; }
      if( tag === "blockquote" ) {
        flush();
        var quote = plain( node.children.map( inline ).join( "" ) ) ? node.children.map( inline ).join( "" ).trim() : "";
        if( quote ) blocks.push( { kind: "html", tag: "blockquote", html: "<blockquote>" + quote + "</blockquote>" } );
        return;
      }
      if( tag === "pre" ) { flush(); note( "preformatted block (kept as a paragraph)" ); paragraph = textOf( node ).replace( /\n/g, "<br>" ); flush(); return; }
      if( tag === "table" ) { note( "table (kept as paragraphs)" ); }
      if( tag === "hr" ) { flush(); note( "horizontal rule" ); return; }
      if( tag === "img" ) { images.push( node.attributes ); return; }
      if( BLOCK[ tag ] || tag === "tbody" || tag === "thead" ) {
        flush();
        node.children.forEach( block );
        flush();
        return;
      }
      // An inline wrapper around blocks (Google Docs wraps a whole paste in
      // one <b>) is a container, not one long bold paragraph.
      if( node.children.some( function( child ) { return child.tag && BLOCK[ child.tag ]; } ) ) {
        flush();
        node.children.forEach( block );
        flush();
        return;
      }
      paragraph += inline( node );
    }

    root.children.forEach( block );
    flush();
    Object.keys( counts ).forEach( function( key ) {
      report.push( "Left out " + counts[ key ] + " " + key + ( counts[ key ] === 1 ? "" : " items" ) );
    } );
    return blocks;
  }

  // --- Mapping onto a template --------------------------------------------------

  function htmlOf( blocks, levelFor ) {
    return blocks.map( function( b ) {
      if( b.kind === "html" ) return b.html;
      return "<" + levelFor( b.level ) + ">" + escapeAttribute( b.text ).replace( /"/g, "&quot;" ) + "</" + levelFor( b.level ) + ">";
    } ).join( "" );
  }

  function slugFor( pageName ) {
    var last = String( pageName || "" ).split( "/" ).filter( function( s ) { return s; } ).pop() || "";
    if( SLUG_PATTERN.test( last ) ) return last;
    return last.replace( /[^A-Za-z0-9_-]+/g, "-" ).replace( /^[-_]+|-+$/g, "" ) || "imported-page";
  }

  function convert( source, templateId ) {
    var report = [], images = [];
    var html = String( source.html || "" );
    var blocks = toBlocks( parse( html ), report, images );

    // The title: the page's own title, else its first heading, else its name.
    var title = plain( source.title || "" );
    var firstHeading = blocks.length && blocks[ 0 ].kind === "heading" ? blocks[ 0 ] : null;
    if( !title && firstHeading ) title = firstHeading.text;
    if( !title ) title = slugFor( source.pageName ).replace( /[-_]+/g, " " );
    if( firstHeading && firstHeading.text.toLowerCase() === title.toLowerCase() ) blocks.shift();

    // Heading levels: the biggest in the body becomes a section heading
    // (h2), every smaller one an h3 - the two the rich text allows.
    var levels = blocks.filter( function( b ) { return b.kind === "heading"; } ).map( function( b ) { return b.level; } );
    var top = levels.length ? Math.min.apply( null, levels ) : 2;
    function levelFor( level ) { return level === top ? "h2" : "h3"; }

    // The first image with a usable address becomes the cover; the rest
    // wait for the image library.
    var cover = null;
    images.forEach( function( attributes ) {
      if( !cover && attributes.src && SAFE_HREF.test( attributes.src ) ) cover = attributes;
    } );
    if( cover ) report.push( "Used the first image (" + cover.src + ") as the cover image" );
    var leftImages = images.length - ( cover ? 1 : 0 );
    if( leftImages > 0 ) report.push( "Left out " + leftImages + " other image" + ( leftImages === 1 ? "" : "s" ) + " - add them again once the image library arrives (CON-T-020/021)" );

    var content = {
      title: title,
      standfirst: "<p></p>",
      heroUrl: cover ? cover.src : "",
      heroAlt: cover ? plain( cover.alt || "" ) : "",
      heroDecorative: false,
      metadata: {}
    };
    if( templateId === "blog-article" ) {
      content.bodyHtml = htmlOf( blocks, levelFor ) || "<p></p>";
    } else {
      var intro = [], sections = [], section = null;
      blocks.forEach( function( b ) {
        if( b.kind === "heading" && b.level === top ) {
          section = { heading: b.text, blocks: [] };
          sections.push( section );
        } else if( section ) {
          section.blocks.push( b );
        } else {
          intro.push( b );
        }
      } );
      content.introHtml = htmlOf( intro, levelFor ) || "<p></p>";
      content.sections = sections.map( function( s ) { return { heading: s.heading, html: htmlOf( s.blocks, levelFor ) || "<p></p>" }; } );
      report.push( "Made " + sections.length + " section" + ( sections.length === 1 ? "" : "s" ) + " from the page's headings" );
      report.push( "The call to action panel is new: give it a link before publishing" );
    }
    if( !plain( html ) ) report.push( "The page had no rendered content to import" );
    report.push( "Write a standfirst and a summary - older pages have neither" );
    return { content: content, slug: slugFor( source.pageName ), report: report };
  }

  // CON-T-053: HTML pasted into a rich-text field, cleaned with the same
  // rules as an import: headings (h1 and h2 become h2, the rest h3),
  // paragraphs, lists, quotes, bold, italic, safe links and line breaks.
  // Scripts, styles, event handlers, unsafe links and foreign formatting
  // are dropped; images are left out (they need a description, so they are
  // added with Image). A single paragraph pastes inline.
  // -> { html, report: [ what was left out ] }
  function cleanPaste( html ) {
    var report = [], images = [];
    var blocks = toBlocks( parse( String( html || "" ) ), report, images );
    if( images.length ) report.push( "Left out " + images.length + " image" + ( images.length === 1 ? "" : "s" ) + "; add images with Image instead" );
    var out = htmlOf( blocks, function( level ) { return level <= 2 ? "h2" : "h3"; } );
    if( blocks.length === 1 && blocks[ 0 ].kind === "html" && blocks[ 0 ].tag === "p" ) out = out.replace( /^<p>|<\/p>$/g, "" );
    return { html: out, report: report };
  }

  var api = {
    parse: parse,
    convert: convert,
    cleanPaste: cleanPaste,
    slugFor: slugFor
  };

  if( typeof module !== "undefined" && module.exports ) module.exports = api;
  if( typeof window !== "undefined" ) window.ContentEditorPageImport = api;
  return api;
})();
