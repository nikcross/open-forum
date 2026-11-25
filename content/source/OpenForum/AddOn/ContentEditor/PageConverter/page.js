/*
* PageConverter: imports an existing Development page into the Content
* Editor. The server converts the page (previewContentPageImport) and
* imports it (importContentPage); this page shows the result side by side
* with the page as it is now, with the conversion report and the
* publication checks, before anything is written.
*
* Replaces the 2021 converter, which wrote the old block editor's format
* into the page's data.json.
*/
OpenForum.includeScript("/OpenForum/AddOn/ContentEditor/ContentEditorClient.js");
OpenForum.includeScript("/OpenForum/AddOn/ContentEditor/model-schema.js");
OpenForum.includeScript("/OpenForum/AddOn/ContentEditor/model-element-definitions.js");
OpenForum.includeScript("/OpenForum/AddOn/ContentEditor/model-style-tokens.js");
OpenForum.includeScript("/OpenForum/AddOn/ContentEditor/model-renderer.js");
OpenForum.includeScript("/OpenForum/AddOn/ContentEditor/model-themes.js");
OpenForum.includeScript("/OpenForum/AddOn/ContentEditor/model-templates.js");
OpenForum.includeScript("/OpenForum/AddOn/ContentEditor/model-content-store.js");
OpenForum.includeScript("/OpenForum/AddOn/ContentEditor/model-publication.js");

var EDITOR_PAGE = "/OpenForum/AddOn/ContentEditor";
var SITE_CONFIG_URL = "/OpenForum/PageTemplates/PublishedPage/content-editor-site.json";
var siteConfig = null;
var preview = null; // the last previewContentPageImport reply
var busy = false;

OpenForum.init = function() {
  fetch( SITE_CONFIG_URL, { cache: "no-store", credentials: "same-origin" } )
    .then( function( response ) { return response.ok ? response.json() : null; } )
    .then( function( config ) { siteConfig = config; } )
    .catch( function() { siteConfig = null; } );

  document.getElementById( "pc-form" ).addEventListener( "submit", function( event ) {
    event.preventDefault();
    check();
  } );
  Array.prototype.forEach.call( document.querySelectorAll( "input[name=pc-type]" ), function( radio ) {
    radio.addEventListener( "change", function() { if( preview ) check(); } );
  } );
  var pageName = new URLSearchParams( window.location.search ).get( "pageName" );
  if( pageName ) {
    document.getElementById( "pc-page" ).value = pageName;
    check();
  }
};

