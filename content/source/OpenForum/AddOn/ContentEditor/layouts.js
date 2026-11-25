/*
* Content Editor - Layouts view (CON-T-047). The site library's page
* layouts: each version is written as its own page.html.template, and a
* page links to, copies or leaves out the version it chose (CON-T-048).
* Create, rename, duplicate, archive and restore layouts here, and open one
* in the Content view to arrange its components around the page content.
* The site's default template and the page types are shown below.
*/
( function() {
  var u = ContentEditorApp.util;
  var layouts = [];
  var showArchived = false;
  var naming = null; // { mode: "new" | "rename" | "duplicate", id }
  var busy = false;

  function themeCss( config, theme ) {
    var tokens = theme ? ContentEditorThemes.getTheme( theme.id, theme.version ) : config ? ContentEditorThemes.getTheme( config.theme.id, config.theme.version ) : null;
    return tokens ? ContentEditorThemes.buildCss( tokens ) : "";
  }

  function layoutPreview( layout, config ) {
    var content = layout.content;
    return "<!doctype html><meta charset='utf-8'><style>html,body{margin:0;}" + themeCss( config, content.fields && content.fields.theme ) +
      ContentEditorLayouts.LAYOUT_CSS + ContentEditorRenderer.renderResponsiveCss( { root: content } ) +
      ".ce-content-slot{min-height:220px;border:3px dashed #9db7c8;margin:18px;border-radius:12px}" +
      ".ce-content-slot:empty::before{content:'Page content';display:block;padding:80px 0;text-align:center;font:600 28px Arial,sans-serif;color:#5d7383}</style>" +
      "<div class='ce-template ce-template--layout'>" + ContentEditorPublication.cleanMarkup( ContentEditorRenderer.renderElement( content ) ) + "</div>";
  }

  function pageTypePreview( templateId, config ) {
    var page = ContentEditorTemplates.createPage( templateId, config, ContentEditorTemplates.examples[ templateId ] || {} );
    return "<!doctype html><meta charset='utf-8'><style>html,body{margin:0;}" + themeCss( config, page.theme ) +
      ContentEditorRenderer.renderResponsiveCss( page ) + "</style>" + ContentEditorPublication.renderBody( page );
  }

  function card( title, lines, srcdoc, extra ) {
    var element = document.createElement( "div" );
    element.className = "ce-card ce-layout-card";
    element.innerHTML = "<div class='ce-layout-thumb'></div><div class='ce-card-text'><h3>" + title + "</h3>" +
      lines.map( function( line ) { return "<p>" + line + "</p>"; } ).join( "" ) + ( extra || "" ) + "</div>";
    if( srcdoc ) {
      // A new iframe per render: Chrome keeps the first srcdoc if it is set twice before loading.
      var frame = document.createElement( "iframe" );
      frame.setAttribute( "sandbox", "" );
      frame.setAttribute( "tabindex", "-1" );
      frame.setAttribute( "title", "Preview" );
      element.querySelector( ".ce-layout-thumb" ).appendChild( frame );
      ContentEditorApp.lazyPreview( frame, srcdoc );
    }
    return element;
  }

  function nameForm( mode, id, value ) {
    return "<form class='ce-name-form' data-name-form='" + mode + "'" + ( id ? " data-id='" + u.esc( id ) + "'" : "" ) + ">" +
      "<input type='text' maxlength='80' required aria-label='Layout name' value='" + u.esc( value || "" ) + "' placeholder='Layout name'/>" +
      "<button type='submit' class='ce-btn ce-primary'>" + ( mode === "new" ? "Create" : mode === "rename" ? "Rename" : "Duplicate" ) + "</button>" +
      "<button type='button' class='ce-btn' data-cancel-name='1'>Cancel</button></form>";
  }

  function render() {
    ContentEditorApp.whenSiteConfig( function( config, problem ) {
      var list = document.getElementById( "ce-layouts-library" );
      var shown = layouts.filter( function( l ) { return showArchived || !l.archived; } );
      var archivedCount = layouts.filter( function( l ) { return l.archived; } ).length;
      document.getElementById( "ce-layouts-new-form" ).innerHTML = naming && naming.mode === "new" ? nameForm( "new", null, "" ) : "";
      document.getElementById( "ce-layouts-archived" ).innerHTML = archivedCount ?
        "<label class='ce-check'><input type='checkbox' id='ce-layouts-show-archived'" + ( showArchived ? " checked" : "" ) + "/> Show " + archivedCount + " archived</label>" : "";
      list.innerHTML = "";
      if( !shown.length ) list.innerHTML = "<div class='ce-empty'>No layouts yet. Make one with New layout: arrange components around the place where each page's content goes.</div>";
      shown.forEach( function( l ) {
        var actions = l.archived
          ? "<button type='button' class='ce-btn' data-restore='" + u.esc( l.id ) + "'>Restore</button>"
          : "<button type='button' class='ce-btn ce-primary' data-edit='" + u.esc( l.id ) + "'>Edit</button>" +
            "<button type='button' class='ce-btn' data-rename='" + u.esc( l.id ) + "'>Rename</button>" +
            "<button type='button' class='ce-btn' data-duplicate='" + u.esc( l.id ) + "'>Duplicate</button>" +
            "<button type='button' class='ce-btn' data-archive='" + u.esc( l.id ) + "'>Archive</button>";
        var form = naming && naming.id === l.id ? nameForm( naming.mode, l.id, naming.mode === "rename" ? l.name : l.name + " (copy)" ) : "";
        list.appendChild( card( "▣ " + u.esc( l.name ), [
          "Version " + l.version + " · " + u.esc( l.savedBy ) + " · " + u.esc( formatSavedAt( l.savedAt ) ) + ( l.archived ? " · archived" : "" ),
          "Template: layout-" + u.esc( l.id ) + "-v" + l.version + ".html.template"
        ], layoutPreview( l, config ), "<div class='ce-card-actions'>" + actions + "</div>" + form ) );
      } );

      var defaults = document.getElementById( "ce-layouts-default" );
      defaults.innerHTML = "";
      defaults.appendChild( card( "Site default template", [
        siteConfigPage + "/page.html.template",
        "Pages use it until they choose a library layout. It is an ordinary OpenForum template, edited outside the Content Editor."
      ], null ) );

      var types = document.getElementById( "ce-layouts-list" );
      types.innerHTML = "";
      if( !config ) { types.innerHTML = "<p class='error'>" + u.esc( problem ) + "</p>"; }
      else Object.keys( ContentEditorTemplates.templates ).forEach( function( templateId ) {
        var template = ContentEditorTemplates.getTemplate( templateId, ContentEditorTemplates.latestVersion( templateId ) );
        types.appendChild( card( u.esc( template.label ), [ Object.keys( template.roles ).length + " fixed parts, version " + template.version,
          config.templates.indexOf( templateId ) !== -1 ? "Offered on this site" : "Not offered on this site" ], pageTypePreview( templateId, config ) ) );
      } );
      rescale();
      var input = document.querySelector( "#ce-view-layouts .ce-name-form input" );
      if( input ) input.focus();
    } );
  }

  function rescale() {
    var view = document.getElementById( "ce-view-layouts" );
    if( view ) ContentEditorApp.scaleThumbnails( view );
  }

  function load() {
    u.readService( "listLibrary", { kind: "layouts" } )
      .then( function( list ) { layouts = list || []; render(); } )
      .catch( function( error ) { document.getElementById( "ce-layouts-library" ).innerHTML = "<p class='error'>" + u.esc( error ) + "</p>"; } );
  }

  function find( id ) {
    return layouts.filter( function( l ) { return l.id === id; } )[ 0 ];
  }

  function run( request, done ) {
    if( busy ) return;
    busy = true;
    request
      .then( function( reply ) {
        if( reply.result !== "ok" ) throw reply.message;
        u.toast( reply.message + "." );
        naming = null;
        ContentEditorApp.componentsChanged();
        if( done ) done( reply.data );
        load();
      } )
      .catch( function( error ) { u.toast( "" + error ); } )
      .then( function() { busy = false; } );
  }

  // A new layout starts as a header, the page content and a footer.
  function newContent( name, config ) {
    var el = function( type, fields, children ) { return ContentEditorSchema.createElement( type, { fields: fields || {}, children: children || [] } ); };
    var siteName = config ? config.name : name;
    return el( "layout", {}, [
      el( "section", {}, [ el( "heading", { text: siteName, level: "h2" } ) ] ),
      el( "content-slot" ),
      el( "section", {}, [ el( "rich-text", { body: { format: ContentEditorTemplates.RICH_TEXT_FORMAT, html: "<p>" + u.esc( siteName ) + "</p>" } } ) ] )
    ] );
  }

  function wire() {
    var view = document.getElementById( "ce-view-layouts" );
    view.addEventListener( "click", function( event ) {
      var target = event.target.closest( "button, input" );
      if( !target ) return;
      var id;
      if( target.id === "ce-layouts-new" ) { naming = { mode: "new" }; render(); return; }
      if( target.id === "ce-layouts-show-archived" ) { showArchived = target.checked; render(); return; }
      if( target.hasAttribute( "data-cancel-name" ) ) { naming = null; render(); return; }
      if( ( id = target.getAttribute( "data-edit" ) ) ) { ContentEditorApp.editLayout( find( id ) ); return; }
      if( ( id = target.getAttribute( "data-rename" ) ) ) { naming = { mode: "rename", id: id }; render(); return; }
      if( ( id = target.getAttribute( "data-duplicate" ) ) ) { naming = { mode: "duplicate", id: id }; render(); return; }
      if( ( id = target.getAttribute( "data-archive" ) ) ) { run( ContentEditorClient.updateLibraryEntry( "layouts", id, { archived: true } ) ); return; }
      if( ( id = target.getAttribute( "data-restore" ) ) ) { run( ContentEditorClient.updateLibraryEntry( "layouts", id, { archived: false } ) ); }
    } );
    view.addEventListener( "submit", function( event ) {
      var form = event.target.closest( "[data-name-form]" );
      if( !form ) return;
      event.preventDefault();
      var name = form.querySelector( "input" ).value.trim();
      var mode = form.getAttribute( "data-name-form" ), id = form.getAttribute( "data-id" );
      if( mode === "new" ) {
        ContentEditorApp.whenSiteConfig( function( config ) {
          run( ContentEditorClient.createLibraryEntry( "layouts", name, newContent( name, config ), "Created" ), function( made ) { ContentEditorApp.editLayout( made ); } );
        } );
      }
      if( mode === "rename" ) run( ContentEditorClient.updateLibraryEntry( "layouts", id, { name: name } ) );
      if( mode === "duplicate" ) run( ContentEditorClient.duplicateLibraryEntry( "layouts", id, name ) );
    } );
  }

  ContentEditorApp.registerView( "layouts", {
    init: function() {
      wire();
      load();
      window.addEventListener( "resize", rescale );
    },
    // Hidden views measure 0 wide, so scale again once shown.
    refresh: load
  } );
} )();
