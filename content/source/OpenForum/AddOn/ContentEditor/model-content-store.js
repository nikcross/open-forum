/*
* ContentEditorContentStore
* Saved pages and immutable revisions (CON-T-024) with expected-revision
* conflict detection on save (CON-T-025).
*
* Decided 2026-10-21: every content page is a real OpenForum page at
* /<public path>, published later by the existing Publisher
* (CON-T-030). Its files:
*   content-editor.json            - index: draft/staged/published revision
*                                    ids, revision and publication lists,
*                                    archived flag
*   content-revision-r0001.json    - one immutable file per save
* and the editor keeps a registry of its pages (content-pages.json) on its
* own addon page.
*
* Pure logic over an io object, so it runs unchanged in node tests (an
* in-memory io) and on the server (ContentPages.sjs gives it OpenForum's
* file API):
*   io.pageExists(page), io.exists(page, file), io.read(page, file) -> text,
*   io.write(page, file, text)
*/
var ContentEditorContentStore = (function() {

  // Split so the release step, which rewrites "/" to "/",
  // leaves it alone: drafts live under /Development on every site.
  var DRAFT_ROOT = "/Develop" + "ment";
  var REGISTRY_FILE = "content-pages.json";
  var INDEX_FILE = "content-editor.json";
  var SLUG_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;

  function revisionId( n ) {
    return "r" + ( n < 10000 ? ( "000" + n ).slice( -4 ) : String( n ) );
  }

  function revisionFile( id ) {
    return "content-revision-" + id + ".json";
  }

  // The page's address on the live site, from the trusted site config.
  // A folder for new pages and moves (CON-T-051): "/" or "/A/B/".
  var FOLDER_PATTERN = /^\/([A-Za-z0-9_-]+\/)*$/;

  function publicPathIn( folder, slug ) {
    if( !FOLDER_PATTERN.test( folder || "" ) ) throw "A folder is a site path starting and ending with /";
    if( !SLUG_PATTERN.test( slug || "" ) ) throw "The URL slug may only use letters, digits, hyphens and underscores";
    return folder + slug;
  }

  function publicPathFor( siteConfig, templateId, slug ) {
    if( !SLUG_PATTERN.test( slug || "" ) ) throw "The URL slug may only use letters, digits, hyphens and underscores";
    var base = templateId === "blog-article" ? siteConfig.publishing.articlePath : siteConfig.publishing.pagePath;
    return base + slug;
  }

  function draftPathFor( publicPath ) {
    if( typeof publicPath !== "string" || !/^\/[A-Za-z0-9_\/-]+$/.test( publicPath ) || publicPath.indexOf( "//" ) !== -1 ) {
      throw "Not a valid page path: " + publicPath;
    }
    if( publicPath === DRAFT_ROOT || publicPath.indexOf( DRAFT_ROOT + "/" ) === 0 ) throw "A page path cannot be inside " + DRAFT_ROOT;
    return DRAFT_ROOT + publicPath;
  }

  var UNSAFE_HTML = [
    { pattern: /<\s*(script|iframe|object|embed|style|link|meta|form|base)\b/i, reason: "a disallowed tag" },
    { pattern: /\son[a-z]+\s*=/i, reason: "an event handler attribute" },
    { pattern: /javascript\s*:/i, reason: "a javascript: address" }
  ];
  var SAFE_LINK = /^(https?:\/\/|mailto:|\/|#|$)/i;
  // PHW-T-002: existing page markup keeps the site's forms and links, so it
  // has its own rules; its protected scripts must be safe addresses.
  var UNSAFE_EXISTING_HTML = [
    { pattern: /<\s*(script|iframe|object|embed|style|base|meta|link)\b/i, reason: "a disallowed tag" },
    { pattern: /\son[a-z]+\s*=/i, reason: "an event handler attribute" },
    { pattern: /(javascript|vbscript)\s*:/i, reason: "a script address" }
  ];
  var SAFE_SCRIPT_SRC = /^(https:\/\/[^\s"'<>]+|\/[A-Za-z0-9_\-\/.]+(\?[^\s"'<>]*)?)$/;

  // Defence in depth on the server: the editor cleans rich text before it
  // saves, but a request could be made without the editor.
  function unsafeMarkup( page ) {
    var problems = [];
    ( function walk( element ) {
      var fields = element.fields || {};
      for( var name in fields ) {
        var value = fields[ name ];
        var html = value && typeof value === "object" && typeof value.html === "string" ? value.html : null;
        if( html !== null ) {
          ( element.type === "html" ? UNSAFE_EXISTING_HTML : UNSAFE_HTML ).forEach( function( rule ) {
            if( rule.pattern.test( html ) ) problems.push( "Element " + element.id + " " + name + " contains " + rule.reason );
          } );
        }
        if( element.type === "html" && name === "scripts" ) {
          if( !Array.isArray( value ) || value.some( function( src ) { return typeof src !== "string" || !SAFE_SCRIPT_SRC.test( src ) || /(javascript|vbscript)\s*:/i.test( src ); } ) ) {
            problems.push( "Element " + element.id + " has a page script that is not a site path or https address" );
          }
        }
        if( ( name === "href" || name === "mediaUrl" ) && typeof value === "string" && !SAFE_LINK.test( value ) && !( name === "mediaUrl" && /^data:image\//i.test( value ) ) ) {
          problems.push( "Element " + element.id + " " + name + " is not a site path or http(s) address" );
        }
      }
      var groups = element.slots ? Object.keys( element.slots ).map( function( k ) { return element.slots[ k ]; } ) : [ element.children || [] ];
      groups.forEach( function( items ) { ( items || [] ).forEach( walk ); } );
    } )( page.root || {} );
    return problems;
  }

  // describe(page) -> { title, templateId } for the index and registry.
  function createStore( io, registryPage, describe ) {

    function readJson( page, file, fallback ) {
      if( !io.exists( page, file ) ) return fallback;
      return JSON.parse( io.read( page, file ) );
    }

    function writeJson( page, file, value ) {
      io.write( page, file, JSON.stringify( value, null, 2 ) );
    }

    function registry() { return readJson( registryPage, REGISTRY_FILE, [] ); }

    function findEntry( pageId ) {
      var entries = registry();
      for( var i = 0; i < entries.length; i++ ) if( entries[ i ].pageId === pageId ) return entries[ i ];
      throw "No content page with id " + pageId;
    }

    function updateRegistry( pageId, fields ) {
      var entries = registry();
      entries.forEach( function( entry ) {
        if( entry.pageId !== pageId ) return;
        for( var key in fields ) entry[ key ] = fields[ key ];
      } );
      writeJson( registryPage, REGISTRY_FILE, entries );
    }

    function writeRevision( draftPath, id, n, page, actor, now, baseRevision, message ) {
      var file = revisionFile( id );
      if( io.exists( draftPath, file ) ) throw "Revision " + id + " already exists and revisions never change";
      writeJson( draftPath, file, { revision: id, n: n, savedAt: now, actor: actor, baseRevision: baseRevision, message: message || "", page: page } );
      return { id: id, n: n, savedAt: now, actor: actor, baseRevision: baseRevision, message: message || "" };
    }

    function create( page, publicPath, actor, now, message ) {
      checkRegistry( page, publicPath );
      if( io.pageExists( draftPathFor( publicPath ) ) || io.pageExists( publicPath ) ) throw "There is already a page at " + publicPath;
      return register( page, publicPath, actor, now, message || "Created" );
    }

    // Takes over an existing page (the PageConverter's import): the page
    // may exist already, but not as a content page.
    function adopt( page, publicPath, actor, now, message ) {
      checkRegistry( page, publicPath );
      if( io.exists( draftPathFor( publicPath ), INDEX_FILE ) ) throw publicPath + " is already a content page";
      return register( page, publicPath, actor, now, message || "Imported" );
    }

    function checkRegistry( page, publicPath ) {
      registry().forEach( function( entry ) {
        if( entry.publicPath === publicPath ) throw "Another content page already uses " + publicPath;
        if( entry.pageId === page.pageId ) throw "This page has already been saved";
      } );
    }

    function register( page, publicPath, actor, now, message ) {
      var draftPath = draftPathFor( publicPath );
      var entries = registry();
      var info = describe( page );
      var first = writeRevision( draftPath, revisionId( 1 ), 1, page, actor, now, null, message );
      var index = {
        pageId: page.pageId, publicPath: publicPath, draftPath: draftPath,
        templateId: info.templateId, title: info.title,
        draftRevision: first.id, publishedRevision: null, archived: false,
        revisions: [ first ]
      };
      writeJson( draftPath, INDEX_FILE, index );
      entries.push( { pageId: page.pageId, publicPath: publicPath, draftPath: draftPath, title: info.title, templateId: info.templateId,
        draftRevision: first.id, updatedAt: now, updatedBy: actor, archived: false } );
      writeJson( registryPage, REGISTRY_FILE, entries );
      return { index: index, revision: first };
    }

    function readIndex( pageId ) {
      var entry = findEntry( pageId );
      var index = readJson( entry.draftPath, INDEX_FILE, null );
      if( !index ) throw "The saved files for " + entry.publicPath + " are missing";
      return index;
    }

    function read( pageId ) {
      var index = readIndex( pageId );
      return { index: index, revision: readRevision( pageId, index.draftRevision, index ) };
    }

    function readRevision( pageId, id, knownIndex ) {
      var index = knownIndex || readIndex( pageId );
      if( !/^r\d{4,}$/.test( id || "" ) ) throw "Not a revision id: " + id;
      var data = readJson( index.draftPath, revisionFile( id ), null );
      if( !data ) throw "No revision " + id + " for " + index.publicPath;
      return data;
    }

    // Saves a new revision only if the draft is still the one the editor
    // started from. Otherwise nothing is written and the reply says who
    // saved what, so the editor can offer to reload or overwrite - never a
    // silent last-writer-wins (section 14.4, FR-UX-005).
    function save( pageId, baseRevision, page, actor, now, message ) {
      if( page.pageId !== pageId ) throw "The page being saved is not " + pageId;
      var index = readIndex( pageId );
      if( index.archived ) throw "This page is archived; restore it before saving";
      if( index.draftRevision !== baseRevision ) {
        var current = index.revisions[ index.revisions.length - 1 ];
        return { conflict: true, current: current, index: index };
      }
      var n = index.revisions.length ? index.revisions[ index.revisions.length - 1 ].n + 1 : 1;
      var info = describe( page );
      var saved = writeRevision( index.draftPath, revisionId( n ), n, page, actor, now, baseRevision, message );
      index.revisions.push( saved );
      index.draftRevision = saved.id;
      index.title = info.title;
      index.templateId = info.templateId;
      writeJson( index.draftPath, INDEX_FILE, index );
      updateRegistry( pageId, { title: info.title, templateId: info.templateId, draftRevision: saved.id, updatedAt: now, updatedBy: actor } );
      return { conflict: false, index: index, revision: saved };
    }

    function setArchived( pageId, archived, actor, now ) {
      var index = readIndex( pageId );
      index.archived = !!archived;
      writeJson( index.draftPath, INDEX_FILE, index );
      updateRegistry( pageId, { archived: !!archived, updatedAt: now, updatedBy: actor } );
      return index;
    }

    // Staging writes the rendered page to the draft page (CON-T-030); the
    // index remembers which revision that render came from.
    // templateMode records how the staged page got its template, so the
    // next publish knows a page.html.template there is its own copy.
    function recordStaging( pageId, revision, actor, now, templateMode ) {
      var index = readIndex( pageId );
      readRevision( pageId, revision, index );
      index.stagedRevision = revision;
      index.stagedAt = now;
      index.stagedBy = actor;
      index.stagedTemplateMode = templateMode || null;
      writeJson( index.draftPath, INDEX_FILE, index );
      return index;
    }

    // Called only after the release step reported success. The revision
    // that was live before is kept as the rollback reference, and every
    // publication is logged.
    function recordPublication( pageId, revision, actor, now ) {
      var index = readIndex( pageId );
      readRevision( pageId, revision, index );
      var previous = index.publishedRevision || null;
      index.previousPublishedRevision = previous;
      index.publishedRevision = revision;
      index.publishedAt = now;
      index.publishedBy = actor;
      index.publications = ( index.publications || [] ).concat( [ { revision: revision, publishedAt: now, actor: actor, previousRevision: previous } ] );
      writeJson( index.draftPath, INDEX_FILE, index );
      updateRegistry( pageId, { publishedRevision: revision, publishedAt: now } );
      return index;
    }

    // CON-T-031 (FR-PUB-005): every publish attempt is logged - practice runs,
    // ones the checks stopped, failed releases and live publishes - with its
    // revision, target, actor, time, result and errors. The newest
    // MAX_PUBLICATION_LOG are kept, in the index, which is never published.
    var PUBLICATION_RESULTS = [ "published", "practice-passed", "blocked", "failed" ];
    var MAX_PUBLICATION_LOG = 100;
    function logPublication( pageId, attempt, actor, now ) {
      if( PUBLICATION_RESULTS.indexOf( attempt.result ) === -1 ) throw "Not a publication result: " + attempt.result;
      var index = readIndex( pageId );
      var entry = { at: now, actor: actor, revision: attempt.revision, target: index.publicPath, practice: !!attempt.practice,
        result: attempt.result, errors: ( attempt.errors || [] ).slice( 0, 20 ).map( String ), warnings: ( attempt.warnings || [] ).length,
        notes: attempt.notes ? String( attempt.notes ).slice( 0, 2000 ) : "" };
      index.publicationLog = ( index.publicationLog || [] ).concat( [ entry ] ).slice( -MAX_PUBLICATION_LOG );
      writeJson( index.draftPath, INDEX_FILE, index );
      return entry;
    }

    // CON-T-051: after the page's files have been copied to the draft page
    // for newPublicPath, points the index and registry there. The caller
    // removes the old draft page once this has succeeded.
    function relocate( pageId, newPublicPath ) {
      var entry = findEntry( pageId );
      var newDraftPath = draftPathFor( newPublicPath );
      if( newPublicPath === entry.publicPath ) throw "The page is already at " + newPublicPath;
      registry().forEach( function( other ) {
        if( other.pageId !== pageId && other.publicPath === newPublicPath ) throw "Another content page already uses " + newPublicPath;
      } );
      var index = readJson( newDraftPath, INDEX_FILE, null );
      if( !index || index.pageId !== pageId ) throw "The page's files are not at " + newDraftPath + " yet";
      index.movedFrom = ( index.movedFrom || [] ).concat( [ entry.publicPath ] );
      index.publicPath = newPublicPath;
      index.draftPath = newDraftPath;
      writeJson( newDraftPath, INDEX_FILE, index );
      updateRegistry( pageId, { publicPath: newPublicPath, draftPath: newDraftPath } );
      return index;
    }

    return {
      list: registry,
      relocate: relocate,
      create: create,
      adopt: adopt,
      read: read,
      readRevision: function( pageId, id ) { return readRevision( pageId, id ); },
      listRevisions: function( pageId ) { return readIndex( pageId ).revisions; },
      save: save,
      setArchived: setArchived,
      recordStaging: recordStaging,
      recordPublication: recordPublication,
      logPublication: logPublication
    };
  }

  // Copies of an imported page's own files, kept on the page (PageConverter).
  // An imported page's own originals. page.html.template and its .link are
  // kept the first time publishing would replace them (CON-T-044).
  var IMPORTED_FILES = [ "imported-page.content", "imported-data.json", "imported-page.html.template", "imported-page.html.template.link" ];

  // Files on a draft page that stay in Development: the editor's index and
  // revisions (unpublished drafts must not become public), the originals of
  // an imported page and the release step's own deletion script.
  function unpublishedFiles( index ) {
    return [ INDEX_FILE, "process-deletions.sjs" ].concat( IMPORTED_FILES, ( index.revisions || [] ).map( function( r ) { return revisionFile( r.id ); } ) );
  }

  var api = {
    publicPathIn: publicPathIn,
    DRAFT_ROOT: DRAFT_ROOT,
    REGISTRY_FILE: REGISTRY_FILE,
    INDEX_FILE: INDEX_FILE,
    IMPORTED_FILES: IMPORTED_FILES,
    revisionId: revisionId,
    revisionFile: revisionFile,
    publicPathFor: publicPathFor,
    draftPathFor: draftPathFor,
    unsafeMarkup: unsafeMarkup,
    unpublishedFiles: unpublishedFiles,
    createStore: createStore
  };

  if( typeof module !== "undefined" && module.exports ) module.exports = api;
  if( typeof window !== "undefined" ) window.ContentEditorContentStore = api;
  return api;
})();

