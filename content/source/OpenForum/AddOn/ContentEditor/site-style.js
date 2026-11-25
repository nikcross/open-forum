/*
* Content Editor - Site Style view (CON-T-050). Edits the site library's
* style: five colours, a heading and a body font from the approved lists,
* and the site icon. Saving adds a version (a theme pages and layouts pin)
* and writes its CSS file on the library page. Values are checked by
* ContentEditorThemes.validateTheme, here and on the server, so nothing
* else can reach the CSS. Contrast is checked against WCAG AA.
*/
( function() {
  var u = ContentEditorApp.util;
  var COLOURS = [
    { token: "accent", label: "Accent", use: "Links, buttons, kickers" },
    { token: "soft", label: "Soft", use: "Image and panel backgrounds" },
    { token: "paper", label: "Paper", use: "Page background" },
    { token: "ink", label: "Ink", use: "Text" },
    { token: "muted", label: "Muted", use: "Standfirst, bylines" }
  ];
  var style = null; // the library entry, or null before the first save
  var draft = null; // the tokens being edited
  var busy = false;

  function load() {
    ContentEditorApp.whenSiteConfig( function( config, problem ) {
      if( !config ) { document.getElementById( "ce-style-body" ).innerHTML = "<p class='error'>" + u.esc( problem ) + "</p>"; return; }
      u.readService( "listLibrary", { kind: "styles" } ).then( function( list ) {
        style = ( list || [] ).filter( function( s ) { return !s.archived; } )[ 0 ] || null;
        var base = style ? style.content : ContentEditorThemes.getTheme( config.theme.id, config.theme.version );
        draft = { type: "site-style", name: style ? style.content.name : config.name + " style", accent: base.accent, soft: base.soft, paper: base.paper,
          ink: base.ink, muted: base.muted, display: base.display, body: base.body || "arial", icon: base.icon || "" };
        render( config );
      } ).catch( function( error ) { document.getElementById( "ce-style-body" ).innerHTML = "<p class='error'>" + u.esc( error ) + "</p>"; } );
    } );
  }

  function options( fonts, value ) {
    return Object.keys( fonts ).map( function( key ) {
      return "<option value='" + key + "'" + ( key === value ? " selected" : "" ) + " style=\"font-family:" + u.esc( fonts[ key ] ) + "\">" + u.esc( fonts[ key ].split( "," )[ 0 ].replace( /'/g, "" ) ) + "</option>";
    } ).join( "" );
  }

  function render( config ) {
    var current = style ? "Version " + style.version + " of " + u.esc( style.name ) + " is the site's style. Saving makes version " + ( style.version + 1 ) + "." :
      "The site uses the built-in " + u.esc( ContentEditorThemes.getTheme( config.theme.id, config.theme.version ).name ) + " theme. Saving starts the site's own style from these values.";
    var html = "<p>" + current + "</p><div class='ce-style-grid'><div>";
    html += "<h2 class='ce-view-subhead'>Colours</h2><div class='ce-colours'>" + COLOURS.map( function( colour ) {
      return "<label class='ce-colour'><span class='ce-colour-chip' data-chip='" + colour.token + "'></span><div class='ce-colour-text'><strong>" + u.esc( colour.label ) + "</strong><br/>" +
        "<input type='color' data-colour='" + colour.token + "' value='" + u.esc( draft[ colour.token ] ) + "' aria-label='" + u.esc( colour.label ) + "'/> " +
        "<input type='text' class='ce-hex' data-hex='" + colour.token + "' value='" + u.esc( draft[ colour.token ] ) + "' maxlength='7' aria-label='" + u.esc( colour.label ) + " hex'/>" +
        "<br/><small>" + u.esc( colour.use ) + "</small></div></label>";
    } ).join( "" ) + "</div>";
    html += "<h2 class='ce-view-subhead'>Fonts</h2><div class='ce-card'>" +
      "<label class='ce-label' for='ce-style-display'>Headings</label><select id='ce-style-display'>" + options( ContentEditorThemes.DISPLAY_FONTS, draft.display ) + "</select>" +
      "<label class='ce-label' for='ce-style-body-font'>Body text</label><select id='ce-style-body-font'>" + options( ContentEditorThemes.BODY_FONTS, draft.body ) + "</select>" +
      "<p>Only fonts every browser already has, so pages never wait for a download.</p></div>";
    html += "<h2 class='ce-view-subhead'>Icon</h2><div class='ce-card ce-icon-card'><span id='ce-style-icon-preview'></span>" +
      "<button type='button' class='ce-btn' id='ce-style-icon-pick'>Choose from the image library</button> <button type='button' class='ce-btn' id='ce-style-icon-clear'>No icon</button>" +
      "<p>Shown in the browser tab of pages that use a library layout.</p></div>";
    html += "</div><div><h2 class='ce-view-subhead'>Sample</h2><div id='ce-style-sample'></div>" +
      "<h2 class='ce-view-subhead'>Checks</h2><ul class='ce-checklist' id='ce-style-checks'></ul>";
    if( style ) html += "<h2 class='ce-view-subhead'>Versions</h2><ul class='ce-checklist'>" + style.versions.slice().reverse().slice( 0, 8 ).map( function( v ) {
      return "<li>v" + v.version + " · " + u.esc( v.savedBy ) + " · " + u.esc( formatSavedAt( v.savedAt ) ) + ( v.message ? " · " + u.esc( v.message ) : "" ) + "</li>";
    } ).join( "" ) + "</ul><p class='ce-hint'>CSS: " + u.esc( "/OpenForum/PageTemplates/SiteLibrary/site-style-" + style.id + "-v" + style.version + ".css" ) + "</p>";
    html += "</div></div><details style='margin-top:24px'><summary>The CSS this style builds</summary><pre id='ce-style-css' class='ce-css-pre'></pre></details>";
    document.getElementById( "ce-style-body" ).innerHTML = html;
    update();
  }

  // Redraws the sample, checks and CSS from the draft.
  function update() {
    var problems = ContentEditorThemes.validateTheme( draft );
    var valid = !problems.length;
    COLOURS.forEach( function( colour ) {
      var chip = document.querySelector( "[data-chip='" + colour.token + "']" );
      if( chip ) chip.style.background = /^#[0-9a-f]{6}$/i.test( draft[ colour.token ] ) ? draft[ colour.token ] : "transparent";
    } );
    var sample = document.getElementById( "ce-style-sample" );
    var display = ContentEditorThemes.DISPLAY_FONTS[ draft.display ], body = ContentEditorThemes.BODY_FONTS[ draft.body ];
    sample.innerHTML = valid ? "<div class='ce-style-sample' style='background:" + draft.paper + ";color:" + draft.ink + ";font-family:" + u.esc( body ) + "'>" +
      "<p style='color:" + draft.accent + ";font-weight:700;font-size:11px;letter-spacing:.15em;text-transform:uppercase'>Kicker</p>" +
      "<h2 style=\"font-family:" + u.esc( display ) + ";font-weight:400\">A heading in the site style</h2>" +
      "<p style='color:" + draft.muted + "'>A standfirst in the muted colour.</p>" +
      "<p>Body text with <span style='color:" + draft.accent + ";text-decoration:underline'>a link</span>.</p>" +
      "<div style='background:" + draft.soft + ";border-radius:10px;padding:14px;margin-bottom:14px'>A panel on the soft colour.</div>" +
      "<span class='ce-sample-button' style='background:" + draft.accent + ";color:#fff'>A button</span></div>" : "";
    var warnings = valid ? ContentEditorThemes.contrastWarnings( draft ) : [];
    document.getElementById( "ce-style-checks" ).innerHTML = problems.map( function( p ) { return "<li class='error'>" + u.esc( p ) + "</li>"; } ).join( "" ) +
      warnings.map( function( w ) { return "<li class='todo'>" + u.esc( w ) + "</li>"; } ).join( "" ) + ( problems.length || warnings.length ? "" : "<li>All colour pairs meet WCAG AA</li>" );
    document.getElementById( "ce-style-css" ).textContent = valid ? ContentEditorThemes.buildCss( draft ).replace( /}/g, "}\n" ) : "Fix the problems above first.";
    document.getElementById( "ce-style-icon-preview" ).innerHTML = draft.icon ? "<img src='" + u.esc( draft.icon ) + "' alt='Site icon'/> <code>" + u.esc( draft.icon ) + "</code>" : "<em>No icon</em>";
    var unchanged = style && JSON.stringify( draft ) === JSON.stringify( style.content );
    var button = document.getElementById( "ce-style-save" );
    button.disabled = !valid || unchanged || busy;
    button.title = !valid ? "Fix the problems first" : unchanged ? "Nothing has changed" : "";
  }

  function save() {
    if( busy ) return;
    busy = true;
    update();
    var request = style ? ContentEditorClient.saveLibraryEntry( "styles", style.id, style.version, draft, "" ) :
      ContentEditorClient.createLibraryEntry( "styles", draft.name, draft, "Started from the built-in theme" );
    request
      .then( function( reply ) {
        if( reply.result !== "ok" ) throw reply.message;
        u.toast( reply.message + ". New pages use it now." );
        ContentEditorApp.reloadSiteConfig( function() { load(); } );
      } )
      .catch( function( error ) { u.toast( "Not saved: " + error ); } )
      .then( function() { busy = false; } );
  }

  function wire() {
    var view = document.getElementById( "ce-view-site-style" );
    view.addEventListener( "input", function( event ) {
      var target = event.target;
      if( target.hasAttribute( "data-colour" ) ) {
        draft[ target.getAttribute( "data-colour" ) ] = target.value;
        view.querySelector( "[data-hex='" + target.getAttribute( "data-colour" ) + "']" ).value = target.value;
      } else if( target.hasAttribute( "data-hex" ) ) {
        var token = target.getAttribute( "data-hex" );
        draft[ token ] = target.value.trim();
        if( /^#[0-9a-f]{6}$/i.test( draft[ token ] ) ) view.querySelector( "[data-colour='" + token + "']" ).value = draft[ token ];
      } else if( target.id === "ce-style-display" ) draft.display = target.value;
      else if( target.id === "ce-style-body-font" ) draft.body = target.value;
      else return;
      update();
    } );
    view.addEventListener( "change", function( event ) {
      if( event.target.id === "ce-style-display" ) { draft.display = event.target.value; update(); }
      if( event.target.id === "ce-style-body-font" ) { draft.body = event.target.value; update(); }
    } );
    view.addEventListener( "click", function( event ) {
      if( event.target.id === "ce-style-save" ) save();
      if( event.target.id === "ce-style-icon-clear" ) { draft.icon = ""; update(); }
      if( event.target.id === "ce-style-icon-pick" ) ContentEditorApp.pickImage( function( image ) { draft.icon = image.url; update(); } );
    } );
  }

  ContentEditorApp.registerView( "site-style", {
    init: function() { wire(); load(); },
    refresh: load
  } );
} )();

