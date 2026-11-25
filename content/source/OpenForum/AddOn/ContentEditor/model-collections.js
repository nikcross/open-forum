/*
* ContentEditorCollections
* Repeating items in an existing page's own markup (CON-T-056): a slideshow,
* a row of panels, a list of team members. The editor stays generic: it
* knows only "a collection of items, each with text, image and link
* fields". Each site says in its content-editor-site.json where its
* collections are and how their fields map to the markup:
*
*   "collections": [ { "id": "home-slides", "name": "Home page slideshow",
*     "pages": [ "/PowisHughes" ], "container": ".cycle-slideshow",
*     "item": "div.slide",
*     "fields": { "image": { "type": "image", "from": "style:background-image" },
*                 "heading": { "type": "text", "selector": "h1" },
*                 "link": { "type": "link", "selector": "a.slide-link" } },
*     "min": 1, "max": 10, "canvas": "one" } ]
*
* "canvas": "one" shows one item at a time in the canvas, as a slideshow's
* own script would; the default, "all", shows the items as the page lays
* them out (a row of panels).
*
* Items are found and changed in the markup string itself, so everything
* else in the page (its classes, data- attributes and the site's own
* scripts that animate it) stays exactly as it was.
*
* Selectors are a small CSS subset: tag, .class, #id and combinations
* (div.slide), joined by spaces (descendant) or > (child).
*
* Plain string code with no DOM, so the same rules run in node tests and
* in the browser.
*
* validateDefinitions(list) -> [ problem ]
* forPage(config, publicPath) -> [ definition ]   valid ones for that page
* forPart(config, path) -> [ definition ]         valid ones for a shared part ("parts": [ path ])
* find(html, definition) -> null | { items: [ { index, text, fields: { name: field } } ] }
*     field: { type, value, editable }  (link value { href, text })
* setField(html, definition, index, name, value) -> html
* moveItem(html, definition, from, to) / removeItem / duplicateItem -> html
* canvasCss(html, definition, shown) -> css showing only item "shown" ("canvas": "one")
*/
var ContentEditorCollections = (function() {

  var VOID = { area: 1, base: 1, br: 1, col: 1, embed: 1, hr: 1, img: 1, input: 1, link: 1, meta: 1, param: 1, source: 1, track: 1, wbr: 1 };
  var FIELD_TYPES = [ "text", "link", "image" ];
  var COMPOUND = /^([a-zA-Z][a-zA-Z0-9-]*)?((?:[.#][A-Za-z_][A-Za-z0-9_-]*)*)$/;

  // --- A small element tree with offsets into the markup -----------------

  function parse( html ) {
    var root = { tag: "#root", attrs: {}, start: 0, openEnd: 0, closeStart: html.length, end: html.length, children: [], parent: null };
    var current = root;
    var pattern = /<!--[\s\S]*?-->|<(\/?)([A-Za-z][A-Za-z0-9:-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g, match;
    while( ( match = pattern.exec( html ) ) ) {
      if( !match[ 2 ] ) continue; // a comment
      var tag = match[ 2 ].toLowerCase();
      if( match[ 1 ] ) {
        // a closing tag closes the nearest open element with its name
        var open = current;
        while( open !== root && open.tag !== tag ) open = open.parent;
        if( open === root ) continue;
        while( current !== open ) { closeAt( current, match.index ); current = current.parent; }
        open.closeStart = match.index;
        open.end = pattern.lastIndex;
        current = open.parent;
        continue;
      }
      var node = { tag: tag, attrs: attributes( match[ 3 ] ), start: match.index, openEnd: pattern.lastIndex, closeStart: pattern.lastIndex, end: pattern.lastIndex, children: [], parent: current };
      current.children.push( node );
      if( !VOID[ tag ] && !/\/\s*$/.test( match[ 3 ] ) ) current = node;
    }
    while( current !== root ) { closeAt( current, html.length ); current = current.parent; }
    return root;
  }

  // An element left open ends where its parent closes.
  function closeAt( node, at ) { node.closeStart = at; node.end = at; }

  function attributes( text ) {
    var attrs = {}, pattern = /([^\s=\/>"']+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/g, match;
    while( ( match = pattern.exec( text ) ) ) {
      attrs[ match[ 1 ].toLowerCase() ] = match[ 2 ] === undefined ? "" : decode( match[ 2 ].replace( /^["']|["']$/g, "" ) );
    }
    return attrs;
  }

  function decode( text ) {
    return String( text ).replace( /&(#x[0-9a-f]+|#[0-9]+|amp|lt|gt|quot|apos|nbsp);/gi, function( all, code ) {
      var lower = code.toLowerCase();
      if( lower.charAt( 0 ) === "#" ) return String.fromCharCode( lower.charAt( 1 ) === "x" ? parseInt( lower.slice( 2 ), 16 ) : parseInt( lower.slice( 1 ), 10 ) );
      return { amp: "&", lt: "<", gt: ">", quot: "\"", apos: "'", nbsp: "\u00a0" }[ lower ];
    } );
  }

  function escapeText( text ) { return String( text ).replace( /&/g, "&amp;" ).replace( /</g, "&lt;" ).replace( />/g, "&gt;" ); }
  function escapeAttr( text ) { return escapeText( text ).replace( /"/g, "&quot;" ); }

  // --- Selectors -----------------------------------------------------------

  // "div.slide > a" -> [ { compound }, ">", { compound } ]; null if not in the subset.
  function parseSelector( selector ) {
    if( typeof selector !== "string" || !selector.trim() ) return null;
    var parts = selector.trim().replace( /\s*>\s*/g, " > " ).split( /\s+/ ), out = [];
    for( var i = 0; i < parts.length; i++ ) {
      if( parts[ i ] === ">" ) { if( !out.length || out[ out.length - 1 ] === ">" ) return null; out.push( ">" ); continue; }
      var match = COMPOUND.exec( parts[ i ] );
      if( !match || !( match[ 1 ] || match[ 2 ] ) ) return null;
      var compound = { tag: match[ 1 ] ? match[ 1 ].toLowerCase() : null, classes: [], id: null };
      ( match[ 2 ].match( /[.#][A-Za-z_][A-Za-z0-9_-]*/g ) || [] ).forEach( function( bit ) {
        if( bit.charAt( 0 ) === "." ) compound.classes.push( bit.slice( 1 ) ); else compound.id = bit.slice( 1 );
      } );
      out.push( compound );
    }
    return out[ out.length - 1 ] === ">" ? null : out;
  }

  function matchesCompound( node, compound ) {
    if( node.tag === "#root" ) return false;
    if( compound.tag && node.tag !== compound.tag ) return false;
    if( compound.id && node.attrs.id !== compound.id ) return false;
    var classes = ( " " + ( node.attrs[ "class" ] || "" ).replace( /\s+/g, " " ) + " " );
    for( var i = 0; i < compound.classes.length; i++ ) if( classes.indexOf( " " + compound.classes[ i ] + " " ) === -1 ) return false;
    return true;
  }

  // Matches right to left, never looking above "scope".
  function matches( node, parts, scope ) {
    var i = parts.length - 1;
    if( !matchesCompound( node, parts[ i ] ) ) return false;
    return matchesFrom( node, parts, i, scope );
  }

  function matchesFrom( node, parts, i, scope ) {
    if( i === 0 ) return true;
    var combinator = parts[ i - 1 ], target = parts[ i - 2 ];
    var up = node.parent;
    if( combinator === ">" ) {
      if( !up || up === scope || !matchesCompound( up, target ) ) return false;
      return matchesFrom( up, parts, i - 2, scope );
    }
    target = parts[ i - 1 ];
    for( ; up && up !== scope; up = up.parent ) {
      if( matchesCompound( up, target ) && matchesFrom( up, parts, i - 1, scope ) ) return true;
    }
    return false;
  }

  function queryAll( scope, parts ) {
    var found = [];
    ( function walk( node ) {
      node.children.forEach( function( child ) {
        if( matches( child, parts, scope ) ) found.push( child );
        walk( child );
      } );
    } )( scope );
    return found;
  }

  // --- Definitions ---------------------------------------------------------

  function validateDefinitions( list ) {
    var problems = [], ids = {};
    if( list === undefined ) return problems;
    if( !Array.isArray( list ) ) return [ "collections must be a list" ];
    list.forEach( function( def, n ) {
      var at = "collections[" + n + "]";
      if( !def || typeof def !== "object" ) { problems.push( at + " must be an object" ); return; }
      if( typeof def.id !== "string" || !/^[a-z0-9-]{1,60}$/.test( def.id ) ) problems.push( at + ".id must be lower-case letters, digits and hyphens" );
      else if( ids[ def.id ] ) problems.push( "collection id '" + def.id + "' is used twice" );
      else ids[ def.id ] = true;
      if( typeof def.name !== "string" || !def.name.trim() ) problems.push( at + ".name is required" );
      [ "pages", "parts" ].forEach( function( key ) {
        if( def[ key ] !== undefined && ( !Array.isArray( def[ key ] ) || def[ key ].some( function( p ) { return typeof p !== "string" || p.charAt( 0 ) !== "/"; } ) ) ) problems.push( at + "." + key + " must list site paths" );
      } );
      if( !parseSelector( def.container ) ) problems.push( at + ".container is not a supported selector" );
      if( !parseSelector( def.item ) ) problems.push( at + ".item is not a supported selector" );
      var fields = def.fields && typeof def.fields === "object" ? Object.keys( def.fields ) : [];
      if( !fields.length ) problems.push( at + ".fields must name at least one field" );
      fields.forEach( function( name ) {
        var field = def.fields[ name ] || {};
        if( FIELD_TYPES.indexOf( field.type ) === -1 ) problems.push( at + ".fields." + name + ".type must be text, link or image" );
        if( field.selector !== undefined && !parseSelector( field.selector ) ) problems.push( at + ".fields." + name + ".selector is not a supported selector" );
        if( field.from !== undefined && !/^(attr:[a-z][a-z0-9-]*|style:background-image)$/.test( field.from ) ) problems.push( at + ".fields." + name + ".from must be attr:<name> or style:background-image" );
      } );
      if( def.canvas !== undefined && def.canvas !== "one" && def.canvas !== "all" ) problems.push( at + ".canvas must be one or all" );
      [ "min", "max" ].forEach( function( key ) {
        if( def[ key ] !== undefined && !( typeof def[ key ] === "number" && def[ key ] >= 0 && def[ key ] % 1 === 0 ) ) problems.push( at + "." + key + " must be a whole number" );
      } );
    } );
    return problems;
  }

  function valid( config ) {
    var list = ( config && config.collections ) || [];
    if( !Array.isArray( list ) ) return [];
    return list.filter( function( def ) { return validateDefinitions( [ def ] ).length === 0; } );
  }

  // A definition with neither pages nor parts applies to every page.
  function forPage( config, publicPath ) {
    return valid( config ).filter( function( def ) {
      return def.pages ? def.pages.indexOf( publicPath ) !== -1 : !def.parts;
    } );
  }

  // CON-T-057: collections inside a shared part, named by its live path.
  function forPart( config, path ) {
    return valid( config ).filter( function( def ) { return !!def.parts && def.parts.indexOf( path ) !== -1; } );
  }

  // --- Finding items -------------------------------------------------------

  function locate( html, def ) {
    var root = parse( html );
    var container = queryAll( root, parseSelector( def.container ) )[ 0 ];
    if( !container ) return null;
    var itemParts = parseSelector( def.item );
    // Items are the container's own children that match the item selector.
    var items = container.children.filter( function( child ) { return matches( child, itemParts, container.parent ); } );
    return { root: root, container: container, items: items };
  }

  function fieldNode( item, field ) {
    if( !field.selector ) return item;
    return queryAll( item, parseSelector( field.selector ) )[ 0 ] || null;
  }

  function source( field ) { return field.from || ( field.type === "image" ? "attr:src" : null ); }

  function backgroundUrl( style ) {
    var match = /background-image\s*:\s*url\(\s*(['"]?)([^'")]*)\1\s*\)/i.exec( style || "" );
    return match ? match[ 2 ] : "";
  }

  function innerText( html, node ) { return decode( html.substring( node.openEnd, node.closeStart ).replace( /<[^>]*>/g, "" ) ).replace( /\s+/g, " " ).trim(); }
  function hasMarkup( html, node ) { return /</.test( html.substring( node.openEnd, node.closeStart ) ); }

  function readField( html, item, field ) {
    var node = fieldNode( item, field );
    if( !node ) return { type: field.type, value: field.type === "link" ? { href: "", text: "" } : "", editable: false, missing: true };
    if( field.type === "image" ) {
      var from = source( field );
      var value = from === "style:background-image" ? backgroundUrl( node.attrs.style ) : node.attrs[ from.slice( 5 ) ] || "";
      return { type: "image", value: value, editable: true };
    }
    if( field.type === "link" ) return { type: "link", value: { href: node.attrs.href || "", text: innerText( html, node ) }, editable: !hasMarkup( html, node ) };
    return { type: "text", value: innerText( html, node ), editable: !hasMarkup( html, node ) };
  }

  function find( html, def ) {
    html = String( html || "" );
    var found = locate( html, def );
    if( !found ) return null;
    return { items: found.items.map( function( item, index ) {
      var fields = {};
      Object.keys( def.fields ).forEach( function( name ) { fields[ name ] = readField( html, item, def.fields[ name ] ); } );
      return { index: index, text: innerText( html, item ), fields: fields };
    } ) };
  }

  // --- Changing items ------------------------------------------------------

  function splice( html, start, end, text ) { return html.substring( 0, start ) + text + html.substring( end ); }

  // Sets (or adds) one attribute in a start tag, leaving the rest as written.
  function setAttribute( startTag, name, value ) {
    var pattern = new RegExp( "(\\s" + name + "\\s*=\\s*)(\"[^\"]*\"|'[^']*'|[^\\s>]+)", "i" );
    var quoted = "\"" + escapeAttr( value ) + "\"";
    if( pattern.test( startTag ) ) return startTag.replace( pattern, function( all, before ) { return before + quoted; } );
    return startTag.replace( /\s*(\/?)>$/, function( all, slash ) { return " " + name + "=" + quoted + ( slash ? " />" : ">" ); } );
  }

  function withBackground( style, url ) {
    var declaration = "background-image:url('" + String( url ).replace( /['"()\\\s]/g, encodeURIComponent ) + "')";
    if( /background-image\s*:[^;]*/i.test( style || "" ) ) return style.replace( /background-image\s*:[^;]*/i, declaration );
    return ( style ? style.replace( /;?\s*$/, ";" ) : "" ) + declaration + ";";
  }

  function itemAt( found, index ) {
    var item = found && found.items[ index ];
    if( !item ) throw "There is no item " + ( index + 1 ) + " in this collection";
    return item;
  }

  function setField( html, def, index, name, value ) {
    html = String( html || "" );
    var field = def.fields[ name ];
    if( !field ) throw "The collection has no field '" + name + "'";
    var item = itemAt( locate( html, def ), index );
    var node = fieldNode( item, field );
    if( !node ) throw "This item has no " + name;
    var startTag = html.substring( node.start, node.openEnd );
    if( field.type === "image" ) {
      var from = source( field );
      if( typeof value !== "string" || /^\s*(javascript|vbscript|data):/i.test( value ) ) throw "That image address cannot be used";
      startTag = from === "style:background-image" ? setAttribute( startTag, "style", withBackground( node.attrs.style, value ) ) : setAttribute( startTag, from.slice( 5 ), value );
      return splice( html, node.start, node.openEnd, startTag );
    }
    if( hasMarkup( html, node ) && !( field.type === "link" && value && value.text === undefined ) ) throw "This " + name + " has its own markup; edit it on the page";
    if( field.type === "link" ) {
      value = value || {};
      if( value.href !== undefined ) {
        if( /^\s*(javascript|vbscript|data):/i.test( value.href ) ) throw "That link address cannot be used";
        startTag = setAttribute( startTag, "href", value.href );
      }
      var inner = value.text === undefined ? html.substring( node.openEnd, node.closeStart ) : escapeText( value.text );
      return html.substring( 0, node.start ) + startTag + inner + html.substring( node.closeStart );
    }
    return splice( html, node.openEnd, node.closeStart, escapeText( value ) );
  }

  // Each item with the whitespace before it, so moved items keep the layout.
  function itemSpan( html, found, index ) {
    var item = found.items[ index ];
    var start = item.start;
    while( start > 0 && /\s/.test( html.charAt( start - 1 ) ) ) start--;
    return { start: start, end: item.end };
  }

  function moveItem( html, def, from, to ) {
    html = String( html || "" );
    var found = locate( html, def );
    itemAt( found, from ); itemAt( found, to );
    if( from === to ) return html;
    var span = itemSpan( html, found, from ), text = html.substring( span.start, span.end );
    var without = splice( html, span.start, span.end, "" );
    var after = locate( without, def );
    // later: after the item now just before the place; earlier: before the item there
    if( to > from ) return splice( without, after.items[ to - 1 ].end, after.items[ to - 1 ].end, text );
    var before = itemSpan( without, after, to ).start;
    return splice( without, before, before, text );
  }

  function removeItem( html, def, index ) {
    html = String( html || "" );
    var found = locate( html, def );
    itemAt( found, index );
    if( def.min !== undefined && found.items.length <= def.min ) throw def.name + " needs at least " + def.min + " item" + ( def.min === 1 ? "" : "s" );
    var span = itemSpan( html, found, index );
    return splice( html, span.start, span.end, "" );
  }

  // A copy of an item, placed after it.
  function duplicateItem( html, def, index ) {
    html = String( html || "" );
    var found = locate( html, def );
    itemAt( found, index );
    if( def.max !== undefined && found.items.length >= def.max ) throw def.name + " can have at most " + def.max + " items";
    var span = itemSpan( html, found, index );
    return splice( html, span.end, span.end, html.substring( span.start, span.end ) );
  }

  // The canvas shows one item at a time, as the site's own script would,
  // without running that script.
  function canvasCss( html, def, shown ) {
    if( def.canvas !== "one" ) return "";
    var found = locate( String( html || "" ), def );
    if( !found || !found.items[ shown ] ) return "";
    var position = found.container.children.indexOf( found.items[ shown ] ) + 1;
    var container = def.container.trim(), item = def.item.trim();
    return container + " > " + item + "{display:none !important;}" +
      container + " > " + item + ":nth-child(" + position + "){display:block !important;position:relative !important;left:auto !important;top:auto !important;opacity:1 !important;visibility:visible !important;}";
  }

  var api = {
    validateDefinitions: validateDefinitions,
    forPage: forPage,
    forPart: forPart,
    find: find,
    setField: setField,
    moveItem: moveItem,
    removeItem: removeItem,
    duplicateItem: duplicateItem,
    canvasCss: canvasCss,
    parseSelector: parseSelector
  };

  if( typeof module !== "undefined" && module.exports ) module.exports = api;
  if( typeof window !== "undefined" ) window.ContentEditorCollections = api;
  return api;
})();
