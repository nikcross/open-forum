/*
* Content Editor - Components view (CON-T-045). The site library's
* components: create, rename, duplicate, archive and restore them, see
* where each is used, and open one in the Content view to edit its parts.
* The building blocks components are made from are listed below.
* CON-T-057: above them, the site's shared parts (files its existing pages
* pull in with &insert:), edited as markup and as declared collections.
*/
( function() {
  var u = ContentEditorApp.util;
  var definitions = ContentEditorElementDefinitions.definitions;
  var components = [];
  var showArchived = false;
  var naming = null; // { mode: "new" | "rename" | "duplicate", id }
  var usage = {}; // id -> usage reply, once asked for
  var busy = false;

  function label( type ) {
    return definitions[ type ] ? definitions[ type ].label : type;
  }

  function renderBlocks() {
    var html = "";
    Object.keys( definitions ).forEach( function( type ) {
      var definition = definitions[ type ];
      if( type === "page-root" || type === "component" ) return;
      var fields = Object.keys( definition.fields || {} );
      html += "<div class='ce-card'><h3>" + u.esc( definition.label ) + "</h3>" +
        "<p>" + ( definition.allowedChildren.length ? "Holds " + u.esc( definition.allowedChildren.map( label ).join( ", " ).toLowerCase() ) : "Holds no other blocks" ) + "</p>" +
        fields.map( function( f ) { return "<span class='ce-tag'>" + u.esc( f ) + "</span>"; } ).join( "" ) +
        "</div>";
    } );
    document.getElementById( "ce-components-blocks" ).innerHTML = html;
  }

  function partsOf( content ) {
    var counts = {};
    ( function walk( element, top ) {
      if( !top ) {
        var name = element.type === "component" ? "◆ " + ( element.fields.name || "component" ) : label( element.type ).toLowerCase();
        counts[ name ] = ( counts[ name ] || 0 ) + 1;
        if( element.type === "component" ) return;
      }
      ContentEditorSchema.childGroups( element ).forEach( function( g ) { g.items.forEach( function( c ) { walk( c, false ); } ); } );
    } )( content, true );
    return Object.keys( counts ).map( function( k ) { return counts[ k ] > 1 ? counts[ k ] + " × " + k : k; } );
  }

  function previewDoc( content, config ) {
    var theme = config ? ContentEditorThemes.getTheme( config.theme.id, config.theme.version ) : null;
    var page = { root: content, theme: config ? config.theme : null };
    return "<!doctype html><meta charset='utf-8'><style>html,body{margin:0;}" + ( theme ? ContentEditorThemes.buildCss( theme ) : "" ) +
      ContentEditorRenderer.renderResponsiveCss( page ) + "</style><div class='ce-template'><div class='ce-page' style='padding:24px'>" +
      ContentEditorPublication.cleanMarkup( ContentEditorRenderer.renderElement( content ) ) + "</div></div>";
  }

  function usageHtml( id ) {
    var reply = usage[ id ];
    if( !reply ) return "<button type='button' class='ce-link-btn' data-usage='" + u.esc( id ) + "'>Where is it used?</button>";
    if( reply.error ) return "<p class='error'>" + u.esc( reply.error ) + "</p>";
    var latest = ( find( id ) || {} ).version;
    function versions( list ) {
      var behind = list.some( function( v ) { return v < latest; } );
      return " <small>v" + list.join( ", v" ) + ( behind ? " · update to v" + latest + " there" : "" ) + "</small>";
    }
    var items = [];
    reply.pages.forEach( function( p ) {
      items.push( "<li>Page " + u.esc( p.title || p.publicPath ) + versions( p.versions ) + " <button type='button' class='ce-link-btn' data-open-page='" + u.esc( p.pageId ) + "'>Open</button></li>" );
    } );
    reply.components.forEach( function( c ) {
      items.push( "<li>Component " + u.esc( c.name ) + versions( c.versions ) + " <button type='button' class='ce-link-btn' data-edit='" + u.esc( c.id ) + "'>Open</button></li>" );
    } );
    reply.layouts.forEach( function( l ) { items.push( "<li>Layout " + u.esc( l.name ) + versions( l.versions ) + "</li>" ); } );
    return items.length ? "<ul class='ce-usage'>" + items.join( "" ) + "</ul>" : "<p class='ce-usage'>Not used anywhere yet.</p>";
  }

  function nameForm( mode, id, value ) {
    return "<form class='ce-name-form' data-name-form='" + mode + "'" + ( id ? " data-id='" + u.esc( id ) + "'" : "" ) + ">" +
      "<input type='text' maxlength='80' required aria-label='Component name' value='" + u.esc( value || "" ) + "' placeholder='Component name'/>" +
      "<button type='submit' class='ce-btn ce-primary'>" + ( mode === "new" ? "Create" : mode === "rename" ? "Rename" : "Duplicate" ) + "</button>" +
      "<button type='button' class='ce-btn' data-cancel-name='1'>Cancel</button></form>";
  }

  function render() {
    ContentEditorApp.whenSiteConfig( function( config ) {
      var list = document.getElementById( "ce-components-list" );
      var shown = components.filter( function( c ) { return showArchived || !c.archived; } );
      var archivedCount = components.filter( function( c ) { return c.archived; } ).length;
      document.getElementById( "ce-components-new-form" ).innerHTML = naming && naming.mode === "new" ? nameForm( "new", null, "" ) : "";
      document.getElementById( "ce-components-archived" ).innerHTML = archivedCount ?
        "<label class='ce-check'><input type='checkbox' id='ce-components-show-archived'" + ( showArchived ? " checked" : "" ) + "/> Show " + archivedCount + " archived</label>" : "";
      list.innerHTML = "";
      if( !shown.length ) {
        list.innerHTML = "<div class='ce-empty'>No components yet. Make one with New component, then place it in pages and layouts.</div>";
      }
      shown.forEach( function( c ) {
        var card = document.createElement( "div" );
        card.className = "ce-card ce-layout-card ce-component-card" + ( c.archived ? " archived" : "" );
        var actions = c.archived
          ? "<button type='button' class='ce-btn' data-restore='" + u.esc( c.id ) + "'>Restore</button>"
          : "<button type='button' class='ce-btn ce-primary' data-edit='" + u.esc( c.id ) + "'>Edit</button>" +
            "<button type='button' class='ce-btn' data-rename='" + u.esc( c.id ) + "'>Rename</button>" +
            "<button type='button' class='ce-btn' data-duplicate='" + u.esc( c.id ) + "'>Duplicate</button>" +
            "<button type='button' class='ce-btn' data-archive='" + u.esc( c.id ) + "'>Archive</button>";
        var form = naming && naming.id === c.id ? nameForm( naming.mode, c.id, naming.mode === "rename" ? c.name : c.name + " (copy)" ) : "";
        card.innerHTML = "<div class='ce-layout-thumb'></div><div class='ce-card-text'><h3>◆ " + u.esc( c.name ) + "</h3>" +
          "<p>Version " + c.version + " · " + u.esc( c.savedBy ) + " · " + u.esc( formatSavedAt( c.savedAt ) ) + ( c.archived ? " · archived" : "" ) + "</p>" +
          "<p>" + u.esc( partsOf( c.content ).join( ", " ) ) + "</p>" +
          "<div class='ce-card-actions'>" + actions + "</div>" + form + usageHtml( c.id ) + "</div>";
        var frame = document.createElement( "iframe" );
        frame.setAttribute( "sandbox", "" );
        frame.setAttribute( "title", c.name + " preview" );
        frame.setAttribute( "tabindex", "-1" );
        card.querySelector( ".ce-layout-thumb" ).appendChild( frame );
        ContentEditorApp.lazyPreview( frame, previewDoc( c.content, config ) );
        list.appendChild( card );
      } );
      ContentEditorApp.scaleThumbnails( list );
      var input = document.querySelector( "#ce-view-components .ce-name-form input" );
      if( input ) input.focus();
    } );
  }

  function load() {
    u.readService( "listLibrary", { kind: "components" } )
      .then( function( list ) { components = list || []; render(); } )
      .catch( function( error ) { document.getElementById( "ce-components-list" ).innerHTML = "<p class='error'>" + u.esc( error ) + "</p>"; } );
  }

  function find( id ) {
    return components.filter( function( c ) { return c.id === id; } )[ 0 ];
  }

  // Every change goes through the server, then the list and the Content
  // view's insert list are reloaded.
  function run( request, done ) {
    if( busy ) return;
    busy = true;
    request
      .then( function( reply ) {
        if( reply.result !== "ok" ) throw reply.message;
        u.toast( reply.message + "." );
        naming = null;
        usage = {};
        ContentEditorApp.componentsChanged();
        if( done ) done( reply.data );
        load();
      } )
      .catch( function( error ) { u.toast( "" + error ); } )
      .then( function() { busy = false; } );
  }

  // --- Shared parts (CON-T-057) ---------------------------------------------
  // The files the site's existing pages pull in with &insert: (a side menu).
  // Saving writes the part's Development copy; every page that uses it shows
  // the change in the editor, and the site owner releases it.
  var parts = null, partsError = "";
  var editing = null; // { path, html, original, version, usedBy, draftPath }
  var partBusy = false;

  function loadParts( then ) {
    u.readService( "listSharedParts", {} )
      .then( function( list ) { parts = list || []; partsError = ""; } )
      .catch( function( error ) { parts = []; partsError = "" + error; } )
      .then( function() { renderParts(); if( then ) then(); } );
  }

  function partHost() {
    return {
      key: "part:" + editing.path,
      defs: ContentEditorCollections.forPart( currentSiteConfig, editing.path ),
      markup: function() { return editing.html; },
      apply: function( html, message ) {
        var cleaned = ContentEditorExistingHtml.clean( html ).html;
        if( cleaned === editing.html ) { u.toast( "No change." ); return false; }
        editing.html = cleaned;
        u.toast( message + " (not saved yet)." );
        return true;
      },
      redraw: function() { renderParts(); }
    };
  }
  var currentSiteConfig = null;

  function statusOf( part ) {
    if( !part.exists ) return "No Development copy yet";
    if( !part.live ) return "Not live yet";
    return part.released ? "Same as live" : "Changed, not released yet";
  }

  function renderParts() {
    var box = document.getElementById( "ce-shared-parts" );
    if( !box ) return;
    if( parts === null ) { box.innerHTML = ""; return; }
    var html = "<h2 class='ce-view-subhead'>Shared parts of the site's pages</h2>" +
      "<p class='ce-view-intro'>Files the site's existing pages pull in, such as a side menu. Editing one changes its Development copy, and every page that uses it shows the change here. The live site keeps the old version until the part's page is released.</p>";
    if( partsError ) html += "<p class='error'>" + u.esc( partsError ) + "</p>";
    else if( !parts.length ) html += "<div class='ce-empty'>No shared parts: none of the site's pages pull one in.</div>";
    html += "<div class='ce-shared-parts'>";
    parts.forEach( function( part ) {
      var open = editing && editing.path === part.path;
      html += "<div class='ce-card ce-shared-part" + ( open ? " open" : "" ) + "'><div class='ce-card-text'><h3><code>" + u.esc( part.path ) + "</code></h3>" +
        "<p>Used by " + part.usedBy.length + " page" + ( part.usedBy.length === 1 ? "" : "s" ) + ": " + u.esc( part.usedBy.join( ", " ) ) + "</p>" +
        "<p class='ce-part-status" + ( part.exists && part.live && !part.released ? " changed" : "" ) + "'>" + u.esc( statusOf( part ) ) + "</p>" +
        ( open ? "" : "<div class='ce-card-actions'><button type='button' class='ce-btn ce-primary' data-part-edit='" + u.esc( part.path ) + "'" + ( part.exists ? "" : " disabled title='Make a Development copy of its page first'" ) + ">Edit</button></div>" ) +
        "</div>" + ( open ? partEditorHtml() : "" ) + "</div>";
    } );
    html += "</div>";
    box.innerHTML = html;
    if( editing ) wirePartEditor( box );
  }

  function partEditorHtml() {
    var changed = editing.html !== editing.original;
    return "<div class='ce-part-editor'>" +
      "<div class='ce-part-preview'><iframe sandbox='' title='Preview of " + u.esc( editing.path ) + "' id='ce-part-preview'></iframe>" +
      "<p class='ce-hint'>Shown in " + u.esc( editing.usedBy[ 0 ] || "" ) + ", with this version of the part outlined.</p></div>" +
      "<div class='ce-part-fields'>" + ContentEditorApp.collectionsUi.html( partHost() ) +
      "<div class='ce-field'><label for='ce-part-html'>Markup</label><textarea id='ce-part-html' class='ce-markup' rows='14' spellcheck='false'>" + u.esc( editing.html ) + "</textarea>" +
      "<p class='ce-hint'>Cleaned for safety when applied: scripts and event handlers are removed.</p>" +
      "<button type='button' class='ce-btn' id='ce-part-apply'>Apply markup</button></div>" +
      "<div class='ce-card-actions'><button type='button' class='ce-btn ce-primary' id='ce-part-save'" + ( changed && !partBusy ? "" : " disabled" ) + ">" + ( partBusy ? "Saving..." : "Save to " + u.esc( editing.draftPath ) ) + "</button>" +
      "<button type='button' class='ce-btn' id='ce-part-close'>" + ( changed ? "Discard changes" : "Close" ) + "</button></div></div></div>";
  }

  function wirePartEditor( box ) {
    var frame = box.querySelector( "#ce-part-preview" );
    var showing = editing;
    if( frame && editing.usedBy.length ) {
      ContentEditorApp.partPreviewDoc( editing.html, ContentEditorSharedParts.DRAFT_ROOT + editing.usedBy[ 0 ], editing.path ).then( function( doc ) {
        if( editing === showing && frame.isConnected ) frame.srcdoc = doc;
      } );
    }
    ContentEditorApp.collectionsUi.wire( box, partHost() );
    box.querySelector( "#ce-part-apply" ).addEventListener( "click", function() {
      if( partHost().apply( box.querySelector( "#ce-part-html" ).value, "Applied the markup" ) ) renderParts();
    } );
    box.querySelector( "#ce-part-close" ).addEventListener( "click", function() { editing = null; renderParts(); } );
    box.querySelector( "#ce-part-save" ).addEventListener( "click", savePart );
  }

  function openPart( path ) {
    if( !path ) return;
    if( editing && editing.path !== path && editing.html !== editing.original ) { u.toast( "Save or discard the changes to " + editing.path + " first." ); return; }
    u.readService( "readSharedPart", { path: path } )
      .then( function( part ) {
        var summary = ( parts || [] ).filter( function( p ) { return p.path === part.path; } )[ 0 ];
        editing = { path: part.path, html: part.cleaned, original: part.cleaned, version: part.version, draftPath: part.draftPath, usedBy: summary ? summary.usedBy : [] };
        if( part.unsafe && part.unsafe.length ) u.toast( "This part will be cleaned when saved: " + part.unsafe.join( "; " ) );
        renderParts();
        var card = document.querySelector( ".ce-shared-part.open" );
        if( card ) card.scrollIntoView( { block: "start" } );
      } )
      .catch( function( error ) { u.toast( "" + error ); } );
  }

  function savePart() {
    if( partBusy || !editing ) return;
    partBusy = true;
    renderParts();
    var saving = editing;
    ContentEditorClient.saveSharedPart( saving.path, saving.html, saving.version )
      .then( function( reply ) {
        if( reply.result === "conflict" ) throw reply.message + ". Close it and open it again to see their version.";
        if( reply.result !== "ok" ) throw reply.message;
        u.toast( reply.message + ". Release " + ContentEditorSharedParts.split( saving.draftPath ).page + " to put it live." );
        editing = null;
        ContentEditorApp.sharedPartChanged( saving.path );
        loadParts();
      } )
      .catch( function( error ) { u.toast( "" + error ); } )
      .then( function() { partBusy = false; renderParts(); } );
  }

  function newContent( name ) {
    var heading = ContentEditorSchema.createElement( "heading", { fields: { text: name, level: "h2" }, children: [] } );
    return ContentEditorSchema.createElement( "component", { fields: { componentId: "", componentVersion: null, name: "" }, children: [ heading ] } );
  }

  function wire() {
    var view = document.getElementById( "ce-view-components" );
    view.addEventListener( "click", function( event ) {
      var target = event.target.closest( "button, input" );
      if( !target ) return;
      var id;
      if( ( id = target.getAttribute( "data-part-edit" ) ) ) { openPart( id ); return; }
      if( target.id === "ce-components-new" ) { naming = { mode: "new" }; render(); return; }
      if( target.id === "ce-components-show-archived" ) { showArchived = target.checked; render(); return; }
      if( target.hasAttribute( "data-cancel-name" ) ) { naming = null; render(); return; }
      if( ( id = target.getAttribute( "data-edit" ) ) ) { ContentEditorApp.editComponent( find( id ) ); return; }
      if( ( id = target.getAttribute( "data-open-page" ) ) ) { ContentEditorApp.openPage( id ); return; }
      if( ( id = target.getAttribute( "data-rename" ) ) ) { naming = { mode: "rename", id: id }; render(); return; }
      if( ( id = target.getAttribute( "data-duplicate" ) ) ) { naming = { mode: "duplicate", id: id }; render(); return; }
      if( ( id = target.getAttribute( "data-archive" ) ) ) { run( ContentEditorClient.updateLibraryEntry( "components", id, { archived: true } ) ); return; }
      if( ( id = target.getAttribute( "data-restore" ) ) ) { run( ContentEditorClient.updateLibraryEntry( "components", id, { archived: false } ) ); return; }
      if( ( id = target.getAttribute( "data-usage" ) ) ) {
        var asked = id;
        u.readService( "libraryUsage", { kind: "components", id: asked } )
          .then( function( reply ) { usage[ asked ] = reply; } )
          .catch( function( error ) { usage[ asked ] = { error: "" + error }; } )
          .then( render );
      }
    } );
    view.addEventListener( "submit", function( event ) {
      var form = event.target.closest( "[data-name-form]" );
      if( !form ) return;
      event.preventDefault();
      var name = form.querySelector( "input" ).value.trim();
      var mode = form.getAttribute( "data-name-form" ), id = form.getAttribute( "data-id" );
      if( mode === "new" ) run( ContentEditorClient.createLibraryEntry( "components", name, newContent( name ), "Created" ), function( made ) { ContentEditorApp.editComponent( made ); } );
      if( mode === "rename" ) run( ContentEditorClient.updateLibraryEntry( "components", id, { name: name } ) );
      if( mode === "duplicate" ) run( ContentEditorClient.duplicateLibraryEntry( "components", id, name ) );
    } );
  }

  function refresh() {
    load();
    ContentEditorApp.whenSiteConfig( function( config ) {
      currentSiteConfig = config;
      loadParts( function() { openPart( ContentEditorApp.takePendingSharedPart() ); } );
    } );
  }

  ContentEditorApp.registerView( "components", {
    init: function() {
      renderBlocks();
      wire();
      refresh();
    },
    refresh: refresh,
    openPart: function( path ) { openPart( path ); }
  } );
} )();
