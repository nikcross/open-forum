/*
* Content Editor - Site Structure view (CON-T-051). The editor's pages as a
* tree of their published paths, with each page's type, layout and state.
* From the tree: open a page, create one in a folder, move or rename one
* (a dry run lists problems and the links that would need updating before
* anything is written), archive or restore it, list Development pages not
* yet in the editor (with Import), and make a navigation component from the
* tree. Only Development copies are ever written.
*/
( function() {
  var u = ContentEditorApp.util;
  var TYPE_NAMES = { "blog-article": "Blog article", "content-page": "Content page", "existing-page": "Existing page" };
  var sitePages = []; // PHW-T-003: the site's own pages not yet in the editor
  var pages = [];
  var layouts = [];
  var showArchived = false;
  var form = null; // { mode: "new" | "move", folder, pageId, plan, armed }
  var others = {}; // folder -> list of other Development pages, once asked for
  var busy = false;

  function buildTree( list ) {
    var root = { name: "", path: "/", children: {}, page: null };
    list.forEach( function( page ) {
      var node = root;
      page.publicPath.split( "/" ).filter( Boolean ).forEach( function( part ) {
        if( !node.children[ part ] ) node.children[ part ] = { name: part, path: node.path + part + "/", children: {}, page: null };
        node = node.children[ part ];
      } );
      node.page = page;
    } );
    return root;
  }

  function stateOf( page ) {
    if( page.archived ) return "<span class='ce-state archived'>Archived</span>";
    if( page.publishedRevision ) return "<span class='ce-state live'>Live " + u.esc( page.publishedRevision ) + "</span>";
    return "<span class='ce-state'>Draft " + u.esc( page.draftRevision || "" ) + "</span>";
  }

  function newForm( folder ) {
    return "<form class='ce-name-form ce-tree-form' data-new-form='" + u.esc( folder ) + "'><span>New page in <code>" + u.esc( folder ) + "</code></span>" +
      "<select aria-label='Page type'>" + Object.keys( TYPE_NAMES ).map( function( id ) { return "<option value='" + id + "'>" + TYPE_NAMES[ id ] + "</option>"; } ).join( "" ) + "</select>" +
      "<button type='submit' class='ce-btn ce-primary'>Start writing</button><button type='button' class='ce-btn' data-cancel='1'>Cancel</button>" +
      "<small>You choose its URL slug before the first save.</small></form>";
  }

  function moveForm( page ) {
    var plan = form.plan;
    var html = "<form class='ce-name-form ce-tree-form' data-move-form='" + u.esc( page.pageId ) + "'><span>Move or rename to</span>" +
      "<input type='text' value='" + u.esc( form.path || page.publicPath ) + "' aria-label='New path' spellcheck='false'/>" +
      "<button type='submit' class='ce-btn'>Check</button>" +
      ( plan && !plan.problems.length ? "<button type='button' class='ce-btn " + ( form.armed ? "danger armed" : "ce-primary" ) + "' data-do-move='1'>" + ( form.armed ? "Sure? Move it" : "Move" ) + "</button>" : "" ) +
      "<button type='button' class='ce-btn' data-cancel='1'>Cancel</button></form>";
    if( plan ) {
      html += "<ul class='ce-checklist ce-tree-plan'>" + plan.problems.map( function( p ) { return "<li class='error'>" + u.esc( p ) + "</li>"; } ).join( "" ) +
        plan.warnings.map( function( w ) { return "<li class='todo'>" + u.esc( w ) + "</li>"; } ).join( "" ) +
        plan.links.map( function( l ) { return "<li class='todo'>" + u.esc( l.kind ) + " " + u.esc( l.name ) + ( l.path ? " (" + u.esc( l.path ) + ")" : "" ) + ": " + l.links + " link" + ( l.links > 1 ? "s" : "" ) + "</li>"; } ).join( "" ) +
        ( plan.problems.length || plan.warnings.length ? "" : "<li>Nothing links to " + u.esc( plan.from ) + "; it is safe to move</li>" ) + "</ul>" +
        ( plan.problems.length ? "" : "<p class='ce-hint'>The Development copy moves to " + u.esc( plan.toDraft ) + " and the old one goes to /OpenForum/DeletedPages. A revision records the new slug.</p>" );
    }
    return html;
  }

  function othersHtml( folder ) {
    var list = others[ folder ];
    if( !list ) return "";
    if( list.error ) return "<p class='error'>" + u.esc( list.error ) + "</p>";
    return "<ul class='ce-tree'>" + ( list.length ? list.map( function( p ) {
      return "<li><div class='ce-tree-row other'><div><strong>" + u.esc( p.publicPath ) + "</strong><br/><small>" + u.esc( p.pageName ) + " · not in the editor</small></div>" +
        "<div class='ce-tree-meta'><a class='ce-btn' href='/OpenForum/AddOn/ContentEditor/PageConverter?pageName=" + encodeURIComponent( p.pageName ) + "'>Import</a></div></div></li>";
    } ).join( "" ) : "<li><p class='ce-hint'>No other Development pages here.</p></li>" ) + "</ul>";
  }

  function folderRow( node ) {
    var folder = node.path;
    return "<div class='ce-tree-row folder'><span>" + u.esc( folder ) + "</span><span class='ce-tree-meta'>" +
      "<button type='button' class='ce-link-btn' data-new-in='" + u.esc( folder ) + "'>New page here</button>" +
      "<button type='button' class='ce-link-btn' data-others='" + u.esc( folder ) + "'>" + ( others[ folder ] ? "Hide other pages" : "Other Development pages" ) + "</button></span></div>" +
      ( form && form.mode === "new" && form.folder === folder ? newForm( folder ) : "" ) + othersHtml( folder );
  }

  function renderNode( node ) {
    var html = "<ul class='ce-tree'>";
    Object.keys( node.children ).sort().forEach( function( key ) {
      var child = node.children[ key ];
      var page = child.page;
      html += "<li>";
      if( page ) {
        html += "<div class='ce-tree-row" + ( page.archived ? " archived" : "" ) + "'><div><strong>" + u.esc( page.title || child.name ) + "</strong><br/><small>" + u.esc( page.publicPath ) + "</small></div>" +
          "<div class='ce-tree-meta'><span class='ce-tag'>" + u.esc( TYPE_NAMES[ page.templateId ] || page.templateId || "Page" ) + "</span>" + stateOf( page ) +
          "<button class='ce-btn' type='button' data-open-page='" + u.esc( page.pageId ) + "'>Open</button>" +
          ( page.archived ? "<button class='ce-btn' type='button' data-restore='" + u.esc( page.pageId ) + "'>Restore</button>" :
            "<button class='ce-btn' type='button' data-move='" + u.esc( page.pageId ) + "'>Move…</button>" +
            "<button class='ce-btn' type='button' data-archive='" + u.esc( page.pageId ) + "'>Archive</button>" ) + "</div></div>";
        if( form && form.mode === "move" && form.pageId === page.pageId ) html += moveForm( page );
      }
      if( Object.keys( child.children ).length ) html += folderRow( child ) + renderNode( child );
      html += "</li>";
    } );
    return html + "</ul>";
  }

  // PHW-T-003: the site's own pages that are not in the editor yet, each
  // opened with its own markup kept.
  function sitePagesHtml() {
    if( !sitePages.length ) return "";
    return "<h2 class='ce-view-subhead'>Site pages not in the editor yet <small>(" + sitePages.length + ")</small></h2>" +
      "<p class='ce-hint'>Edit opens the page in the editor with its own markup kept as it is.</p><ul class='ce-tree'>" + sitePages.map( function( p ) {
        return "<li><div class='ce-tree-row other'><div><strong>" + u.esc( p.title ) + "</strong><br/><small>" + u.esc( p.publicPath ) + "</small></div>" +
          "<div class='ce-tree-meta'><button class='ce-btn ce-primary' type='button' data-edit-site-page='" + u.esc( p.pageName ) + "'>Edit</button></div></div></li>";
      } ).join( "" ) + "</ul>";
  }

  function render() {
    var shown = pages.filter( function( p ) { return showArchived || !p.archived; } );
    var root = buildTree( shown );
    document.getElementById( "ce-structure-tree" ).innerHTML = folderRow( root ) + ( shown.length ? renderNode( root ) : "<div class='ce-empty'>No pages in the editor yet.</div>" ) + sitePagesHtml();
    var input = document.querySelector( "#ce-structure-tree .ce-tree-form input, #ce-structure-tree .ce-tree-form select" );
    if( input && form && !form.focused ) { input.focus(); form.focused = true; }
  }

  function load() {
    u.readService( "listSitePages", {} )
      .then( function( list ) { sitePages = ( list || [] ).filter( function( p ) { return !p.inEditor; } ); } )
      .catch( function() { sitePages = []; } )
      .then( function() { return u.readService( "listContentPages", {} ); } )
      .then( function( list ) { pages = list || []; render(); } )
      .catch( function( error ) { document.getElementById( "ce-structure-tree" ).innerHTML = "<p class='error'>" + u.esc( error ) + "</p>"; } );
  }

  function find( pageId ) {
    return pages.filter( function( p ) { return p.pageId === pageId; } )[ 0 ];
  }

  function run( request, done ) {
    if( busy ) return;
    busy = true;
    request
      .then( function( reply ) {
        if( reply.result !== "ok" ) throw reply.message;
        u.toast( reply.message + "." );
        form = null;
        if( done ) done( reply.data );
        load();
      } )
      .catch( function( error ) { u.toast( "" + error ); } )
      .then( function() { busy = false; } );
  }

  // A navigation component from the tree: a list of links to every live
  // page (archived pages are left out), nested by folder.
  function navigationContent() {
    var root = buildTree( pages.filter( function( p ) { return !p.archived; } ) );
    function list( node ) {
      var keys = Object.keys( node.children ).sort();
      if( !keys.length ) return "";
      return "<ul>" + keys.map( function( key ) {
        var child = node.children[ key ];
        var label = child.page ? "<a href=\"" + u.esc( child.page.publicPath ) + "\">" + u.esc( child.page.title || key ) + "</a>" : u.esc( key );
        return "<li>" + label + list( child ) + "</li>";
      } ).join( "" ) + "</ul>";
    }
    var text = ContentEditorSchema.createElement( "rich-text", { fields: { body: { format: ContentEditorTemplates.RICH_TEXT_FORMAT, html: list( root ) || "<p></p>" } }, children: [] } );
    return ContentEditorSchema.createElement( "component", { fields: { componentId: "", componentVersion: null, name: "" }, children: [ text ] } );
  }

  function makeNavigation() {
    u.readService( "listLibrary", { kind: "components" } ).then( function( list ) {
      var existing = ( list || [] ).filter( function( c ) { return c.name === "Site navigation" && !c.archived; } )[ 0 ];
      var content = navigationContent();
      run( existing ? ContentEditorClient.saveLibraryEntry( "components", existing.id, existing.version, content, "Made from the site structure" ) :
        ContentEditorClient.createLibraryEntry( "components", "Site navigation", content, "Made from the site structure" ),
        function() { ContentEditorApp.componentsChanged(); u.toast( "The Site navigation component lists the site's pages. Place it in a layout or update it where it is used." ); } );
    } ).catch( function( error ) { u.toast( "" + error ); } );
  }

  function wire() {
    var view = document.getElementById( "ce-view-site-structure" );
    view.addEventListener( "click", function( event ) {
      var target = event.target.closest( "button, input" );
      if( !target ) return;
      var id;
      if( target.id === "ce-structure-archived" ) { showArchived = target.checked; render(); return; }
      if( target.id === "ce-structure-new-root" ) { form = { mode: "new", folder: "/" }; render(); return; }
      if( target.id === "ce-structure-nav" ) { makeNavigation(); return; }
      if( target.hasAttribute( "data-cancel" ) ) { form = null; render(); return; }
      if( ( id = target.getAttribute( "data-open-page" ) ) ) { ContentEditorApp.openPage( id ); return; }
      if( ( id = target.getAttribute( "data-edit-site-page" ) ) ) { ContentEditorApp.editSitePage( id ); return; }
      if( ( id = target.getAttribute( "data-new-in" ) ) ) { form = { mode: "new", folder: id }; render(); return; }
      if( ( id = target.getAttribute( "data-move" ) ) ) {
        if( ContentEditorApp.isOpenWithChanges( id ) ) { u.toast( "Save or undo the changes open in the editor first." ); return; }
        form = { mode: "move", pageId: id }; render(); return;
      }
      if( ( id = target.getAttribute( "data-archive" ) ) ) { run( ContentEditorClient.setContentPageArchived( id, true ) ); return; }
      if( ( id = target.getAttribute( "data-restore" ) ) ) { run( ContentEditorClient.setContentPageArchived( id, false ) ); return; }
      if( ( id = target.getAttribute( "data-others" ) ) ) {
        var folder = id;
        if( others[ folder ] ) { delete others[ folder ]; render(); return; }
        u.readService( "listOtherDevelopmentPages", { folder: folder } )
          .then( function( list ) { others[ folder ] = list || []; }, function( error ) { others[ folder ] = { error: "" + error }; } )
          .then( render );
        return;
      }
      if( target.hasAttribute( "data-do-move" ) && form && form.plan ) {
        if( !form.armed ) { form.armed = true; render(); return; }
        var pageId = form.pageId;
        run( ContentEditorClient.moveContentPage( pageId, form.plan.to ), function() { ContentEditorApp.pageMoved( pageId ); } );
      }
    } );
    view.addEventListener( "submit", function( event ) {
      event.preventDefault();
      var newForm = event.target.closest( "[data-new-form]" );
      if( newForm ) { ContentEditorApp.newPageIn( newForm.getAttribute( "data-new-form" ), newForm.querySelector( "select" ).value ); form = null; render(); return; }
      var move = event.target.closest( "[data-move-form]" );
      if( move ) {
        var path = move.querySelector( "input" ).value.trim();
        form.path = path;
        form.armed = false;
        u.readService( "planContentPageMove", { pageId: move.getAttribute( "data-move-form" ), path: path } )
          .then( function( plan ) { form.plan = plan; }, function( error ) { form.plan = { problems: [ "" + error ], warnings: [], links: [] }; } )
          .then( render );
      }
    } );
  }

  ContentEditorApp.registerView( "site-structure", {
    init: function() { wire(); load(); },
    refresh: load
  } );
} )();

