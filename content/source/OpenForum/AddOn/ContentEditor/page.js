
OpenForum.includeScript("/OpenForum/Javascript/Application/SideMenu.js");
OpenForum.includeScript("/OpenForum/AddOn/ContentEditor/ContentEditorClient.js");
OpenForum.includeScript("/OpenForum/AddOn/ContentEditor/model-schema.js");
OpenForum.includeScript("/OpenForum/AddOn/ContentEditor/model-element-definitions.js");
OpenForum.includeScript("/OpenForum/AddOn/ContentEditor/model-style-tokens.js");
OpenForum.includeScript("/OpenForum/AddOn/ContentEditor/model-existing-html.js");
OpenForum.includeScript("/OpenForum/AddOn/ContentEditor/model-collections.js");
OpenForum.includeScript("/OpenForum/AddOn/ContentEditor/model-shared-parts.js");
OpenForum.includeScript("/OpenForum/AddOn/ContentEditor/model-renderer.js");
OpenForum.includeScript("/OpenForum/AddOn/ContentEditor/model-diff.js");
OpenForum.includeScript("/OpenForum/AddOn/ContentEditor/model-themes.js");
OpenForum.includeScript("/OpenForum/AddOn/ContentEditor/model-templates.js");
OpenForum.includeScript("/OpenForum/AddOn/ContentEditor/model-migrations.js");
OpenForum.includeScript("/OpenForum/AddOn/ContentEditor/model-content-store.js");
OpenForum.includeScript("/OpenForum/AddOn/ContentEditor/model-publication.js");
OpenForum.includeScript("/OpenForum/AddOn/ContentEditor/model-canvas-protocol.js");
OpenForum.includeScript("/OpenForum/AddOn/ContentEditor/model-commands.js");
OpenForum.includeScript("/OpenForum/AddOn/ContentEditor/model-isolation-fixtures.js");
OpenForum.includeScript("/OpenForum/AddOn/ContentEditor/model-page-styles.js");
OpenForum.includeScript("/OpenForum/AddOn/ContentEditor/model-site-library.js");
OpenForum.includeScript("/OpenForum/AddOn/ContentEditor/model-layouts.js");

var version = "Content Editor v0.33.0 (agent library and images)";
var APP_PATH = "/OpenForum/AddOn/ContentEditor";
var pageName = APP_PATH; // SideMenu looks for view files on the global pageName
var sideMenu = null;
var PAGE_CONVERTER = "/OpenForum/AddOn/ContentEditor/PageConverter";

// The one OpenForum binding left on the page ({{statusMessage}} in the
// footer); every other panel is drawn by this file.
var statusMessage = "Loading...";

// --- Site configuration (CON-T-039) ----------------------------------------
// Trusted per-site configuration in the site's PublishedPage template folder.
// There is no site picker: a missing or invalid file only disables the
// templates, with the reason shown, and never falls back to another site.
// The site's Development copy, when it has one, is used before the live
// one (2026-10-24), as on the server.
var SITE_DRAFT_ROOT = "/Develop" + "ment";
var LIVE_SITE_CONFIG_PAGE = "/OpenForum/PageTemplates/PublishedPage";
var SITE_CONFIG_FILE = "content-editor-site.json";
var siteConfigPage = SITE_DRAFT_ROOT + LIVE_SITE_CONFIG_PAGE;
var siteConfig = null;
var siteConfigProblem = "";

// --- Shell <-> canvas messaging (CON-T-008, CON-T-041) ----------------------
// Messages go over this session's own IntraQ queue - not the global
// OpenForum.inq bus, which every tab shares and which evaluates "run"
// messages. Each canvas render gets its own renderId, so a message left over
// from a replaced canvas is ignored.
var canvasQueueName = "ContentEditor.session." + generateNonce();
var canvasQueue = null; // created in OpenForum.init
var currentRenderId = null;
var pendingPings = {};
var canvasReadyCallbacks = [];

// CON-T-010 isolation self-test bookkeeping - only populated while a
// ?selftest=isolation run is in progress. isolationQueueArrivals records
// fixture markers that arrived over the IntraQ queue; markers pushed
// straight onto the shell window land in window.ContentEditorIsolationBreaches.
var isolationSelfTestResults = {};
var isolationQueueArrivals = {};

// --- Editor state ----------------------------------------------------------
// openPages: what the Pages list shows.
//   { kind: "draft", type, drafts: { <type>: { page, stack, baseline, opened, compare } } } -
//     a page on the structured model. A templated page keeps one draft per
//     content type, so switching type and back never loses work; a
//     free-form page (the domain-model demo) has type null.
//     A saved page also has entry.saved = { pageId, publicPath, draftPath,
//     baseRevision, archived, revisions } (CON-T-024).
//   { kind: "site", pageName, title } - an existing site page made before
//     the new editor, shown read-only.
var openPages = [];
var savedPages = []; // the editor's registry of saved pages (listContentPages)
var libraryComponents = []; // the site library's components, latest versions (CON-T-045)
var libraryLayouts = []; // and its layouts (CON-T-047)
var siteStyles = []; // and its site style versions (CON-T-050)
var LIBRARY_KINDS = {
  components: { label: "Component", plural: "Components", wrapper: "ce-template--component", root: "component" },
  layouts: { label: "Layout", plural: "Layouts", wrapper: "ce-template--layout", root: "layout" }
};
var saving = false;
var conflictState = null; // { entry, current } after a save was refused as a conflict (CON-T-025)
// The open Publish panel (CON-T-029/030): { entry, revision, check, practice, published, busy, armed, error }
var publishPanel = null;
var editCommittedCallbacks = [];
var currentIndex = -1;
var sitePages = [];
var selectedId = null;
var selectedSlot = null; // CON-T-054: { elementId, slot } - the column clicked in the canvas
var pendingDeleteId = null;
var previewing = false;
var deviceWidth = "desktop";
var openMenu = null;
var editingInfo = null; // { elementId, rich } while text is being edited in the canvas
var linkInProgress = null; // { elementId } while the toolbar asks for a link address
var pendingLinkHref = "#ce-link-pending";

var TYPE_LABELS = { "blog-article": "Blog article", "content-page": "Content page", "existing-page": "Existing page" };
var ROLE_LABELS = {
  "header": "Header", "title": "Title", "standfirst": "Introduction", "hero-section": "Cover", "hero": "Cover image",
  "content": "Content", "body": "Body text", "columns": "Body and call to action", "content-section": "Section",
  "section-heading": "Section heading", "cta-heading": "Panel heading", "cta-text": "Panel text", "cta": "Call to action button"
};
var INSPECTOR_FIELDS = {
  "heading": [ { name: "level", label: "Heading level", type: "choice", options: [ "h1", "h2", "h3", "h4" ] } ],
  "image": [
    { name: "mediaUrl", label: "Image address", type: "text", hint: "<button type='button' class='ce-link-btn' data-pick-image='mediaUrl'>Choose from the image library</button> or paste an address." },
    { name: "alt", label: "Image description", type: "text", hint: "Describe the image for readers who cannot see it." },
    { name: "decorative", label: "Decorative image (no description needed)", type: "boolean" }
  ],
  "button": [
    { name: "text", label: "Button text", type: "text" },
    { name: "href", label: "Link", type: "text", hint: "A page on this site like /ContactUs, or a full https:// address." }
  ],
  "spacer": [ { name: "height", label: "Height", type: "spacing" } ]
};
var STYLE_LABELS = { background: "Background", spacingTop: "Space above", spacingBottom: "Space below", maxWidth: "Maximum width", width: "Width", alignment: "Alignment" };

// --- The app (CON-T-043) -----------------------------------------------------------------------
// application.json lists the views. SideMenu loads each view's fragment and
// script into #ceApplicationView, then runs its init, which comes here.
// The Content view is this file; the others register themselves from their
// own scripts with ContentEditorApp.registerView.

// SideMenu's closeOnShow configures Foundation's off-canvas menu. This app
// shows its views as a top bar and does not load Foundation (its script
// fails without Foundation's CSS), so that one call is a no-op here.
if( typeof window.$ === "undefined" ) window.$ = function() { return { foundation: function() {} }; };

OpenForum.init = function() {
  OpenForum.loadJSON( APP_PATH + "/application.json", function( data ) {
    sideMenu = new SideMenu( "ceViewMenu", "ceApplicationView", data.sideMenu );
    ContentEditorApp.markActiveView();
  }, true );
  window.addEventListener( "hashchange", function() { ContentEditorApp.markActiveView(); } );
};

