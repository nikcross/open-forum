/*
* ContentEditorSiteLibrary
* The deployed site's own library (CON-R-018): page components (CON-T-045),
* page layouts (CON-T-047) and the site style (CON-T-050), kept on one
* OpenForum page, one JSON file per kind.
*
* Every entry is named and versioned. Saving adds a new version and never
* changes an old one, so whatever pinned a version - a page that placed a
* component, a layout published as a template - keeps exactly what it had.
*
* A page holds a copy of each component it places (an "instance": a
* component element whose children are that version's elements), so a
* page renders from its own revision alone and a component change only
* reaches it through an explicit update. Components inside components are
* copied the same way, which is also how a cycle is spotted: a component
* may never contain an instance of itself, however deep.
*
* createStore(io, libraryPage) - io: { exists, read, write } as in
*   ContentEditorContentStore.
* validateComponent(content, id), instantiate(entry, version),
* componentIdsIn(element), usagesIn(element, id) are pure helpers.
*/
var ContentEditorSiteLibrary = (function(Schema, Definitions, Store, Themes) {

  var KINDS = {
    components: { file: "components.json", label: "component", prefix: "cmp" },
    layouts: { file: "layouts.json", label: "layout", prefix: "lay" },
    styles: { file: "site-style.json", label: "site style", prefix: "sty" }
  };
  var NAME_MAX = 80;
  var ID_PATTERN = /^[a-z0-9-]{1,60}$/;

  function kindOf( kind ) {
    if( !KINDS.hasOwnProperty( kind ) ) throw "Unknown library kind: " + kind;
    return KINDS[ kind ];
  }

  function cleanName( name ) {
    var text = String( name === undefined || name === null ? "" : name ).replace( /\s+/g, " " ).trim();
    if( !text ) throw "Give it a name";
    if( text.length > NAME_MAX ) throw "Names are at most " + NAME_MAX + " characters";
    return text;
  }

  function newId( kind, name ) {
    var slug = name.toLowerCase().replace( /[^a-z0-9]+/g, "-" ).replace( /^-+|-+$/g, "" ).slice( 0, 40 ) || "item";
    return kindOf( kind ).prefix + "-" + slug + "-" + Math.random().toString( 36 ).slice( 2, 6 );
  }

  function eachElement( element, visit ) {
    visit( element );
    Schema.childGroups( element ).forEach( function( group ) {
      group.items.forEach( function( child ) { eachElement( child, visit ); } );
    } );
  }

  // Every component placed anywhere inside element (not element itself).
  function componentIdsIn( element ) {
    var ids = [];
    Schema.childGroups( element ).forEach( function( group ) {
      group.items.forEach( function( child ) {
        eachElement( child, function( node ) {
          if( node.type === "component" && node.fields && node.fields.componentId && ids.indexOf( node.fields.componentId ) === -1 ) ids.push( node.fields.componentId );
        } );
      } );
    } );
    return ids;
  }

  // The instances of component id inside element, with the version each placed.
  function usagesIn( element, id ) {
    var found = [];
    eachElement( element, function( node ) {
      if( node.type === "component" && node.fields && node.fields.componentId === id ) found.push( { elementId: node.id, version: node.fields.componentVersion } );
    } );
    return found;
  }

  // A component's content is a component element (its container) holding
  // its parts. id is the component's own id, or null for a new one.
  function validateComponent( content, id ) {
    if( !content || content.type !== "component" ) return [ "A component's content must be a component container" ];
    var errors = Definitions.validatePage( { root: content } ).concat( Store.unsafeMarkup( { root: content } ) );
    if( !Schema.childGroups( content )[ 0 ].items.length ) errors.push( "Add something to the component first" );
    if( id && componentIdsIn( content ).indexOf( id ) !== -1 ) errors.push( "A component cannot contain itself, even inside another component" );
    if( countOfType( content, "content-slot" ) || countOfType( content, "layout" ) ) errors.push( "The page content place belongs in layouts, not components" );
    return errors;
  }

  function countOfType( element, type ) {
    var count = 0;
    eachElement( element, function( node ) { if( node.type === type ) count++; } );
    return count;
  }

  // A layout's content is a layout element with exactly one content slot
  // (CON-T-047).
  function validateLayout( content ) {
    if( !content || content.type !== "layout" ) return [ "A layout's content must be a layout container" ];
    var errors = Definitions.validatePage( { root: content } ).concat( Store.unsafeMarkup( { root: content } ) );
    var slots = countOfType( content, "content-slot" );
    if( slots !== 1 ) errors.push( slots ? "A layout has exactly one place for the page content; this one has " + slots : "Add the page content to the layout" );
    return errors;
  }

  // A site style (CON-T-050) is a theme's tokens: five colours, a heading
  // and a body font from the approved lists, and an optional icon.
  var STYLE_KEYS = [ "type", "name", "accent", "soft", "paper", "ink", "muted", "display", "body", "icon" ];

  function validateStyle( content ) {
    if( !content || content.type !== "site-style" ) return [ "A site style's content must be a site-style" ];
    var errors = Object.keys( content ).filter( function( key ) { return STYLE_KEYS.indexOf( key ) === -1; } ).map( function( key ) { return "Unknown style setting " + key; } );
    if( typeof content.name !== "string" || !content.name.trim() ) errors.push( "The style needs a name" );
    return errors.concat( Themes.validateTheme( content ) );
  }

  function validateContent( kind, content, id ) {
    if( kind === "components" ) return validateComponent( content, id );
    if( kind === "layouts" ) return validateLayout( content );
    if( kind === "styles" ) return validateStyle( content );
    if( content === null || typeof content !== "object" ) return [ "The " + kindOf( kind ).label + " has no content" ];
    return [];
  }

  // A copy of one version of a component, ready to place in a page or in
  // another component: new element ids throughout, and the container
  // records which component and version it came from.
  // entry is a summary (list or read) or a stored entry with all versions.
  function instantiate( entry, version ) {
    var chosen = entry.content && entry.version === version ? entry : null;
    ( entry.versions || [] ).forEach( function( v ) { if( !chosen && v.version === version && v.content ) chosen = v; } );
    if( !chosen ) throw "Version " + version + " of " + entry.name + " does not exist";
    var element = Schema.cloneWithNewIds( chosen.content );
    element.fields = element.fields || {};
    element.fields.componentId = entry.id;
    element.fields.componentVersion = chosen.version;
    element.fields.name = entry.name;
    return element;
  }

  function latest( entry ) {
    return entry.versions[ entry.versions.length - 1 ];
  }

  // Style versions are small and pages pin any of them, so a style's
  // summary carries every version's content.
  function summary( entry ) {
    var last = latest( entry );
    var withContent = last.content && last.content.type === "site-style";
    return { id: entry.id, name: entry.name, archived: !!entry.archived, version: last.version,
      savedAt: last.savedAt, savedBy: last.savedBy, message: last.message, content: last.content,
      versions: entry.versions.map( function( v ) {
        var item = { version: v.version, savedAt: v.savedAt, savedBy: v.savedBy, message: v.message };
        if( withContent ) item.content = v.content;
        return item;
      } ) };
  }

  // Registers every site style version as a theme and returns the site
  // configuration with the current style as its theme (CON-T-050). With no
  // site style the configured theme stays.
  function applyStyles( config, styles ) {
    var current = null;
    ( styles || [] ).forEach( function( style ) {
      ( style.versions || [] ).forEach( function( v ) {
        if( v.content ) {
          try { Themes.registerTheme( style.id, v.version, v.content ); } catch( e ) { /* an invalid version is never used */ }
        }
      } );
      if( !style.archived && !current ) current = style;
    } );
    if( !config || !current || !Themes.getTheme( current.id, current.version ) ) return config;
    var effective = JSON.parse( JSON.stringify( config ) );
    effective.theme = { id: current.id, version: current.version };
    return effective;
  }

  function createStore( io, libraryPage ) {

    function readKind( kind ) {
      var spec = kindOf( kind );
      if( !io.exists( libraryPage, spec.file ) ) return { entries: [] };
      return JSON.parse( io.read( libraryPage, spec.file ) );
    }

    function writeKind( kind, data ) {
      io.write( libraryPage, kindOf( kind ).file, JSON.stringify( data, null, 2 ) );
    }

    function find( data, kind, id ) {
      for( var i = 0; i < data.entries.length; i++ ) if( data.entries[ i ].id === id ) return data.entries[ i ];
      throw "There is no " + kindOf( kind ).label + " " + id;
    }

    function checkNameFree( data, kind, name, exceptId ) {
      data.entries.forEach( function( entry ) {
        if( entry.id !== exceptId && !entry.archived && entry.name.toLowerCase() === name.toLowerCase() ) throw "There is already a " + kindOf( kind ).label + " called " + entry.name;
      } );
    }

    function list( kind ) {
      return readKind( kind ).entries.map( summary );
    }

    function read( kind, id, version ) {
      var entry = find( readKind( kind ), kind, id );
      if( version === undefined || version === null || version === "" ) return summary( entry );
      var chosen = null;
      entry.versions.forEach( function( v ) { if( v.version === Number( version ) ) chosen = v; } );
      if( !chosen ) throw "Version " + version + " of " + entry.name + " does not exist";
      return { id: entry.id, name: entry.name, archived: !!entry.archived, version: chosen.version, savedAt: chosen.savedAt,
        savedBy: chosen.savedBy, message: chosen.message, content: chosen.content };
    }

    function create( kind, name, content, actor, now, message ) {
      name = cleanName( name );
      var data = readKind( kind );
      checkNameFree( data, kind, name, null );
      var errors = validateContent( kind, content, null );
      if( errors.length ) throw "Not saved: " + errors.join( "; " );
      var entry = { id: newId( kind, name ), name: name, archived: false,
        versions: [ { version: 1, savedAt: now, savedBy: actor, message: message || "Created", content: content } ] };
      data.entries.push( entry );
      writeKind( kind, data );
      return summary( entry );
    }

    // Adds a version if baseVersion is still the latest; otherwise returns
    // { conflict: true, current } and writes nothing.
    function save( kind, id, baseVersion, content, actor, now, message ) {
      var data = readKind( kind );
      var entry = find( data, kind, id );
      var last = latest( entry );
      if( Number( baseVersion ) !== last.version ) return { conflict: true, current: summary( entry ) };
      var errors = validateContent( kind, content, id );
      if( errors.length ) throw "Not saved: " + errors.join( "; " );
      entry.versions.push( { version: last.version + 1, savedAt: now, savedBy: actor, message: message || "", content: content } );
      writeKind( kind, data );
      return summary( entry );
    }

    function update( kind, id, changes ) {
      var data = readKind( kind );
      var entry = find( data, kind, id );
      if( changes.name !== undefined ) {
        var name = cleanName( changes.name );
        checkNameFree( data, kind, name, id );
        entry.name = name;
      }
      if( changes.archived !== undefined ) {
        if( !changes.archived ) checkNameFree( data, kind, entry.name, id );
        entry.archived = !!changes.archived;
      }
      writeKind( kind, data );
      return summary( entry );
    }

    function duplicate( kind, id, name, actor, now ) {
      var source = find( readKind( kind ), kind, id );
      return create( kind, name, JSON.parse( JSON.stringify( latest( source ).content ) ), actor, now, "Copied from " + source.name + " version " + latest( source ).version );
    }

    return { list: list, read: read, create: create, save: save, update: update, duplicate: duplicate };
  }

  // --- Images (CON-T-049) ----------------------------------------------------
  // Uploads are checked by what the file is, not only by its name: the
  // first bytes must be the signature of the image type its name claims.
  // SVG is refused, since it can carry scripts.
  var IMAGE_TYPES = {
    png: [ [ 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A ] ],
    jpg: [ [ 0xFF, 0xD8, 0xFF ] ],
    jpeg: [ [ 0xFF, 0xD8, 0xFF ] ],
    gif: [ [ 0x47, 0x49, 0x46, 0x38, 0x37, 0x61 ], [ 0x47, 0x49, 0x46, 0x38, 0x39, 0x61 ] ],
    webp: [ [ 0x52, 0x49, 0x46, 0x46, null, null, null, null, 0x57, 0x45, 0x42, 0x50 ] ]
  };
  var MAX_IMAGE_BYTES = 4 * 1024 * 1024;

  // A safe file name for an upload, or an error.
  function imageFileName( name ) {
    var clean = String( name || "" ).split( /[\\/]/ ).pop().replace( /\s+/g, "-" ).replace( /[^A-Za-z0-9._-]/g, "" ).replace( /^[._-]+/, "" );
    var match = clean.match( /^(.{1,80})\.([A-Za-z]+)$/ );
    if( !match || !IMAGE_TYPES.hasOwnProperty( match[ 2 ].toLowerCase() ) ) throw "Images must be .png, .jpg, .gif or .webp files";
    return clean;
  }

  // bytes: the file's first bytes as numbers 0-255.
  function checkImageBytes( fileName, bytes, size ) {
    var ext = fileName.split( "." ).pop().toLowerCase();
    if( size > MAX_IMAGE_BYTES ) throw "Images can be at most " + ( MAX_IMAGE_BYTES / 1024 / 1024 ) + "MB";
    if( !size ) throw "The file is empty";
    var ok = ( IMAGE_TYPES[ ext ] || [] ).some( function( signature ) {
      return signature.every( function( value, i ) { return value === null || bytes[ i ] === value; } );
    } );
    if( !ok ) throw fileName + " is not a " + ext.toUpperCase() + " image";
  }

  // A linked image: a full https address with no quotes, spaces or angle brackets.
  function imageLink( url ) {
    var text = String( url || "" ).trim();
    if( !/^https:\/\/[^\s"'<>]+$/i.test( text ) || text.length > 1000 ) throw "Link an image by its full https:// address";
    return text;
  }

  // --- Image details (CON-T-023) ---------------------------------------------
  // The type an image's first bytes say it is ("png", "jpg", "gif", "webp"),
  // or null.
  function imageTypeOf( bytes ) {
    var found = null;
    [ "png", "jpg", "gif", "webp" ].forEach( function( ext ) {
      if( found ) return;
      if( IMAGE_TYPES[ ext ].some( function( signature ) {
        return signature.every( function( value, i ) { return value === null || bytes[ i ] === value; } );
      } ) ) found = ext;
    } );
    return found;
  }

  // { type, width, height } read from the start of the file (a JPEG's size
  // can be some way in, so pass up to the first 64KB). width and height are
  // null when the header can't be read.
  function imageDimensions( bytes ) {
    var type = imageTypeOf( bytes );
    var size = { type: type, width: null, height: null };
    function at( i ) { return bytes[ i ] === undefined ? NaN : bytes[ i ]; }
    function u16be( i ) { return at( i ) * 256 + at( i + 1 ); }
    function u16le( i ) { return at( i ) + at( i + 1 ) * 256; }
    function u32be( i ) { return ( ( at( i ) * 256 + at( i + 1 ) ) * 256 + at( i + 2 ) ) * 256 + at( i + 3 ); }
    function u24le( i ) { return at( i ) + at( i + 1 ) * 256 + at( i + 2 ) * 65536; }
    function set( w, h ) { if( w > 0 && h > 0 ) { size.width = w; size.height = h; } }
    if( type === "png" ) set( u32be( 16 ), u32be( 20 ) );
    else if( type === "gif" ) set( u16le( 6 ), u16le( 8 ) );
    else if( type === "jpg" ) {
      for( var i = 2; i + 8 < bytes.length; ) {
        if( bytes[ i ] !== 0xFF ) { i++; continue; }
        var marker = bytes[ i + 1 ];
        if( marker === 0xFF ) { i++; continue; }
        if( marker === 0xD8 || marker === 0x01 || ( marker >= 0xD0 && marker <= 0xD7 ) ) { i += 2; continue; }
        if( marker >= 0xC0 && marker <= 0xCF && marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC ) { set( u16be( i + 7 ), u16be( i + 5 ) ); break; }
        i += 2 + u16be( i + 2 );
      }
    } else if( type === "webp" ) {
      var chunk = String.fromCharCode( at( 12 ), at( 13 ), at( 14 ), at( 15 ) );
      if( chunk === "VP8 " ) set( u16le( 26 ) & 0x3FFF, u16le( 28 ) & 0x3FFF );
      else if( chunk === "VP8L" ) set( 1 + ( ( ( at( 22 ) & 0x3F ) << 8 ) | at( 21 ) ), 1 + ( ( ( at( 24 ) & 0x0F ) << 10 ) | ( at( 23 ) << 2 ) | ( ( at( 22 ) & 0xC0 ) >> 6 ) ) );
      else if( chunk === "VP8X" ) set( 1 + u24le( 24 ), 1 + u24le( 27 ) );
    }
    return size;
  }

  // The resized copies of name among a page's file names (name200x200.png,
  // name_200x200.png, name.icon.png, name.thumbnail.png).
  var RESIZED_IMAGE = /(_?\d+x\d+|\.icon|\.thumbnail)\.[a-z]+$/i;
  function imageVariants( names, name ) {
    var base = String( name ).replace( /\.[a-z]+$/i, "" );
    return names.filter( function( other ) {
      return other !== name && RESIZED_IMAGE.test( other ) && other.replace( RESIZED_IMAGE, "" ) === base;
    } ).sort();
  }

  // How many times element (and everything inside it) shows the image at
  // url: image elements and images in rich text. A query string is ignored.
  function imageUses( element, url ) {
    var count = 0;
    function same( src ) { return String( src || "" ).replace( /&amp;/g, "&" ).split( "?" )[ 0 ] === url; }
    eachElement( element, function( node ) {
      var fields = node.fields || {};
      if( typeof fields.mediaUrl === "string" && same( fields.mediaUrl ) ) count++;
      var html = fields.body && typeof fields.body.html === "string" ? fields.body.html : "";
      ( html.match( /<img\b[^>]*\ssrc="[^"]*"/gi ) || [] ).forEach( function( tag ) {
        if( same( tag.replace( /^[\s\S]*\ssrc="|"$/gi, "" ) ) ) count++;
      } );
    } );
    return count;
  }

  // Image sources (CON-T-049, changed 2026-10-23): the pages whose images
  // the library shows. The defaults are the site's own uploads page and
  // /Images; other pages are added by the site editor. Releasing rewrites
  // /Images to /Images, so the list is de-duplicated.
  var DEFAULT_IMAGE_SOURCES = [ "/Images", "/Images" ];
  var MAX_IMAGE_SOURCES = 20;

  // A page to read images from: a plain page path, or an error.
  function imageSourcePage( path ) {
    var text = String( path || "" ).trim().replace( /\/+$/, "" );
    if( !/^(\/[A-Za-z0-9_-]+)+$/.test( text ) || text.length > 200 ) throw "An image source is a page path such as /Shared/Images";
    return text;
  }

  // The sources to show, defaults first: [{ pageName, isDefault, id }].
  // added: the stored extra sources, [{ id, pageName }].
  function imageSources( added ) {
    var seen = {};
    var list = [];
    function add( pageName, isDefault, id ) {
      if( seen[ pageName ] ) return;
      seen[ pageName ] = true;
      list.push( { pageName: pageName, isDefault: isDefault, id: id || "" } );
    }
    DEFAULT_IMAGE_SOURCES.forEach( function( pageName ) { add( pageName, true ); } );
    ( added || [] ).forEach( function( entry ) { add( entry.pageName, false, entry.id ); } );
    return list;
  }

  // CON-T-051: how many links in element point at path or below it -
  // button addresses and links in rich text.
  function linksToPath( element, path ) {
    var count = 0;
    function matches( href ) {
      href = String( href || "" ).split( /[?#]/ )[ 0 ];
      return href === path || href.indexOf( path + "/" ) === 0;
    }
    eachElement( element, function( node ) {
      var fields = node.fields || {};
      if( typeof fields.href === "string" && matches( fields.href ) ) count++;
      var html = fields.body && typeof fields.body.html === "string" ? fields.body.html : "";
      ( html.match( /\shref="[^"]*"/gi ) || [] ).forEach( function( attr ) {
        if( matches( attr.replace( /^\shref="|"$/gi, "" ).replace( /&amp;/g, "&" ) ) ) count++;
      } );
    } );
    return count;
  }

  var api = {
    KINDS: KINDS,
    MAX_IMAGE_BYTES: MAX_IMAGE_BYTES,
    imageFileName: imageFileName,
    checkImageBytes: checkImageBytes,
    imageLink: imageLink,
    DEFAULT_IMAGE_SOURCES: DEFAULT_IMAGE_SOURCES,
    MAX_IMAGE_SOURCES: MAX_IMAGE_SOURCES,
    imageSourcePage: imageSourcePage,
    imageTypeOf: imageTypeOf,
    imageDimensions: imageDimensions,
    imageVariants: imageVariants,
    imageUses: imageUses,
    imageSources: imageSources,
    ID_PATTERN: ID_PATTERN,
    createStore: createStore,
    validateComponent: validateComponent,
    validateLayout: validateLayout,
    validateStyle: validateStyle,
    applyStyles: applyStyles,
    instantiate: instantiate,
    componentIdsIn: componentIdsIn,
    linksToPath: linksToPath,
    usagesIn: usagesIn
  };

  if( typeof module !== "undefined" && module.exports ) module.exports = api;
  if( typeof window !== "undefined" ) window.ContentEditorSiteLibrary = api;
  return api;
})(
  typeof require !== "undefined" ? require("./schema.js") : window.ContentEditorSchema,
  typeof require !== "undefined" ? require("./element-definitions.js") : window.ContentEditorElementDefinitions,
  typeof require !== "undefined" ? require("./content-store.js") : window.ContentEditorContentStore,
  typeof require !== "undefined" ? require("./themes.js") : window.ContentEditorThemes
);

