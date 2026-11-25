/*
* ContentPages
* Server side of saving content editor pages (CON-T-024) with conflict
* detection (CON-T-025). The storage rules live in model-content-store.js,
* and the page model rules in the same model-*.js files the editor runs, so
* the server validates exactly what the browser does.
*
* Each page is a real OpenForum page at /<public path>
* (decided 2026-10-21). Publishing (CON-T-029/030) checks one saved
* revision, renders it into that Development page (staging) and then
* releases it to the live path with the existing Publisher.
*
* Example include script: var ContentPages = js.getObject("/OpenForum/AddOn/ContentEditor","ContentPages.sjs");
*/
var ContentPages = function() {
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
    "model-themes.js", "model-templates.js", "model-migrations.js", "model-content-store.js", "model-publication.js", "model-page-import.js",
    "model-site-library.js", "model-shared-parts.js", "model-collections.js" ];
  var PUBLISHER_PAGE = "/OpenForum/AddOn/Publisher";
  // The site's default template, for pages with no layout of their own.
  // A .link to it is rewritten to the live copy by the release step.
  function pageTemplate() { return siteConfigPage() + "/page.html.template"; }
  // Layout templates (CON-T-047) are written on the site library page.
  // CON-T-030 published through its own builder into these files. Pages
  // now use the default OpenForum builder (CON-T-044), so publishing
  // removes them; deleteAttachment keeps them in the page's history.
  var OLD_PAGE_BUILDER = ADDON_PAGE + "/content-page-builder.js";
  var OLD_FILES = [ "content.html", "content.css" ];

  // The model modules register themselves on window when it exists.
  var window = {};
  for( var m = 0; m < MODULES.length; m++ ) {
    eval( "" + file.getAttachment( ADDON_PAGE, MODULES[ m ] ) );
  }
  var Templates = window.ContentEditorTemplates;
  var Migrations = window.ContentEditorMigrations;
  var Schema = window.ContentEditorSchema;
  var Definitions = window.ContentEditorElementDefinitions;
  var Themes = window.ContentEditorThemes;
  var Store = window.ContentEditorContentStore;
  var Publication = window.ContentEditorPublication;
  var PageImport = window.ContentEditorPageImport;
  var Existing = window.ContentEditorExistingHtml;
  var Shared = window.ContentEditorSharedParts;

  function siteConfig() {
    if( !file.attachmentExists( siteConfigPage(), SITE_CONFIG_FILE ) ) throw "This site has no content editor configuration";
    var config = JSON.parse( "" + file.getAttachment( siteConfigPage(), SITE_CONFIG_FILE ) );
    // CON-T-050: the site library's current style is the site's theme.
    try { config = window.ContentEditorSiteLibrary.applyStyles( config, js.getObject( ADDON_PAGE, "SiteLibrary.sjs" ).listLibrary( "styles" ) ); } catch( e ) { /* no library yet */ }
    var problems = Themes.validateSiteConfig( config );
    if( problems.length ) throw "This site's content editor configuration is invalid: " + problems.join( "; " );
    return config;
  }

  function describe( page ) {
    return { title: Templates.getTitle( page ), templateId: page.template ? page.template.id : null };
  }

  // authorise(pageName) throws if the user may not update that page.
  function storeFor( user, authorise ) {
    var io = {
      pageExists: function( page ) { return file.pageExists( page ) == true; },
      exists: function( page, fileName ) { return file.attachmentExists( page, fileName ) == true; },
      read: function( page, fileName ) { return "" + file.getAttachment( page, fileName ); },
      write: function( page, fileName, text ) {
        if( authorise ) authorise( page );
        openForum.saveAsAttachment( page, fileName, text, user );
      }
    };
    return Store.createStore( io, ADDON_PAGE, describe );
  }

  function parsePage( pageJson ) {
    var page = JSON.parse( "" + pageJson );
    if( !page || !page.template ) throw "Only pages made from a template can be saved";
    page = Migrations.migrate( page ); // an editor opened before an upgrade sends the older schema
    var layout = page.layout;
    if( !layout || Schema.TEMPLATE_MODES.indexOf( layout.templateMode ) === -1 ||
      !( layout.id === null || ( typeof layout.id === "string" && /^[a-z0-9-]{1,60}$/.test( layout.id ) ) ) ) throw "The page's layout choice is not valid";
    if( layout.templateMode === "own" && page.template.id !== "existing-page" ) throw "Only an existing site page can keep its own template";
    var config = siteConfig();
    // An existing page (PHW-T-002) is adopted, never offered as a new page type.
    if( config.templates.indexOf( page.template.id ) === -1 && page.template.id !== "existing-page" ) throw "This site does not offer the '" + page.template.id + "' template";
    var errors = Templates.validatePage( page ).concat( Store.unsafeMarkup( page ) );
    if( errors.length ) throw "The page was not saved: " + errors.join( "; " );
    return { page: page, config: config };
  }

  function now() { return new Date().toISOString(); }

  // CON-T-058: for the contentEditor tool of the add-on MCP service, so an
  // AI agent works with exactly the editor's own rules.
  self.models = function() { return window; };
  self.readSiteSettings = function() {
    return { page: siteConfigPage(), file: SITE_CONFIG_FILE, draftPage: DRAFT_ROOT + LIVE_SITE_CONFIG_PAGE, config: siteConfig() };
  };

  /* Used in service /OpenForum/AddOn/ContentEditor listContentPages */
  self.listContentPages = function() {
    return storeFor( null, null ).list();
  };

  /* Used in service /OpenForum/AddOn/ContentEditor readContentPage */
  self.readContentPage = function( pageId ) {
    return storeFor( null, null ).read( "" + pageId );
  };

  /* Used in service /OpenForum/AddOn/ContentEditor listContentPageRevisions */
  self.listContentPageRevisions = function( pageId ) {
    return storeFor( null, null ).listRevisions( "" + pageId );
  };

  /* Used in service /OpenForum/AddOn/ContentEditor readContentPageRevision */
  self.readContentPageRevision = function( pageId, revisionId ) {
    return storeFor( null, null ).readRevision( "" + pageId, "" + revisionId );
  };

  // Creates the page at /<public path> with revision r0001, and
  // a placeholder page.content so it is a normal OpenForum page until it is
  // published.
  /* Used in service /OpenForum/AddOn/ContentEditor createContentPage */
  // folder (CON-T-051, optional) puts the page in a site folder such as
  // /Services/ instead of the site's default place for its type.
  self.createContentPage = function( user, authorise, pageJson, message, folder ) {
    var parsed = parsePage( pageJson );
    var page = parsed.page;
    var publicPath = folder ? Store.publicPathIn( "" + folder, page.slug ) : Store.publicPathFor( parsed.config, page.template.id, page.slug );
    var draftPath = Store.draftPathFor( publicPath );
    authorise( draftPath );
    authorise( ADDON_PAGE );
    var result = storeFor( user, authorise ).create( page, publicPath, "" + user, now(), message ? "" + message : "Created" );
    openForum.saveAsAttachment( draftPath, "data.json", JSON.stringify( { pageName: draftPath, title: describe( page ).title, author: "" + user }, null, 2 ), user );
    openForum.saveAsAttachment( draftPath, "page.content",
      "This page is being written in the Content Editor. It is published to " + publicPath + " from there.", user );
    try { openForum.buildPage( draftPath ); } catch( e ) { /* the placeholder still works unbuilt */ }
    return result;
  };

  // Saves a new revision if baseRevision is still the draft; otherwise
  // returns { conflict: true, current } and writes nothing.
  /* Used in service /OpenForum/AddOn/ContentEditor saveContentPage */
  self.saveContentPage = function( user, authorise, pageId, baseRevision, pageJson, message ) {
    var parsed = parsePage( pageJson );
    var store = storeFor( user, authorise );
    var index = store.read( "" + pageId ).index;
    authorise( index.draftPath );
    authorise( ADDON_PAGE );
    return store.save( "" + pageId, "" + baseRevision, parsed.page, "" + user, now(), message ? "" + message : "" );
  };

  // Revisions never change, so an older one is brought up to the current
  // schema in memory each time it is read.
  function checkRevision( index, revision ) {
    var config = siteConfig();
    var page = Migrations.migrate( JSON.parse( JSON.stringify( revision.page ) ) );
    var checked = Publication.validate( page, config, { pageExists: function( path ) { return file.pageExists( path ) == true; },
      latestComponentVersion: latestComponentVersions(), layout: libraryLayout } );
    var rendered = null;
    if( checked.errors.length === 0 ) {
      rendered = Publication.render( page, { pageId: index.pageId, revision: revision.revision } );
      checked.errors = checked.errors.concat( Publication.checkOutput( rendered.html, page ) );
      try {
        var templateProblem = page.layout.templateMode === "own" ? null : liveTemplateProblem( templateFor( page ) );
        if( templateProblem ) checked.errors.push( templateProblem );
      } catch( e ) { checked.errors.push( "" + e ); }
      sharedPartWarnings( page ).forEach( function( text ) { checked.warnings.push( text ); } );
      var ownWarning = ownTemplateWarning( index, page );
      if( ownWarning ) {
        checked.warnings.push( ownWarning );
        checked.where = checked.where || {};
        checked.where[ ownWarning ] = { setting: "layout" };
      }
    }
    return { errors: checked.errors, warnings: checked.warnings, where: checked.where || {}, rendered: rendered, page: page };
  }

  // CON-T-046: placed components that are behind the library are a warning.
  function latestComponentVersions() {
    var latest = {};
    try {
      js.getObject( ADDON_PAGE, "SiteLibrary.sjs" ).listLibrary( "components" ).forEach( function( c ) { latest[ c.id ] = c.version; } );
    } catch( e ) { /* no library yet */ }
    return function( id ) { return latest[ id ] || null; };
  }

  function libraryLayout( id ) {
    try {
      return js.getObject( ADDON_PAGE, "SiteLibrary.sjs" ).listLibrary( "layouts" ).filter( function( l ) { return l.id === id; } )[ 0 ] || null;
    } catch( e ) { return null; }
  }

  // The page.html.template file a page's layout publishes with.
  function templateFor( page ) {
    var layout = page.layout || {};
    if( layout.id === null || layout.id === undefined ) return pageTemplate();
    return js.getObject( ADDON_PAGE, "SiteLibrary.sjs" ).layoutTemplatePath( layout.id, layout.version );
  }

  var TEMPLATE_FILES = [ "page.html.template", "page.html.template.link" ];

  // CON-T-057: a page shows the live copy of a shared part once published,
  // so unreleased changes to a part it inserts are worth knowing about.
  function sharedPartWarnings( page ) {
    if( page.template.id !== "existing-page" ) return [];
    var block = page.root.children[ 0 ];
    var markup = block && block.fields && block.fields.html ? block.fields.html.html || "" : "";
    return Shared.collect( [ { publicPath: "", html: markup } ] ).filter( function( part ) {
      var state = sharedPartState( part.path );
      return state.exists && !state.released;
    } ).map( function( part ) {
      return "The shared part " + part.path + " has changes that are not released yet; the published page shows the live copy until " + Shared.split( Shared.DRAFT_ROOT + part.path ).page + " is published";
    } );
  }

  // CON-B-003: publishing an existing page with a layout replaces the
  // template it had before it was in the editor.
  function ownTemplateWarning( index, page ) {
    if( page.template.id !== "existing-page" || page.layout.templateMode === "own" ) return null;
    var had = hasOwnFile( index.draftPath, "imported-page.html.template" ) ||
      ( hasOwnFile( index.draftPath, "page.html.template" ) && index.stagedTemplateMode !== "copy" );
    return had ? "Publishing replaces this page's own template; choose Keep the page's own template to keep it" : null;
  }

  // A template link the editor writes, in its Development or live form.
  function editorLink( text ) {
    var live = text.indexOf( DRAFT_ROOT + "/" ) === 0 ? text.substring( DRAFT_ROOT.length ) : text;
    return live === LIVE_SITE_CONFIG_PAGE + "/page.html.template" || live.indexOf( LIVE_LIBRARY_PAGE + "/layout-" ) === 0;
  }

  // Publishing rewrites a Development template path to the live one, so
  // the live file must be there already (site settings are released by
  // the site owner).
  function liveTemplateProblem( path ) {
    if( path.indexOf( DRAFT_ROOT + "/" ) !== 0 ) return null;
    var live = splitPath( path.substring( DRAFT_ROOT.length ) );
    if( file.attachmentExists( live.page, live.file ) == true ) return null;
    return "The page's template " + live.page + "/" + live.file + " is not live yet; release the site's Development settings first";
  }

  function splitPath( path ) {
    var at = path.lastIndexOf( "/" );
    return { page: path.substring( 0, at ), file: path.substring( at + 1 ) };
  }

  // file.attachmentExists and file.getAttachment follow .link files (a
  // page.html.template.link makes page.html.template "exist"), so these
  // look at the page's own files and read a link's own text.
  function hasOwnFile( draftPath, fileName ) {
    var keys = file.getAttachmentsForPage( draftPath ).keySet().iterator();
    while( keys.hasNext() ) if( ( "" + keys.next() ) === fileName ) return true;
    return false;
  }

  function readOwnFile( draftPath, fileName ) {
    return ( "" + file.getAttachment( draftPath, fileName, false ) ).trim();
  }

  function removeFile( draftPath, fileName ) {
    if( hasOwnFile( draftPath, fileName ) ) openForum.deleteAttachment( draftPath, fileName );
  }

  // Keeps a template file the page had before the editor first replaced it.
  function keepOriginal( draftPath, fileName, index, user ) {
    if( !hasOwnFile( draftPath, fileName ) ) return;
    if( fileName === "page.html.template" && index.stagedTemplateMode === "copy" ) return; // the editor's own copy
    if( fileName === "page.html.template.link" && ( index.stagedTemplateMode === "link" ||
      editorLink( readOwnFile( draftPath, fileName ) ) ) ) return; // the editor's own link
    if( hasOwnFile( draftPath, "imported-" + fileName ) ) return;
    openForum.saveAsAttachment( draftPath, "imported-" + fileName, "" + file.getAttachment( draftPath, fileName, false ), user );
  }

  // Writes the page's template choice: a .link to its layout's template, a
  // copy of it, or neither (the page inherits its template).
  function writeTemplate( draftPath, page, index, user ) {
    var mode = page.layout.templateMode;
    keepOriginal( draftPath, "page.html.template", index, user );
    keepOriginal( draftPath, "page.html.template.link", index, user );
    // CON-B-003: an existing page keeps the template files it had before it
    // was in the editor, put back if an earlier staging replaced them.
    if( mode === "own" ) {
      TEMPLATE_FILES.forEach( function( name ) {
        if( !hasOwnFile( draftPath, "imported-" + name ) ) return;
        var original = "" + file.getAttachment( draftPath, "imported-" + name, false );
        if( !hasOwnFile( draftPath, name ) || ( "" + file.getAttachment( draftPath, name, false ) ) !== original ) openForum.saveAsAttachment( draftPath, name, original, user );
      } );
      return;
    }
    var path = templateFor( page );
    if( mode !== "link" ) removeFile( draftPath, "page.html.template.link" );
    if( mode !== "copy" ) removeFile( draftPath, "page.html.template" );
    if( mode === "link" ) openForum.saveAsAttachment( draftPath, "page.html.template.link", path, user );
    if( mode === "copy" ) {
      var source = splitPath( path );
      openForum.saveAsAttachment( draftPath, "page.html.template", "" + file.getAttachment( source.page, source.file ), user );
    }
  }

  function removeOldPublishing( draftPath, index ) {
    if( !index.stagedRevision ) return;
    OLD_FILES.forEach( function( name ) { removeFile( draftPath, name ); } );
    if( hasOwnFile( draftPath, "page.build.js.link" ) && readOwnFile( draftPath, "page.build.js.link" ) === OLD_PAGE_BUILDER ) {
      openForum.deleteAttachment( draftPath, "page.build.js.link" );
    }
  }

  function summaryOf( index, revision, checked ) {
    return { pageId: index.pageId, revision: revision.revision, publicPath: index.publicPath, draftPath: index.draftPath,
      errors: checked.errors, warnings: checked.warnings, where: checked.where || {},
      publishedRevision: index.publishedRevision || null, previousPublishedRevision: index.previousPublishedRevision || null };
  }

  // CON-T-029: the publication checks for one saved revision (the draft if
  // revisionId is empty). Writes nothing.
  /* Used in service /OpenForum/AddOn/ContentEditor checkContentPagePublication */
  self.checkContentPagePublication = function( pageId, revisionId ) {
    var store = storeFor( null, null );
    var index = store.read( "" + pageId ).index;
    var revision = store.readRevision( "" + pageId, revisionId ? "" + revisionId : index.draftRevision );
    return summaryOf( index, revision, checkRevision( index, revision ) );
  };

  // CON-T-030: publishes one immutable revision. Nothing is written unless
  // every check passes. Staging renders it into the Development page,
  // where it can be looked at; the release step then copies that page to
  // the live path. In practice mode (the default) the release step only
  // reports what it would do.
  // Publishing an older revision is how a page is rolled back; the index
  // keeps the revision that was live before as the rollback reference.
  /* Used in service /OpenForum/AddOn/ContentEditor publishContentPage */
  self.publishContentPage = function( user, authorise, pageId, revisionId, practice ) {
    practice = ( "" + practice ) !== "false";
    var store = storeFor( user, authorise );
    var index = store.read( "" + pageId ).index;
    if( index.archived ) throw "This page is archived; restore it before publishing";
    authorise( index.draftPath );
    authorise( ADDON_PAGE );
    if( !practice ) authorise( index.publicPath );
    var revision = store.readRevision( "" + pageId, revisionId ? "" + revisionId : index.draftRevision );
    var checked = checkRevision( index, revision );
    var summary = summaryOf( index, revision, checked );
    summary.practice = practice;
    summary.published = false;
    // CON-T-031: every attempt goes in the page's publication log.
    function logged( result ) {
      summary.logEntry = store.logPublication( "" + pageId, { revision: revision.revision, practice: practice, result: result,
        errors: summary.errors, warnings: summary.warnings, notes: summary.notes }, "" + user, now() );
      return summary;
    }
    if( checked.errors.length ) return logged( "blocked" );

    var page = checked.page, draftPath = index.draftPath;
    removeOldPublishing( draftPath, index );
    writeTemplate( draftPath, page, index, user );
    openForum.saveAsAttachment( draftPath, "publish-config.json", JSON.stringify( { excludedFiles: Store.unpublishedFiles( index ) }, null, 2 ), user );
    var title = Publication.escapeField( Templates.getTitle( page ) );
    openForum.saveAsAttachment( draftPath, "data.json", JSON.stringify( { pageName: draftPath, title: title, shortTitle: title,
      author: Publication.escapeField( ( page.metadata && page.metadata.author ) || "" + user ),
      description: Publication.escapeField( ( page.metadata && page.metadata.summary ) || "" ) }, null, 2 ), user );
    openForum.saveAsAttachment( draftPath, "page.content", checked.rendered.pageContent, user );
    openForum.refreshPage( draftPath );
    summary.staged = true;
    store.recordStaging( "" + pageId, revision.revision, "" + user, now(), page.layout.templateMode );

    var Publisher = js.getObject( PUBLISHER_PAGE, "Publisher.sjs" );
    var released = Publisher.publish( draftPath, practice, false, null, user );
    var notes = "" + released.notes;
    summary.notes = notes;
    // Publisher reports its failures in the notes rather than throwing.
    if( notes.indexOf( "Error: " ) !== -1 || notes.indexOf( "(ERROR " ) !== -1 ) {
      summary.errors = [ practice ? "The release step's practice run reported an error; see its notes" :
        "The release step reported an error, so the live page may be only partly updated. Publish " +
        ( index.publishedRevision || "the previous revision" ) + " again to roll back. See the release notes." ];
      return logged( "failed" );
    }
    if( !practice ) {
      var published = store.recordPublication( "" + pageId, revision.revision, "" + user, now() );
      summary.published = true;
      summary.publishedRevision = published.publishedRevision;
      summary.previousPublishedRevision = published.previousPublishedRevision;
    }
    return logged( practice ? "practice-passed" : "published" );
  };

  // PageConverter: an existing Development page converted to a template.
  function convertExisting( sourcePage, templateId ) {
    sourcePage = "" + sourcePage;
    if( sourcePage.indexOf( Store.DRAFT_ROOT + "/" ) !== 0 ) throw "Only pages under " + Store.DRAFT_ROOT + "/ can be imported; make a Development copy first";
    var publicPath = sourcePage.substring( Store.DRAFT_ROOT.length );
    if( Store.draftPathFor( publicPath ) !== sourcePage ) throw "Not a valid page path: " + sourcePage;
    if( file.pageExists( sourcePage ) != true ) throw "There is no page at " + sourcePage;
    // The editor's own pages and the platform are not site pages (PHW-R-001).
    if( sourcePage.indexOf( Store.DRAFT_ROOT + "/OpenForum/" ) === 0 ) throw "Pages under /OpenForum are not site pages";
    var config = siteConfig();
    templateId = "" + templateId;
    if( config.templates.indexOf( templateId ) === -1 && templateId !== "existing-page" ) throw "This site does not offer the '" + templateId + "' template";
    var data = {};
    try { data = JSON.parse( "" + file.getAttachment( sourcePage, "data.json" ) ); } catch( e ) { data = {}; }
    if( templateId === "existing-page" ) return adoptExisting( sourcePage, publicPath, data, config );
    var html = file.attachmentExists( sourcePage, "page.html.fragment" ) == true ? "" + file.getAttachment( sourcePage, "page.html.fragment" ) : "";
    var converted = PageImport.convert( { html: html, title: data.title ? "" + data.title : "", pageName: sourcePage }, templateId );
    var page = Templates.createPage( templateId, config, converted.content );
    page.slug = converted.slug;
    var errors = Templates.validatePage( page ).concat( Store.unsafeMarkup( page ) );
    if( errors.length ) throw "The converted page is not valid: " + errors.join( "; " );
    return { page: page, report: converted.report, sourcePage: sourcePage, publicPath: publicPath,
      alreadyImported: file.attachmentExists( sourcePage, Store.INDEX_FILE ) == true,
      livePageExists: file.pageExists( publicPath ) == true };
  }

  // PHW-T-002/003: an existing page with its own markup kept intact: its
  // page.content (with its &insert: parts as directives) cleaned for
  // safety, its original external scripts kept as protected page scripts.
  function adoptExisting( sourcePage, publicPath, data, config ) {
    var raw = file.attachmentExists( sourcePage, "page.content" ) == true ? "" + file.getAttachment( sourcePage, "page.content" ) : "";
    var cleaned = Existing.clean( raw );
    var title = ( data.title ? "" + data.title : "" ).replace( /\s+/g, " " ).trim() || PageImport.slugFor( sourcePage );
    var page = Templates.createPage( "existing-page", config, { title: title.slice( 0, 200 ), html: cleaned.html, scripts: cleaned.scripts } );
    page.slug = PageImport.slugFor( sourcePage );
    if( data.description ) page.metadata.summary = ( "" + data.description ).replace( /\s+/g, " " ).trim().slice( 0, 320 );
    var errors = Templates.validatePage( page ).concat( Store.unsafeMarkup( page ) );
    if( errors.length ) throw "The page could not be adopted: " + errors.join( "; " );
    return { page: page, report: cleaned.report, scripts: cleaned.scripts, unchanged: cleaned.html === raw.replace( /<script\b[^>]*><\/script>\s*/gi, "" ),
      sourcePage: sourcePage, publicPath: publicPath,
      alreadyImported: file.attachmentExists( sourcePage, Store.INDEX_FILE ) == true,
      livePageExists: file.pageExists( publicPath ) == true };
  }

  // What importing would make, without writing anything.
  /* Used in service /OpenForum/AddOn/ContentEditor previewContentPageImport */
  self.previewContentPageImport = function( sourcePage, templateId ) {
    return convertExisting( sourcePage, templateId );
  };

  // Imports an existing Development page as revision r0001 of a content
  // page at the same path. Nothing the page shows changes until it is
  // published from the editor; its own page.content and data.json are kept
  // as imported-page.content and imported-data.json (never published).
  /* Used in service /OpenForum/AddOn/ContentEditor importContentPage */
  self.importContentPage = function( user, authorise, sourcePage, templateId ) {
    var converted = convertExisting( sourcePage, templateId );
    if( converted.alreadyImported ) throw converted.sourcePage + " is already in the Content Editor";
    authorise( converted.sourcePage );
    authorise( ADDON_PAGE );
    var originals = [ [ "page.content", Store.IMPORTED_FILES[ 0 ] ], [ "data.json", Store.IMPORTED_FILES[ 1 ] ] ];
    for( var i = 0; i < originals.length; i++ ) {
      if( file.attachmentExists( converted.sourcePage, originals[ i ][ 0 ] ) == true && file.attachmentExists( converted.sourcePage, originals[ i ][ 1 ] ) != true ) {
        openForum.saveAsAttachment( converted.sourcePage, originals[ i ][ 1 ], "" + file.getAttachment( converted.sourcePage, originals[ i ][ 0 ] ), user );
      }
    }
    var result = storeFor( user, authorise ).adopt( converted.page, converted.publicPath, "" + user, now(), "Imported from the existing page" );
    result.report = converted.report;
    return result;
  };

  /* Used in service /OpenForum/AddOn/ContentEditor setContentPageArchived */
  // --- Site structure (CON-T-051) ---------------------------------------------

  function hasSubPages( pageName ) {
    var keys = file.getAttachmentsForPage( pageName ).keySet().iterator();
    while( keys.hasNext() ) {
      var key = "" + keys.next();
      if( key.charAt( 0 ) === "+" && key !== "+history" ) return true;
    }
    return false;
  }

  // The links that point at path (or below it) from every editor page's
  // draft and from the library's components and layouts.
  function linksTo( path ) {
    var Library = window.ContentEditorSiteLibrary;
    var found = [];
    storeFor( null, null ).list().forEach( function( entry ) {
      if( entry.publicPath === path ) return;
      var page = storeFor( null, null ).read( entry.pageId ).revision.page;
      var n = Library.linksToPath( page.root, path ) +
        ( ( page.metadata && page.metadata.relatedPages ) || [] ).filter( function( p ) { return p === path || p.indexOf( path + "/" ) === 0; } ).length;
      if( n ) found.push( { kind: "page", id: entry.pageId, name: entry.title || entry.publicPath, path: entry.publicPath, links: n } );
    } );
    try {
      var library = js.getObject( ADDON_PAGE, "SiteLibrary.sjs" );
      [ "components", "layouts" ].forEach( function( kind ) {
        library.listLibrary( kind ).forEach( function( entry ) {
          var n = entry.content ? Library.linksToPath( entry.content, path ) : 0;
          if( n ) found.push( { kind: kind === "components" ? "component" : "layout", id: entry.id, name: entry.name, links: n } );
        } );
      } );
    } catch( e ) { /* no library */ }
    return found;
  }

  // What moving a page would do, without writing anything.
  /* Used in service /OpenForum/AddOn/ContentEditor planContentPageMove */
  self.planContentPageMove = function( pageId, newPublicPath ) {
    var index = storeFor( null, null ).read( "" + pageId ).index;
    var plan = { pageId: index.pageId, from: index.publicPath, to: "" + newPublicPath, fromDraft: index.draftPath, problems: [], warnings: [], links: [] };
    try { plan.toDraft = Store.draftPathFor( plan.to ); } catch( e ) { plan.problems.push( "" + e ); return plan; }
    if( plan.to === plan.from ) plan.problems.push( "The page is already at " + plan.to );
    if( file.pageExists( plan.toDraft ) == true ) plan.problems.push( "There is already a Development page at " + plan.toDraft );
    // CON-T-052: refused like create, so publishing can never replace an unrelated live page.
    if( file.pageExists( plan.to ) == true ) plan.problems.push( "There is already a live page at " + plan.to + "; choose another address" );
    storeFor( null, null ).list().forEach( function( entry ) {
      if( entry.pageId !== index.pageId && entry.publicPath === plan.to ) plan.problems.push( "Another content page already uses " + plan.to );
    } );
    if( hasSubPages( plan.fromDraft ) ) plan.problems.push( "The page has pages below it; move those first" );
    if( index.archived ) plan.problems.push( "Restore the page before moving it" );
    if( index.publishedRevision ) plan.warnings.push( "The live page stays at " + plan.from + " until you publish from the new place and remove the old live page" );
    plan.links = linksTo( plan.from );
    if( plan.links.length ) plan.warnings.push( plan.links.length + " page" + ( plan.links.length > 1 ? "s and library items link" : " or library item links" ) + " to " + plan.from + "; update them after the move" );
    return plan;
  };

  // Moves a page's Development copy: the whole page folder is copied to the
  // new place, the index and registry follow it, a revision records the new
  // slug, and the old Development page is deleted (OpenForum keeps deleted
  // pages in /OpenForum/DeletedPages). Live pages are never touched.
  /* Used in service /OpenForum/AddOn/ContentEditor moveContentPage */
  self.moveContentPage = function( user, authorise, pageId, newPublicPath ) {
    var plan = self.planContentPageMove( pageId, newPublicPath );
    if( plan.problems.length ) throw "Not moved: " + plan.problems.join( "; " );
    authorise( plan.fromDraft );
    authorise( plan.toDraft );
    authorise( ADDON_PAGE );
    wiki.copyPage( plan.fromDraft.substring( 1 ), plan.toDraft.substring( 1 ), null );
    if( file.attachmentExists( plan.toDraft, Store.INDEX_FILE ) != true ) throw "Not moved: the copy to " + plan.toDraft + " did not complete";
    var store = storeFor( user, authorise );
    store.relocate( plan.pageId, plan.to );
    var data = {};
    try { data = JSON.parse( "" + file.getAttachment( plan.toDraft, "data.json" ) ); } catch( e ) {}
    data.pageName = plan.toDraft;
    openForum.saveAsAttachment( plan.toDraft, "data.json", JSON.stringify( data, null, 2 ), user );
    // The slug follows the new path in a new revision.
    var read = store.read( plan.pageId );
    var page = Migrations.migrate( read.revision.page );
    page.slug = plan.to.split( "/" ).pop();
    var saved = store.save( plan.pageId, read.index.draftRevision, page, "" + user, now(), "Moved from " + plan.from + " to " + plan.to );
    wiki.deletePage( plan.fromDraft.substring( 1 ) );
    try { openForum.buildPage( plan.toDraft ); } catch( e ) { /* rebuilt on next publish */ }
    plan.index = saved.index;
    plan.revision = saved.revision;
    return plan;
  };

  // Development pages directly below a folder that are not in the editor.
  /* Used in service /OpenForum/AddOn/ContentEditor listOtherDevelopmentPages */
  self.listOtherDevelopmentPages = function( folder ) {
    folder = "" + folder;
    if( !/^\/([A-Za-z0-9_-]+\/)*$/.test( folder ) ) throw "A folder is a site path starting and ending with /";
    var parent = Store.DRAFT_ROOT + folder.replace( /\/$/, "" );
    if( file.pageExists( parent ) != true ) return [];
    var known = {};
    storeFor( null, null ).list().forEach( function( entry ) { known[ entry.draftPath ] = true; } );
    var pages = [];
    var keys = file.getAttachmentsForPage( parent ).keySet().iterator();
    while( keys.hasNext() ) {
      var key = "" + keys.next();
      if( key.charAt( 0 ) !== "+" || key === "+history" ) continue;
      var pageName = parent + "/" + key.substring( 1 );
      if( !known[ pageName ] ) pages.push( { pageName: pageName, publicPath: folder + key.substring( 1 ) } );
    }
    return pages.sort( function( a, b ) { return a.pageName < b.pageName ? -1 : 1; } );
  };

  // PHW-T-003: the site's own pages, from their /Development copies: every
  // page below /Development except the platform (/OpenForum),
  // the site's support folders and history, a few levels deep, with
  // whether each is already in the editor.
  var SUPPORT_FOLDERS = { OpenForum: 1, common: 1, css: 1, js: 1, images: 1, Images: 1, Uploads: 1, fonts: 1, history: 1 };
  // --- Shared parts (CON-T-057) ---------------------------------------------
  // The fragment files the site's pages pull in with &insert:. The editor
  // writes only their Development copies; the site owner releases them.

  function readFile( path ) {
    var at = Shared.split( path );
    return file.attachmentExists( at.page, at.file ) == true ? "" + file.getAttachment( at.page, at.file ) : null;
  }

  function sharedPartState( live ) {
    var text = readFile( Shared.DRAFT_ROOT + live ), liveText = readFile( live );
    return { path: live, draftPath: Shared.DRAFT_ROOT + live, exists: text !== null, live: liveText !== null,
      released: text !== null && liveText !== null && text === liveText, version: Shared.version( text || "" ), text: text || "" };
  }

  function partSummary( live, usedBy ) {
    var state = sharedPartState( live );
    delete state.text;
    state.usedBy = usedBy || [];
    return state;
  }

  /* Used in service /OpenForum/AddOn/ContentEditor listSharedParts */
  self.listSharedParts = function() {
    var pages = self.listSitePages().map( function( p ) {
      return { publicPath: p.publicPath, html: readFile( p.pageName + "/page.content" ) || "" };
    } );
    return Shared.collect( pages ).map( function( part ) { return partSummary( part.path, part.usedBy ); } );
  };

  /* Used in service /OpenForum/AddOn/ContentEditor readSharedPart */
  self.readSharedPart = function( path ) {
    var state = sharedPartState( Shared.check( "" + path ) );
    var cleaned = Existing.clean( state.text );
    state.html = state.text;
    state.cleaned = cleaned.html;
    state.unsafe = cleaned.report;
    delete state.text;
    return state;
  };

  // Saves a part's Development copy, cleaned like an existing page's markup.
  // baseVersion is the version the editor started from; a newer save by
  // someone else is reported as a conflict and nothing is written.
  /* Used in service /OpenForum/AddOn/ContentEditor saveSharedPart */
  self.saveSharedPart = function( user, authorise, path, html, baseVersion ) {
    var live = Shared.check( "" + path );
    var state = sharedPartState( live );
    if( state.version !== "" + baseVersion ) {
      delete state.text;
      return { conflict: true, current: state };
    }
    var target = Shared.split( Shared.DRAFT_ROOT + live );
    if( file.pageExists( target.page ) != true ) throw "There is no Development page " + target.page + "; make a Development copy of " + Shared.split( live ).page + " first";
    authorise( target.page );
    var cleaned = Existing.clean( "" + html );
    openForum.saveAsAttachment( target.page, target.file, cleaned.html, user );
    return { saved: true, part: partSummary( live ), report: cleaned.report };
  };

  /* Used in service /OpenForum/AddOn/ContentEditor listSitePages */
  self.listSitePages = function() {
    var known = {};
    storeFor( null, null ).list().forEach( function( entry ) { known[ entry.draftPath ] = entry; } );
    var pages = [];
    ( function walk( parent, depth ) {
      var keys = file.getAttachmentsForPage( parent ).keySet().iterator();
      while( keys.hasNext() ) {
        var key = "" + keys.next();
        if( key.charAt( 0 ) !== "+" ) continue;
        var name = key.substring( 1 );
        if( depth === 0 && SUPPORT_FOLDERS[ name ] ) continue;
        if( name === "history" ) continue;
        var pageName = parent + "/" + name;
        if( file.attachmentExists( pageName, "page.content" ) != true ) continue;
        var data = {};
        try { data = JSON.parse( "" + file.getAttachment( pageName, "data.json" ) ); } catch( e ) { data = {}; }
        var entry = known[ pageName ];
        pages.push( { pageName: pageName, publicPath: pageName.substring( Store.DRAFT_ROOT.length ),
          title: ( data.title ? "" + data.title : name ).replace( /\s+/g, " " ).trim(),
          inEditor: !!entry, pageId: entry ? entry.pageId : null } );
        if( depth < 3 ) walk( pageName, depth + 1 );
      }
    } )( Store.DRAFT_ROOT, 0 );
    return pages.sort( function( a, b ) { return a.publicPath < b.publicPath ? -1 : 1; } );
  };

  self.setContentPageArchived = function( user, authorise, pageId, archived ) {
    var store = storeFor( user, authorise );
    var index = store.read( "" + pageId ).index;
    authorise( index.draftPath );
    authorise( ADDON_PAGE );
    return store.setArchived( "" + pageId, ( "" + archived ) === "true", "" + user, now() );
  };
};