var ContentEditorApp = ( function() {
  var self = {};
  var views = { content: { init: startContentView, close: function() { commitCanvasEdit(); } } };
  var siteConfigWaiting = [];
  var siteConfigLoaded = false;

  self.util = { esc: esc, readService: readService, toast: function( text ) { toast( text ); } };

  self.registerView = function( id, view ) { views[ id ] = view; };

  self.initView = function( id ) {
    var view = views[ id ];
    if( !view ) return;
    view.init();
    if( view.refresh ) sideMenu.setViewRefresh( "ce-view-" + id, view.refresh );
    if( view.close ) sideMenu.setViewClose( "ce-view-" + id, view.close );
  };

  self.showView = function( id ) { sideMenu.showView( "ce-view-" + id ); };

  self.isShown = function( id ) {
    var element = document.getElementById( "ce-view-" + id );
    return !!element && element.style.display === "block";
  };

  // SideMenu writes plain links; mark the one for the view on show.
  self.markActiveView = function() {
    var links = document.querySelectorAll( "#ceViewMenu a" );
    var title = "";
    try { title = decodeURIComponent( window.location.hash.substring( 1 ) ).split( "." )[ 0 ]; } catch( e ) {}
    var any = false;
    Array.prototype.forEach.call( links, function( link ) { if( link.textContent === title ) any = true; } );
    Array.prototype.forEach.call( links, function( link, i ) {
      var active = any ? link.textContent === title : i === 0;
      link.classList.toggle( "active", active );
      if( active ) link.setAttribute( "aria-current", "page" ); else link.removeAttribute( "aria-current" );
    } );
  };

  // Adopts one of the site's own pages and opens it in the Content view
  // (PHW-T-003).
  self.editSitePage = function( pageName ) {
    self.showView( "content" );
    adoptSitePage( pageName );
  };

  // Opens a library component in the Content view (CON-T-045).
  self.editComponent = function( summary ) {
    if( !summary ) return;
    self.showView( "content" );
    openComponent( summary );
  };

  // Opens a library layout in the Content view (CON-T-047).
  self.editLayout = function( summary ) {
    if( !summary ) return;
    self.showView( "content" );
    openLibraryEntry( "layouts", summary );
  };

  // Site structure (CON-T-051): a new page in a folder, and a page that
  // was moved - any open copy is closed, since its saved state moved too.
  self.newPageIn = function( folder, templateId ) {
    self.showView( "content" );
    createNewPage( templateId, folder );
  };

  self.isOpenWithChanges = function( pageId ) {
    return openPages.some( function( entry ) { return entry.saved && entry.saved.pageId === pageId && anyDraftChanged( entry ); } );
  };

  self.pageMoved = function( pageId ) {
    var current = currentEntry();
    openPages = openPages.filter( function( entry ) { return !( entry.saved && entry.saved.pageId === pageId ); } );
    currentIndex = current ? openPages.indexOf( current ) : -1;
    if( currentIndex === -1 && openPages.length ) currentIndex = 0;
    loadSavedPages( function() { if( currentIndex !== -1 ) openPageAt( currentIndex ); else renderAll(); } );
  };

  // Opens a saved content page in the Content view.
  self.openPage = function( pageId ) {
    self.showView( "content" );
    openSavedPage( pageId );
  };

  // The library changed in another view: refresh the insert list.
  self.componentsChanged = function() { loadComponents(); };

  // CON-T-057: shared parts are edited in the Components view; the canvas
  // reloads a part once its Development copy is saved.
  var pendingSharedPart = null;
  self.openSharedPart = function( path ) {
    pendingSharedPart = ContentEditorSharedParts.livePath( path );
    if( views.components && views.components.openPart && self.isShown( "components" ) ) views.components.openPart( self.takePendingSharedPart() );
    self.showView( "components" );
  };
  self.takePendingSharedPart = function() { var path = pendingSharedPart; pendingSharedPart = null; return path; };
  self.sharedPartChanged = function( path ) {
    var live = ContentEditorSharedParts.livePath( path );
    delete insertFragments[ live ];
    delete insertFragments[ ContentEditorSharedParts.DRAFT_ROOT + live ];
    if( currentPageModel() ) renderCurrentPage();
  };
  // A preview document for a shared part: a page that uses it (its
  // Development copy), with this version of the part in place and the
  // page's own site stylesheets. No scripts run in it.
  self.partPreviewDoc = function( html, pageName, path ) {
    var content = fetch( pageName + "/page.content", { cache: "no-store", credentials: "same-origin" } )
      .then( function( response ) { return response.ok ? response.text() : ""; } ).catch( function() { return ""; } );
    return Promise.all( [ loadPageStyles( pageName ), content ] ).then( function( loaded ) {
      var styles = loaded[ 0 ], live = ContentEditorSharedParts.livePath( path ), parts = {};
      parts[ live ] = html;
      parts[ ContentEditorSharedParts.DRAFT_ROOT + live ] = html;
      var body = ContentEditorExistingHtml.forCanvas( ContentEditorExistingHtml.clean( loaded[ 1 ] ).html, parts );
      var extracted = styles ? styles.extracted : null;
      var wrapper = ContentEditorPageStyles.buildWrapperHtml( extracted ? extracted.wrapperChain : [] );
      return "<!doctype html><html><head><meta charset='utf-8'><base href='" + ( styles ? styles.pageUrl : window.location.origin + "/" ).replace( /'/g, "%27" ) + "' target='_blank'>" +
        ContentEditorPageStyles.buildHeadHtml( extracted ) + "</head><body" + ContentEditorPageStyles.attributesToHtml( extracted ? extracted.bodyAttributes : [] ) + ">" +
        "<style>.ce-insert[data-insert]{outline:2px solid #e0a43a;outline-offset:2px;}</style>" +
        wrapper.open + body + wrapper.close + "</body></html>";
    } );
  };
  self.collectionsUi = {
    html: function( host ) { return collectionsHtml( host ); },
    wire: function( panel, host ) { wireCollections( panel, host ); }
  };

  // Sandboxed previews render at desktop width and are scaled to their card.
  // CON-T-034: a preview iframe only renders its page when its card comes
  // near the screen, so a long list or a hidden view costs nothing until it
  // is looked at. Each frame's srcdoc is set exactly once.
  var lazyFrames = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver( function( entries ) {
    entries.forEach( function( entry ) {
      if( !entry.isIntersecting ) return;
      lazyFrames.unobserve( entry.target );
      entry.target.srcdoc = entry.target.ceSrcdoc;
      delete entry.target.ceSrcdoc;
    } );
  }, { rootMargin: "300px" } );
  self.lazyPreview = function( frame, srcdoc ) {
    if( !lazyFrames ) { frame.srcdoc = srcdoc; return; }
    frame.ceSrcdoc = srcdoc;
    lazyFrames.observe( frame );
  };

  self.scaleThumbnails = function( container ) {
    Array.prototype.forEach.call( container.querySelectorAll( ".ce-layout-thumb" ), function( thumb ) {
      var frame = thumb.querySelector( "iframe" );
      if( frame ) frame.style.transform = "scale(" + ( ( thumb.clientWidth || 300 ) / ( frame.offsetWidth || 1100 ) ) + ")";
    } );
  };

  // --- The image library (CON-T-049) ---------------------------------------
  // Every image the site can use: the image source pages (by default the
  // site's own uploads on /Images and /Images; the site editor
  // can add others, changed 2026-10-23) and linked https images. Resized
  // copies (name200x200.png, name.icon.png...) are left out and used as tiles.
  var IMAGE_FILE = /\.(png|jpe?g|gif|webp)$/i;
  var RESIZED = /(_?\d+x\d+|\.icon|\.thumbnail)\.[a-z]+$/i;
  // Where uploads go (read when needed: the model scripts load after this file).
  self.uploadPage = function() { return ContentEditorSiteLibrary.DEFAULT_IMAGE_SOURCES[ 0 ]; };

  // A missing or unreadable page gives no images rather than stopping the rest.
  function imagesOnPage( pageName ) {
    return fetch( "/OpenForum/Actions/Attachments?pageName=" + encodeURIComponent( pageName ), { cache: "no-store" } )
      .then( function( response ) { return response.ok ? response.json() : {}; } )
      .catch( function() { return {}; } )
      .then( function( reply ) {
        var names = ( ( reply && reply.attachments ) || [] ).map( function( a ) { return ( a.fileName || "" ).split( "/" ).pop(); } );
        return names.filter( function( n ) { return IMAGE_FILE.test( n ) && !RESIZED.test( n ); } ).sort().map( function( name ) {
          var dot = name.lastIndexOf( "." );
          var small = [ name.substring( 0, dot ) + "200x200" + name.substring( dot ), name.substring( 0, dot ) + "_200x200" + name.substring( dot ) ]
            .filter( function( c ) { return names.indexOf( c ) !== -1; } )[ 0 ];
          return { name: name, url: pageName + "/" + name, tile: pageName + "/" + ( small || name ), source: pageName };
        } );
      } );
  }

  // [{ pageName, isDefault, id }]; the defaults alone if the list can't be read.
  self.loadImageSources = function() {
    return readService( "listImageSources", {} )
      .catch( function() { return null; } )
      .then( function( list ) { return list && list.length ? list : ContentEditorSiteLibrary.imageSources( [] ); } );
  };

  // A title for a group of images: a source page, or "linked".
  self.imageGroupTitle = function( source ) {
    if( source === "linked" ) return "Linked images";
    return source === self.uploadPage() ? source + " (uploads)" : source;
  };

  // { sources, images }: images carry source, the page they came from or "linked".
  self.loadImages = function() {
    return self.loadImageSources().then( function( sources ) {
      return Promise.all( sources.map( function( s ) { return imagesOnPage( s.pageName ); } ).concat( [
        readService( "listLinkedImages", {} ).catch( function() { return []; } ).then( function( list ) {
          return ( list || [] ).map( function( l ) { return { name: l.name, url: l.url, tile: l.url, source: "linked", id: l.id, archived: !!l.archived, addedBy: l.addedBy }; } );
        } )
      ] ) ).then( function( groups ) { return { sources: sources, images: [].concat.apply( [], groups ) }; } );
    } );
  };

  // A picker over the library; onPick(image) when one is chosen.
  self.pickImage = function( onPick ) {
    var overlay = document.createElement( "div" );
    overlay.className = "ce-picker";
    overlay.setAttribute( "role", "dialog" );
    overlay.setAttribute( "aria-modal", "true" );
    overlay.setAttribute( "aria-label", "Choose an image" );
    var opener = document.activeElement; // focus goes back here on close (CON-T-032)
    overlay.innerHTML = "<div class='ce-picker-box'><div class='ce-picker-head'><h2>Choose an image</h2>" +
      "<input type='search' class='ce-search' placeholder='Search images' aria-label='Search images'/>" +
      "<button type='button' class='ce-btn' data-close='1'>Cancel</button></div><div class='ce-picker-list'><p class='ce-app-loading'>Loading...</p></div>" +
      "<p class='ce-hint'>Upload or link more images in the Images view.</p></div>";
    document.body.appendChild( overlay );
    var images = [], sources = [];
    var list = overlay.querySelector( ".ce-picker-list" ), search = overlay.querySelector( "input" );
    function close() {
      overlay.remove();
      document.removeEventListener( "keydown", onKey );
      if( opener && document.contains( opener ) ) opener.focus();
    }
    // Escape closes; Tab stays inside the dialog.
    function onKey( event ) {
      if( event.key === "Escape" ) { close(); return; }
      if( event.key !== "Tab" ) return;
      var focusable = Array.prototype.filter.call( overlay.querySelectorAll( "button, input" ), function( el ) { return !el.disabled && el.offsetParent !== null; } );
      if( !focusable.length ) return;
      var first = focusable[ 0 ], last = focusable[ focusable.length - 1 ];
      if( event.shiftKey && document.activeElement === first ) { event.preventDefault(); last.focus(); }
      else if( !event.shiftKey && document.activeElement === last ) { event.preventDefault(); first.focus(); }
    }
    function draw() {
      var q = search.value.trim().toLowerCase();
      var groups = sources.map( function( s ) { return s.pageName; } ).concat( [ "linked" ] );
      list.innerHTML = groups.map( function( source ) {
        var shown = images.filter( function( i ) { return i.source === source && !i.archived && ( !q || i.name.toLowerCase().indexOf( q ) !== -1 ); } );
        if( !shown.length ) return "";
        return "<h3>" + esc( self.imageGroupTitle( source ) ) + "</h3><div class='ce-image-grid'>" + shown.map( function( image ) {
          return "<button type='button' class='ce-image-tile' data-url='" + esc( image.url ) + "'><img loading='lazy' alt='' src='" + esc( image.tile ) + "'/><span>" + esc( image.name ) + "</span></button>";
        } ).join( "" ) + "</div>";
      } ).join( "" ) || "<div class='ce-empty'>No images match.</div>";
    }
    overlay.addEventListener( "click", function( event ) {
      if( event.target === overlay || event.target.closest( "[data-close]" ) ) { close(); return; }
      var tile = event.target.closest( "[data-url]" );
      if( !tile ) return;
      var chosen = images.filter( function( i ) { return i.url === tile.getAttribute( "data-url" ); } )[ 0 ];
      close();
      if( chosen ) onPick( chosen );
    } );
    search.addEventListener( "input", draw );
    document.addEventListener( "keydown", onKey );
    search.focus();
    self.loadImages().then( function( loaded ) { images = loaded.images; sources = loaded.sources; draw(); } );
  };

  // The site style changed: load the configuration again so new pages use
  // the new version, and redraw.
  self.reloadSiteConfig = function( next ) {
    loadSiteConfig( function() { if( currentEntry() ) renderAll(); if( next ) next( siteConfig ); } );
  };

  // The site configuration, loaded once by the Content view.
  self.whenSiteConfig = function( callback ) {
    if( siteConfigLoaded ) callback( siteConfig, siteConfigProblem );
    else siteConfigWaiting.push( callback );
  };

  self.siteConfigLoaded = function() {
    siteConfigLoaded = true;
    document.getElementById( "ce-site-name" ).textContent = siteConfig ? siteConfig.name : "";
    siteConfigWaiting.splice( 0 ).forEach( function( callback ) { callback( siteConfig, siteConfigProblem ); } );
  };

  return self;
} )();

function startContentView() {
  canvasQueue = new OpenForum.IntraQ( canvasQueueName );
  canvasQueue.addListener( handleCanvasMessage );
  wireShell();

  var selftest = OpenForum.getParameter( "selftest" );
  if( selftest === "isolation" ) { runIsolationSelfTest(); return; }
  if( selftest === "domintegrity" ) { runDomIntegritySelfTest(); return; }
  if( selftest === "pagestyles" ) { runPageStylesSelfTest(); return; }

  loadSitePages();
  loadComponents();
  loadSiteConfig( function() { loadSavedPages( function() {
    var template = OpenForum.getParameter( "template" );
    var pageName = OpenForum.getParameter( "pageName" );
    var contentPage = OpenForum.getParameter( "contentPage" );
    var latest = savedPages.filter( function( p ) { return !p.archived; } )
      .sort( function( a, b ) { return a.updatedAt < b.updatedAt ? 1 : -1; } )[ 0 ];
    if( OpenForum.getParameter( "demo" ) === "model" ) {
      showModelDemo();
    } else if( contentPage !== "" ) {
      openSavedPage( contentPage );
    } else if( pageName !== "" ) {
      editPage( pageName );
    } else if( template !== "" ) {
      openExample( template );
    } else if( latest ) {
      openSavedPage( latest.pageId );
    } else if( siteConfig ) {
      openExample( "blog-article" );
      openExample( "content-page", true );
      openPageAt( 0 );
    } else {
      showModelDemo();
    }
  } ); } );

  // Unsaved changes are protected against closing or leaving the page (FR-PAGE-005).
  window.addEventListener( "beforeunload", function( event ) {
    if( !anyUnsavedChanges() ) return;
    event.preventDefault();
    event.returnValue = "";
  } );
}

// GET actions on the editor's own service; fresh every time, so a stale
// cached reply can never stand in for the saved state.
function readService( action, params ) {
  var query = "action=" + encodeURIComponent( action ) + "&ts=" + Date.now();
  for( var key in params || {} ) query += "&" + encodeURIComponent( key ) + "=" + encodeURIComponent( params[ key ] );
  return fetch( "/OpenForum/AddOn/ContentEditor?" + query, { cache: "no-store", credentials: "same-origin" } )
    .then( function( response ) { return response.json(); } )
    .then( function( reply ) {
      if( reply.result !== "ok" ) throw reply.message;
      return reply.data;
    } );
}

function loadSavedPages( next ) {
  readService( "listContentPages" )
    .then( function( list ) { savedPages = list || []; } )
    .catch( function( error ) { savedPages = []; setStatus( "Could not list saved pages: " + error ); } )
    .then( function() { renderRail(); if( next ) next(); } );
}

function anyUnsavedChanges() {
  return openPages.some( function( entry ) {
    if( entry.kind !== "draft" ) return false;
    var draft = entry.drafts[ entry.type || "free-form" ];
    return entry.saved || entry.library ? JSON.stringify( draft.page ) !== draft.baseline : false;
  } );
}

// Opens a saved page at its current draft revision.
function openSavedPage( pageId ) {
  for( var i = 0; i < openPages.length; i++ ) {
    if( openPages[ i ].saved && openPages[ i ].saved.pageId === pageId ) { openPageAt( i ); return; }
  }
  setStatus( "Opening saved page..." );
  readService( "readContentPage", { pageId: pageId } )
    .then( function( data ) {
      var page = ContentEditorMigrations.migrate( data.revision.page );
      var type = page.template ? page.template.id : null;
      var entry = { kind: "draft", type: type, drafts: {}, saved: savedInfo( data.index ) };
      entry.drafts[ type || "free-form" ] = newDraftState( page );
      openPages.push( entry );
      openPageAt( openPages.length - 1 );
    } )
    .catch( function( error ) { setStatus( "Could not open the saved page: " + error ); toast( "" + error ); } );
}

function savedInfo( index ) {
  return { pageId: index.pageId, publicPath: index.publicPath, draftPath: index.draftPath, baseRevision: index.draftRevision,
    archived: !!index.archived, revisions: index.revisions || [], publicationLog: index.publicationLog || [],
    publishedRevision: index.publishedRevision || null, previousPublishedRevision: index.previousPublishedRevision || null };
}

function loadSiteConfig( next ) {
  function settings( page ) {
    return fetch( page + "/" + SITE_CONFIG_FILE, { cache: "no-store", credentials: "same-origin" } )
      .then( function( response ) { if( response.ok ) siteConfigPage = page; return response; } );
  }
  settings( SITE_DRAFT_ROOT + LIVE_SITE_CONFIG_PAGE )
    .then( function( response ) { return response.ok ? response : settings( LIVE_SITE_CONFIG_PAGE ); } )
    .then( function( response ) {
      if( !response.ok ) throw "This site has no content editor configuration (" + response.status + ")";
      return response.json();
    } )
    .then( function( config ) {
      // CON-T-050: the site library's current style is the site's theme.
      return readService( "listLibrary", { kind: "styles" } )
        .then( function( styles ) { siteStyles = styles || []; return ContentEditorSiteLibrary.applyStyles( config, siteStyles ); },
          function() { return config; } );
    } )
    .then( function( config ) {
      var problems = ContentEditorThemes.validateSiteConfig( config );
      if( problems.length ) throw "This site's content editor configuration is invalid: " + problems.join( "; " );
      siteConfig = config;
    } )
    .catch( function( error ) {
      siteConfig = null;
      siteConfigProblem = "" + error;
    } )
    .then( function() { ContentEditorApp.siteConfigLoaded(); next(); } );
}

// PHW-T-003: the site's own pages (from their /Development copies) that
// are not in the editor yet; choosing one adopts it as an existing page.
function loadSitePages() {
  readService( "listSitePages", {} )
    .then( function( pages ) { sitePages = ( pages || [] ).filter( function( p ) { return !p.inEditor; } ); } )
    .catch( function() { sitePages = []; } )
    .then( function() { openPagesMenuOnce(); renderRail(); } );
}

// The Pages list opens by itself the first time site pages are waiting.
var pagesMenuOpened = false;
function openPagesMenuOnce() {
  if( pagesMenuOpened || !sitePages.length ) return;
  pagesMenuOpened = true;
  if( openMenu === null ) openMenu = "pages";
}

function adoptSitePage( pageName ) {
  if( saving ) return;
  saving = true;
  setStatus( "Opening " + pageName + " in the editor..." );
  ContentEditorClient.importContentPage( pageName, "existing-page" )
    .then( function( reply ) {
      if( reply.result !== "ok" ) throw reply.message;
      var data = reply.data;
      var removed = ( data.report || [] ).length ? " Cleaned for safety: " + data.report.join( "; " ) + "." : "";
      toast( "Opened " + pageName + " in the editor." + removed );
      saving = false;
      loadSitePages();
      loadSavedPages( function() { openSavedPage( data.index.pageId ); } );
    } )
    .catch( function( error ) { saving = false; setStatus( "Could not open " + pageName + ": " + error ); toast( "" + error ); } );
}

// --- Library entries: components (CON-T-045) and layouts (CON-T-047) --------
// A library entry opens like a page: a free-form page in the site's theme
// whose only element is the component's or layout's container. Saving adds
// a version to the site library; neither is published on its own.

function loadComponents( next ) {
  readService( "listLibrary", { kind: "components" } )
    .then( function( list ) { libraryComponents = list || []; } )
    .catch( function() { libraryComponents = []; } )
    .then( function() { return readService( "listLibrary", { kind: "layouts" } ); } )
    .then( function( list ) { libraryLayouts = list || []; } )
    .catch( function() { libraryLayouts = []; } )
    .then( function() { if( currentEntry() ) { renderRail(); renderInspector(); } if( next ) next(); } );
}

function findLayout( id ) {
  return libraryLayouts.filter( function( l ) { return l.id === id; } )[ 0 ] || null;
}

function findComponent( id ) {
  return libraryComponents.filter( function( c ) { return c.id === id; } )[ 0 ] || null;
}

function openComponent( summary ) {
  openLibraryEntry( "components", summary );
}

function openLibraryEntry( kind, summary ) {
  for( var i = 0; i < openPages.length; i++ ) {
    if( openPages[ i ].library && openPages[ i ].library.id === summary.id ) { openPageAt( i ); return; }
  }
  var page = ContentEditorSchema.createPage( summary.name, "" );
  page.theme = siteConfig ? JSON.parse( JSON.stringify( siteConfig.theme ) ) : null;
  page.root.children = [ JSON.parse( JSON.stringify( summary.content ) ) ];
  var entry = { kind: "draft", type: null, drafts: {}, library: { kind: kind, id: summary.id, name: summary.name, version: summary.version } };
  entry.drafts[ "free-form" ] = newDraftState( page );
  openPages.push( entry );
  openPageAt( openPages.length - 1 );
}

function libraryKind( entry ) {
  return entry && entry.library ? LIBRARY_KINDS[ entry.library.kind ] : null;
}

function componentRoot( page ) {
  return page.root.children[ 0 ] || null;
}

// The outermost component instance holding elementId that the open entry
// may not edit inside: every instance except the component being edited.
function lockingInstance( elementId ) {
  var page = currentPageModel(), entry = currentEntry();
  if( !page || !elementId ) return null;
  var ownRoot = entry.library ? componentRoot( page ) : null;
  var path = [], node = ContentEditorSchema.findElementById( page.root, elementId );
  while( node ) {
    path.unshift( node );
    var info = ContentEditorSchema.findParentInfo( page.root, node.id );
    node = info ? info.parent : null;
  }
  for( var i = 0; i < path.length; i++ ) {
    if( path[ i ].type === "component" && path[ i ] !== ownRoot ) return path[ i ];
  }
  return null;
}

// Components that can go into the open entry: live ones, and never the
// component being edited or one that already holds it.
function placeableComponents() {
  var entry = currentEntry();
  var editingId = entry && entry.library && entry.library.kind === "components" ? entry.library.id : null;
  return libraryComponents.filter( function( c ) {
    return !c.archived && c.id !== editingId && !( editingId && ContentEditorSiteLibrary.componentIdsIn( c.content ).indexOf( editingId ) !== -1 );
  } );
}

function saveLibraryItem( entry, draft ) {
  var snapshot = JSON.stringify( draft.page );
  var content = JSON.parse( snapshot ).root.children[ 0 ];
  saving = true;
  renderTopBar();
  setStatus( "Saving " + entry.library.name + "..." );
  ContentEditorClient.saveLibraryEntry( entry.library.kind, entry.library.id, entry.library.version, content, "" )
    .then( function( reply ) {
      if( reply.result === "conflict" ) {
        setStatus( reply.message );
        toast( "Not saved: " + reply.message + ". Open it again from " + libraryKind( entry ).plural + " to get their version." );
        return;
      }
      if( reply.result !== "ok" ) throw reply.message;
      entry.library.version = reply.data.version;
      // The server pins a layout to the site theme; keep the draft the same.
      draft.page.root.children[ 0 ] = reply.data.content;
      snapshot = JSON.stringify( draft.page );
      draft.baseline = snapshot;
      setStatus( reply.message );
      toast( reply.message + "." );
      loadComponents();
    } )
    .catch( function( error ) {
      setStatus( "Not saved: " + error );
      toast( "Not saved: " + error );
    } )
    .then( function() {
      saving = false;
      renderAll();
    } );
}

// --- Open pages ---------------------------------------------------------------

// opened keeps the page as it was opened, for "what changed" (CON-T-026);
// baseline moves on with every save.
function newDraftState( page ) {
  var snapshot = JSON.stringify( page );
  return { page: page, stack: ContentEditorCommands.createCommandStack(), baseline: snapshot, opened: snapshot };
}

function openExample( templateId, inBackground ) {
  if( !siteConfig ) { setStatus( siteConfigProblem ); renderAll(); return; }
  try {
    var page = ContentEditorTemplates.createPage( templateId, siteConfig, ContentEditorTemplates.examples[ templateId ] || {} );
    var entry = { kind: "draft", type: templateId, drafts: {} };
    entry.drafts[ templateId ] = newDraftState( page );
    openPages.push( entry );
    if( !inBackground ) openPageAt( openPages.length - 1 );
  } catch( error ) {
    setStatus( "Could not open the template: " + error );
    renderAll();
  }
}

// folder (CON-T-051, optional): a site folder such as /Services/ for the page.
function createNewPage( templateId, folder ) {
  if( !siteConfig ) return;
  var content = templateId === "content-page"
    ? { title: "", standfirst: "<p></p>", introHtml: "<p></p>", sections: [ { heading: "First section", html: "<p></p>" } ], cta: { text: "Get in touch", href: "" } }
    : { title: "", standfirst: "<p></p>", bodyHtml: "<p></p>" };
  var entry = { kind: "draft", type: templateId, drafts: {}, folder: folder || null };
  entry.drafts[ templateId ] = newDraftState( ContentEditorTemplates.createPage( templateId, siteConfig, content ) );
  openPages.push( entry );
  openPageAt( openPages.length - 1 );
  toast( "New " + TYPE_LABELS[ templateId ].toLowerCase() + ( folder ? " in " + folder : "" ) + " - click the title to start writing, and choose its URL slug before you save." );
}

function openPageAt( index ) {
  commitCanvasEdit();
  linkInProgress = null;
  currentIndex = index;
  selectedId = null;
  pendingDeleteId = null;
  openMenu = null;
  linkInProgress = null;
  var entry = currentEntry();
  if( entry && entry.kind === "site" ) { loadSitePage( entry ); return; }
  setStatus( entry ? describeDraft() : "" );
  renderAll();
}

// Exercises every MVP built-in element through the structured model as a
// free-form page (no template). Reachable via ?demo=model.
function showModelDemo() {
  var page = ContentEditorSchema.createPage( "Domain model demo", "demo" );
  var heading = ContentEditorSchema.createElement( "heading", { fields: { text: "Content Editor domain model", level: "h1" } } );
  var richText = ContentEditorSchema.createElement( "rich-text", { fields: { body: {
    format: "editor-rich-text-v1",
    html: "<p>This section, heading, rich-text, image, button, two-column and spacer are all real element instances from <b>ContentEditorSchema</b>, validated by <b>ContentEditorElementDefinitions</b> and rendered by <b>ContentEditorRenderer</b>.</p>"
  } } } );
  var image = ContentEditorSchema.createElement( "image", { fields: {
    mediaId: "demo-media-1", mediaUrl: "/OpenForum/Images/icons/png/picture.png", alt: "Placeholder media", decorative: false
  } } );
  var button = ContentEditorSchema.createElement( "button", { fields: { text: "Example button", href: "#" } } );
  var spacer = ContentEditorSchema.createElement( "spacer", { fields: { height: "space-4" } } );
  var twoColumn = ContentEditorSchema.createElement( "two-column", { slots: {
    columnA: [ ContentEditorSchema.createElement( "heading", { fields: { text: "Column A", level: "h3" } } ) ],
    columnB: [ ContentEditorSchema.createElement( "heading", { fields: { text: "Column B", level: "h3" } } ) ]
  } } );
  page.root.children = [ ContentEditorSchema.createElement( "section", { children: [ heading, richText, image, button, spacer, twoColumn ] } ) ];
  openPages.push( { kind: "draft", type: null, drafts: { "free-form": newDraftState( page ) } } );
  openPageAt( openPages.length - 1 );
  if( !siteConfig && siteConfigProblem ) setStatus( siteConfigProblem + " - showing the free-form domain model demo instead." );
}

// An existing site page, read-only until it can be brought onto the model.
function editPage( pageName ) {
  var title = pageName;
  sitePages.forEach( function( p ) { if( p.pageName === pageName ) title = p.title; } );
  var index = -1;
  openPages.forEach( function( entry, i ) { if( entry.kind === "site" && entry.pageName === pageName ) index = i; } );
  if( index === -1 ) { openPages.push( { kind: "site", pageName: pageName, title: title } ); index = openPages.length - 1; }
  openPageAt( index );
}

function loadSitePage( entry ) {
  setStatus( "Loading " + entry.pageName + " ..." );
  renderAll();
  var fragmentRequest = fetch( entry.pageName + "/page.html.fragment", { cache: "no-store" } )
    .then( function( response ) {
      if( !response.ok ) throw "Could not load " + entry.pageName + " (" + response.status + ")";
      return response.text();
    } );
  Promise.all( [ fragmentRequest, loadPageStyles( entry.pageName ) ] )
    .then( function( results ) {
      if( currentEntry() !== entry ) return;
      renderCanvas( results[ 0 ], null, null, results[ 1 ], null, {} );
      setStatus( "Viewing " + entry.pageName + " - read only until saving pages on the new model arrives (" + describePageStyles( results[ 1 ] ) + ")" );
    } )
    .catch( function( error ) { setStatus( "" + error ); } );
}

function currentEntry() { return openPages[ currentIndex ] || null; }

// The current draft state, or null when a read-only site page is shown.
function currentDraft() {
  var entry = currentEntry();
  if( !entry || entry.kind !== "draft" ) return null;
  return entry.drafts[ entry.type || "free-form" ];
}

function currentPageModel() { var draft = currentDraft(); return draft ? draft.page : null; }

function currentTemplate() {
  var page = currentPageModel();
  return page && page.template ? ContentEditorTemplates.getTemplate( page.template.id, page.template.version ) : null;
}

function describeDraft() {
  var page = currentPageModel();
  if( !page ) return "";
  var entry = currentEntry();
  if( entry.library ) return libraryKind( entry ).label + " " + entry.library.name + " version " + entry.library.version + " - saving adds a new version to the site library";
  if( !page.template ) return "Free-form page - the domain model demo";
  var template = currentTemplate();
  var theme = ContentEditorThemes.getTheme( page.theme.id, page.theme.version );
  return template.label + " template v" + template.version + " - " + theme.name + " theme v" + page.theme.version + ( siteConfig ? " for " + siteConfig.name : "" );
}

function setStatus( text ) {
  statusMessage = text;
  OpenForum.scan();
  document.body.classList.add( "ce-ready" ); // the status line stays hidden until its binding has a value
}

// --- Saving (CON-T-024/025) ----------------------------------------------------------

// Runs fn once any text being edited in the canvas has been committed to
// the model (the canvas reports field-changed, then edit-end, over IntraQ).
function afterEditCommitted( fn ) {
  if( !editingInfo ) { fn(); return; }
  editCommittedCallbacks.push( fn );
  sendToCanvas( "shell:commit" );
}

function runEditCommittedCallbacks() {
  var callbacks = editCommittedCallbacks;
  editCommittedCallbacks = [];
  callbacks.forEach( function( fn ) { fn(); } );
}

function canSave() {
  var entry = currentEntry(), page = currentPageModel();
  return !!page && ( !!page.template || !!entry.library ) && !!siteConfig && !saving && !( entry.saved && entry.saved.archived );
}

// overwrite: save over a conflicting newer revision after the person chose
// to (CON-T-025) - never done silently.
function saveCurrentPage( overwrite ) {
  if( !canSave() ) return;
  afterEditCommitted( function() {
    var entry = currentEntry(), draft = currentDraft();
    if( entry.library ) { saveLibraryItem( entry, draft ); return; }
    if( !entry.saved && !draft.page.slug ) {
      selectPageSettings( "slug" );
      toast( "Choose a URL slug before the first save - it sets where the page will live." );
      return;
    }
    var snapshot = JSON.stringify( draft.page );
    saving = true;
    renderTopBar();
    setStatus( "Saving..." );
    var request = entry.saved
      ? ContentEditorClient.saveContentPage( entry.saved.pageId, overwrite && conflictState ? conflictState.current.id : entry.saved.baseRevision, JSON.parse( snapshot ), overwrite ? "Saved over " + conflictState.current.id : "" )
      : ContentEditorClient.createContentPage( JSON.parse( snapshot ), "Created", entry.folder );
    request
      .then( function( reply ) {
        if( reply.result === "conflict" ) {
          conflictState = { entry: entry, current: reply.data.current };
          setStatus( reply.message );
          toast( "Not saved: " + reply.message + "." );
          if( currentEntry() === entry ) selectPageSettings();
          return;
        }
        if( reply.result !== "ok" ) throw reply.message;
        entry.saved = savedInfo( reply.data.index );
        draft.baseline = snapshot;
        conflictState = null;
        setStatus( "Saved " + reply.data.revision.id + " of " + entry.saved.publicPath + " (draft at " + entry.saved.draftPath + ")" );
        toast( "Saved (" + reply.data.revision.id + ")." );
        loadSavedPages();
      } )
      .catch( function( error ) {
        setStatus( "Not saved: " + error );
        toast( "Not saved: " + error );
      } )
      .then( function() {
        saving = false;
        renderAll();
      } );
  } );
}

// Throws away local changes and loads the newest saved draft (after a
// conflict). The open entry is replaced in place.
function reloadSavedPage() {
  var entry = currentEntry();
  if( !entry || !entry.saved ) return;
  readService( "readContentPage", { pageId: entry.saved.pageId } )
    .then( function( data ) {
      var page = ContentEditorMigrations.migrate( data.revision.page );
      entry.type = page.template ? page.template.id : null;
      entry.drafts = {};
      entry.drafts[ entry.type || "free-form" ] = newDraftState( page );
      entry.saved = savedInfo( data.index );
      conflictState = null;
      selectedId = null;
      setStatus( "Loaded " + data.revision.revision + " saved by " + data.revision.actor );
      renderAll();
    } )
    .catch( function( error ) { toast( "" + error ); } );
}

function setArchived( archived ) {
  var entry = currentEntry();
  if( !entry || !entry.saved ) return;
  ContentEditorClient.setContentPageArchived( entry.saved.pageId, archived )
    .then( function( reply ) {
      if( reply.result !== "ok" ) throw reply.message;
      entry.saved.archived = !!reply.data.archived;
      toast( archived ? "Archived. It stays in Pages and can be restored." : "Restored." );
      loadSavedPages();
      renderAll();
    } )
    .catch( function( error ) { toast( "" + error ); } );
}

function formatSavedAt( iso ) {
  var date = new Date( iso );
  if( isNaN( date.getTime() ) ) return iso;
  return date.toLocaleDateString( "en-GB", { day: "numeric", month: "short" } ) + " " + date.toLocaleTimeString( "en-GB", { hour: "2-digit", minute: "2-digit" } );
}

// --- Commands ---------------------------------------------------------------------

// build: a function returning the command, so a command that refuses (for
// example a move into a container that can't hold the element) is reported
// rather than thrown.
function runCommand( build, message ) {
  var draft = currentDraft();
  if( !draft ) return false;
  try {
    var command = build();
    draft.stack.apply( command );
    setStatus( message || command.type + " on " + ( command.targetIds || [] ).join( ", " ) );
    if( message ) toast( message );
  } catch( error ) {
    setStatus( "" + error );
    toast( "" + error );
    return false;
  }
  renderAll();
  return true;
}

function metadataCommand( field, value ) {
  var page = currentPageModel();
  var before = JSON.parse( JSON.stringify( page.metadata[ field ] === undefined ? null : page.metadata[ field ] ) );
  var after = JSON.parse( JSON.stringify( value ) );
  return { type: "UpdatePageMetadata", targetIds: [ "metadata." + field ],
    apply: function() { page.metadata[ field ] = JSON.parse( JSON.stringify( after ) ); },
    invert: function() { page.metadata[ field ] = before; } };
}

function pagePropertyCommand( property, value ) {
  var page = currentPageModel(), before = page[ property ];
  return { type: "UpdatePageMetadata", targetIds: [ property ],
    apply: function() { page[ property ] = value; },
    invert: function() { page[ property ] = before; } };
}

function performUndoRedo( isRedo ) {
  var draft = currentDraft();
  if( !draft ) return;
  var command = isRedo ? draft.stack.redo() : draft.stack.undo();
  if( !command ) return;
  pendingDeleteId = null;
  setStatus( ( isRedo ? "Redid: " : "Undid: " ) + command.type + " on " + ( command.targetIds || [] ).join( ", " ) );
  renderAll();
}

// Keeps rich text to the tags the templates style; links only to site
// paths, http(s) or mailto (and the toolbar's own pending-link marker).
// The canvas sends raw innerHTML - this is where it becomes model content.
function cleanRichText( html ) {
  var doc = new DOMParser().parseFromString( "<div>" + html + "</div>", "text/html" );
  var allowed = { P: 1, H2: 1, H3: 1, BLOCKQUOTE: 1, UL: 1, OL: 1, LI: 1, STRONG: 1, B: 1, EM: 1, I: 1, A: 1, BR: 1 };
  function walk( node ) {
    Array.prototype.slice.call( node.children ).forEach( function( child ) {
      if( !allowed[ child.tagName ] ) {
        if( child.tagName === "DIV" ) {
          var paragraph = doc.createElement( "p" );
          paragraph.innerHTML = child.innerHTML;
          child.parentNode.replaceChild( paragraph, child );
          walk( paragraph );
          return;
        }
        child.parentNode.replaceChild( doc.createTextNode( child.textContent || "" ), child );
        return;
      }
      var href = child.tagName === "A" ? child.getAttribute( "href" ) : null;
      Array.prototype.slice.call( child.attributes ).forEach( function( attribute ) { child.removeAttribute( attribute.name ); } );
      if( href && ( /^(https?:\/\/|mailto:|\/)/i.test( href ) || href === pendingLinkHref ) ) child.setAttribute( "href", href );
      walk( child );
    } );
  }
  walk( doc.body.firstChild );
  return doc.body.firstChild.innerHTML;
}

// Applies a field edit from the canvas or the inspector as an undoable
// UpdateField command. Returns true if the page changed.
function applyFieldEdit( elementId, fieldId, rich, value ) {
  var page = currentPageModel();
  if( !page ) return false;
  var element = ContentEditorSchema.findElementById( page.root, elementId );
  if( !element ) return false;
  var newValue;
  if( fieldId === "html" && element.type === "html" ) {
    // PHW-T-002: existing markup, from the canvas (inserted parts expanded)
    // or the markup box, cleaned with its own rules, not the rich-text ones.
    var markup = ContentEditorExistingHtml.clean( ContentEditorExistingHtml.fromCanvas( String( value || "" ) ) ).html;
    if( element.fields.html && element.fields.html.html === markup ) return false;
    newValue = { format: ContentEditorTemplates.EXISTING_HTML_FORMAT, html: markup };
  } else if( rich ) {
    var html = cleanRichText( value );
    if( element.fields[ fieldId ] && element.fields[ fieldId ].html === html ) return false;
    newValue = { format: ContentEditorTemplates.RICH_TEXT_FORMAT, html: html };
  } else {
    newValue = typeof value === "string" && fieldId === "text" ? value.replace( /\s+/g, " " ).trim() : value;
    if( element.fields[ fieldId ] === newValue ) return false;
  }
  return runCommand( function() { return ContentEditorCommands.createUpdateFieldCommand( page, elementId, fieldId, newValue ); }, "Updated " + labelFor( element ).toLowerCase() );
}

// --- Template locks -------------------------------------------------------------------

function roleCounts( page ) {
  var counts = {};
  ( function walk( element ) {
    if( element.role ) counts[ element.role ] = ( counts[ element.role ] || 0 ) + 1;
    ContentEditorSchema.childGroups( element ).forEach( function( group ) { group.items.forEach( walk ); } );
  } )( page.root );
  return counts;
}

// What the template allows for an element: unique template parts stay where
// they are; repeatable parts (content page sections) can move, be
// duplicated, and be deleted while at least one remains.
function locksFor( element ) {
  var entry = currentEntry(), page = currentPageModel();
  if( entry && entry.library && element === componentRoot( page ) ) return { canMove: false, canDuplicate: false, canDelete: false, locked: true, componentRoot: true };
  var instance = lockingInstance( element.id );
  if( instance && instance !== element ) return { canMove: false, canDuplicate: false, canDelete: false, locked: true, inComponent: instance };
  var template = currentTemplate();
  if( !template ) return { canMove: true, canDuplicate: true, canDelete: true, locked: false };
  var counts = roleCounts( currentPageModel() );
  var holdsLockedPart = false;
  ( function walk( node ) {
    var spec = node.role && template.roles[ node.role ];
    if( spec && ( spec.unique || ( spec.required && counts[ node.role ] <= 1 ) ) ) holdsLockedPart = true;
    ContentEditorSchema.childGroups( node ).forEach( function( group ) { group.items.forEach( walk ); } );
  } )( element );
  var spec = element.role ? template.roles[ element.role ] : null;
  return {
    canMove: !( spec && spec.unique ) && !holdsLockedPart,
    canDuplicate: !holdsLockedPart,
    canDelete: !holdsLockedPart,
    locked: holdsLockedPart
  };
}

// --- Canvas -------------------------------------------------------------------------------

function generateNonce() {
  return "n" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

function generateRenderId() {
  return "render." + generateNonce();
}

function sendToCanvas( type, payload, correlationId ) {
  canvasQueue.send( ContentEditorProtocol.createMessage( type, payload, correlationId, currentRenderId ) );
}

// One-shot callbacks run when the current render's canvas reports
// canvas:ready.
// The page's own html attributes, with the editor's language if the page
// doesn't give one, so assistive technology reads the canvas correctly
// (CON-T-032, WCAG 3.1.1).
function canvasHtmlAttributes( extracted ) {
  var attributes = ( extracted ? extracted.htmlAttributes : [] ) || [];
  var hasLang = attributes.some( function( a ) { return ( "" + a.name ).toLowerCase() === "lang"; } );
  return hasLang ? attributes : attributes.concat( [ { name: "lang", value: document.documentElement.lang || "en" } ] );
}

// CON-T-032: tells screen reader users what just happened (selection
// moves in the canvas and panel, which they can't see).
function announce( text ) {
  var region = document.getElementById( "ce-announce" );
  if( !region ) return;
  region.textContent = "";
  setTimeout( function() { region.textContent = text; }, 30 );
}

// Where the settings panel is: beside the page, or under it on narrow
// screens (CON-T-035).
function settingsPlace() {
  return window.matchMedia && window.matchMedia( "(max-width: 900px)" ).matches ? "below the page" : "on the right";
}

function announceSelection() {
  var page = currentPageModel();
  var element = page && selectedId ? ContentEditorSchema.findElementById( page.root, selectedId ) : null;
  announce( element ? "Selected " + labelFor( element ) + ". Its settings are in the panel " + settingsPlace() + "." : "Page settings" );
}

function whenCanvasReady( callback ) {
  canvasReadyCallbacks.push( callback );
}

// Editor-only chrome (selection, hover, empty-field prompts). Never part of
// the renderer's output, so it can never reach a published page.
var EDITOR_CHROME_STYLE =
  "[data-element-id]{cursor:pointer;}" +
  "[data-element-id]:not([data-element-type=page-root]):not([data-element-type=section]):hover{outline:1px dashed var(--ce-accent,#2ba6cb);outline-offset:3px;}" +
  "[data-element-type=section][data-role=content-section]:hover{outline:1px dashed var(--ce-accent,#2ba6cb);outline-offset:6px;}" +
  "[data-element-id]:focus-visible{outline:2px dashed var(--ce-accent,#2ba6cb);outline-offset:3px;}" +
  ".ce-selected{outline:2px solid var(--ce-accent,#2ba6cb) !important;outline-offset:3px;}" +
  "[contenteditable=true]{cursor:text;outline:2px solid var(--ce-accent,#2ba6cb) !important;outline-offset:3px;}" +
  "[data-role=title]:empty:before{content:'Give your page a title';color:#a9b2b6;}" +
  "[data-element-type=rich-text]:empty:before,[data-element-type=rich-text]>p:only-child:empty:before{content:'Start writing...';color:#a9b2b6;}" +
  ".ce-template .ce-image-empty{display:grid;place-items:center;min-height:180px;background:var(--ce-soft,#eef2f4);border-radius:11px;color:var(--ce-accent,#2ba6cb);font:600 12px Arial,sans-serif;}" +
  ".ce-image-empty:after{content:'Cover image - add an image address in the settings panel';}" +
  // CON-T-054: empty containers would have no height and so nothing to click.
  ".ce-column:empty,[data-element-type=section]:empty,[data-element-type=component]:empty{display:grid;place-items:center;min-height:80px;box-sizing:border-box;padding:12px;border:1px dashed var(--ce-accent,#2ba6cb);border-radius:9px;background:rgba(43,166,203,.05);color:var(--ce-accent,#2ba6cb);font:600 12px Arial,sans-serif;text-align:center;}" +
  ".ce-column:empty:after{content:'Empty column - click it, then add content from the left';}" +
  "[data-element-type=section]:empty:after{content:'Empty section - click it, then add content from the left';}" +
  "[data-element-type=component]:empty:after{content:'Empty component';}" +
  ".ce-column.ce-target-slot{outline:2px solid var(--ce-accent,#2ba6cb);outline-offset:-2px;background:rgba(43,166,203,.12);}" +
  "[data-element-type=two-column]:hover>.ce-column:not(:empty){outline:1px dotted var(--ce-accent,#2ba6cb);outline-offset:2px;}" +
  // CON-T-026: parts that changed, when "Mark changed parts" is on.
  ".ce-changed{box-shadow:0 0 0 3px rgba(232,140,40,.6);border-radius:3px;}" +
  // PHW-T-002: shared parts pulled into existing markup with &insert:.
  ".ce-insert{outline:1px dashed #9db7c8;outline-offset:2px;cursor:default;}" +
  ".ce-kicker,.ce-byline,.ce-tags{cursor:pointer;}" +
  ".ce-kicker:hover,.ce-byline:hover,.ce-tags:hover{outline:1px dashed var(--ce-accent,#2ba6cb);outline-offset:3px;}";

var DEMO_STYLE =
  "body{font-family:sans-serif;margin:0;padding:16px;color:#222;}" +
  ".ce-section{display:flex;flex-direction:column;gap:12px;}" +
  ".ce-heading{margin:0;}" +
  ".ce-image{max-width:120px;height:auto;}" +
  ".ce-button{display:inline-block;padding:8px 14px;background:#2ba6cb;color:#fff;text-decoration:none;border-radius:4px;width:fit-content;}" +
  ".ce-two-column{display:flex;gap:24px;}" +
  ".ce-column{flex:1;border:dashed 1px #ccc;padding:8px;}" +
  ".ce-spacer{height:24px;}";

// Scripts the canvas loads with the per-render nonce: the platform's own
// IntraQ and the shared protocol and runtime. open-forum-intraq.js ends by
// registering the global OpenForum.inq bus through OpenForum.addInitialiser;
// the stub OpenForum object makes that a no-op. The full open-forum.js is
// deliberately not loaded: its auto-scan would evaluate the page's {{}}
// bindings.
// The canvas's own files carry page.js's ?ts= stamp, so a new release of
// the editor never runs against a cached older runtime.
var CANVAS_SCRIPT_STAMP = ( function() {
  var script = document.currentScript;
  var match = script && /[?&]ts=(\d+)/.exec( script.src );
  return match ? "?ts=" + match[ 1 ] : "";
} )();
var CANVAS_SCRIPT_URLS = [
  "/OpenForum/Javascript/Core/open-forum-intraq.js",
  "/OpenForum/AddOn/ContentEditor/model-canvas-protocol.js",
  "/OpenForum/AddOn/ContentEditor/model-page-import.js", // cleans pasted rich text (CON-T-053)
  "/OpenForum/AddOn/ContentEditor/model-canvas-runtime.js"
];

function buildCanvasRuntimeScript( nonce, renderId, options ) {
  var config = JSON.stringify( {
    renderId: renderId,
    queueName: canvasQueueName,
    selectedId: options.selectedId || null,
    selectedSlot: options.selectedSlot || null,
    changedIds: options.changedIds || [],
    preview: !!options.preview,
    openComponentId: options.openComponentId || null
  } ).replace( /</g, "\\u003c" );
  var tags = "<script nonce='" + nonce + "'>var OpenForum={addInitialiser:function(){}};window.ContentEditorCanvasConfig=" + config + ";</" + "script>";
  for( var i = 0; i < CANVAS_SCRIPT_URLS.length; i++ ) {
    tags += "<script nonce='" + nonce + "' src='" + CANVAS_SCRIPT_URLS[ i ] + CANVAS_SCRIPT_STAMP + "'></" + "script>";
  }
  return tags;
}

// Isolated canvas (CON-T-007/008/041): the page is rendered inside a
// sandboxed same-origin iframe, so its CSS can't reach the shell, with a
// per-render CSP nonce, so only our own scripts run - any script tag or
// inline handler in the page's markup is blocked by the browser.
// pageStyles (optional, from loadPageStyles) brings in a real page's own
// site stylesheets and template wrapper. renderId (optional) lets a caller
// build content that refers to the render before it happens - only the
// isolation self-test needs that. options: { preview, selectedId }.
function renderCanvas( fragmentHtml, inlineStyle, responsiveCss, pageStyles, renderId, options ) {
  options = options || {};
  var nonce = generateNonce();
  currentRenderId = renderId || generateRenderId();
  canvasReadyCallbacks = []; // callbacks belong to the render that follows them
  var origin = window.location.origin;
  var baseUrl = pageStyles ? pageStyles.pageUrl : origin + "/";
  var extracted = pageStyles ? pageStyles.extracted : null;
  var wrapper = ContentEditorPageStyles.buildWrapperHtml( extracted ? extracted.wrapperChain : [] );
  var doc =
    "<!doctype html><html" + ContentEditorPageStyles.attributesToHtml( canvasHtmlAttributes( extracted ) ) + "><head>" +
    "<meta charset='utf-8'>" +
    "<meta name='viewport' content='width=device-width,initial-scale=1'>" +
    "<meta http-equiv='Content-Security-Policy' content=\"" + ContentEditorPageStyles.buildCanvasCsp( origin, nonce ) + "\">" +
    "<base href='" + baseUrl.replace( /'/g, "%27" ) + "' target='_blank'>" +
    ContentEditorPageStyles.buildHeadHtml( extracted ) +
    ( inlineStyle ? "<style>" + inlineStyle + "</style>" : "" ) +
    // CON-T-018: real @media rules for tablet/phone style overrides.
    ( responsiveCss ? "<style>" + responsiveCss + "</style>" : "" ) +
    ( options.preview ? "" : "<style>" + EDITOR_CHROME_STYLE + "</style>" ) +
    "</head><body" + ContentEditorPageStyles.attributesToHtml( extracted ? extracted.bodyAttributes : [] ) + ">" +
    wrapper.open + fragmentHtml + wrapper.close +
    buildCanvasRuntimeScript( nonce, currentRenderId, options ) + "</body></html>";
  // A fresh iframe element for every render: Chrome keeps the first
  // document when srcdoc is set twice before the first one has loaded.
  var oldCanvas = document.getElementById( "editorCanvas" );
  var canvas = oldCanvas.cloneNode( false );
  canvas.removeAttribute( "srcdoc" );
  canvas.setAttribute( "sandbox", "allow-scripts allow-same-origin" );
  canvas.title = options.preview ? "Page preview" : "Page being edited";
  canvas.srcdoc = doc;
  oldCanvas.parentNode.replaceChild( canvas, oldCanvas );
  editingInfo = null;
}

function stripEditorMarkers( html ) {
  return html.replace( / data-(element-id|element-type|field-id)="[^"]*"/g, "" );
}

function templateStyleFor( page ) {
  var theme = ContentEditorThemes.getTheme( page.theme.id, page.theme.version );
  return "html,body{margin:0;}" + ContentEditorThemes.buildCss( theme );
}

// Renders the current draft from the model into the canvas. Every edit and
// every undo/redo goes through this, so the canvas never drifts from the
// model.
// --- Page layouts (CON-T-048) -------------------------------------------------
// A page shows inside the layout version it chose. Versions are fetched once
// and kept, since a version never changes.
var layoutVersions = {}; // "id@version" -> layout entry at that version, or "loading"

function layoutVersion( id, version ) {
  var key = id + "@" + version;
  if( layoutVersions[ key ] === undefined ) {
    layoutVersions[ key ] = "loading";
    readService( "readLibraryEntry", { kind: "layouts", id: id, version: version } )
      .then( function( entry ) { layoutVersions[ key ] = entry; renderCurrentPage(); } )
      .catch( function() { layoutVersions[ key ] = null; } );
  }
  return layoutVersions[ key ] === "loading" ? null : layoutVersions[ key ];
}

// The chosen layout's markup either side of the page, for the canvas. Its
// elements are renamed so the canvas never treats them as the page's own.
function layoutFrameFor( page ) {
  var choice = page.layout;
  if( !page.template || !choice || !choice.id || choice.templateMode === "none" || choice.templateMode === "own" ) return null;
  var entry = layoutVersion( choice.id, choice.version );
  if( !entry || !entry.content ) return null;
  var markup = ContentEditorPublication.cleanMarkup( ContentEditorRenderer.renderElement( entry.content ) ).replace( / data-element-id=/g, " data-layout-element-id=" );
  var at = markup.indexOf( "<!--ce-content-slot-->" );
  if( at === -1 ) return null;
  return {
    before: "<div class=\"ce-template ce-template--layout\">" + markup.substring( 0, at ),
    after: markup.substring( at + "<!--ce-content-slot-->".length ) + "</div>",
    css: ContentEditorLayouts.LAYOUT_CSS + ContentEditorRenderer.renderResponsiveCss( { root: entry.content } ).replace( /data-element-id/g, "data-layout-element-id" )
  };
}

function layoutCommand( changes ) {
  var page = currentPageModel();
  var next = JSON.parse( JSON.stringify( page.layout || ContentEditorSchema.createLayoutChoice() ) );
  for( var key in changes ) next[ key ] = changes[ key ];
  return pagePropertyCommand( "layout", next );
}

// Shown only while editing a component or layout: where the page content
// will go, and the outline of a component.
var LIBRARY_CANVAS_STYLE = ".ce-content-slot{min-height:140px;border:2px dashed #9db7c8;border-radius:10px;margin:18px;display:flex;align-items:center;justify-content:center;background:#ffffff99}" +
  ".ce-content-slot:empty::before{content:'Each page\\'s own content goes here';font:600 14px Arial,sans-serif;color:#5d7383}";

function renderCurrentPage() {
  var page = currentPageModel();
  if( !page ) return false;
  var entry = currentEntry();
  if( page.template && page.template.id === "existing-page" ) return renderExistingPage( page, entry );
  var html = page.template ? ContentEditorTemplates.renderPage( page ) : ContentEditorRenderer.renderPage( page );
  // A component is shown in the site's theme, like the pages it goes into.
  if( entry.library ) html = "<div class=\"ce-template " + libraryKind( entry ).wrapper + "\">" + html + "</div>";
  if( previewing ) html = page.template ? ContentEditorPublication.renderBody( page ) : stripEditorMarkers( html );
  var style = page.template || ( entry.library && page.theme ) ? templateStyleFor( page ) : DEMO_STYLE;
  if( entry.library ) style += LIBRARY_CANVAS_STYLE + ContentEditorLayouts.LAYOUT_CSS;
  var frame = layoutFrameFor( page );
  if( frame ) {
    html = frame.before + html + frame.after;
    style += frame.css;
  }
  renderCanvas( html, style, ContentEditorRenderer.renderResponsiveCss( page ), null, null, { preview: previewing, selectedId: selectedId, selectedSlot: activeSlot(), changedIds: markedChangeIds(),
    openComponentId: entry.library && entry.library.kind === "components" && componentRoot( page ) ? componentRoot( page ).id : null } );
  return true;
}

// --- Existing pages (PHW-T-002) ---------------------------------------------
// An existing page is shown in the site's own design: the stylesheets and
// wrapper of its own Development page.html, its &insert: parts fetched and
// shown as locked parts.
var insertFragments = {}, insertLoading = {}, existingPageStyles = {};

function ensureInsertFragments( page ) {
  var paths = [];
  ( function walk( element ) {
    if( element.type === "html" ) paths = paths.concat( ContentEditorExistingHtml.inserts( ( element.fields.html || {} ).html ) );
    ContentEditorSchema.childGroups( element ).forEach( function( group ) { group.items.forEach( walk ); } );
  } )( page.root );
  paths.forEach( function( path ) {
    if( insertFragments.hasOwnProperty( path ) || insertLoading[ path ] ) return;
    insertLoading[ path ] = true;
    fetch( path, { cache: "no-store", credentials: "same-origin" } )
      .then( function( response ) { return response.ok ? response.text() : null; } )
      .catch( function() { return null; } )
      .then( function( text ) {
        insertFragments[ path ] = text === null ? "<em>Could not load " + esc( path ) + "</em>" : ContentEditorExistingHtml.clean( text ).html;
        delete insertLoading[ path ];
        if( currentPageModel() ) renderCurrentPage();
      } );
  } );
  ContentEditorRenderer.setInsertFragments( insertFragments );
}

function renderExistingPage( page, entry ) {
  ensureInsertFragments( page );
  var source = entry.saved ? entry.saved.draftPath : null;
  if( source && existingPageStyles[ source ] === undefined ) {
    existingPageStyles[ source ] = null;
    loadPageStyles( source ).then( function( styles ) {
      existingPageStyles[ source ] = styles || false;
      if( currentEntry() === entry ) renderCurrentPage();
    } );
  }
  var html = previewing ? ContentEditorPublication.renderBody( page ) : ContentEditorTemplates.renderPage( page );
  renderCanvas( html, "", collectionCanvasCss( page, entry ), existingPageStyles[ source ] || null, null, { preview: previewing, selectedId: selectedId, changedIds: markedChangeIds() } );
  return true;
}

// --- Collections (CON-T-056) -------------------------------------------------
// Repeating items the site declares in its configuration (a slideshow, a row
// of panels), managed as a list in Page settings. Every change is an edit of
// the existing markup, so it is undoable and the site's own script still
// animates the published page. A collection declared with "canvas": "one"
// shows one item at a time in the canvas.
var collectionShown = {}, collectionOpen = null;

// Where collections are edited: an existing page's markup, or a shared
// part's (CON-T-057). host: { key, defs, markup(), apply( html, message ),
// redraw() }; apply returns true if the markup changed.
function pageCollectionHost( page, entry ) {
  if( !page || !page.template || page.template.id !== "existing-page" || !siteConfig || !entry || !entry.saved ) return null;
  var block = ContentEditorTemplates.findByRole( page, "page-html" )[ 0 ];
  if( !block ) return null;
  return {
    key: entry.saved.pageId,
    defs: ContentEditorCollections.forPage( siteConfig, entry.saved.publicPath ),
    markup: function() {
      var current = ContentEditorTemplates.findByRole( currentPageModel(), "page-html" )[ 0 ];
      return ( ( current && current.fields.html ) || {} ).html || "";
    },
    apply: function( html, message ) {
      if( !applyFieldEdit( block.id, "html", false, html ) ) { toast( "No change." ); return false; }
      toast( message );
      return true;
    },
    redraw: function() { renderCurrentPage(); renderInspector(); }
  };
}

function hostCollections( host ) {
  if( !host ) return [];
  var markup = host.markup();
  return host.defs.map( function( def ) { return { def: def, markup: markup, found: ContentEditorCollections.find( markup, def ) }; } );
}

function collectionKey( host, def ) { return host.key + ":" + def.id; }

function collectionCanvasCss( page, entry ) {
  var host = pageCollectionHost( page, entry );
  return hostCollections( host ).map( function( c ) {
    if( !c.found || !c.found.items.length ) return "";
    var shown = Math.min( collectionShown[ collectionKey( host, c.def ) ] || 0, c.found.items.length - 1 );
    return ContentEditorCollections.canvasCss( c.markup, c.def, shown );
  } ).join( "" );
}

function collectionItemLabel( def, item ) {
  var names = Object.keys( def.fields );
  for( var i = 0; i < names.length; i++ ) {
    var field = item.fields[ names[ i ] ];
    if( field.type === "text" && field.value ) return field.value;
    if( field.type === "link" && field.value.text ) return field.value.text;
  }
  return item.text || "Item " + ( item.index + 1 );
}

function collectionsHtml( host ) {
  if( !host ) return "";
  var problems = siteConfig ? ContentEditorCollections.validateDefinitions( siteConfig.collections ) : [];
  var html = problems.length ? "<p class='ce-lock-note'>Some collections in this site's configuration are not used: " + esc( problems.join( "; " ) ) + "</p>" : "";
  hostCollections( host ).forEach( function( c ) {
    var key = collectionKey( host, c.def );
    html += "<div class='ce-field-group ce-collection' data-collection='" + esc( c.def.id ) + "'><h3>" + esc( c.def.name ) + "</h3>";
    if( !c.found ) { html += "<p class='ce-hint'>Not found here (" + esc( c.def.container ) + ").</p></div>"; return; }
    var count = c.found.items.length, shown = Math.min( collectionShown[ key ] || 0, Math.max( count - 1, 0 ) );
    var oneAtATime = c.def.canvas === "one";
    html += "<p class='ce-hint'>" + count + " item" + ( count === 1 ? "" : "s" ) + "." + ( oneAtATime ? " The page shows them with its own script; here the canvas shows one at a time." : "" ) + "</p><ol class='ce-collection-items'>";
    c.found.items.forEach( function( item ) {
      var i = item.index, open = collectionOpen === key + ":" + i, label = collectionItemLabel( c.def, item );
      var isShown = oneAtATime && i === shown;
      html += "<li class='" + ( isShown ? "shown" : "" ) + "'><div class='ce-collection-row'>" + ( oneAtATime ? "<button type='button' class='ce-link-btn' data-col-show='" + i + "' aria-pressed='" + isShown + "' title='Show it in the canvas'>" + esc( label ) + "</button>" : "<strong class='ce-collection-label'>" + esc( label ) + "</strong>" ) + "<span class='ce-collection-tools'>" +
        "<button type='button' data-col-move='" + i + "' data-to='" + ( i - 1 ) + "'" + ( i === 0 ? " disabled" : "" ) + " aria-label='Move " + esc( label ) + " up'>↑</button>" +
        "<button type='button' data-col-move='" + i + "' data-to='" + ( i + 1 ) + "'" + ( i === count - 1 ? " disabled" : "" ) + " aria-label='Move " + esc( label ) + " down'>↓</button>" +
        "<button type='button' data-col-copy='" + i + "'" + ( c.def.max !== undefined && count >= c.def.max ? " disabled" : "" ) + " aria-label='Copy " + esc( label ) + "'>Copy</button>" +
        "<button type='button' data-col-remove='" + i + "'" + ( c.def.min !== undefined && count <= c.def.min ? " disabled" : "" ) + " aria-label='Remove " + esc( label ) + "'>Remove</button>" +
        "<button type='button' data-col-open='" + i + "' aria-expanded='" + open + "'>" + ( open ? "Close" : "Edit" ) + "</button></span></div>";
      if( open ) html += collectionFieldsHtml( c.def, item );
      html += "</li>";
    } );
    html += "</ol></div>";
  } );
  return html;
}

function collectionFieldsHtml( def, item ) {
  return "<div class='ce-collection-fields'>" + Object.keys( def.fields ).map( function( name ) {
    var f = item.fields[ name ], label = def.fields[ name ].label || name.charAt( 0 ).toUpperCase() + name.slice( 1 );
    var id = "ce-col-" + item.index + "-" + name;
    if( f.missing ) return "<p class='ce-hint'>" + esc( label ) + ": not in this item.</p>";
    if( f.type === "image" ) return field( label, "<input id='" + id + "' type='text' spellcheck='false' data-col-field='" + esc( name ) + "' value='" + esc( f.value ) + "'>",
      "<button type='button' class='ce-link-btn' data-col-pick='" + esc( name ) + "'>Choose from the image library</button> or paste an address.", id );
    if( f.type === "link" ) return field( label + " address", "<input id='" + id + "' type='text' spellcheck='false' data-col-field='" + esc( name ) + "' data-part='href' value='" + esc( f.value.href ) + "'>", null, id ) +
      ( f.editable ? field( label + " text", "<input id='" + id + "-text' type='text' data-col-field='" + esc( name ) + "' data-part='text' value='" + esc( f.value.text ) + "'>", null, id + "-text" ) : "<p class='ce-hint'>The link text has its own markup; edit it on the page.</p>" );
    if( !f.editable ) return "<p class='ce-hint'>" + esc( label ) + " has its own markup; edit it on the page.</p>";
    return field( label, f.value.length > 60 ? "<textarea id='" + id + "' rows='3' data-col-field='" + esc( name ) + "'>" + esc( f.value ) + "</textarea>" :
      "<input id='" + id + "' type='text' data-col-field='" + esc( name ) + "' value='" + esc( f.value ) + "'>", null, id );
  } ).join( "" ) + "</div>";
}

function wireCollections( panel, host ) {
  hostCollections( host ).forEach( function( c ) {
    var box = panel.querySelector( "[data-collection='" + c.def.id + "']" );
    if( !box || !c.found ) return;
    var key = collectionKey( host, c.def );
    function change( make, message ) {
      var html;
      try { html = make( host.markup() ); } catch( e ) { toast( "" + e ); return false; }
      return host.apply( html, message );
    }
    function on( attribute, handler ) {
      Array.prototype.forEach.call( box.querySelectorAll( "[" + attribute + "]" ), function( button ) {
        button.addEventListener( "click", function() { handler( Number( button.getAttribute( attribute ) ), button ); } );
      } );
    }
    on( "data-col-show", function( i ) { collectionShown[ key ] = i; host.redraw(); } );
    on( "data-col-open", function( i ) { collectionOpen = collectionOpen === key + ":" + i ? null : key + ":" + i; collectionShown[ key ] = i; host.redraw(); } );
    on( "data-col-move", function( i, button ) {
      var to = Number( button.getAttribute( "data-to" ) );
      if( change( function( html ) { return ContentEditorCollections.moveItem( html, c.def, i, to ); }, "Moved item " + ( i + 1 ) + " to " + ( to + 1 ) ) ) {
        collectionShown[ key ] = to;
        if( collectionOpen === key + ":" + i ) collectionOpen = key + ":" + to;
        host.redraw();
      }
    } );
    on( "data-col-copy", function( i ) {
      if( change( function( html ) { return ContentEditorCollections.duplicateItem( html, c.def, i ); }, "Copied item " + ( i + 1 ) ) ) {
        collectionShown[ key ] = i + 1; collectionOpen = key + ":" + ( i + 1 );
        host.redraw();
      }
    } );
    on( "data-col-remove", function( i ) {
      if( change( function( html ) { return ContentEditorCollections.removeItem( html, c.def, i ); }, "Removed item " + ( i + 1 ) + ". Undo brings it back." ) ) {
        collectionShown[ key ] = Math.max( 0, i - 1 ); collectionOpen = null;
        host.redraw();
      }
    } );
    var open = collectionOpen && collectionOpen.indexOf( key + ":" ) === 0 ? Number( collectionOpen.slice( key.length + 1 ) ) : null;
    if( open === null ) return;
    Array.prototype.forEach.call( box.querySelectorAll( "[data-col-field]" ), function( input ) {
      input.addEventListener( "change", function() {
        var name = input.getAttribute( "data-col-field" ), part = input.getAttribute( "data-part" ), value = input.value;
        if( part ) { value = {}; value[ part ] = input.value; }
        change( function( html ) { return ContentEditorCollections.setField( html, c.def, open, name, value ); }, "Updated " + name );
      } );
    } );
    Array.prototype.forEach.call( box.querySelectorAll( "[data-col-pick]" ), function( button ) {
      button.addEventListener( "click", function() {
        var name = button.getAttribute( "data-col-pick" );
        ContentEditorApp.pickImage( function( image ) {
          if( change( function( html ) { return ContentEditorCollections.setField( html, c.def, open, name, image.url ); }, "Updated " + name ) ) host.redraw();
        } );
      } );
    } );
  } );
}

function existingHtmlControls( element ) {
  var markup = ( element.fields.html || {} ).html || "";
  var inserts = ContentEditorExistingHtml.inserts( markup );
  var scripts = element.fields.scripts || [];
  return "<div class='ce-field-group'><h3>Page markup</h3>" +
    field( "Markup", "<textarea id='ce-e-html' class='ce-markup' rows='16' spellcheck='false'>" + esc( markup ) + "</textarea>",
      "Edits are cleaned for safety: scripts, event handlers and script addresses are removed. Lines like &amp;insert:/common/part.html; pull in a shared part.", "ce-e-html" ) +
    "<button type='button' class='ce-btn' id='ce-apply-html'>Apply markup</button>" +
    ( inserts.length ? "<p class='ce-hint'>Shared parts: " + inserts.map( function( p ) { return "<code>" + esc( p ) + "</code> " + sharedPartButton( p ); } ).join( ", " ) + "</p>" : "" ) +
    ( scripts.length ? "<p class='ce-hint'>Page scripts, kept unchanged and not run in the editor: " + scripts.map( function( s ) { return "<code>" + esc( s ) + "</code>"; } ).join( ", " ) + "</p>" : "" ) +
    "</div>";
}

// CON-T-057: the shared parts an existing page pulls in, each with a way to
// edit it in the Components view.
function sharedPartButton( path ) {
  try { ContentEditorSharedParts.check( path ); } catch( e ) { return ""; }
  return "<button type='button' class='ce-link-btn' data-edit-part='" + esc( path ) + "'>Edit shared part</button>";
}

function sharedPartsHtml( page ) {
  var block = ContentEditorTemplates.findByRole( page, "page-html" )[ 0 ];
  var inserts = block ? ContentEditorExistingHtml.inserts( ( block.fields.html || {} ).html ) : [];
  var editable = inserts.filter( function( p ) { try { ContentEditorSharedParts.check( p ); return true; } catch( e ) { return false; } } );
  if( !editable.length ) return "";
  return "<div class='ce-field-group'><h3>Shared parts</h3><p class='ce-hint'>Parts this page pulls in from other files, shown locked on the page. Changing one changes every page that uses it.</p><ul class='ce-shared-part-list'>" +
    editable.map( function( p ) { return "<li><code>" + esc( ContentEditorSharedParts.livePath( p ) ) + "</code> " + sharedPartButton( p ) + "</li>"; } ).join( "" ) + "</ul></div>";
}

function wireSharedParts( panel ) {
  Array.prototype.forEach.call( panel.querySelectorAll( "[data-edit-part]" ), function( button ) {
    button.addEventListener( "click", function() { ContentEditorApp.openSharedPart( button.getAttribute( "data-edit-part" ) ); } );
  } );
}

function wireExistingHtmlControls( panel, element ) {
  wireSharedParts( panel );
  var apply = panel.querySelector( "#ce-apply-html" );
  if( !apply ) return;
  apply.addEventListener( "click", function() {
    if( !applyFieldEdit( element.id, "html", false, panel.querySelector( "#ce-e-html" ).value ) ) toast( "No change to the markup." );
  } );
}

function handleCanvasMessage( message ) {
  if( !ContentEditorProtocol.isValidMessage( message ) ) return; // also skips IntraQ's own joined/left notices
  if( message.renderId === null || message.renderId !== currentRenderId ) return; // not from the current canvas
  var payload = message.payload || {};

  if( message.type === "canvas:ready" ) {
    var pingId = "ping_" + Date.now();
    pendingPings[ pingId ] = performance.now();
    sendToCanvas( "shell:ping", null, pingId );
    var callbacks = canvasReadyCallbacks;
    canvasReadyCallbacks = [];
    for( var i = 0; i < callbacks.length; i++ ) callbacks[ i ]();
  } else if( message.type === "canvas:pong" ) {
    var startedAt = pendingPings[ message.correlationId ];
    delete pendingPings[ message.correlationId ];
    if( startedAt !== undefined ) {
      document.getElementById( "ce-connection" ).textContent = "Canvas connected over IntraQ (protocol v" + ContentEditorProtocol.VERSION + ", " + Math.round( performance.now() - startedAt ) + "ms)";
    }
  } else if( message.type === "canvas:size" ) {
    document.getElementById( "editorCanvas" ).style.height = Math.max( 420, payload.height ) + "px";
  } else if( message.type === "canvas:select" ) {
    if( !currentDraft() ) return;
    var instance = lockingInstance( payload.elementId );
    var chosen = instance ? instance.id : payload.elementId;
    if( chosen !== selectedId ) pendingDeleteId = null;
    selectedId = chosen;
    selectedSlot = !instance && validSlot( chosen, payload.slot ) ? { elementId: chosen, slot: payload.slot } : null;
    renderRail(); renderInspector(); renderToolbar();
    announceSelection();
  } else if( message.type === "canvas:deselect" ) {
    selectPageSettings();
    announceSelection();
  } else if( message.type === "canvas:frame-click" ) {
    selectPageSettings( { kicker: "category", byline: "author", tags: "tags" }[ payload.part ] );
  } else if( message.type === "canvas:edit-start" ) {
    editingInfo = { elementId: payload.elementId, rich: !!payload.rich };
    renderToolbar();
  } else if( message.type === "canvas:edit-end" ) {
    editingInfo = null;
    if( !linkInProgress ) renderToolbar();
    runEditCommittedCallbacks();
  } else if( message.type === "canvas:field-changed" ) {
    var next = payload.next;
    if( next ) { selectedId = next.elementId; pendingDeleteId = null; }
    var changed = applyFieldEdit( payload.elementId, payload.fieldId, payload.rich, payload.value );
    // After a change the canvas is replaced, so its edit-end won't arrive.
    if( changed ) { editingInfo = null; runEditCommittedCallbacks(); }
    if( next && next.elementId ) {
      if( changed ) {
        if( next.edit ) whenCanvasReady( function() { sendToCanvas( "shell:begin-edit", { elementId: next.elementId } ); } );
      } else {
        sendToCanvas( next.edit ? "shell:begin-edit" : "shell:highlight", { elementId: next.elementId } );
        renderRail(); renderInspector(); renderToolbar();
      }
    } else if( !changed ) {
      renderToolbar();
    }
  } else if( message.type === "canvas:undo-redo" ) {
    performUndoRedo( payload.redo );
  } else if( message.type === "canvas:position" ) {
    var frameTop = document.getElementById( "editorCanvas" ).getBoundingClientRect().top + window.scrollY;
    window.scrollTo( { top: Math.max( 0, frameTop + payload.top - 140 ), behavior: "smooth" } );
  } else if( message.type === "canvas:link-made" ) {
    if( !payload.made ) { toast( "Select some text first, then choose Link." ); return; }
    // Save the text with its placeholder link now, so the address the
    // person types next is applied to the model, not to an unsaved edit.
    linkInProgress = { elementId: editingInfo ? editingInfo.elementId : null };
    sendToCanvas( "shell:commit" );
    renderToolbar();
  } else if( message.type.indexOf( "hostile:" ) === 0 || message.type.indexOf( "control:" ) === 0 ) {
    // Only ever reachable if a self-test fixture script actually executed -
    // see runIsolationSelfTest (CON-T-010/041).
    isolationQueueArrivals[ message.type ] = true;
  }
}

function commitCanvasEdit() {
  if( editingInfo ) sendToCanvas( "shell:commit" );
}

// --- Shell rendering -------------------------------------------------------------------------

function esc( value ) {
  return String( value == null ? "" : value ).replace( /[&<>"']/g, function( c ) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ c ];
  } );
}

function labelFor( element ) {
  if( !element ) return "";
  if( element.role === "section-heading" && element.fields.text ) return element.fields.text;
  if( element.role === "content-section" ) {
    var heading = ( element.children || [] ).filter( function( c ) { return c.role === "section-heading"; } )[ 0 ];
    return "Section" + ( heading && heading.fields.text ? ": " + heading.fields.text : "" );
  }
  if( element.role && ROLE_LABELS[ element.role ] ) return ROLE_LABELS[ element.role ];
  if( element.type === "heading" && element.fields.text ) return element.fields.text;
  if( element.type === "component" && element.fields.name ) return "◆ " + element.fields.name;
  var def = ContentEditorElementDefinitions.getDefinition( element.type );
  return def ? def.label : element.type;
}

function renderAll( focusField ) {
  var page = currentPageModel();
  var focusKey = focusKeyOf( document.activeElement );
  if( selectedId && ( !page || !ContentEditorSchema.findElementById( page.root, selectedId ) ) ) selectedId = null;
  renderTopBar();
  renderRail();
  renderInspector( focusField );
  renderToolbar();
  renderFooter();
  if( page ) renderCurrentPage();
  if( !focusField ) restoreFocus( focusKey );
}

// CON-T-032 (WCAG 2.4.3): redrawing the rail and panel replaces the control
// that had focus, which would drop a keyboard user back to the top of the
// page. Put focus back on the same control, or on the selected part in the
// outline when that control has gone (a deleted element's tools, an insert
// button that moved), or Page settings when nothing is selected.
var FOCUS_KEYS = [ "data-tool", "data-insert", "data-insert-component", "data-select", "data-settings", "data-goto", "data-show-change" ];
function focusKeyOf( element ) {
  if( !element || element === document.body ) return null;
  if( element.id && element.closest( "#ce-rail, #ce-inspector, .ce-top" ) ) return "#" + element.id;
  for( var i = 0; i < FOCUS_KEYS.length; i++ ) {
    if( element.hasAttribute && element.hasAttribute( FOCUS_KEYS[ i ] ) ) return "[" + FOCUS_KEYS[ i ] + "='" + element.getAttribute( FOCUS_KEYS[ i ] ).replace( /'/g, "\\'" ) + "']";
  }
  return null;
}

function restoreFocus( key ) {
  var active = document.activeElement;
  if( !key || ( active && active !== document.body ) ) return;
  var again = null;
  try { again = document.querySelector( key ); } catch( e ) { again = null; }
  if( !again || again.disabled ) again = document.querySelector( "#ce-rail .ce-outline .current" ) || document.querySelector( "#ce-rail [data-settings]" );
  if( again ) again.focus();
}

function renderTopBar() {
  var entry = currentEntry(), draft = currentDraft(), page = currentPageModel();
  var title = "Content Editor", type = "";
  if( entry && entry.kind === "site" ) { title = entry.title; type = "Existing page · read only"; }
  if( page ) {
    title = ( page.template ? ContentEditorTemplates.getTitle( page ) : page.title ) || "Untitled";
    type = ( page.template ? TYPE_LABELS[ entry.type ] : "Free-form page" ) + " · Draft" + ( siteConfig ? " · " + siteConfig.name : "" );
    if( entry.library ) type = libraryKind( entry ).label + " · version " + entry.library.version + " · site library";
  }
  document.getElementById( "ce-header-title" ).textContent = title;
  document.getElementById( "ce-header-type" ).textContent = type;
  var dirty = !!draft && JSON.stringify( draft.page ) !== draft.baseline;
  var saved = entry && entry.saved;
  var state = document.getElementById( "ce-save-state" );
  state.textContent = !draft ? "Read only" : saving ? "Saving..." : saved && saved.archived ? "Archived" : dirty ? "Unsaved changes" :
    saved ? "Saved · " + saved.baseRevision : entry && entry.library ? "Saved · v" + entry.library.version : page && page.template ? "Not saved yet" : "Not saved";
  state.classList.toggle( "dirty", dirty || ( !!page && !!page.template && !saved ) );
  if( saved ) document.getElementById( "ce-header-type" ).textContent = type + " · " + saved.publicPath;
  document.getElementById( "ce-undo" ).disabled = !draft || !draft.stack.canUndo();
  document.getElementById( "ce-redo" ).disabled = !draft || !draft.stack.canRedo();
  var saveButton = document.getElementById( "ce-save" );
  saveButton.disabled = !canSave();
  saveButton.textContent = saving ? "Saving..." : entry && entry.library ? "Save " + libraryKind( entry ).label.toLowerCase() : "Save draft";
  saveButton.title = page && !page.template ? "Only pages made from a template can be saved" : saved && saved.archived ? "Restore this page to save it" : "Save draft (Ctrl+S)";
  var publishButton = document.getElementById( "ce-publish" );
  publishButton.disabled = !canPublish();
  publishButton.title = entry && entry.library ? libraryKind( entry ).plural + " are published with the pages that use them" : !saved ? "Save the page first - publishing always uses a saved revision" : saved.archived ? "Restore this page to publish it" :
    dirty ? "Save your changes first - publishing uses the saved revision" : "Check and publish " + saved.baseRevision;
  document.getElementById( "ce-preview" ).disabled = !draft;
  document.getElementById( "ce-preview" ).textContent = previewing ? "Back to edit" : "Preview ↗";
  document.getElementById( "ce-edit-tab" ).setAttribute( "aria-selected", String( !previewing ) );
  document.getElementById( "ce-preview-tab" ).setAttribute( "aria-selected", String( previewing ) );
  document.getElementById( "ce-mode-help" ).textContent = previewing ? "This is how readers will see the page." : draft ? "Click anything on the page to edit it." : "";
  document.body.classList.toggle( "ce-previewing", previewing );
  Array.prototype.forEach.call( document.querySelectorAll( "[data-device]" ), function( button ) {
    button.setAttribute( "aria-pressed", String( button.getAttribute( "data-device" ) === deviceWidth ) );
  } );
  document.getElementById( "ce-stage" ).className = "ce-stage " + deviceWidth;
  var theme = page && page.theme ? ContentEditorThemes.getTheme( page.theme.id, page.theme.version ) : null;
  var root = document.documentElement.style;
  root.setProperty( "--brand", theme ? theme.accent : "#286d9c" );
  root.setProperty( "--brand-soft", theme ? theme.soft : "#e3eef4" );
  root.setProperty( "--paper-bg", theme ? theme.paper : "#f6f8f9" );
}

// The clicked column, while its element is still the one selected.
function activeSlot() {
  return selectedSlot && selectedSlot.elementId === selectedId ? selectedSlot.slot : null;
}

// CON-T-054: slot is one of element id's own columns.
function validSlot( id, slot ) {
  if( typeof slot !== "string" || !slot ) return false;
  var element = ContentEditorSchema.findElementById( currentPageModel().root, id );
  var def = element && ContentEditorElementDefinitions.getDefinition( element.type );
  return !!( def && def.slots && def.slots.indexOf( slot ) !== -1 );
}

function insertionPoints() {
  var page = currentPageModel(), points = [], entry = currentEntry();
  var selected = selectedId ? ContentEditorSchema.findElementById( page.root, selectedId ) : null;
  // A component's parts all live inside its container.
  var ownRoot = entry.library ? componentRoot( page ) : null;
  if( !selected && ownRoot ) selected = ownRoot;
  if( !selected ) {
    points.push( { label: "Add a section at the end of the page", parentId: page.root.id, slot: null, index: page.root.children.length } );
    return points;
  }
  var info = ContentEditorSchema.findParentInfo( page.root, selected.id );
  if( info && selected !== ownRoot ) points.push( { label: "After “" + labelFor( selected ) + "”", parentId: info.parent.id, slot: info.slot, index: info.index + 1 } );
  var def = ContentEditorElementDefinitions.getDefinition( selected.type );
  if( lockingInstance( selected.id ) ) def = null; // a placed component is changed in the library
  if( def && def.allowedChildren.length ) {
    if( def.slots ) {
      var clicked = activeSlot();
      var columns = def.slots.map( function( slot, i ) {
        return { label: "Inside column " + ( i ? "B" : "A" ) + ( slot === clicked ? " (the one you clicked)" : "" ), parentId: selected.id, slot: slot, index: ( selected.slots[ slot ] || [] ).length };
      } );
      // The column clicked in the canvas comes first, before "after" (CON-T-054).
      columns.sort( function( a, b ) { return ( b.slot === clicked ) - ( a.slot === clicked ); } );
      points = clicked ? columns.concat( points ) : points.concat( columns );
    } else {
      points.push( { label: "Inside “" + labelFor( selected ) + "”", parentId: selected.id, slot: null, index: ( selected.children || [] ).length } );
    }
  }
  return points;
}

// The content page body column offers a whole section (heading and text)
// rather than a bare section element.
function isContentPageBody( parent, slot ) {
  var template = currentTemplate();
  return !!template && template.id === "content-page" && template.version >= 2 && parent.role === "columns" && slot === "columnA";
}

function renderRail() {
  var rail = document.getElementById( "ce-rail" );
  var entry = currentEntry(), page = currentPageModel();
  var html = "<div class='ce-rail-head'><p class='ce-panel-label'>Workspace</p></div>";
  var waiting = sitePagesNotOpen();
  html += "<button class='ce-rail-item" + ( openMenu === "pages" ? " active" : "" ) + "' type='button' data-menu='pages' aria-expanded='" + ( openMenu === "pages" ) + "'><span class='ce-rail-icon'>▤</span> Pages<span class='ce-badge'>" +
    savedPages.length + " saved" + ( waiting.length ? " · " + waiting.length + " to open" : "" ) + "</span></button>";
  if( openMenu === "pages" ) {
    html += "<div class='ce-sub-menu'>" + ( waiting.length ? "<p class='ce-sub-heading'>In the editor</p>" : "" );
    var openSavedIds = {};
    openPages.forEach( function( item ) { if( item.saved ) openSavedIds[ item.saved.pageId ] = true; } );
    openPages.forEach( function( item, i ) {
      html += "<button type='button' data-open-index='" + i + "'" + ( i === currentIndex ? " aria-current='page'" : "" ) + ">" + ( i === currentIndex ? "● " : "" ) + esc( entryTitle( item ) ) +
        " <small>· " + esc( entryKind( item ) ) + "</small></button>";
    } );
    savedPages.filter( function( p ) { return !openSavedIds[ p.pageId ]; } ).forEach( function( p ) {
      html += "<button type='button' data-saved-page='" + esc( p.pageId ) + "'>" + esc( p.title || p.publicPath ) + " <small>· " + ( p.archived ? "Archived" : "Saved " + esc( p.draftRevision ) ) + "</small></button>";
    } );
    // PHW-T-003: the site's own pages not yet in the editor.
    if( waiting.length ) html += "<p class='ce-sub-heading'>Site pages: click one to edit it</p>";
    waiting.forEach( function( sitePage ) {
      html += "<button type='button' data-site-page='" + esc( sitePage.pageName ) + "' title='Open " + esc( sitePage.publicPath ) + " in the editor, keeping its own markup'>" + esc( sitePage.title ) + " <small>· " + esc( sitePage.publicPath ) + "</small></button>";
    } );
    html += "</div>";
  }
  html += "<button class='ce-rail-item" + ( openMenu === "new" ? " active" : "" ) + "' type='button' data-menu='new'" + ( siteConfig ? "" : " disabled title='" + esc( siteConfigProblem ) + "'" ) + "><span class='ce-rail-icon'>＋</span> New page</button>";
  if( openMenu === "new" && siteConfig ) {
    html += "<div class='ce-sub-menu'>" + siteConfig.templates.map( function( id ) {
      return "<button type='button' data-new-page='" + id + "'>" + esc( TYPE_LABELS[ id ] || id ) + "</button>";
    } ).join( "" ) + "</div>";
  }
  html += "<button class='ce-rail-item' type='button' data-images='1'><span class='ce-rail-icon'>▧</span> Images</button>";
  html += "<a class='ce-rail-item' href='" + PAGE_CONVERTER + "'><span class='ce-rail-icon'>⇪</span> Import a page</a>";
  html += "<button class='ce-rail-item" + ( page && !selectedId ? " active" : "" ) + "' type='button' data-settings='1'" + ( page ? "" : " disabled" ) + "><span class='ce-rail-icon'>⚙</span> " + ( entry && entry.library ? libraryKind( entry ).label + " settings" : "Page settings" ) + "</button>";

  html += "<div class='ce-rail-section'><p class='ce-panel-label'>On this page</p>";
  if( page ) {
    html += "<ul class='ce-outline'>";
    ( function walk( element, depth ) {
      if( element.type !== "page-root" ) {
        var group = ( element.type === "section" || element.type === "two-column" ) && element.role && element.role !== "content-section";
        var latestPart = element.type === "component" ? findComponent( element.fields.componentId ) : null;
        var behind = latestPart && element !== ( currentEntry().library ? componentRoot( page ) : null ) && latestPart.version > element.fields.componentVersion;
        html += "<li><button type='button' class='" + ( element.id === selectedId ? "current" : "" ) + ( group ? " group" : "" ) + "' data-select='" + esc( element.id ) + "' style='padding-left:" + ( 10 + depth * 12 ) + "px'>" + esc( labelFor( element ) ) +
          ( behind ? " <small class='ce-behind'>v" + esc( element.fields.componentVersion ) + " → v" + latestPart.version + "</small>" : "" ) + "</button></li>";
      }
      if( element.type === "component" && lockingInstance( element.id ) === element ) return; // its parts are edited in the library
      ContentEditorSchema.childGroups( element ).forEach( function( g ) {
        g.items.forEach( function( child ) { walk( child, element.type === "page-root" ? 0 : depth + 1 ); } );
      } );
    } )( page.root, 0 );
    html += "</ul>";
  } else {
    html += "<p class='ce-hint'>" + ( entry && entry.kind === "site" ? "This page isn't on the new editor model yet, so its parts can't be edited here." : "Open or create a page." ) + "</p>";
  }
  html += "</div>";

  // An existing page is its own markup (PHW-T-002): nothing is added to it.
  if( page && !previewing && !( page.template && page.template.id === "existing-page" ) ) {
    html += "<div class='ce-rail-section'><p class='ce-panel-label'>Add to the page</p>";
    insertionPoints().forEach( function( point ) {
      var parent = ContentEditorSchema.findElementById( page.root, point.parentId );
      var allowed = ( ContentEditorElementDefinitions.getDefinition( parent.type ) || {} ).allowedChildren || [];
      if( !allowed.length ) return;
      var where = " data-parent='" + esc( point.parentId ) + "' data-slot='" + esc( point.slot || "" ) + "' data-index='" + point.index + "'";
      html += "<p class='ce-add-where'>" + esc( point.label ) + "</p><div class='ce-add-list'>" + allowed.map( function( type ) {
        if( type === "layout" || type === "html" ) return ""; // html: only made by adopting an existing page
        if( type === "content-slot" ) {
          var openEntry = currentEntry();
          if( !( openEntry.library && openEntry.library.kind === "layouts" ) || JSON.stringify( page.root ).indexOf( "\"content-slot\"" ) !== -1 ) return "";
        }
        if( type === "component" ) {
          return placeableComponents().map( function( c ) {
            return "<button type='button' class='ce-add-component' data-insert-component='" + esc( c.id ) + "'" + where + " title='Component, version " + c.version + "'>◆ " + esc( c.name ) + "</button>";
          } ).join( "" );
        }
        var label = type === "section" && isContentPageBody( parent, point.slot ) ? "Section with heading" : ContentEditorElementDefinitions.getDefinition( type ).label;
        return "<button type='button' data-insert='" + type + "'" + where + ">+ " + esc( label ) + "</button>";
      } ).join( "" ) + "</div>";
    } );
    html += "</div>";
  }
  html += "<div class='ce-rail-help'><strong>Write first, refine later</strong><p>Every change can be undone. Template parts like the title stay in place; add your own sections around them.</p></div>";
  rail.innerHTML = html;
}

function sitePagesNotOpen() {
  return sitePages.filter( function( sitePage ) {
    return !openPages.some( function( entry ) { return entry.kind === "site" && entry.pageName === sitePage.pageName; } );
  } );
}

function entryTitle( entry ) {
  if( entry.kind === "site" ) return entry.title;
  var page = entry.drafts[ entry.type || "free-form" ].page;
  return ( page.template ? ContentEditorTemplates.getTitle( page ) : page.title ) || "Untitled";
}

function entryKind( entry ) {
  if( entry.kind === "site" ) return "Existing page";
  if( entry.library ) return libraryKind( entry ).label + " v" + entry.library.version + ( anyDraftChanged( entry ) ? ", changed" : "" );
  if( entry.saved ) return ( entry.saved.archived ? "Archived" : "Saved " + entry.saved.baseRevision ) + ( anyDraftChanged( entry ) ? ", changed" : "" );
  return entry.type ? TYPE_LABELS[ entry.type ] + ", not saved" : "Free-form, not saved";
}

function anyDraftChanged( entry ) {
  var draft = entry.drafts[ entry.type || "free-form" ];
  return JSON.stringify( draft.page ) !== draft.baseline;
}

function renderToolbar() {
  var bar = document.getElementById( "ce-toolbar" ), page = currentPageModel();
  if( linkInProgress ) {
    bar.innerHTML = "<label class='ce-tool-hint' for='ce-link-url'>Link to</label>" +
      "<input id='ce-link-url' type='text' placeholder='/About or https://...' spellcheck='false'>" +
      "<button class='ce-tool-text' type='button' data-link-apply='1'>Apply</button><button class='ce-tool-text' type='button' data-link-cancel='1'>Remove link</button>";
    var input = document.getElementById( "ce-link-url" );
    input.focus();
    input.addEventListener( "keydown", function( event ) {
      if( event.key === "Enter" ) { event.preventDefault(); applyPendingLink( input.value ); }
      if( event.key === "Escape" ) { event.preventDefault(); applyPendingLink( null ); }
    } );
    return;
  }
  if( editingInfo && editingInfo.rich ) {
    bar.innerHTML =
      "<button type='button' data-cmd='bold' aria-label='Bold' title='Bold'><b>B</b></button>" +
      "<button type='button' data-cmd='italic' aria-label='Italic' title='Italic'><i>I</i></button><span class='ce-tool-sep'></span>" +
      "<button class='ce-tool-text' type='button' data-block='h2'>H2 Heading</button>" +
      "<button class='ce-tool-text' type='button' data-block='h3'>H3 Heading</button>" +
      "<button class='ce-tool-text' type='button' data-block='p'>Paragraph</button><span class='ce-tool-sep'></span>" +
      "<button class='ce-tool-text' type='button' data-block='blockquote'>❝ Quote</button>" +
      "<button class='ce-tool-text' type='button' data-cmd='insertUnorderedList'>☷ List</button>" +
      "<button class='ce-tool-text' type='button' data-link-start='1'>↗ Link</button>";
  } else if( editingInfo ) {
    bar.innerHTML = "<span class='ce-tool-hint'>Editing " + esc( labelFor( ContentEditorSchema.findElementById( page.root, editingInfo.elementId ) ).toLowerCase() ) + " - press Enter or click away to finish.</span>";
  } else if( page && selectedId ) {
    bar.innerHTML = "<span class='ce-tool-hint'>" + esc( labelFor( ContentEditorSchema.findElementById( page.root, selectedId ) ) ) + " selected - its settings are " + settingsPlace() + ".</span>";
  } else if( page ) {
    bar.innerHTML = "<span class='ce-tool-hint'>Click text on the page to edit it. Formatting tools appear here when you edit body text.</span>";
  } else {
    bar.innerHTML = "<span class='ce-tool-hint'>Read only.</span>";
  }
}

function applyPendingLink( url ) {
  var link = linkInProgress;
  linkInProgress = null;
  var page = currentPageModel();
  var element = link && link.elementId && page ? ContentEditorSchema.findElementById( page.root, link.elementId ) : null;
  if( !element ) { renderToolbar(); return; }
  var html = element.fields.body.html;
  var replacement;
  if( url === null || url.trim() === "" ) {
    replacement = html.replace( /<a href="#ce-link-pending">([\s\S]*?)<\/a>/g, "$1" );
  } else {
    url = url.trim();
    if( !/^(https?:\/\/|mailto:|\/)/i.test( url ) ) {
      linkInProgress = link;
      toast( "Use a site path like /About or a full https:// address." );
      renderToolbar();
      return;
    }
    replacement = html.split( "href=\"" + pendingLinkHref + "\"" ).join( "href=\"" + esc( url ) + "\"" );
  }
  if( !applyFieldEdit( element.id, "body", true, replacement ) ) renderToolbar();
}

function field( label, inner, hint, id ) {
  return "<div class='ce-field'>" + ( label ? "<label" + ( id ? " for='" + id + "'" : "" ) + ">" + esc( label ) + "</label>" : "" ) + inner + ( hint ? "<p class='ce-hint'>" + hint + "</p>" : "" ) + "</div>";
}

// CON-T-022: crop and focal point for an image. Both are only how the image
// is shown (ContentEditorRenderer draws them with CSS); the file is never
// changed. A template's cover is already cropped by the page design, so it
// only gets the focal point.
function imageCropControls( element ) {
  var focus = ContentEditorRenderer.imageFocus( element );
  var crop = element.fields.crop || "original";
  var html = "<div class='ce-field-group'><h3>Crop and focal point</h3>";
  if( element.role === "hero" ) {
    html += "<p class='ce-hint'>The page design crops the cover to fit. Choose the point that must stay in view.</p>";
  } else {
    html += field( "Crop", "<select id='ce-e-crop' data-field='crop'>" + ContentEditorRenderer.IMAGE_CROPS.map( function( c ) {
      return "<option value='" + c.value + "'" + ( c.value === crop ? " selected" : "" ) + ">" + esc( c.label ) + "</option>";
    } ).join( "" ) + "</select>", "The image file is not changed; this is only how it is shown.", "ce-e-crop" );
  }
  html += "<div class='ce-focal' data-focal-pick='1' title='Click to set the focal point'><img src='" + esc( element.fields.mediaUrl ) + "' alt=''/>" +
    "<span class='ce-focal-dot' style='left:" + focus.x + "%;top:" + focus.y + "%'></span></div>" +
    "<div class='ce-focal-inputs'><label for='ce-e-focus-x'>Across</label><input id='ce-e-focus-x' type='number' min='0' max='100' step='1' value='" + focus.x + "' data-focus='x'/><span>%</span>" +
    "<label for='ce-e-focus-y'>Down</label><input id='ce-e-focus-y' type='number' min='0' max='100' step='1' value='" + focus.y + "' data-focus='y'/><span>%</span></div>" +
    "<p class='ce-hint'>Click the picture, or type percentages, to choose the point that stays in view when the image is cropped.</p>";
  if( crop !== "original" || focus.x !== 50 || focus.y !== 50 ) html += "<button type='button' class='ce-link-btn' data-crop-reset='1'>Show the whole image again</button>";
  return html + "</div>";
}

function wireImageCropControls( panel, element ) {
  function setFocus( x, y ) {
    var now = ContentEditorRenderer.imageFocus( element );
    var next = ContentEditorRenderer.imageFocus( { fields: { focus: { x: x, y: y } } } );
    if( next.x === now.x && next.y === now.y ) return;
    var page = currentPageModel();
    runCommand( function() { return ContentEditorCommands.createUpdateFieldCommand( page, element.id, "focus", next ); }, "Moved the focal point to " + next.x + "% across, " + next.y + "% down" );
  }
  var picker = panel.querySelector( "[data-focal-pick]" );
  if( picker ) picker.addEventListener( "click", function( event ) {
    var box = picker.querySelector( "img" ).getBoundingClientRect();
    if( !box.width || !box.height ) return;
    setFocus( ( event.clientX - box.left ) / box.width * 100, ( event.clientY - box.top ) / box.height * 100 );
  } );
  Array.prototype.forEach.call( panel.querySelectorAll( "[data-focus]" ), function( input ) {
    input.addEventListener( "change", function() {
      var now = ContentEditorRenderer.imageFocus( element );
      if( input.getAttribute( "data-focus" ) === "x" ) setFocus( input.value, now.y );
      else setFocus( now.x, input.value );
    } );
  } );
  var reset = panel.querySelector( "[data-crop-reset]" );
  if( reset ) reset.addEventListener( "click", function() {
    if( element.fields.crop && element.fields.crop !== "original" ) applyFieldEdit( element.id, "crop", false, "original" );
    setFocus( 50, 50 );
  } );
}

// --- Changes (CON-T-026) ----------------------------------------------------
// What has changed in the open draft, against the page as it was opened, as
// last saved, or a saved revision. The comparison is of the page model
// (ContentEditorDiff), not the HTML; changed parts can be marked in the
// canvas, which is editor-only chrome and never reaches a published page.
var CHANGE_KINDS = { added: "Added", removed: "Removed", moved: "Moved", field: "Edited", style: "Style", metadata: "Detail", page: "Setting" };

function compareState( draft ) {
  if( !draft.compare ) draft.compare = { against: "saved", revisionId: null, revisionPage: null, loading: false, mark: false, showHtml: false };
  return draft.compare;
}

function compareBase( draft ) {
  var state = compareState( draft );
  if( state.against === "opened" ) return JSON.parse( draft.opened || draft.baseline );
  if( state.against === "saved" ) return JSON.parse( draft.baseline );
  return state.revisionId === state.against ? state.revisionPage : null;
}

function currentChanges() {
  var draft = currentDraft();
  if( !draft || !draft.page ) return null;
  var base = compareBase( draft );
  return base ? ContentEditorDiff.diffPages( base, draft.page ) : null;
}

// Ids to mark in the canvas, when marking is on.
function markedChangeIds() {
  var draft = currentDraft();
  if( !draft || previewing || !compareState( draft ).mark ) return [];
  var result = currentChanges();
  return result ? result.changedIds.slice( 0, 500 ) : [];
}

function compareWith( against ) {
  var draft = currentDraft(), entry = currentEntry();
  if( !draft ) return;
  var state = compareState( draft );
  state.against = against;
  if( against !== "opened" && against !== "saved" && state.revisionId !== against && entry.saved ) {
    state.loading = true;
    state.revisionId = null;
    state.revisionPage = null;
    readService( "readContentPageRevision", { pageId: entry.saved.pageId, revisionId: against } )
      .then( function( revision ) {
        if( state.against !== against ) return;
        state.revisionPage = ContentEditorMigrations.migrate( revision.page );
        state.revisionId = against;
      } )
      .catch( function( error ) { toast( "Could not read " + against + ": " + error ); state.against = "saved"; } )
      .then( function() { state.loading = false; renderAll(); } );
  }
  renderAll();
}

function changesHtml( draft, entry ) {
  var state = compareState( draft ), saved = entry.saved;
  var options = [ [ "opened", "The page when you opened it" ], [ "saved", saved ? "The last save (" + saved.baseRevision + ")" : "The last save" ] ];
  if( saved ) saved.revisions.slice().reverse().forEach( function( r ) {
    if( r.id !== saved.baseRevision ) options.push( [ r.id, r.id + " · " + formatSavedAt( r.savedAt ) + ( r.id === saved.publishedRevision ? " (live)" : "" ) ] );
  } );
  var html = "<div class='ce-field-group'><h3>Changes</h3>" + field( "Compare with", "<select id='ce-compare-with'>" + options.map( function( o ) {
    return "<option value='" + esc( o[ 0 ] ) + "'" + ( o[ 0 ] === state.against ? " selected" : "" ) + ">" + esc( o[ 1 ] ) + "</option>";
  } ).join( "" ) + "</select>", null, "ce-compare-with" );
  if( state.loading ) return html + "<p class='ce-app-loading'>Loading...</p></div>";
  var result = currentChanges();
  if( !result ) return html + "</div>";
  if( !result.changes.length ) return html + "<p class='ce-hint'>No changes.</p></div>";
  var c = result.counts, parts = [];
  if( c.edited ) parts.push( c.edited + " edited" );
  if( c.added ) parts.push( c.added + " added" );
  if( c.removed ) parts.push( c.removed + " removed" );
  if( c.moved ) parts.push( c.moved + " moved" );
  if( c.page ) parts.push( c.page + " page " + ( c.page === 1 ? "setting" : "settings" ) );
  html += "<p class='ce-hint'>" + esc( parts.join( ", " ) ) + ".</p><ul class='ce-changes'>" + result.changes.slice( 0, 40 ).map( function( change ) {
    var shown = change.elementId && change.kind !== "removed" && ContentEditorSchema.findElementById( draft.page.root, change.elementId );
    return "<li><span class='ce-change-kind ce-change-" + change.kind + "'>" + CHANGE_KINDS[ change.kind ] + "</span> " + esc( change.label ) +
      ( change.field && ( change.kind === "field" || change.kind === "style" ) ? " <small>(" + esc( change.field ) + ")</small>" : "" ) +
      ( change.from !== null ? "<br><small><del>" + esc( change.from ) + "</del> → <ins>" + esc( change.to ) + "</ins></small>" : "" ) +
      ( shown ? " <button type='button' class='ce-link-btn' data-show-change='" + esc( change.elementId ) + "'>Show</button>" : "" ) + "</li>";
  } ).join( "" ) + "</ul>" + ( result.changes.length > 40 ? "<p class='ce-hint'>And " + ( result.changes.length - 40 ) + " more.</p>" : "" );
  html += "<label class='ce-check'><input type='checkbox' id='ce-mark-changes'" + ( state.mark ? " checked" : "" ) + "> Mark changed parts on the page</label>";
  html += "<details class='ce-responsive' id='ce-html-diff'" + ( state.showHtml ? " open" : "" ) + "><summary>Rendered HTML difference (for checking)</summary>";
  if( state.showHtml ) {
    var lines = ContentEditorDiff.diffHtml( ContentEditorRenderer.renderPage( compareBase( draft ) ), ContentEditorRenderer.renderPage( draft.page ) );
    html += lines.tooLarge ? "<p class='ce-hint'>The page is too large to compare line by line.</p>" :
      "<pre class='ce-html-diff'>" + lines.removed.slice( 0, 30 ).map( function( l ) { return "<del>- " + esc( l ) + "</del>"; } ).join( "\n" ) +
      ( lines.removed.length && lines.added.length ? "\n" : "" ) + lines.added.slice( 0, 30 ).map( function( l ) { return "<ins>+ " + esc( l ) + "</ins>"; } ).join( "\n" ) + "</pre>";
  }
  return html + "</details></div>";
}

function wireChanges( panel ) {
  var draft = currentDraft();
  if( !draft ) return;
  var state = compareState( draft );
  var select = panel.querySelector( "#ce-compare-with" );
  if( select ) select.addEventListener( "change", function() { compareWith( select.value ); } );
  var mark = panel.querySelector( "#ce-mark-changes" );
  if( mark ) mark.addEventListener( "change", function() { state.mark = mark.checked; renderAll(); } );
  var details = panel.querySelector( "#ce-html-diff" );
  if( details ) details.addEventListener( "toggle", function() { if( details.open !== state.showHtml ) { state.showHtml = details.open; renderInspector(); } } );
  Array.prototype.forEach.call( panel.querySelectorAll( "[data-show-change]" ), function( button ) {
    button.addEventListener( "click", function() { selectElement( button.getAttribute( "data-show-change" ) ); } );
  } );
  Array.prototype.forEach.call( panel.querySelectorAll( "[data-compare-revision]" ), function( button ) {
    button.addEventListener( "click", function() { compareWith( button.getAttribute( "data-compare-revision" ) ); } );
  } );
}

// The same publication checks the server runs before it publishes
// (CON-T-029): errors stop publication, the rest are suggestions.
function publishChecks() {
  var page = currentPageModel(), checks = [];
  if( !page || !page.template ) return checks;
  var result = ContentEditorPublication.validate( page, siteConfig, {
    latestComponentVersion: function( id ) { var c = findComponent( id ); return c ? c.version : null; },
    layout: function( id ) { return findLayout( id ); }
  } );
  var where = result.where || {};
  result.errors.forEach( function( text ) { checks.push( { state: "error", text: text, where: where[ text ] || null } ); } );
  result.warnings.forEach( function( text ) { checks.push( { state: "todo", text: text, where: where[ text ] || null } ); } );
  if( !checks.length ) checks.push( { state: "ok", text: "Ready to publish" } );
  return checks;
}

// CON-T-031 (FR-PUB-004): a check's route to the part or setting it is about.
function goToButton( where ) {
  if( !where ) return "";
  return " <button type='button' class='ce-link-btn ce-goto' data-goto='" + esc( JSON.stringify( where ) ) + "'>Go to</button>";
}

function goTo( where ) {
  var page = currentPageModel();
  if( where.setting ) { publishPanel = null; selectPageSettings( where.setting ); return; }
  if( !page || !ContentEditorSchema.findElementById( page.root, where.elementId ) ) { toast( "That part is not in the open draft." ); return; }
  publishPanel = null;
  selectElement( where.elementId );
  var input = where.field && document.getElementById( "ce-e-" + where.field );
  if( input ) input.focus();
}

function wireGoTo( panel ) {
  Array.prototype.forEach.call( panel.querySelectorAll( "[data-goto]" ), function( button ) {
    button.addEventListener( "click", function() {
      var where;
      try { where = JSON.parse( button.getAttribute( "data-goto" ) ); } catch( e ) { return; }
      goTo( where );
    } );
  } );
}

// The page's publication log, newest first (CON-T-031, FR-PUB-005).
var PUBLICATION_RESULT_LABELS = { "published": "Published", "practice-passed": "Practice run passed", "blocked": "Stopped by the checks", "failed": "Release failed" };
function publicationLogHtml( saved ) {
  var log = ( saved.publicationLog || [] ).slice().reverse();
  if( !log.length ) return "";
  return "<div class='ce-field-group'><h3>Publication log</h3><ul class='ce-history'>" + log.slice( 0, 10 ).map( function( e ) {
    return "<li><strong class='ce-pub-" + esc( e.result ) + "'>" + esc( PUBLICATION_RESULT_LABELS[ e.result ] || e.result ) + "</strong> " + esc( e.revision ) +
      " → " + esc( e.target ) + "<br><small>" + esc( e.actor ) + " · " + esc( formatSavedAt( e.at ) ) + ( e.practice ? " · practice" : "" ) +
      ( e.warnings ? " · " + e.warnings + " warning" + ( e.warnings === 1 ? "" : "s" ) : "" ) + "</small>" +
      ( e.errors && e.errors.length ? "<ul class='ce-pub-errors'>" + e.errors.map( function( x ) { return "<li>" + esc( x ) + "</li>"; } ).join( "" ) + "</ul>" : "" ) + "</li>";
  } ).join( "" ) + "</ul>" + ( log.length > 10 ? "<p class='ce-hint'>" + ( log.length - 10 ) + " older attempts are kept in the page's index.</p>" : "" ) + "</div>";
}

function canPublish() {
  var entry = currentEntry(), draft = currentDraft();
  return !!entry && !entry.library && !!entry.saved && !entry.saved.archived && !saving && !!draft && JSON.stringify( draft.page ) === draft.baseline;
}

// Opens the Publish panel for one saved revision (the draft by default)
// and runs the server's checks on it.
function openPublishPanel( revisionId ) {
  var entry = currentEntry();
  if( !entry || !entry.saved ) return;
  var panel = { entry: entry, revision: revisionId || entry.saved.baseRevision, check: null, practice: null, published: null, busy: true, armed: false, error: null };
  publishPanel = panel;
  selectPageSettings();
  readService( "checkContentPagePublication", { pageId: entry.saved.pageId, revisionId: panel.revision } )
    .then( function( check ) { panel.check = check; } )
    .catch( function( error ) { panel.error = "" + error; } )
    .then( function() { panel.busy = false; if( publishPanel === panel ) renderInspector(); } );
}

// practice: the release step only reports what it would do; the page is
// still staged into its Development copy so it can be looked at.
function runPublish( practice ) {
  var panel = publishPanel, entry = panel.entry;
  panel.busy = true;
  panel.armed = false;
  panel.error = null;
  renderInspector();
  setStatus( practice ? "Practice run for " + panel.revision + "..." : "Publishing " + panel.revision + "..." );
  ContentEditorClient.publishContentPage( entry.saved.pageId, panel.revision, practice )
    .then( function( reply ) {
      if( reply.result !== "ok" ) throw reply.message;
      var data = reply.data;
      panel.check = data;
      if( practice ) panel.practice = data; else panel.published = data;
      if( data.published ) {
        entry.saved.publishedRevision = data.publishedRevision;
        entry.saved.previousPublishedRevision = data.previousPublishedRevision;
      }
      if( data.logEntry ) entry.saved.publicationLog = ( entry.saved.publicationLog || [] ).concat( [ data.logEntry ] );
      setStatus( reply.message );
      toast( reply.message + "." );
      loadSavedPages();
    } )
    .catch( function( error ) {
      panel.error = "" + error;
      setStatus( "Not published: " + error );
    } )
    .then( function() { panel.busy = false; renderAll(); } );
}

// Publisher's notes are HTML built from file contents, so they are shown
// as plain text.
function releaseNotesText( notes ) {
  return String( notes || "" ).replace( /<br\/>/g, "" ).replace( /<[^>]*>/g, "" ).replace( /\n{3,}/g, "\n\n" ).trim();
}

function renderPublishPanel() {
  var panel = publishPanel, saved = panel.entry.saved;
  var live = saved.publishedRevision;
  var html = "<div class='ce-publish' role='region' aria-label='Publish'><div class='ce-publish-head'><h3>Publish " + esc( panel.revision ) + "</h3>" +
    "<button type='button' class='ce-link-btn' id='ce-publish-close'>Close</button></div>" +
    "<p class='ce-hint'>To " + esc( saved.publicPath ) + " · " + ( live ? "live now: " + esc( live ) : "not published yet" ) + "</p>";
  if( panel.error ) html += "<p class='ce-publish-error' role='alert'>" + esc( panel.error ) + "</p>";
  if( panel.busy ) return html + "<p class='ce-hint' role='status'>Working...</p></div>";
  var check = panel.check;
  if( !check ) return html + "</div>";
  var where = check.where || {};
  html += "<ul class='ce-checklist'>" + check.errors.map( function( e ) { return "<li class='error'>" + esc( e ) + goToButton( where[ e ] ) + "</li>"; } ).join( "" ) +
    check.warnings.map( function( w ) { return "<li class='todo'>" + esc( w ) + goToButton( where[ w ] ) + "</li>"; } ).join( "" ) +
    ( check.errors.length || check.warnings.length ? "" : "<li>All publication checks pass</li>" ) + "</ul>";
  if( check.errors.length ) return html + "<p class='ce-hint'>Fix these, save, and publish the new revision.</p></div>";

  var practised = panel.practice && panel.practice.revision === panel.revision && panel.practice.errors.length === 0;
  html += "<div class='ce-publish-steps'><button type='button' class='ce-btn' id='ce-publish-practice'>" + ( practised ? "Practice again" : "1. Practice run" ) + "</button>";
  html += "<button type='button' class='ce-btn ce-primary" + ( panel.armed ? " armed" : "" ) + "' id='ce-publish-live'" + ( practised ? "" : " disabled title='Run a practice run first'" ) + ">" +
    ( panel.armed ? "Confirm: publish to " + esc( saved.publicPath ) : "2. Publish to live" ) + "</button></div>";
  if( practised ) {
    html += "<p class='ce-hint'>Practice run passed. The rendered page is staged at <a href='" + esc( saved.draftPath ) + "?ts=" + Date.now() + "' target='_blank' rel='noopener'>" + esc( saved.draftPath ) + " ↗</a>.</p>" +
      "<details class='ce-release-notes'><summary>What the release step will do</summary><pre>" + esc( releaseNotesText( panel.practice.notes ) ) + "</pre></details>";
  }
  if( panel.published && panel.published.revision === panel.revision ) {
    html += "<p class='ce-publish-done' role='status'>Published " + esc( panel.revision ) + ". <a href='" + esc( saved.publicPath ) + "?ts=" + Date.now() + "' target='_blank' rel='noopener'>Open the live page ↗</a></p>";
  }
  var previous = saved.previousPublishedRevision;
  if( live && previous && panel.revision !== previous ) {
    html += "<p class='ce-hint'>Something wrong with the live page? <button type='button' class='ce-link-btn' id='ce-publish-rollback'>Roll back to " + esc( previous ) + "</button></p>";
  }
  return html + "</div>";
}

function wirePublishPanel() {
  var on = function( id, fn ) { var el = document.getElementById( id ); if( el ) el.addEventListener( "click", fn ); };
  on( "ce-publish-close", function() { publishPanel = null; renderInspector(); } );
  on( "ce-publish-practice", function() { runPublish( true ); } );
  on( "ce-publish-live", function() {
    // Two clicks, without a browser dialog: the first arms the button.
    if( !publishPanel.armed ) { publishPanel.armed = true; renderInspector(); return; }
    runPublish( false );
  } );
  on( "ce-publish-rollback", function() { openPublishPanel( publishPanel.entry.saved.previousPublishedRevision ); } );
}

function renderInspector( focusField ) {
  var panel = document.getElementById( "ce-inspector" );
  var entry = currentEntry(), page = currentPageModel();
  if( !page ) {
    panel.innerHTML = entry && entry.kind === "site"
      ? "<div class='ce-inspector-head'><div><h2>" + esc( entry.title ) + "</h2><small>" + esc( entry.pageName ) + "</small></div><span class='ce-role-tag'>Read only</span></div>" +
        "<p class='ce-lock-note'>This page was made before the new editor. It is shown with this site's own styles; to edit it here, import it with the Page Converter first.</p>" +
        "<a class='ce-btn ce-primary' href='" + esc( PAGE_CONVERTER + "?pageName=" + encodeURIComponent( entry.pageName ) ) + "'>Import into the editor</a> " +
        "<a class='ce-btn' href='" + esc( entry.pageName ) + "' target='_blank' rel='noopener'>Open the page ↗</a>"
      : "<div class='ce-inspector-head'><div><h2>Content Editor</h2></div></div><p class='ce-hint'>" + esc( siteConfigProblem || "Open or create a page." ) + "</p>";
    return;
  }
  var element = selectedId ? ContentEditorSchema.findElementById( page.root, selectedId ) : null;
  var focusKey = focusKeyOf( document.activeElement ); // CON-T-032: keep keyboard focus across the redraw
  if( element ) renderElementInspector( panel, element ); else renderPageSettings( panel, focusField );
  if( !focusField ) restoreFocus( focusKey );
}

// The page's layout and how it gets its page.html.template (CON-T-048).
function layoutSettingsHtml( page ) {
  var choice = page.layout || ContentEditorSchema.createLayoutChoice();
  var current = choice.id ? findLayout( choice.id ) : null;
  var options = "<option value=''" + ( choice.id ? "" : " selected" ) + ">Site default template</option>";
  libraryLayouts.forEach( function( l ) {
    if( l.archived && l.id !== choice.id ) return;
    options += "<option value='" + esc( l.id ) + "'" + ( l.id === choice.id ? " selected" : "" ) + ">" + esc( l.name ) + ( l.archived ? " (archived)" : "" ) + "</option>";
  } );
  if( choice.id && !current ) options += "<option value='" + esc( choice.id ) + "' selected>" + esc( choice.id ) + " (not in the library)</option>";
  var html = "<div class='ce-field-group'><h3>Layout</h3>";
  html += field( "Page layout", "<select id='ce-f-layout'" + ( choice.templateMode === "none" || choice.templateMode === "own" ? " disabled" : "" ) + ">" + options + "</select>",
    choice.id ? "Version " + esc( choice.version ) + " of this layout." : "The site's own OpenForum template.", "ce-f-layout" );
  if( current && current.version > choice.version && choice.templateMode !== "none" ) {
    html += "<p class='ce-lock-note'>Version " + current.version + " of " + esc( current.name ) + " is in the library.</p><button type='button' class='ce-btn' id='ce-layout-update'>Use version " + current.version + "</button>";
  }
  var modes = [
    [ "link", "Link to the layout's template", "Recommended. The page follows the version it links to." ],
    [ "copy", "Copy the template into the page", "The page keeps its own copy, made when it is published." ],
    [ "none", "No template of its own", "The page uses the template of the pages above it; when released, OpenForum gives it the standard published template." ]
  ];
  // CON-B-003: an existing site page can keep the template files it had.
  if( page.template && page.template.id === "existing-page" ) {
    modes.unshift( [ "own", "Keep the page's own template", "Recommended for existing pages. The page keeps the template it had before it was in the editor." ] );
    modes[ 1 ][ 2 ] = "The page links to the chosen layout's template instead of its own.";
  }
  html += "<div class='ce-field' role='radiogroup' aria-label='Template'><span class='ce-label'>Template</span>" + modes.map( function( mode ) {
    return "<label class='ce-check ce-mode'><input type='radio' name='ce-f-template-mode' value='" + mode[ 0 ] + "'" + ( choice.templateMode === mode[ 0 ] ? " checked" : "" ) + "> " +
      esc( mode[ 1 ] ) + "<br><small>" + esc( mode[ 2 ] ) + "</small></label>";
  } ).join( "" ) + "</div></div>";
  return html;
}

function wireLayoutSettings( panel ) {
  var select = panel.querySelector( "#ce-f-layout" );
  if( !select ) return;
  select.addEventListener( "change", function() {
    var chosen = select.value ? findLayout( select.value ) : null;
    runCommand( function() { return layoutCommand( { id: chosen ? chosen.id : null, version: chosen ? chosen.version : null } ); },
      chosen ? "The page now uses the " + chosen.name + " layout" : "The page now uses the site default template" );
  } );
  var update = panel.querySelector( "#ce-layout-update" );
  if( update ) update.addEventListener( "click", function() {
    var latest = findLayout( currentPageModel().layout.id );
    if( latest ) runCommand( function() { return layoutCommand( { version: latest.version } ); }, "The page now uses version " + latest.version + " of " + latest.name );
  } );
  Array.prototype.forEach.call( panel.querySelectorAll( "input[name='ce-f-template-mode']" ), function( radio ) {
    radio.addEventListener( "change", function() {
      if( radio.checked ) runCommand( function() { return layoutCommand( { templateMode: radio.value } ); }, "Template: " + radio.value );
    } );
  } );
}

function renderPageSettings( panel, focusField ) {
  var page = currentPageModel(), template = currentTemplate();
  var html;
  var entry = currentEntry();
  if( entry.library ) {
    var kindInfo = libraryKind( entry ), isLayout = entry.library.kind === "layouts";
    var latest = isLayout ? findLayout( entry.library.id ) : findComponent( entry.library.id );
    html = "<div class='ce-inspector-head'><div><h2>" + esc( entry.library.name ) + "</h2><small>" + kindInfo.label + " in the site library</small></div><span class='ce-role-tag'>v" + entry.library.version + "</span></div>";
    html += "<p class='ce-hint'>Saving adds version " + ( entry.library.version + 1 ) + ". " +
      ( isLayout ? "Each version is written as its own page template; pages keep the version they chose until you update them." : "Pages and layouts keep the version they placed until you update them there." ) + "</p>";
    if( isLayout && latest && latest.templatePath ) html += "<p class='ce-hint'>Template: " + esc( latest.templatePath ) + "</p>";
    if( latest ) html += "<div class='ce-field-group'><h3>Versions</h3><ul class='ce-checklist'>" + latest.versions.slice().reverse().slice( 0, 8 ).map( function( v ) {
      return "<li>v" + v.version + " · " + esc( v.savedBy ) + " · " + esc( formatSavedAt( v.savedAt ) ) + ( v.message ? " · " + esc( v.message ) : "" ) + "</li>";
    } ).join( "" ) + "</ul></div>";
    var problems = isLayout ? ContentEditorSiteLibrary.validateLayout( componentRoot( page ) ) : ContentEditorSiteLibrary.validateComponent( componentRoot( page ), entry.library.id );
    // What would stop a page using it from being published.
    var elementChecks = ContentEditorPublication.checkElements( componentRoot( page ) );
    var todo = elementChecks.errors.concat( elementChecks.warnings );
    html += "<div class='ce-field-group'><h3>Checks</h3><ul class='ce-checklist'>" + problems.map( function( e ) { return "<li class='error'>" + esc( e ) + "</li>"; } ).join( "" ) +
      todo.map( function( e ) { return "<li class='todo'>" + esc( e ) + "</li>"; } ).join( "" ) + ( problems.length || todo.length ? "" : "<li>Ready to save</li>" ) + "</ul>" +
      ( todo.length ? "<p class='ce-hint'>These can be saved, but pages using this " + kindInfo.label.toLowerCase() + " cannot be published until they are fixed.</p>" : "" ) + "</div>";
    html += "<button type='button' class='ce-btn' id='ce-to-library'>Back to " + kindInfo.plural + "</button>";
    panel.innerHTML = html;
    document.getElementById( "ce-to-library" ).addEventListener( "click", function() { ContentEditorApp.showView( entry.library.kind ); } );
    return;
  }
  if( !template ) {
    html = "<div class='ce-inspector-head'><div><h2>Page settings</h2><small>Free-form page</small></div><span class='ce-role-tag'>Draft</span></div>";
    html += field( "Page title", "<input id='ce-f-title' type='text' value='" + esc( page.title ) + "'>", null, "ce-f-title" );
    html += field( "URL slug", "<input id='ce-f-slug' type='text' spellcheck='false' value='" + esc( page.slug ) + "'>", null, "ce-f-slug" );
    var errors = ContentEditorElementDefinitions.validatePage( page );
    html += "<div class='ce-field-group'><h3>Checks</h3><ul class='ce-checklist'>" + ( errors.length ? errors.map( function( e ) { return "<li class='error'>" + esc( e ) + "</li>"; } ).join( "" ) : "<li>Page is valid</li>" ) + "</ul></div>";
    panel.innerHTML = html;
    document.getElementById( "ce-f-title" ).addEventListener( "change", function( event ) { runCommand( function() { return pagePropertyCommand( "title", event.target.value ); } ); } );
    document.getElementById( "ce-f-slug" ).addEventListener( "change", function( event ) { runCommand( function() { return pagePropertyCommand( "slug", event.target.value.trim() ); } ); } );
    return;
  }
  var metadata = page.metadata, isArticle = template.id === "blog-article";
  var theme = ContentEditorThemes.getTheme( page.theme.id, page.theme.version );
  var saved = currentEntry().saved;
  html = "<div class='ce-inspector-head'><div><h2>" + ( isArticle ? "Article settings" : "Page settings" ) + "</h2><small>" + esc( template.label ) + " template v" + template.version + "</small></div><span class='ce-role-tag'>" +
    ( saved ? ( saved.archived ? "Archived" : "Saved " + esc( saved.baseRevision ) ) : "Not saved" ) + "</span></div>";
  if( conflictState && conflictState.entry === currentEntry() ) {
    var current = conflictState.current;
    html += "<div class='ce-conflict' role='alert'><strong>Not saved - this page changed</strong><p>" + esc( current.actor ) + " saved " + esc( current.id ) + " at " + esc( formatSavedAt( current.savedAt ) ) +
      " after you opened it. Your changes are still here.</p>" +
      "<button type='button' class='ce-btn' id='ce-conflict-reload'>Load their version</button> " +
      "<button type='button' class='ce-btn ce-primary' id='ce-conflict-overwrite'>Save mine as newest</button>" +
      "<p class='ce-hint'>Loading theirs drops your unsaved changes. Comparing the two arrives with CON-T-026.</p></div>";
  }
  if( publishPanel && publishPanel.entry === currentEntry() ) html += renderPublishPanel();
  if( template.id === "existing-page" ) {
    html += field( "Page title", "<input id='ce-f-title' type='text' maxlength='200' value='" + esc( metadata.title ) + "'>", "Shown in the browser tab and search results.", "ce-f-title" );
    html += "<p class='ce-hint'>An existing page: its own markup is kept as it is. Edit its text on the page, or its markup in the block's settings.</p>";
    html += collectionsHtml( pageCollectionHost( page, entry ) );
    html += sharedPartsHtml( page );
  } else {
    html += field( "Content type", "<select id='ce-f-type'" + ( saved ? " disabled" : "" ) + ">" + siteConfig.templates.map( function( id ) {
      return "<option value='" + id + "'" + ( id === template.id ? " selected" : "" ) + ">" + esc( TYPE_LABELS[ id ] || id ) + "</option>";
    } ).join( "" ) + "</select>", saved ? "Fixed once the page is saved." : "Use a content page for a service, About page or guide. Switching keeps a separate draft of each.", "ce-f-type" );
  }
  html += field( "Category", "<input id='ce-f-category' type='text' maxlength='60' value='" + esc( metadata.category ) + "' placeholder='e.g. Field notes'>", null, "ce-f-category" );
  if( isArticle ) {
    html += field( "Author", "<input id='ce-f-author' type='text' maxlength='100' value='" + esc( metadata.author ) + "'>", null, "ce-f-author" );
    html += field( "Publish date", "<input id='ce-f-publishDate' type='date' value='" + esc( metadata.publishDate ) + "'>", "Leave empty while it is a draft.", "ce-f-publishDate" );
    html += field( "Tags", "<input id='ce-f-tags' type='text' value='" + esc( ( metadata.tags || [] ).join( ", " ) ) + "' placeholder='Design, guides, ideas'>", "Separate tags with commas.", "ce-f-tags" );
    html += field( "Related pages", "<input id='ce-f-relatedPages' type='text' value='" + esc( ( metadata.relatedPages || [] ).join( ", " ) ) + "' placeholder='/Blog/another-article'>", "Site paths, separated by commas.", "ce-f-relatedPages" );
  }
  html += "<div class='ce-field-group'><h3>Sharing &amp; search</h3>";
  var base = siteConfig.baseUrl + ( currentEntry().folder || ( isArticle ? siteConfig.publishing.articlePath : siteConfig.publishing.pagePath ) );
  html += field( "URL slug", "<input id='ce-f-slug' type='text' spellcheck='false' value='" + esc( page.slug ) + "' placeholder='your-page-title'" + ( saved ? " disabled" : "" ) + ">" +
    "<small class='ce-url-preview'>" + esc( saved ? siteConfig.baseUrl + saved.publicPath : base + ( page.slug || "page-slug" ) ) + "</small>",
    saved ? "Fixed once saved. The draft lives at " + esc( saved.draftPath ) + " until it is published." : "<button type='button' class='ce-link-btn' id='ce-slug-from-title'>Make from title</button>", "ce-f-slug" );
  html += field( "Summary", "<textarea id='ce-f-summary' maxlength='320' placeholder='A short description for cards and search results'>" + esc( metadata.summary ) + "</textarea>",
    "<span id='ce-summary-length'>" + ( metadata.summary || "" ).length + "</span>/320 characters", "ce-f-summary" );
  html += "</div><div class='ce-field-group'><h3>Site style</h3>";
  html += "<div class='ce-theme-card'><span class='ce-swatches'>" + [ "accent", "soft", "paper", "ink" ].map( function( key ) { return "<span style='background:" + theme[ key ] + "'></span>"; } ).join( "" ) +
    "</span><span><strong>" + esc( siteConfig.name ) + "</strong> · " + esc( theme.name ) + " v" + page.theme.version + "<br><small>Set by this site's style</small></span></div>";
  if( page.theme.id !== siteConfig.theme.id || page.theme.version !== siteConfig.theme.version ) {
    var current = ContentEditorThemes.getTheme( siteConfig.theme.id, siteConfig.theme.version );
    html += "<p class='ce-lock-note'>The site now uses " + esc( current ? current.name : siteConfig.theme.id ) + " v" + siteConfig.theme.version + ". This page keeps its own until you switch.</p>" +
      "<button type='button' class='ce-btn' id='ce-use-site-style'>Use the site's current style</button>";
  }
  html += "</div>" + layoutSettingsHtml( page );
  html += "<div class='ce-field-group'><h3>Before publishing</h3><ul class='ce-checklist'>" + publishChecks().map( function( check ) {
    return "<li class='" + ( check.state === "ok" ? "" : check.state ) + "'>" + esc( check.text ) + goToButton( check.where ) + "</li>";
  } ).join( "" ) + "</ul></div>";
  if( currentDraft() ) html += changesHtml( currentDraft(), entry );
  if( saved ) {
    var revisions = saved.revisions.slice().reverse().slice( 0, 8 );
    html += "<div class='ce-field-group'><h3>History</h3><ul class='ce-history'>" + revisions.map( function( revision ) {
      return "<li><strong>" + esc( revision.id ) + "</strong>" + ( revision.id === saved.publishedRevision ? " <span class='ce-role-tag'>Live</span>" : "" ) +
        " " + esc( revision.actor ) + " · " + esc( formatSavedAt( revision.savedAt ) ) +
        ( revision.message ? "<br><small>" + esc( revision.message ) + "</small>" : "" ) +
        ( revision.id !== saved.baseRevision ? " <button type='button' class='ce-link-btn' data-compare-revision='" + esc( revision.id ) + "'>Compare</button>" : "" ) +
        ( saved.archived ? "" : " <button type='button' class='ce-link-btn' data-publish-revision='" + esc( revision.id ) + "'>Publish…</button>" ) + "</li>";
    } ).join( "" ) + "</ul>" + ( saved.revisions.length > 8 ? "<p class='ce-hint'>" + ( saved.revisions.length - 8 ) + " older revisions.</p>" : "" ) +
      "<p class='ce-hint'>Every save is kept. Compare shows what has changed since that revision; publishing an older revision rolls the live page back to it.</p>" +
      "<button type='button' class='ce-btn' id='ce-archive'>" + ( saved.archived ? "Restore page" : "Archive page" ) + "</button></div>";
    html += publicationLogHtml( saved );
  }
  panel.innerHTML = html;
  if( document.getElementById( "ce-conflict-reload" ) ) {
    document.getElementById( "ce-conflict-reload" ).addEventListener( "click", reloadSavedPage );
    document.getElementById( "ce-conflict-overwrite" ).addEventListener( "click", function() { saveCurrentPage( true ); } );
  }
  wirePublishPanel();
  wireChanges( panel );
  wireGoTo( panel );
  wireCollections( panel, pageCollectionHost( currentPageModel(), currentEntry() ) );
  wireSharedParts( panel );
  Array.prototype.forEach.call( panel.querySelectorAll( "[data-publish-revision]" ), function( button ) {
    button.addEventListener( "click", function() { openPublishPanel( button.getAttribute( "data-publish-revision" ) ); } );
  } );
  if( document.getElementById( "ce-archive" ) ) {
    document.getElementById( "ce-archive" ).addEventListener( "click", function() { setArchived( !saved.archived ); } );
  }

  wireLayoutSettings( panel );
  if( document.getElementById( "ce-use-site-style" ) ) document.getElementById( "ce-use-site-style" ).addEventListener( "click", function() {
    runCommand( function() { return pagePropertyCommand( "theme", JSON.parse( JSON.stringify( siteConfig.theme ) ) ); }, "The page now uses the site's current style" );
  } );
  if( document.getElementById( "ce-f-type" ) ) document.getElementById( "ce-f-type" ).addEventListener( "change", function( event ) { switchContentType( event.target.value ); } );
  [ "category", "author", "publishDate", "summary" ].concat( template.id === "existing-page" ? [ "title" ] : [] ).forEach( function( key ) {
    var input = document.getElementById( "ce-f-" + key );
    if( !input ) return;
    input.addEventListener( "change", function() {
      if( input.value !== ( currentPageModel().metadata[ key ] || "" ) ) runCommand( function() { return metadataCommand( key, input.value ); }, "Updated " + key );
    } );
  } );
  [ "tags", "relatedPages" ].forEach( function( key ) {
    var input = document.getElementById( "ce-f-" + key );
    if( !input ) return;
    input.addEventListener( "change", function() {
      var list = input.value.split( "," ).map( function( s ) { return s.trim(); } ).filter( function( s ) { return s.length > 0; } );
      if( JSON.stringify( list ) !== JSON.stringify( currentPageModel().metadata[ key ] ) ) runCommand( function() { return metadataCommand( key, list ); }, "Updated " + key );
    } );
  } );
  document.getElementById( "ce-f-summary" ).addEventListener( "input", function( event ) { document.getElementById( "ce-summary-length" ).textContent = event.target.value.length; } );
  document.getElementById( "ce-f-slug" ).addEventListener( "change", function( event ) {
    if( event.target.value.trim() !== currentPageModel().slug ) runCommand( function() { return pagePropertyCommand( "slug", event.target.value.trim() ); }, "Updated the URL slug" );
  } );
  if( document.getElementById( "ce-slug-from-title" ) ) document.getElementById( "ce-slug-from-title" ).addEventListener( "click", function() {
    runCommand( function() { return pagePropertyCommand( "slug", slugify( ContentEditorTemplates.getTitle( currentPageModel() ) ) ); }, "Made the URL slug from the title" );
  } );
  if( focusField && document.getElementById( "ce-f-" + focusField ) ) document.getElementById( "ce-f-" + focusField ).focus();
}

function slugify( text ) {
  return String( text || "" ).normalize( "NFKD" ).replace( /[\u0300-\u036f]/g, "" ).toLowerCase().replace( /[^a-z0-9]+/g, "-" ).replace( /^-|-$/g, "" ).slice( 0, 90 );
}

// A placed component: which version it holds, and where to change it.
function componentInstanceInfo( element ) {
  var latest = findComponent( element.fields.componentId );
  var html = "<div class='ce-field-group'><h3>Component</h3><p class='ce-hint'>" + esc( element.fields.name ) + ", version " + esc( element.fields.componentVersion ) + ". Its parts are changed in the library, then updated here.</p>";
  if( !latest ) return html + "<p class='ce-hint'>It is no longer in this site's library.</p></div>";
  if( latest.archived ) html += "<p class='ce-hint'>It has been archived in the library.</p>";
  if( latest.version > element.fields.componentVersion ) {
    html += "<p class='ce-lock-note'>Version " + latest.version + " is in the library" + ( latest.message ? " (" + esc( latest.message ) + ")" : "" ) + ".</p>" +
      "<button type='button' class='ce-btn ce-primary' data-update-component='" + esc( element.id ) + "'>Update to version " + latest.version + "</button> ";
  }
  html += "<button type='button' class='ce-btn' data-edit-component='" + esc( latest.id ) + "'>Edit the component</button></div>";
  return html;
}

function wireComponentInstanceInfo( panel, element ) {
  Array.prototype.forEach.call( panel.querySelectorAll( "[data-update-component]" ), function( button ) {
    button.addEventListener( "click", function() {
      var latest = findComponent( element.fields.componentId );
      if( !latest ) return;
      var page = currentPageModel();
      runCommand( function() {
        return ContentEditorCommands.createReplaceComponentCommand( page, element.id, ContentEditorSiteLibrary.instantiate( latest, latest.version ) );
      }, "Updated " + latest.name + " to version " + latest.version );
    } );
  } );
  Array.prototype.forEach.call( panel.querySelectorAll( "[data-edit-component]" ), function( button ) {
    button.addEventListener( "click", function() {
      var latest = findComponent( button.getAttribute( "data-edit-component" ) );
      if( latest ) openComponent( latest );
    } );
  } );
}

function renderElementInspector( panel, element ) {
  var page = currentPageModel(), lock = locksFor( element ), def = ContentEditorElementDefinitions.getDefinition( element.type );
  var html = "<div class='ce-inspector-head'><div><h2>" + esc( labelFor( element ) ) + "</h2><small>" + esc( def.label ) + "</small></div>" +
    ( element.role ? "<span class='ce-role-tag'>Template</span>" : "" ) + "</div>";
  var trail = [], info = ContentEditorSchema.findParentInfo( page.root, element.id );
  while( info && info.parent.type !== "page-root" ) {
    trail.unshift( info.parent );
    info = ContentEditorSchema.findParentInfo( page.root, info.parent.id );
  }
  if( trail.length ) html += "<p class='ce-trail'>In " + trail.map( function( parent ) { return "<button type='button' data-select-parent='" + esc( parent.id ) + "'>" + esc( labelFor( parent ) ) + "</button>"; } ).join( " › " ) + "</p>";
  html += "<div class='ce-element-tools'>" +
    "<button class='ce-btn' type='button' data-tool='up' title='Move up' aria-label='Move up'" + ( lock.canMove ? "" : " disabled" ) + ">↑</button>" +
    "<button class='ce-btn' type='button' data-tool='down' title='Move down' aria-label='Move down'" + ( lock.canMove ? "" : " disabled" ) + ">↓</button>" +
    "<button class='ce-btn' type='button' data-tool='duplicate' title='Duplicate' aria-label='Duplicate'" + ( lock.canDuplicate ? "" : " disabled" ) + ">⧉</button>" +
    "<button class='ce-btn danger" + ( pendingDeleteId === element.id ? " armed" : "" ) + "' type='button' data-tool='delete' title='Delete' aria-label='Delete'" + ( lock.canDelete ? "" : " disabled" ) + ">" + ( pendingDeleteId === element.id ? "Sure?" : "✕" ) + "</button></div>";
  if( lock.componentRoot ) html += "<p class='ce-lock-note'>" + ( element.type === "layout" ? "This is the layout itself. Add parts inside it, and put the page content where each page's own content should go." :
    "This is the component's container. Add its parts inside it; its background and spacing apply wherever it is placed." ) + "</p>";
  else if( lock.locked ) html += "<p class='ce-lock-note'>This is part of the " + esc( currentTemplate().label.toLowerCase() ) + " template, so it stays in place. Edit its content freely.</p>";
  else html += "<p class='ce-hint ce-tools-hint'>Move, duplicate or delete. Every change can be undone.</p>";
  if( ( def.fields.text && element.type !== "button" ) || def.fields.body || element.type === "html" ) html += "<p class='ce-lock-note ce-direct-note'>Edit the text directly on the page.</p>";
  if( element.type === "component" && !lock.componentRoot ) html += componentInstanceInfo( element );

  ( INSPECTOR_FIELDS[ element.type ] || [] ).forEach( function( spec ) {
    var value = element.fields[ spec.name ], id = "ce-e-" + spec.name;
    if( spec.type === "choice" ) {
      html += field( spec.label, "<select id='" + id + "' data-field='" + spec.name + "'>" + spec.options.map( function( o ) { return "<option" + ( o === value ? " selected" : "" ) + ">" + o + "</option>"; } ).join( "" ) + "</select>", null, id );
    } else if( spec.type === "boolean" ) {
      html += "<div class='ce-field'><label class='ce-check'><input id='" + id + "' type='checkbox' data-field='" + spec.name + "'" + ( value ? " checked" : "" ) + "> " + esc( spec.label ) + "</label></div>";
    } else if( spec.type === "spacing" ) {
      html += field( spec.label, "<select id='" + id + "' data-field='" + spec.name + "'>" + ContentEditorStyleTokens.optionsFor( "spacingTop" ).map( function( o ) { return "<option value='" + o.value + "'" + ( o.value === value ? " selected" : "" ) + ">" + esc( o.label ) + "</option>"; } ).join( "" ) + "</select>", null, id );
    } else {
      html += field( spec.label, "<input id='" + id + "' type='text' data-field='" + spec.name + "' value='" + esc( value ) + "'>", spec.hint, id );
    }
  } );

  if( element.type === "image" && element.fields.mediaUrl ) html += imageCropControls( element );
  if( element.type === "html" ) html += existingHtmlControls( element );

  if( def.styleControls.length ) {
    html += "<div class='ce-field-group'><h3>Layout &amp; style</h3>";
    def.styleControls.forEach( function( control ) {
      var raw = element.style && element.style[ control ];
      var options = ContentEditorStyleTokens.optionsFor( control );
      function select( breakpoint ) {
        var value = ContentEditorStyleTokens.getStyleValueAt( raw, breakpoint ) || "";
        return "<select data-style='" + control + "' data-bp='" + breakpoint + "' aria-label='" + esc( ( STYLE_LABELS[ control ] || control ) + " " + breakpoint ) + "'><option value=''>" + ( breakpoint === "base" ? "Default" : "Same as desktop" ) + "</option>" +
          options.map( function( o ) { return "<option value='" + o.value + "'" + ( o.value === value ? " selected" : "" ) + ">" + esc( o.label ) + "</option>"; } ).join( "" ) + "</select>";
      }
      var hasOverride = ContentEditorStyleTokens.getStyleValueAt( raw, "tablet" ) || ContentEditorStyleTokens.getStyleValueAt( raw, "phone" );
      html += "<div class='ce-field'><span class='ce-label'>" + esc( STYLE_LABELS[ control ] || control ) + "</span>" + select( "base" ) +
        "<details class='ce-responsive'" + ( hasOverride ? " open" : "" ) + "><summary>Tablet and phone</summary>" +
        "<div class='ce-style-row'><span>Tablet</span>" + select( "tablet" ) + "</div><div class='ce-style-row'><span>Phone</span>" + select( "phone" ) + "</div></details></div>";
    } );
    html += "</div>";
  }
  html += "<button type='button' class='ce-link-btn' id='ce-back-to-page'>← Page settings</button>";
  panel.innerHTML = html;

  Array.prototype.forEach.call( panel.querySelectorAll( "[data-tool]" ), function( button ) {
    button.addEventListener( "click", function() { useElementTool( button.getAttribute( "data-tool" ), element ); } );
  } );
  wireComponentInstanceInfo( panel, element );
  Array.prototype.forEach.call( panel.querySelectorAll( "[data-pick-image]" ), function( button ) {
    button.addEventListener( "click", function() {
      var fieldName = button.getAttribute( "data-pick-image" );
      ContentEditorApp.pickImage( function( image ) { applyFieldEdit( element.id, fieldName, false, image.url ); } );
    } );
  } );
  Array.prototype.forEach.call( panel.querySelectorAll( "[data-select-parent]" ), function( button ) {
    button.addEventListener( "click", function() { selectElement( button.getAttribute( "data-select-parent" ) ); } );
  } );
  Array.prototype.forEach.call( panel.querySelectorAll( "[data-field]" ), function( input ) {
    input.addEventListener( "change", function() {
      applyFieldEdit( element.id, input.getAttribute( "data-field" ), false, input.type === "checkbox" ? input.checked : input.value );
    } );
  } );
  wireImageCropControls( panel, element );
  wireExistingHtmlControls( panel, element );
  Array.prototype.forEach.call( panel.querySelectorAll( "[data-style]" ), function( select ) {
    select.addEventListener( "change", function() {
      runCommand( function() { return ContentEditorCommands.createUpdateStyleCommand( page, element.id, select.getAttribute( "data-style" ), select.getAttribute( "data-bp" ), select.value || null ); }, "Updated " + ( STYLE_LABELS[ select.getAttribute( "data-style" ) ] || "style" ).toLowerCase() );
    } );
  } );
  document.getElementById( "ce-back-to-page" ).addEventListener( "click", function() { selectPageSettings(); } );
}

function useElementTool( name, element ) {
  var page = currentPageModel();
  if( name === "delete" ) {
    if( pendingDeleteId !== element.id ) { pendingDeleteId = element.id; renderInspector(); return; }
    pendingDeleteId = null;
    selectedId = null;
    runCommand( function() { return ContentEditorCommands.createRemoveElementCommand( page, element.id ); }, "Deleted " + labelFor( element ).toLowerCase() + ". Press Ctrl+Z to undo." );
    return;
  }
  pendingDeleteId = null;
  if( name === "duplicate" ) {
    runCommand( function() { return ContentEditorCommands.createDuplicateElementCommand( page, element.id ); }, "Duplicated " + labelFor( element ).toLowerCase() );
    return;
  }
  var info = ContentEditorSchema.findParentInfo( page.root, element.id );
  var siblings = ContentEditorSchema.childArray( info.parent, info.slot );
  var to = info.index + ( name === "up" ? -1 : 1 );
  if( to < 0 || to >= siblings.length ) return;
  runCommand( function() { return ContentEditorCommands.createMoveElementCommand( page, element.id, info.parent.id, info.slot, to ); }, "Moved " + labelFor( element ).toLowerCase() + ( name === "up" ? " up" : " down" ) );
}

function createDefaultElement( type, parent, slot ) {
  if( type === "section" && isContentPageBody( parent, slot ) ) return ContentEditorTemplates.createContentSection();
  var def = ContentEditorElementDefinitions.getDefinition( type ), fields = {};
  for( var key in def.fields ) fields[ key ] = JSON.parse( JSON.stringify( def.fields[ key ].default ) );
  if( type === "image" ) fields.mediaUrl = "";
  if( type === "heading" ) fields.text = "New heading";
  if( type === "rich-text" ) fields.body = { format: ContentEditorTemplates.RICH_TEXT_FORMAT, html: "<p>New text</p>" };
  var overrides = { fields: fields };
  if( def.slots ) {
    overrides.slots = {};
    def.slots.forEach( function( s ) { overrides.slots[ s ] = []; } );
  } else {
    overrides.children = [];
  }
  return ContentEditorSchema.createElement( type, overrides );
}

function renderFooter() {
  var page = currentPageModel(), wordsEl = document.getElementById( "ce-word-count" ), status = document.getElementById( "ce-foot-status" );
  if( !page ) { wordsEl.textContent = ""; status.textContent = ""; status.className = "ce-foot-status"; return; }
  var words = 0;
  ( function walk( element ) {
    if( element.type === "rich-text" && element.role !== "cta-text" ) {
      var text = ( ( element.fields.body || {} ).html || "" ).replace( /<[^>]*>/g, " " ).trim();
      if( text ) words += text.split( /\s+/ ).length;
    }
    ContentEditorSchema.childGroups( element ).forEach( function( g ) { g.items.forEach( walk ); } );
  } )( page.root );
  wordsEl.textContent = words + ( words === 1 ? " word" : " words" ) + " · " + Math.max( 1, Math.ceil( words / 220 ) ) + " min read";
  var errors = page.template ? ContentEditorTemplates.validatePage( page ) : ContentEditorElementDefinitions.validatePage( page );
  var checks = publishChecks();
  var blocking = checks.filter( function( c ) { return c.state === "error"; } ).length;
  var suggested = checks.filter( function( c ) { return c.state === "todo"; } ).length;
  status.className = "ce-foot-status " + ( errors.length ? "bad" : "ok" );
  status.textContent = errors.length ? errors[ 0 ] : !page.template ? "Valid" :
    blocking ? "Valid · " + blocking + " thing" + ( blocking === 1 ? "" : "s" ) + " to fix before publishing" :
    "Ready to publish" + ( suggested ? " · " + suggested + " suggestion" + ( suggested === 1 ? "" : "s" ) : "" );
}

// --- Actions -----------------------------------------------------------------------------------------

function selectElement( id ) {
  commitCanvasEdit();
  var instance = lockingInstance( id );
  if( instance ) id = instance.id;
  if( id !== selectedId ) pendingDeleteId = null;
  selectedId = id;
  selectedSlot = null;
  renderRail(); renderInspector(); renderToolbar();
  sendToCanvas( "shell:highlight", { elementId: id } );
  announceSelection();
}

function selectPageSettings( focusField ) {
  pendingDeleteId = null;
  selectedId = null;
  selectedSlot = null;
  renderRail(); renderInspector( focusField ); renderToolbar();
  sendToCanvas( "shell:highlight", { elementId: null } );
}

// Carries the shared content across on the first switch, then keeps the
// two drafts separate.
function switchContentType( type ) {
  commitCanvasEdit();
  var entry = currentEntry();
  if( !entry.drafts[ type ] ) {
    var from = currentPageModel();
    var bodies = ContentEditorTemplates.findByRole( from, "body" ).map( function( b ) { return b.fields.body.html; } );
    var hero = ContentEditorTemplates.findByRole( from, "hero" )[ 0 ];
    var content = {
      title: ContentEditorTemplates.getTitle( from ), slug: from.slug,
      standfirst: ContentEditorTemplates.findByRole( from, "standfirst" )[ 0 ].fields.body.html,
      heroUrl: hero.fields.mediaUrl, heroAlt: hero.fields.alt, heroDecorative: hero.fields.decorative,
      metadata: { category: from.metadata.category, summary: from.metadata.summary }
    };
    if( type === "content-page" ) {
      content.introHtml = bodies.join( "" );
    } else {
      var headings = ContentEditorTemplates.findByRole( from, "section-heading" );
      content.bodyHtml = bodies.map( function( html, i ) { return ( i && headings[ i - 1 ] ? "<h2>" + esc( headings[ i - 1 ].fields.text ) + "</h2>" : "" ) + html; } ).join( "" );
    }
    entry.drafts[ type ] = newDraftState( ContentEditorTemplates.createPage( type, siteConfig, content ) );
  }
  entry.type = type;
  selectedId = null;
  pendingDeleteId = null;
  toast( TYPE_LABELS[ type ] + " layout. Your other draft is kept." );
  setStatus( describeDraft() );
  renderAll();
}

function setPreview( on ) {
  if( !currentDraft() ) return;
  commitCanvasEdit();
  linkInProgress = null;
  previewing = on;
  if( on ) selectedId = null;
  renderAll();
}

var toastTimer = null;
function toast( text ) {
  var element = document.getElementById( "ce-toast" );
  element.textContent = text;
  element.hidden = false;
  clearTimeout( toastTimer );
  toastTimer = setTimeout( function() { element.hidden = true; }, 3200 );
}

function wireShell() {
  document.getElementById( "ce-rail" ).addEventListener( "click", function( event ) {
    var button = event.target.closest( "button" );
    if( !button || button.disabled ) return;
    if( button.hasAttribute( "data-menu" ) ) { openMenu = openMenu === button.getAttribute( "data-menu" ) ? null : button.getAttribute( "data-menu" ); renderRail(); return; }
    if( button.hasAttribute( "data-open-index" ) ) { openPageAt( Number( button.getAttribute( "data-open-index" ) ) ); return; }
    if( button.hasAttribute( "data-site-page" ) ) { adoptSitePage( button.getAttribute( "data-site-page" ) ); return; }
    if( button.hasAttribute( "data-saved-page" ) ) { openSavedPage( button.getAttribute( "data-saved-page" ) ); return; }
    if( button.hasAttribute( "data-new-page" ) ) { createNewPage( button.getAttribute( "data-new-page" ) ); return; }
    if( button.hasAttribute( "data-images" ) ) { ContentEditorApp.showView( "images" ); return; }
    if( button.hasAttribute( "data-settings" ) ) { commitCanvasEdit(); selectPageSettings(); return; }
    if( button.hasAttribute( "data-select" ) ) { selectElement( button.getAttribute( "data-select" ) ); return; }
    if( button.hasAttribute( "data-insert-component" ) ) {
      var target = currentPageModel();
      var holder = ContentEditorSchema.findElementById( target.root, button.getAttribute( "data-parent" ) );
      var chosen = findComponent( button.getAttribute( "data-insert-component" ) );
      if( !holder || !chosen ) return;
      var instance = ContentEditorSiteLibrary.instantiate( chosen, chosen.version );
      selectedId = instance.id;
      runCommand( function() { return ContentEditorCommands.createInsertElementCommand( target, holder.id, button.getAttribute( "data-slot" ) || null, Number( button.getAttribute( "data-index" ) ), instance ); }, "Added the " + chosen.name + " component" );
      return;
    }
    if( button.hasAttribute( "data-insert" ) ) {
      var page = currentPageModel();
      var parent = ContentEditorSchema.findElementById( page.root, button.getAttribute( "data-parent" ) );
      var slot = button.getAttribute( "data-slot" ) || null;
      var element = createDefaultElement( button.getAttribute( "data-insert" ), parent, slot );
      selectedId = element.id;
      runCommand( function() { return ContentEditorCommands.createInsertElementCommand( page, parent.id, slot, Number( button.getAttribute( "data-index" ) ), element ); }, "Added " + labelFor( element ).toLowerCase() );
    }
  } );
  document.getElementById( "ce-toolbar" ).addEventListener( "mousedown", function( event ) {
    // Keep the canvas selection: toolbar buttons must not take focus.
    if( event.target.closest( "button" ) ) event.preventDefault();
  } );
  document.getElementById( "ce-toolbar" ).addEventListener( "click", function( event ) {
    var button = event.target.closest( "button" );
    if( !button ) return;
    if( button.hasAttribute( "data-cmd" ) ) sendToCanvas( "shell:format", { command: button.getAttribute( "data-cmd" ) } );
    else if( button.hasAttribute( "data-block" ) ) sendToCanvas( "shell:format", { command: "formatBlock", value: button.getAttribute( "data-block" ) } );
    else if( button.hasAttribute( "data-link-start" ) ) sendToCanvas( "shell:link", { url: pendingLinkHref } );
    else if( button.hasAttribute( "data-link-apply" ) ) applyPendingLink( document.getElementById( "ce-link-url" ).value );
    else if( button.hasAttribute( "data-link-cancel" ) ) applyPendingLink( null );
  } );
  // Any press elsewhere in the shell finishes the text being edited.
  document.addEventListener( "mousedown", function( event ) {
    if( editingInfo && !event.target.closest( "#ce-toolbar" ) ) commitCanvasEdit();
  } );
  document.getElementById( "ce-undo" ).addEventListener( "click", function() { commitCanvasEdit(); performUndoRedo( false ); } );
  document.getElementById( "ce-redo" ).addEventListener( "click", function() { commitCanvasEdit(); performUndoRedo( true ); } );
  document.getElementById( "ce-save" ).addEventListener( "click", function() { saveCurrentPage( false ); } );
  document.getElementById( "ce-publish" ).addEventListener( "click", function() { commitCanvasEdit(); openPublishPanel( null ); } );
  document.getElementById( "ce-preview" ).addEventListener( "click", function() { setPreview( !previewing ); } );
  // CON-T-035: on narrow screens the rail (pages, outline, add) opens above the page.
  document.getElementById( "ce-rail-toggle" ).addEventListener( "click", function() {
    var workspace = document.getElementById( "ce-workspace" );
    var open = !workspace.classList.contains( "ce-rail-open" );
    workspace.classList.toggle( "ce-rail-open", open );
    this.setAttribute( "aria-expanded", String( open ) );
    if( open ) { var first = document.querySelector( "#ce-rail button" ); if( first ) first.focus(); }
  } );
  document.getElementById( "ce-edit-tab" ).addEventListener( "click", function() { setPreview( false ); } );
  document.getElementById( "ce-preview-tab" ).addEventListener( "click", function() { setPreview( true ); } );
  Array.prototype.forEach.call( document.querySelectorAll( "[data-device]" ), function( button ) {
    button.addEventListener( "click", function() {
      deviceWidth = button.getAttribute( "data-device" );
      renderTopBar();
    } );
  } );
  document.addEventListener( "keydown", function( event ) {
    if( !ContentEditorApp.isShown( "content" ) ) return; // the other views have no undo or save
    var meta = event.ctrlKey || event.metaKey, key = event.key.toLowerCase();
    if( meta && key === "s" ) { event.preventDefault(); saveCurrentPage( false ); return; }
    if( !meta || ( key !== "z" && key !== "y" ) ) return;
    if( /INPUT|TEXTAREA|SELECT/.test( document.activeElement.tagName ) ) return; // fields undo their own typing
    event.preventDefault();
    performUndoRedo( key === "y" || event.shiftKey );
  } );
}

// --- Existing pages: site styles (CON-T-007) ---------------------------------------------------

// Reads the page's rendered page.html as inert data (DOMParser never runs
// its scripts) to find its applicable styles and template wrapper. A page
// with no page.html still opens, just without its site styles.
function loadPageStyles( pageName ) {
  var pageUrl = window.location.origin + pageName.replace( /\/?$/, "/" );
  return fetch( pageName + "/page.html", { cache: "no-store" } )
    .then( function( response ) {
      if( !response.ok ) return null;
      return response.text();
    } )
    .then( function( html ) {
      if( html === null ) return null;
      var doc = new DOMParser().parseFromString( html, "text/html" );
      return { pageUrl: pageUrl, extracted: ContentEditorPageStyles.extract( doc, pageUrl, window.location.origin ) };
    } )
    .catch( function() { return null; } );
}

function describePageStyles( pageStyles ) {
  if( !pageStyles ) return "no page.html found, shown without site styles";
  var extracted = pageStyles.extracted;
  var links = 0;
  for( var i = 0; i < extracted.styles.length; i++ ) if( extracted.styles[ i ].type === "link" ) links++;
  return "site styles: " + links + " stylesheet(s), " + ( extracted.styles.length - links ) + " style block(s)" +
    ( extracted.dropped.length ? ", " + extracted.dropped.length + " other-site stylesheet(s) left out" : "" ) +
    ( extracted.foundContentMarker ? "" : ", no template content marker" );
}

// --- Self-tests --------------------------------------------------------------------------------------

// CON-T-010/041: renders each hostile fixture in turn and checks that its
// marker never reaches the shell by either route a same-origin canvas
// offers - pushed straight onto the shell window, or posted onto this
// session's IntraQ queue with the current renderId. A positive control runs
// first: the same breach script injected with the real nonce must be seen
// on both routes, proving the test can detect a breach at all. Reachable
// via ?selftest=isolation.
var ISOLATION_STEP_MS = 600;

function hasDirectBreach( marker ) {
  return ( window.ContentEditorIsolationBreaches || [] ).indexOf( marker ) !== -1;
}

function runIsolationSelfTest() {
  isolationSelfTestResults = {};
  isolationQueueArrivals = {};
  window.ContentEditorIsolationBreaches = [];
  var fixtures = ContentEditorIsolationFixtures.fixtures;
  var index = 0;

  function runNext() {
    if( index >= fixtures.length ) {
      setTimeout( finishIsolationSelfTest, ISOLATION_STEP_MS );
      return;
    }
    var fixture = fixtures[ index++ ];
    var renderId = generateRenderId();
    renderCanvas( fixture.html( fixture.hostileType, { queueName: canvasQueueName, renderId: renderId } ), null, null, null, renderId );
    setTimeout( runNext, ISOLATION_STEP_MS );
  }

  setStatus( "Running isolation self-test (control + " + fixtures.length + " hostile fixtures)..." );
  runIsolationControl( function() { runNext(); } );
}

// Injects the breach script as a trusted, nonced script into a plain
// canvas render, the way only the editor's own code can.
function runIsolationControl( next ) {
  var marker = "control:trusted-script";
  renderCanvas( "<p>Isolation self-test control</p>" );
  whenCanvasReady( function() {
    var canvasDocument = document.getElementById( "editorCanvas" ).contentDocument;
    var trusted = canvasDocument && canvasDocument.querySelector( "script[nonce]" );
    if( trusted ) {
      var script = canvasDocument.createElement( "script" );
      script.nonce = trusted.nonce;
      script.textContent = ContentEditorIsolationFixtures.breachScript( marker, { queueName: canvasQueueName, renderId: currentRenderId } );
      canvasDocument.body.appendChild( script );
    }
    setTimeout( function() {
      isolationSelfTestResults[ marker ] = { control: true, direct: hasDirectBreach( marker ), queue: isolationQueueArrivals[ marker ] === true };
      next();
    }, ISOLATION_STEP_MS );
  } );
}

function finishIsolationSelfTest() {
  var fixtures = ContentEditorIsolationFixtures.fixtures;
  for( var i = 0; i < fixtures.length; i++ ) {
    var type = fixtures[ i ].hostileType;
    isolationSelfTestResults[ type ] = { control: false, direct: hasDirectBreach( type ), queue: isolationQueueArrivals[ type ] === true };
  }
  var lines = [];
  var failures = 0;
  for( var name in isolationSelfTestResults ) {
    var result = isolationSelfTestResults[ name ];
    if( result.control ) {
      var detected = result.direct && result.queue;
      if( !detected ) failures++;
      lines.push( name + ": " + ( detected ? "detected on both routes (test can see a breach)" :
        "NOT DETECTED (direct=" + result.direct + ", queue=" + result.queue + ") - the test cannot see a breach" ) );
    } else {
      var breached = result.direct || result.queue;
      if( breached ) failures++;
      lines.push( name + ": " + ( breached ? "BREACH (direct=" + result.direct + ", queue=" + result.queue + ")" : "blocked" ) );
    }
  }
  setStatus( ( failures === 0 ? "Isolation self-test PASSED — " : "Isolation self-test FAILED — " ) + lines.join( " | " ) );
}

// CON-T-014 / MVP exit criterion 1: every render fully replaces the canvas
// from the model; the canvas DOM shows the edited model; tampering with the
// canvas DOM never reaches the model and is gone after a re-render. The
// canvas is same-origin, so this test reads its DOM directly - a test-only
// check, the editor itself only talks to the canvas over IntraQ.
// Reachable via ?selftest=domintegrity.
function runDomIntegritySelfTest() {
  var page = ContentEditorSchema.createPage( "DOM integrity test", "domtest" );
  var heading = ContentEditorSchema.createElement( "heading", { fields: { text: "Original heading", level: "h2" } } );
  page.root.children = [ ContentEditorSchema.createElement( "section", { children: [ heading ] } ) ];
  openPages.push( { kind: "draft", type: null, drafts: { "free-form": newDraftState( page ) } } );
  openPageAt( openPages.length - 1 );
  setStatus( "Running DOM integrity self-test..." );

  var docBeforeEdit = document.getElementById( "editorCanvas" ).srcdoc;
  applyFieldEdit( heading.id, "level", false, "h3" ); // a real model command - renders again
  var docAfterEdit = document.getElementById( "editorCanvas" ).srcdoc;
  var expectedAfterEdit = ContentEditorRenderer.renderPage( currentPageModel() );
  var srcdocIsPureModelOutput = docAfterEdit.indexOf( expectedAfterEdit ) !== -1;
  var somethingActuallyChanged = docAfterEdit !== docBeforeEdit;

  function headingInCanvas() {
    var canvasDocument = document.getElementById( "editorCanvas" ).contentDocument;
    return canvasDocument ? canvasDocument.querySelector( "[data-element-id='" + heading.id + "']" ) : null;
  }

  whenCanvasReady( function() {
    var shown = headingInCanvas();
    var canvasDomShowsModel = !!shown && shown.tagName === "H3" && shown.textContent === "Original heading";
    var tampered = false;
    if( shown ) {
      shown.textContent = "Tampered in the canvas DOM";
      tampered = headingInCanvas().textContent === "Tampered in the canvas DOM";
    }
    renderCurrentPage();
    whenCanvasReady( function() {
      var afterRerender = headingInCanvas();
      var tamperingDiscarded = tampered && !!afterRerender && afterRerender.textContent === "Original heading" &&
        ContentEditorSchema.findElementById( currentPageModel().root, heading.id ).fields.text === "Original heading";
      var passed = srcdocIsPureModelOutput && somethingActuallyChanged && canvasDomShowsModel && tamperingDiscarded;
      setStatus( passed
        ? "DOM integrity self-test PASSED — every render fully replaces the canvas from the model, the canvas DOM shows the edited model, and tampering with the canvas DOM never reaches the model and is gone after a re-render"
        : "DOM integrity self-test FAILED — srcdocIsPureModelOutput=" + srcdocIsPureModelOutput +
          ", somethingActuallyChanged=" + somethingActuallyChanged + ", canvasDomShowsModel=" + canvasDomShowsModel +
          ", tamperingDiscarded=" + tamperingDiscarded );
    } );
  } );
}

// CON-T-007 page-styles self-test: runs extract() on a fixture page.html
// (no network) and checks what reaches the canvas srcdoc. Reachable via
// ?selftest=pagestyles.
function runPageStylesSelfTest() {
  var origin = window.location.origin;
  var pageUrl = origin + "/Selftest/PageStyles/";
  var fixture =
    "<!doctype html><html lang='en' class='no-js' onload='window.fixtureLeak=1'><head>" +
    "<link rel='stylesheet' href='/OpenForum/PageTemplates/Frameworks/Foundation/css/foundation.css'>" +
    "<link rel='stylesheet' href='https://other-site.example.com/theme.css'>" +
    "<style>.fixture-site-rule{color:#123456}</style>" +
    "<script>window.fixtureHeadScript=1</script>" +
    "</head><body class='site-body' onclick='window.fixtureLeak=1'>" +
    "<nav class='top-bar'>menu</nav>" +
    "<div class='row'><div class='columns' onmouseover='window.fixtureLeak=1' data-secret='x'>" +
    "<!--PageContent Start-->original content<!--Page Content End-->" +
    "</div></div><script>window.fixtureBodyScript=1</script></body></html>";

  var doc = new DOMParser().parseFromString( fixture, "text/html" );
  var extracted = ContentEditorPageStyles.extract( doc, pageUrl, origin );
  renderCanvas( "<p class='fixture-content'>Fixture content</p>", null, null, { pageUrl: pageUrl, extracted: extracted } );
  var srcdoc = document.getElementById( "editorCanvas" ).srcdoc;

  var checks = {
    sameOriginStylesheetKept: srcdoc.indexOf( "href=\"" + origin + "/OpenForum/PageTemplates/Frameworks/Foundation/css/foundation.css\"" ) !== -1,
    styleBlockKept: srcdoc.indexOf( ".fixture-site-rule{color:#123456}" ) !== -1,
    cascadeOrderKept: srcdoc.indexOf( "foundation.css" ) < srcdoc.indexOf( ".fixture-site-rule" ),
    otherSiteStylesheetDropped: srcdoc.indexOf( "other-site.example.com" ) === -1 && extracted.dropped.length === 1,
    templateScriptsNotCopied: srcdoc.indexOf( "fixtureHeadScript" ) === -1 && srcdoc.indexOf( "fixtureBodyScript" ) === -1,
    handlersNotCopied: srcdoc.indexOf( "fixtureLeak" ) === -1 && srcdoc.indexOf( "data-secret" ) === -1,
    templateChromeNotCopied: srcdoc.indexOf( "top-bar" ) === -1,
    wrapperRebuilt: srcdoc.indexOf( "<body class=\"site-body\"><div class=\"row\"><div class=\"columns\"><p class='fixture-content'>" ) !== -1,
    htmlAttributesKept: srcdoc.indexOf( "<html lang=\"en\" class=\"no-js\">" ) !== -1,
    baseIsThePage: srcdoc.indexOf( "<base href='" + pageUrl + "'" ) !== -1
  };

  var failed = [];
  for( var name in checks ) if( !checks[ name ] ) failed.push( name );
  setStatus( failed.length === 0
    ? "Page styles self-test PASSED — " + Object.keys( checks ).length + " checks: same-origin styles kept in order, template wrapper rebuilt, other-site stylesheet, scripts and handlers left out"
    : "Page styles self-test FAILED — " + failed.join( ", " ) );
}

