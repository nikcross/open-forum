/*
* ContentEditorSharedParts
* A site's shared parts (CON-T-057): the fragment files its existing pages
* pull in with &insert:/path/part.html; (a side menu used by nine pages).
* The editor edits the part's Development copy, so every page that inserts
* it shows the change; the site owner releases it like any Development
* page. Parts under /OpenForum belong to the site's templates and are not
* edited here.
*
* Plain string code with no DOM, so the same rules run in node tests, in
* the browser and on the server (Rhino).
*
* livePath(path) -> path without the Development root
* check(path) -> live path, or throws if it is not an editable part
* draftPath(path) -> the Development copy's path
* split(path) -> { page, file }
* version(text) -> a short fingerprint, for conflict detection
* collect(pages) -> [ { path, usedBy: [ publicPath ] } ]   pages: [ { publicPath, html } ]
*/
var ContentEditorSharedParts = (function() {

  var DRAFT_ROOT = "/Develop" + "ment";
  var PART_PATH = /^\/[A-Za-z0-9_\-\/.]+\.html$/;
  var INSERT = /&insert:(\/[A-Za-z0-9_\-\/.]+);/g;

  function livePath( path ) {
    path = String( path || "" );
    return path.indexOf( DRAFT_ROOT + "/" ) === 0 ? path.substring( DRAFT_ROOT.length ) : path;
  }

  function check( path ) {
    var live = livePath( path );
    if( !PART_PATH.test( live ) || /\.\.|\/\//.test( live ) ) throw "Not a shared part: " + path;
    if( live.indexOf( "/OpenForum/" ) === 0 ) throw "Parts under /OpenForum belong to the site's templates, not its pages";
    return live;
  }

  function draftPath( path ) { return DRAFT_ROOT + check( path ); }

  function split( path ) {
    var at = path.lastIndexOf( "/" );
    return { page: path.substring( 0, at ), file: path.substring( at + 1 ) };
  }

  // djb2 over the text, with its length; enough to notice someone else's save.
  function version( text ) {
    text = String( text || "" );
    var hash = 5381;
    for( var i = 0; i < text.length; i++ ) hash = ( ( hash * 33 ) ^ text.charCodeAt( i ) ) >>> 0;
    return hash.toString( 16 ) + "-" + text.length;
  }

  function collect( pages ) {
    var parts = {};
    ( pages || [] ).forEach( function( page ) {
      var match;
      INSERT.lastIndex = 0;
      while( ( match = INSERT.exec( String( page.html || "" ) ) ) ) {
        var live;
        try { live = check( match[ 1 ] ); } catch( e ) { continue; }
        var part = parts[ live ] || ( parts[ live ] = { path: live, usedBy: [] } );
        if( part.usedBy.indexOf( page.publicPath ) === -1 ) part.usedBy.push( page.publicPath );
      }
    } );
    return Object.keys( parts ).sort().map( function( key ) {
      parts[ key ].usedBy.sort();
      return parts[ key ];
    } );
  }

  var api = {
    DRAFT_ROOT: DRAFT_ROOT,
    livePath: livePath,
    check: check,
    draftPath: draftPath,
    split: split,
    version: version,
    collect: collect
  };

  if( typeof module !== "undefined" && module.exports ) module.exports = api;
  if( typeof window !== "undefined" ) window.ContentEditorSharedParts = api;
  return api;
})();