function esc( value ) {
  return String( value === undefined || value === null ? "" : value ).replace( /&/g, "&amp;" ).replace( /</g, "&lt;" ).replace( />/g, "&gt;" ).replace( /"/g, "&quot;" ).replace( /'/g, "&#39;" );
}

function selectedType() {
  return document.querySelector( "input[name=pc-type]:checked" ).value;
}

function showResult( html ) {
  document.getElementById( "pc-result" ).innerHTML = html;
}

function readService( action, params ) {
  var query = "action=" + encodeURIComponent( action ) + "&ts=" + Date.now();
  for( var key in params ) query += "&" + encodeURIComponent( key ) + "=" + encodeURIComponent( params[ key ] );
  return fetch( EDITOR_PAGE + "?" + query, { cache: "no-store", credentials: "same-origin" } )
    .then( function( response ) { return response.json(); } )
    .then( function( reply ) {
      if( reply.result !== "ok" ) throw reply.message;
      return reply.data;
    } );
}

function check() {
  if( busy ) return;
  var sourcePage = document.getElementById( "pc-page" ).value.trim().replace( /\/+$/, "" );
  if( !sourcePage ) { showResult( "<p class='error'>Enter the page to import, for example /ANewPage.</p>" ); return; }
  if( sourcePage.charAt( 0 ) !== "/" ) sourcePage = "/" + sourcePage;
  document.getElementById( "pc-page" ).value = sourcePage;
  busy = true;
  preview = null;
  showResult( "<p class='pc-note'>Checking " + esc( sourcePage ) + "...</p>" );
  document.getElementById( "pc-original" ).src = sourcePage + "?ts=" + Date.now();
  readService( "previewContentPageImport", { sourcePage: sourcePage, templateId: selectedType() } )
    .then( function( data ) {
      preview = data;
      renderPreview();
    } )
    .catch( function( error ) {
      showResult( "<p class='error'>" + esc( error ) + "</p>" );
      document.getElementById( "pc-preview" ).srcdoc = "";
    } )
    .then( function() { busy = false; } );
}

function renderPreview() {
  var page = preview.page;
  var theme = ContentEditorThemes.getTheme( page.theme.id, page.theme.version );
  document.getElementById( "pc-preview" ).srcdoc = "<!doctype html><meta charset='utf-8'><style>html,body{margin:0;}" +
    ContentEditorThemes.buildCss( theme ) + ContentEditorRenderer.renderResponsiveCss( page ) + "</style>" + ContentEditorPublication.renderBody( page );

  var checks = ContentEditorPublication.validate( page, siteConfig );
  var html = "<h2>" + esc( ContentEditorTemplates.getTitle( page ) ) + "</h2>" +
    "<p class='pc-note'>" + ( selectedType() === "blog-article" ? "Blog article" : "Content page" ) + " · stays at " + esc( preview.sourcePage ) +
    " and publishes to " + esc( preview.publicPath ) + ( preview.livePageExists ? ", replacing the live page there when you publish" : " (not on live yet)" ) + "</p>";
  html += "<div class='pc-columns'><div><strong>What the import did</strong><ul>" + preview.report.map( function( line ) { return "<li>" + esc( line ) + "</li>"; } ).join( "" ) + "</ul></div>";
  html += "<div><strong>Before it can be published</strong><ul>" +
    checks.errors.map( function( e ) { return "<li class='error'>" + esc( e ) + "</li>"; } ).join( "" ) +
    checks.warnings.map( function( w ) { return "<li class='warn'>" + esc( w ) + "</li>"; } ).join( "" ) +
    ( checks.errors.length || checks.warnings.length ? "" : "<li>All publication checks pass</li>" ) +
    "</ul><p class='pc-note'>You can fix all of these in the editor after importing.</p></div></div>";
  if( preview.alreadyImported ) {
    html += "<p>This page is already in the Content Editor. <a class='pc-btn secondary' id='pc-open-existing' href='" + EDITOR_PAGE + "'>Open the Content Editor</a></p>";
    showResult( html );
    linkExisting();
    return;
  }
  html += "<p><button type='button' class='pc-btn' id='pc-import'>Import into the Content Editor</button></p>";
  showResult( html );
  document.getElementById( "pc-import" ).addEventListener( "click", importPage );
}

// Points the "open" link at the already-imported page.
function linkExisting() {
  readService( "listContentPages", {} ).then( function( pages ) {
    ( pages || [] ).forEach( function( entry ) {
      if( entry.draftPath === preview.sourcePage ) document.getElementById( "pc-open-existing" ).href = EDITOR_PAGE + "?contentPage=" + encodeURIComponent( entry.pageId );
    } );
  } ).catch( function() {} );
}

function importPage() {
  if( busy || !preview ) return;
  busy = true;
  var button = document.getElementById( "pc-import" );
  button.disabled = true;
  button.textContent = "Importing...";
  ContentEditorClient.importContentPage( preview.sourcePage, selectedType() )
    .then( function( reply ) {
      if( reply.result !== "ok" ) throw reply.message;
      var pageId = reply.data.index.pageId;
      button.parentNode.innerHTML = "<strong>" + esc( reply.message ) + ".</strong> <a class='pc-btn' href='" + EDITOR_PAGE + "?contentPage=" + encodeURIComponent( pageId ) + "'>Open it in the Content Editor</a>";
    } )
    .catch( function( error ) {
      button.disabled = false;
      button.textContent = "Import into the Content Editor";
      button.insertAdjacentHTML( "afterend", " <span class='error'>" + esc( error ) + "</span>" );
    } )
    .then( function() { busy = false; } );
}

