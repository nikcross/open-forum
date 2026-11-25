/*
* SiteLibrary
* Server side of the site's library (CON-R-018): components (CON-T-045),
* layouts (CON-T-047) and the site style (CON-T-050). The rules live in
* model-site-library.js, which the editor runs too.
*
* The library is the deployed site's own: one OpenForum page, the site's
* Development copy of /OpenForum/PageTemplates/SiteLibrary when it has one,
* otherwise the live page, one JSON file per kind.
*
* Example include script: var SiteLibrary = js.getObject("/OpenForum/AddOn/ContentEditor","SiteLibrary.sjs");
*/
var SiteLibrary = function() {
  var self = this;

  var ADDON_PAGE = "/OpenForum/AddOn/ContentEditor";
  // The site's settings pages (2026-10-24): a site's own Development copy,
  // when it has one, is used before the live copy, so settings can be
  // drafted there. Publishing rewrites Development paths to the live ones.
  var DRAFT_ROOT = "/Develop" + "ment";
  var LIVE_SITE_CONFIG_PAGE = "/OpenForum/PageTemplates/PublishedPage";
  var LIVE_LIBRARY_PAGE = "/OpenForum/PageTemplates/SiteLibrary";
  var SITE_CONFIG_FILE = "content-editor-site.json";
  // Looked up on each use, so settings drafted after the editor loaded are found.
  function siteConfigPage() { return file.attachmentExists( DRAFT_ROOT + LIVE_SITE_CONFIG_PAGE, SITE_CONFIG_FILE ) == true ? DRAFT_ROOT + LIVE_SITE_CONFIG_PAGE : LIVE_SITE_CONFIG_PAGE; }
  function libraryPage() { return file.pageExists( DRAFT_ROOT + LIVE_LIBRARY_PAGE ) == true ? DRAFT_ROOT + LIVE_LIBRARY_PAGE : LIVE_LIBRARY_PAGE; }
  var MODULES = [ "model-schema.js", "model-element-definitions.js", "model-style-tokens.js", "model-existing-html.js", "model-renderer.js",
    "model-themes.js", "model-templates.js", "model-migrations.js", "model-content-store.js", "model-publication.js",
    "model-site-library.js", "model-layouts.js" ];

  // The model modules register themselves on window when it exists.
  var window = {};
  for( var m = 0; m < MODULES.length; m++ ) {
    eval( "" + file.getAttachment( ADDON_PAGE, MODULES[ m ] ) );
  }
  var Library = window.ContentEditorSiteLibrary;
  var Migrations = window.ContentEditorMigrations;
  var Themes = window.ContentEditorThemes;
  var Layouts = window.ContentEditorLayouts;

  function now() { return new Date().toISOString(); }

  // authorise(pageName) throws if the user may not update that page.
  function storeFor( user, authorise ) {
    var io = {
      exists: function( page, fileName ) { return file.attachmentExists( page, fileName ) == true; },
      read: function( page, fileName ) { return "" + file.getAttachment( page, fileName ); },
      write: function( page, fileName, text ) {
        if( authorise ) authorise( page );
        openForum.saveAsAttachment( page, fileName, text, user );
      }
    };
    return Library.createStore( io, libraryPage() );
  }

  function parseContent( contentJson ) {
    var content;
    try { content = JSON.parse( "" + contentJson ); } catch( e ) { throw "The content is not valid JSON"; }
    return content;
  }

  // CON-T-050: every site style version is a theme, and the current style
  // is the site's theme.
  function registerStyles( config ) {
    return Library.applyStyles( config, storeFor( null, null ).list( "styles" ) );
  }

  function siteTheme() {
    var config = registerStyles( JSON.parse( "" + file.getAttachment( siteConfigPage(), SITE_CONFIG_FILE ) ) );
    var problems = Themes.validateSiteConfig( config );
    if( problems.length ) throw "This site's content editor configuration is invalid: " + problems.join( "; " );
    return { id: config.theme.id, version: config.theme.version };
  }

  // CON-T-047: each layout version is written once as its own template
  // file; pages link to the version they chose.
  function writeLayoutTemplate( entry, user, authorise ) {
    registerStyles( null );
    var theme = entry.content.fields.theme;
    var fileName = Layouts.templateFileName( entry.id, entry.version );
    authorise( libraryPage() );
    openForum.saveAsAttachment( libraryPage(), fileName, Layouts.renderTemplate( entry, Themes.getTheme( theme.id, theme.version ) ), user );
    entry.templatePath = libraryPage() + "/" + fileName;
    return entry;
  }

  // CON-T-050: each site style version is also written as a CSS file, for
  // pages and templates made outside the Content Editor.
  function writeStyleCss( entry, user, authorise ) {
    var fileName = "site-style-" + entry.id + "-v" + entry.version + ".css";
    authorise( libraryPage() );
    openForum.saveAsAttachment( libraryPage(), fileName, "/* " + entry.name + " version " + entry.version + ", built by the Content Editor. This file never changes. */\n" +
      Themes.buildCss( entry.content ) + "\n", user );
    entry.cssPath = libraryPage() + "/" + fileName;
    return entry;
  }

  function afterSave( kind, entry, user, authorise ) {
    if( kind === "layouts" ) return writeLayoutTemplate( entry, user, authorise );
    if( kind === "styles" ) return writeStyleCss( entry, user, authorise );
    return entry;
  }

  // A layout is pinned to the site theme it was saved with.
  function prepare( kind, content ) {
    if( kind === "layouts" && content && content.type === "layout" ) {
      content.fields = content.fields || {};
      content.fields.theme = siteTheme();
    }
    return content;
  }

  // The template path a page uses for one version of a layout.
  self.layoutTemplatePath = function( id, version ) {
    var fileName = Layouts.templateFileName( "" + id, Number( version ) );
    if( file.attachmentExists( libraryPage(), fileName ) != true ) throw "Version " + version + " of layout " + id + " has no template";
    return libraryPage() + "/" + fileName;
  };

  // CON-T-059: starts the site's Development copy of the library page from
  // the live one, so library changes are drafted there and released by a
  // person. The live page's files are copied as they are (a .link stays a
  // .link); its data.json and sub-pages are not.
  self.startDraftLibrary = function( user, authorise ) {
    var draft = DRAFT_ROOT + LIVE_LIBRARY_PAGE;
    if( file.pageExists( draft ) == true ) return { page: draft, started: false, copied: [] };
    authorise( draft );
    var copied = [];
    if( file.pageExists( LIVE_LIBRARY_PAGE ) == true ) {
      attachmentNames( LIVE_LIBRARY_PAGE ).forEach( function( name ) {
        if( name.charAt( 0 ) === "+" || name === "data.json" || !/\.(json|css|template|link|content|html|txt)$/.test( name ) ) return;
        openForum.saveAsAttachment( draft, name, readRaw( LIVE_LIBRARY_PAGE, name ), user );
        copied.push( name );
      } );
    }
    if( copied.indexOf( "page.content" ) === -1 ) openForum.saveAsAttachment( draft, "page.content", "The site's library for the Content Editor: components, layouts, site style and image details.", user );
    return { page: draft, started: true, copied: copied };
  };

  // A file's own text, without following a .link.
  function readRaw( pageName, fileName ) {
    var input = file.getAttachmentInputStream( pageName, fileName );
    var out = new Packages.java.io.ByteArrayOutputStream();
    var buffer = Packages.java.lang.reflect.Array.newInstance( Packages.java.lang.Byte.TYPE, 8192 ), n;
    try { while( ( n = input.read( buffer ) ) > 0 ) out.write( buffer, 0, n ); } finally { input.close(); }
    return "" + new Packages.java.lang.String( out.toByteArray(), "UTF-8" );
  }

  /* Used in service /OpenForum/AddOn/ContentEditor listLibrary */
  self.listLibrary = function( kind ) {
    return storeFor( null, null ).list( "" + kind );
  };

  /* Used in service /OpenForum/AddOn/ContentEditor readLibraryEntry */
  self.readLibraryEntry = function( kind, id, version ) {
    return storeFor( null, null ).read( "" + kind, "" + id, version ? "" + version : "" );
  };

  /* Used in service /OpenForum/AddOn/ContentEditor createLibraryEntry */
  self.createLibraryEntry = function( user, authorise, kind, name, contentJson, message ) {
    authorise( libraryPage() );
    kind = "" + kind;
    var created = storeFor( user, authorise ).create( kind, "" + name, prepare( kind, parseContent( contentJson ) ), "" + user, now(), message ? "" + message : "Created" );
    return afterSave( kind, created, user, authorise );
  };

  // Returns { conflict: true, current } instead of saving over a newer version.
  /* Used in service /OpenForum/AddOn/ContentEditor saveLibraryEntry */
  self.saveLibraryEntry = function( user, authorise, kind, id, baseVersion, contentJson, message ) {
    authorise( libraryPage() );
    kind = "" + kind;
    var saved = storeFor( user, authorise ).save( kind, "" + id, Number( baseVersion ), prepare( kind, parseContent( contentJson ) ), "" + user, now(), message ? "" + message : "" );
    return saved.conflict ? saved : afterSave( kind, saved, user, authorise );
  };

  /* Used in service /OpenForum/AddOn/ContentEditor updateLibraryEntry */
  self.updateLibraryEntry = function( user, authorise, kind, id, name, archived ) {
    authorise( libraryPage() );
    var changes = {};
    if( name !== "" ) changes.name = "" + name;
    if( archived !== "" ) changes.archived = ( "" + archived ) === "true";
    return storeFor( user, authorise ).update( "" + kind, "" + id, changes );
  };

  /* Used in service /OpenForum/AddOn/ContentEditor duplicateLibraryEntry */
  self.duplicateLibraryEntry = function( user, authorise, kind, id, name ) {
    authorise( libraryPage() );
    kind = "" + kind;
    var copied = storeFor( user, authorise ).duplicate( kind, "" + id, "" + name, "" + user, now() );
    return afterSave( kind, copied, user, authorise );
  };

  // --- Images (CON-T-049) ----------------------------------------------------
  // Uploads go to the site's own images page; the release step copies it to
  // /Images and rewrites pages' /Images addresses to match.
  var IMAGES_PAGE = "/Images";
  var LINKED_IMAGES_FILE = "linked-images.json";

  function hasOwnFile( pageName, fileName ) {
    var keys = file.getAttachmentsForPage( pageName ).keySet().iterator();
    while( keys.hasNext() ) if( ( "" + keys.next() ).toLowerCase() === fileName.toLowerCase() ) return true;
    return false;
  }

  // data is the file as base64, optionally as a data: URL. Returns the
  // checked bytes, or throws.
  function decodeImage( name, data ) {
    var text = ( "" + data ).replace( /^data:[^,]*,/, "" ).replace( /\s/g, "" );
    var bytes;
    try { bytes = Packages.java.util.Base64.getDecoder().decode( new Packages.java.lang.String( text ) ); } catch( e ) { throw "The upload could not be read"; }
    var first = [];
    for( var i = 0; i < 16 && i < bytes.length; i++ ) first.push( bytes[ i ] & 0xff );
    Library.checkImageBytes( name, first, bytes.length );
    return bytes;
  }

  function writeBytes( pageName, name, bytes ) {
    var out = file.getAttachmentOutputStream( pageName, name );
    try { out.write( bytes ); out.flush(); } finally { out.close(); }
  }

  /* Used in service /OpenForum/AddOn/ContentEditor uploadImage */
  self.uploadImage = function( user, authorise, fileName, data ) {
    var name = Library.imageFileName( "" + fileName );
    authorise( IMAGES_PAGE );
    authorise( libraryPage() );
    if( hasOwnFile( IMAGES_PAGE, name ) || hasOwnFile( IMAGES_PAGE, name + ".link" ) ) throw "There is already an image called " + name + "; rename the file and try again";
    var bytes = decodeImage( name, data );
    writeBytes( IMAGES_PAGE, name, bytes );
    recordImage( name, user, "uploaded" );
    return { fileName: name, url: IMAGES_PAGE + "/" + name, size: bytes.length, uploadedBy: "" + user };
  };

  // --- Image details, replace and remove (CON-T-023) -----------------------
  // Details of the uploads are kept in image-details.json on the library
  // page: { images: { name: { type, width, height, size, sha256,
  // uploadedBy, uploadedAt, history: [...] } } }. Size, type and checksum
  // are always read from the file itself; the record adds who and when.
  var IMAGE_DETAILS_FILE = "image-details.json";
  var MAX_HEAD = 65536;

  function readImageDetails() {
    if( file.attachmentExists( libraryPage(), IMAGE_DETAILS_FILE ) != true ) return { images: {} };
    return JSON.parse( "" + file.getAttachment( libraryPage(), IMAGE_DETAILS_FILE ) );
  }

  function attachmentNames( pageName ) {
    var names = [], keys = file.getAttachmentsForPage( pageName ).keySet().iterator();
    while( keys.hasNext() ) names.push( "" + keys.next() );
    return names;
  }

  // { size, sha256, head } - head is the first 64KB as numbers 0-255.
  function scanAttachment( pageName, fileName ) {
    var input = file.getAttachmentInputStream( pageName, fileName );
    var digest = Packages.java.security.MessageDigest.getInstance( "SHA-256" );
    var buffer = Packages.java.lang.reflect.Array.newInstance( Packages.java.lang.Byte.TYPE, 8192 );
    var head = [], size = 0, n;
    try {
      while( ( n = input.read( buffer ) ) > 0 ) {
        digest.update( buffer, 0, n );
        for( var i = 0; i < n && head.length < MAX_HEAD; i++ ) head.push( buffer[ i ] & 0xff );
        size += n;
      }
    } finally { input.close(); }
    var hash = digest.digest(), hex = "";
    for( var j = 0; j < hash.length; j++ ) hex += ( "0" + ( hash[ j ] & 0xff ).toString( 16 ) ).slice( -2 );
    return { size: size, sha256: hex, head: head };
  }

  function copyAttachment( pageName, from, to ) {
    var input = file.getAttachmentInputStream( pageName, from );
    var out = file.getAttachmentOutputStream( pageName, to );
    var buffer = Packages.java.lang.reflect.Array.newInstance( Packages.java.lang.Byte.TYPE, 8192 ), n;
    try { while( ( n = input.read( buffer ) ) > 0 ) out.write( buffer, 0, n ); out.flush(); } finally { input.close(); out.close(); }
  }

  // A kept copy is renamed so it is no longer an image file name: it stays
  // on the page (and can be renamed back) but the library doesn't show it.
  function keepAside( name, how, stamp ) {
    var kept = name + "." + how + "-" + stamp;
    copyAttachment( IMAGES_PAGE, name, kept );
    return kept;
  }

  function stampNow() { return now().replace( /[^0-9]/g, "" ).slice( 0, 14 ); }

  // Records the file as it is now, with who did what.
  function recordImage( name, user, action, extra ) {
    var scan = scanAttachment( IMAGES_PAGE, name );
    var size = Library.imageDimensions( scan.head );
    var data = readImageDetails();
    var record = data.images[ name ] || { history: [] };
    record.type = size.type;
    record.width = size.width;
    record.height = size.height;
    record.size = scan.size;
    record.sha256 = scan.sha256;
    if( action === "uploaded" ) { record.uploadedBy = "" + user; record.uploadedAt = now(); }
    var event = { action: action, by: "" + user, at: now(), sha256: scan.sha256 };
    for( var key in extra || {} ) event[ key ] = extra[ key ];
    record.history.push( event );
    delete record.removed;
    data.images[ name ] = record;
    openForum.saveAsAttachment( libraryPage(), IMAGE_DETAILS_FILE, JSON.stringify( data, null, 2 ), user );
    return record;
  }

  // Where url is shown: the draft and the published revision of every editor
  // page, the latest version of every component and layout, and the site
  // style's icon. Pages made outside the Content Editor are not checked.
  function imageUsage( url ) {
    var usage = { pages: [], components: [], layouts: [], styles: [] };
    var ContentPages = js.getObject( ADDON_PAGE, "ContentPages.sjs" );
    ContentPages.listContentPages().forEach( function( entry ) {
      var read = ContentPages.readContentPage( entry.pageId );
      var inDraft = Library.imageUses( Migrations.migrate( read.revision.page ).root, url );
      var published = read.index.publishedRevision, inPublished = 0;
      if( published === read.index.draftRevision ) inPublished = inDraft;
      else if( published ) inPublished = Library.imageUses( Migrations.migrate( ContentPages.readContentPageRevision( entry.pageId, published ).page ).root, url );
      if( inDraft || inPublished ) usage.pages.push( { pageId: entry.pageId, title: entry.title, publicPath: entry.publicPath, archived: !!entry.archived,
        draft: inDraft, published: inPublished, publishedRevision: published || null } );
    } );
    var store = storeFor( null, null );
    [ "components", "layouts" ].forEach( function( kind ) {
      store.list( kind ).forEach( function( entry ) {
        var n = entry.content ? Library.imageUses( entry.content, url ) : 0;
        if( n ) usage[ kind ].push( { id: entry.id, name: entry.name, version: entry.version, archived: !!entry.archived, uses: n } );
      } );
    } );
    store.list( "styles" ).forEach( function( entry ) {
      if( entry.content && entry.content.icon === url ) usage.styles.push( { id: entry.id, name: entry.name, version: entry.version, archived: !!entry.archived, uses: 1 } );
    } );
    return usage;
  }

  // The places that would break if url went away: every page (published
  // or not), and library items that are not archived.
  function blockingUses( usage ) {
    var live = function( item ) { return !item.archived; };
    return usage.pages.map( function( p ) { return "the page " + ( p.title || p.publicPath ); } )
      .concat( usage.components.filter( live ).map( function( c ) { return "the " + c.name + " component"; } ) )
      .concat( usage.layouts.filter( live ).map( function( l ) { return "the " + l.name + " layout"; } ) )
      .concat( usage.styles.filter( live ).map( function( s ) { return "the site style's icon"; } ) );
  }

  function uploadedImage( fileName ) {
    var name = Library.imageFileName( "" + fileName );
    if( !hasOwnFile( IMAGES_PAGE, name ) || hasOwnFile( IMAGES_PAGE, name + ".link" ) ) throw "There is no uploaded image called " + name;
    return name;
  }

  /* Used in service /OpenForum/AddOn/ContentEditor imageDetails */
  self.imageDetails = function( pageName, fileName ) {
    var page = Library.imageSourcePage( "" + pageName ), name = "" + fileName;
    if( !/^[A-Za-z0-9][A-Za-z0-9._-]{0,119}$/.test( name ) || !hasOwnFile( page, name ) ) throw "There is no image " + name + " on " + page;
    var scan = scanAttachment( page, name );
    var size = Library.imageDimensions( scan.head );
    var url = page + "/" + name;
    var usage = imageUsage( url );
    return { pageName: page, fileName: name, url: url, type: size.type, width: size.width, height: size.height, size: scan.size, sha256: scan.sha256,
      variants: Library.imageVariants( attachmentNames( page ), name ), record: page === IMAGES_PAGE ? ( readImageDetails().images[ name ] || null ) : null,
      usage: usage, blockedBy: blockingUses( usage ), canChange: page === IMAGES_PAGE };
  };

  // Replacing keeps the address, so every page that uses the image shows
  // the new picture. The old file and its resized copies are kept aside.
  /* Used in service /OpenForum/AddOn/ContentEditor replaceImage */
  self.replaceImage = function( user, authorise, fileName, data ) {
    authorise( IMAGES_PAGE );
    authorise( libraryPage() );
    var name = uploadedImage( fileName );
    var bytes = decodeImage( name, data );
    var stamp = stampNow();
    var kept = keepAside( name, "previous", stamp );
    var variants = Library.imageVariants( attachmentNames( IMAGES_PAGE ), name );
    variants.forEach( function( v ) { keepAside( v, "previous", stamp ); openForum.deleteAttachment( IMAGES_PAGE, v ); } );
    writeBytes( IMAGES_PAGE, name, bytes );
    var record = recordImage( name, user, "replaced", { keptAs: kept } );
    var url = IMAGES_PAGE + "/" + name;
    return { fileName: name, url: url, keptAs: kept, resizedCopiesKeptAside: variants, record: record, usage: imageUsage( url ) };
  };

  // Only an image nothing uses can be removed, so no page loses a picture.
  // It is kept aside under a new name rather than deleted.
  /* Used in service /OpenForum/AddOn/ContentEditor removeImage */
  self.removeImage = function( user, authorise, fileName ) {
    authorise( IMAGES_PAGE );
    authorise( libraryPage() );
    var name = uploadedImage( fileName );
    var blocked = blockingUses( imageUsage( IMAGES_PAGE + "/" + name ) );
    if( blocked.length ) throw name + " is still used by " + blocked.join( ", " ) + ". Replace it, or take it out of those first";
    var stamp = stampNow();
    var moved = [ name ].concat( Library.imageVariants( attachmentNames( IMAGES_PAGE ), name ) );
    var kept = moved.map( function( n ) {
      var aside = keepAside( n, "removed", stamp );
      openForum.deleteAttachment( IMAGES_PAGE, n );
      return aside;
    } );
    var data = readImageDetails();
    var record = data.images[ name ] || { history: [] };
    record.history.push( { action: "removed", by: "" + user, at: now(), keptAs: kept[ 0 ] } );
    record.removed = true;
    data.images[ name ] = record;
    openForum.saveAsAttachment( libraryPage(), IMAGE_DETAILS_FILE, JSON.stringify( data, null, 2 ), user );
    return { fileName: name, keptAs: kept[ 0 ], moved: moved };
  };

  // CON-T-059: the images in every image source, without their resized
  // copies: [ { pageName, fileName, url } ].
  self.listImages = function() {
    var list = [];
    Library.imageSources( readImageSources().entries ).forEach( function( source ) {
      if( file.pageExists( source.pageName ) != true ) return;
      var names = attachmentNames( source.pageName );
      names.forEach( function( name ) {
        try { if( Library.imageFileName( name ) !== name ) return; } catch( e ) { return; }
        if( names.some( function( other ) { return other !== name && Library.imageVariants( [ name ], other ).length; } ) ) return;
        list.push( { pageName: source.pageName, fileName: name, url: source.pageName + "/" + name } );
      } );
    } );
    return list;
  };

  function readLinkedImages() {
    if( file.attachmentExists( libraryPage(), LINKED_IMAGES_FILE ) != true ) return { entries: [] };
    return JSON.parse( "" + file.getAttachment( libraryPage(), LINKED_IMAGES_FILE ) );
  }

  /* Used in service /OpenForum/AddOn/ContentEditor listLinkedImages */
  self.listLinkedImages = function() {
    return readLinkedImages().entries;
  };

  /* Used in service /OpenForum/AddOn/ContentEditor addLinkedImage */
  self.addLinkedImage = function( user, authorise, url, name ) {
    authorise( libraryPage() );
    var link = Library.imageLink( "" + url );
    var data = readLinkedImages();
    data.entries.forEach( function( entry ) { if( entry.url === link && !entry.archived ) throw "That image is already linked as " + entry.name; } );
    var title = ( "" + name ).replace( /\s+/g, " " ).trim().slice( 0, 80 ) || link.split( "/" ).pop().split( "?" )[ 0 ];
    var entry = { id: "img-" + Math.random().toString( 36 ).slice( 2, 10 ), url: link, name: title, addedBy: "" + user, addedAt: now(), archived: false };
    data.entries.push( entry );
    openForum.saveAsAttachment( libraryPage(), LINKED_IMAGES_FILE, JSON.stringify( data, null, 2 ), user );
    return entry;
  };

  // Removing a linked image only archives its entry.
  /* Used in service /OpenForum/AddOn/ContentEditor updateLinkedImage */
  self.updateLinkedImage = function( user, authorise, id, archived ) {
    authorise( libraryPage() );
    var data = readLinkedImages(), found = null;
    data.entries.forEach( function( entry ) { if( entry.id === "" + id ) found = entry; } );
    if( !found ) throw "There is no linked image " + id;
    found.archived = ( "" + archived ) === "true";
    openForum.saveAsAttachment( libraryPage(), LINKED_IMAGES_FILE, JSON.stringify( data, null, 2 ), user );
    return found;
  };

  // Image sources (changed 2026-10-23): /Images and /Images are
  // always shown; other pages the site editor adds are kept here.
  var IMAGE_SOURCES_FILE = "image-sources.json";

  function readImageSources() {
    if( file.attachmentExists( libraryPage(), IMAGE_SOURCES_FILE ) != true ) return { entries: [] };
    return JSON.parse( "" + file.getAttachment( libraryPage(), IMAGE_SOURCES_FILE ) );
  }

  /* Used in service /OpenForum/AddOn/ContentEditor listImageSources */
  self.listImageSources = function() {
    return Library.imageSources( readImageSources().entries );
  };

  /* Used in service /OpenForum/AddOn/ContentEditor addImageSource */
  self.addImageSource = function( user, authorise, pageName ) {
    authorise( libraryPage() );
    var page = Library.imageSourcePage( "" + pageName );
    var data = readImageSources();
    Library.imageSources( data.entries ).forEach( function( source ) {
      if( source.pageName === page ) throw page + " is already an image source";
    } );
    if( data.entries.length >= Library.MAX_IMAGE_SOURCES ) throw "There can be at most " + Library.MAX_IMAGE_SOURCES + " extra image sources";
    if( file.pageExists( page ) != true ) throw "There is no page at " + page;
    var entry = { id: "src-" + Math.random().toString( 36 ).slice( 2, 10 ), pageName: page, addedBy: "" + user, addedAt: now() };
    data.entries.push( entry );
    openForum.saveAsAttachment( libraryPage(), IMAGE_SOURCES_FILE, JSON.stringify( data, null, 2 ), user );
    return entry;
  };

  // Removing a source only stops the library showing its images.
  /* Used in service /OpenForum/AddOn/ContentEditor removeImageSource */
  self.removeImageSource = function( user, authorise, id ) {
    authorise( libraryPage() );
    var data = readImageSources(), found = null;
    data.entries = data.entries.filter( function( entry ) {
      if( entry.id !== "" + id ) return true;
      found = entry;
      return false;
    } );
    if( !found ) throw "There is no added image source " + id;
    openForum.saveAsAttachment( libraryPage(), IMAGE_SOURCES_FILE, JSON.stringify( data, null, 2 ), user );
    return found;
  };

  // Where a component is used: the draft of every editor page, and the
  // latest version of every other component and layout.
  /* Used in service /OpenForum/AddOn/ContentEditor libraryUsage */
  self.libraryUsage = function( kind, id ) {
    kind = "" + kind;
    id = "" + id;
    var usage = { pages: [], components: [], layouts: [] };
    if( kind !== "components" ) return usage;
    var ContentPages = js.getObject( ADDON_PAGE, "ContentPages.sjs" );
    ContentPages.listContentPages().forEach( function( entry ) {
      var read = ContentPages.readContentPage( entry.pageId );
      var page = Migrations.migrate( read.revision.page );
      var found = Library.usagesIn( page.root, id );
      if( found.length ) {
        usage.pages.push( { pageId: entry.pageId, title: entry.title, publicPath: entry.publicPath, revision: read.revision.revision,
          archived: !!entry.archived, versions: found.map( function( f ) { return f.version; } ) } );
      }
    } );
    var store = storeFor( null, null );
    [ "components", "layouts" ].forEach( function( other ) {
      store.list( other ).forEach( function( entry ) {
        if( entry.id === id || !entry.content ) return;
        var found = Library.usagesIn( entry.content, id );
        if( found.length ) usage[ other ].push( { id: entry.id, name: entry.name, version: entry.version, archived: entry.archived,
          versions: found.map( function( f ) { return f.version; } ) } );
      } );
    } );
    return usage;
  };
};

