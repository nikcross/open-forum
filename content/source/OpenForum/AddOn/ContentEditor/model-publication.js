/*
* ContentEditorPublication
* Publication checks (CON-T-029) and the published render (CON-T-030,
* OpenForum page format CON-T-044).
*
* The same rules run in the editor's "Before publishing" list and on the
* server before anything is staged, so a page the editor says is ready is
* the page the server accepts.
*
* validate(page, siteConfig, options) -> { errors: [], warnings: [] }
*   errors stop publication; warnings are shown but do not.
*   options.pageExists(path) - optional, checks related pages on the server.
* renderBody(page) -> the published markup alone (the editor's preview)
* render(page, target) -> { pageContent, html, css }
*   target: { pageId, revision }. pageContent is the page's page.content:
*   its stylesheet and markup in one wiki no-markup block, so the default
*   OpenForum page builder puts them into the page template untouched.
* toWikiSafe(html) -> html that cannot end a +++ block early
* checkOutput(html) -> []  defence in depth on the generated markup.
* escapeField(text) -> a data.json value safe to place in a template
*/
var ContentEditorPublication = (function(Templates, Renderer, Themes, Store, Schema) {

  // The wiki renderer's no-markup block: everything between the markers is
  // passed through as it is (tested 2026-10-21 on
  // /TheLab/Experiments/ContentEditorRawTest). Fields such as &title; are
  // filled in before rendering, but the editor's markup never contains a
  // raw "&name;" - text and attributes are escaped.
  var NO_MARKUP = "+++";
  // Kept so responsive rules ([data-element-id]) and the theme's layout
  // rules ([data-role], [data-slot]) still match on the published page.
  var EDITOR_ONLY_ATTRIBUTES = /\s(data-field-id|data-element-type)="[^"]*"/g;
  var EMPTY_IMAGE = /<div class="ce-image ce-image-empty"[^>]*><\/div>/g;
  var PENDING_LINK = "#ce-link-pending";

  function textOf( html ) {
    return String( html || "" ).replace( /<[^>]*>/g, " " ).replace( /&nbsp;/g, " " ).replace( /\s+/g, " " ).trim();
  }

  // visit( element, component ): component is the name of the placed
  // component the element is part of, if any (CON-T-045).
  function eachElement( element, visit, component ) {
    visit( element, component );
    var inner = element.type === "component" && element.fields && element.fields.name ? element.fields.name : component;
    var groups = element.slots ? Object.keys( element.slots ).map( function( k ) { return element.slots[ k ]; } ) : [ element.children || [] ];
    groups.forEach( function( items ) { ( items || [] ).forEach( function( child ) { eachElement( child, visit, inner ); } ); } );
  }

  function describeElement( element, component ) {
    var text = element.role ? "The " + element.role.replace( /-/g, " " ) : "A " + element.type + " (" + element.id + ")";
    return component ? text + " in the " + component + " component (fix it in Components, then update it here)" : text;
  }

  // The checks on each element of a page, component or layout:
  // { errors, warnings, bodyText, where }. where maps each message to the
  // element and field it is about, so the editor can take you there
  // (CON-T-031, FR-PUB-004).
  function checkElements( root ) {
    var errors = [], warnings = [], where = {};
    var bodyText = "";
    function note( list, text, element, field ) {
      list.push( text );
      if( !where[ text ] ) where[ text ] = { elementId: element.id, field: field || null };
    }
    eachElement( root, function( element, component ) {
      var fields = element.fields || {};
      var about = describeElement( element, component );
      if( element.type === "heading" && element.role && !( fields.text || "" ).trim() ) note( errors, about + " is empty", element, "text" );
      if( element.type === "rich-text" ) {
        var html = fields.body && fields.body.html || "";
        if( element.role === "body" ) bodyText += textOf( html );
        if( element.role === "standfirst" && !textOf( html ) ) note( warnings, "The standfirst is empty", element, "body" );
        ( html.match( /<img\b[^>]*>/gi ) || [] ).forEach( function( tag ) {
          if( !/\salt="[^"]+"/i.test( tag ) ) note( errors, about + " has an image with no description", element, "body" );
        } );
        ( html.match( /<a\b[^>]*>/gi ) || [] ).forEach( function( tag ) {
          var href = ( tag.match( /\shref="([^"]*)"/i ) || [] )[ 1 ];
          if( !href ) note( warnings, about + " has a link with no address", element, "body" );
        } );
      }
      if( element.type === "image" ) {
        if( !fields.mediaUrl ) {
          note( warnings, about + " has no image; it is left out of the published page", element, "mediaUrl" );
        } else if( !fields.decorative && !( fields.alt || "" ).trim() ) {
          note( errors, about + " needs a description, or marking as decorative", element, "alt" );
        }
      }
      // CON-T-054: an empty area is easy to leave behind by mistake. Template
      // parts (with a role) are left to the template's own checks.
      if( element.type === "two-column" ) {
        Object.keys( element.slots || {} ).forEach( function( slot, i ) {
          if( !( element.slots[ slot ] || [] ).length ) note( warnings, about + ": column " + ( i ? "B" : "A" ) + " is empty", element, null );
        } );
      }
      if( ( element.type === "section" || element.type === "component" ) && !element.role && !( element.children || [] ).length ) {
        note( warnings, about + " is empty", element, null );
      }
      if( element.type === "button" ) {
        if( !( fields.text || "" ).trim() ) note( errors, about + " has no text", element, "text" );
        if( !fields.href ) note( errors, about + " has no link", element, "href" );
      }
    } );
    return { errors: unique( errors ), warnings: unique( warnings ), bodyText: bodyText, where: where };
  }

  function validate( page, siteConfig, options ) {
    options = options || {};
    var errors = [], warnings = [], where = {};
    if( !page || !page.template ) return { errors: [ "Only pages made from a template can be published" ], warnings: warnings, where: where };
    // A page-level message is about one of the page settings.
    function setting( list, text, key ) {
      list.push( text );
      if( !where[ text ] ) where[ text ] = { setting: key };
    }

    errors = errors.concat( Templates.validatePage( page ), Store.unsafeMarkup( page ) );
    // PHW-T-002: an existing page keeps its own markup and address; only its
    // title, summary and the safety of its markup are checked.
    if( page.template.id === "existing-page" ) {
      var meta = page.metadata || {};
      if( !( meta.title || "" ).trim() ) setting( errors, "Add a title", "title" );
      if( !( meta.summary || "" ).trim() ) setting( warnings, "Write a short summary for cards and search results", "summary" );
      var block = page.root.children[ 0 ];
      var markup = block && block.fields && block.fields.html ? block.fields.html.html || "" : "";
      if( !textOf( markup.replace( /&insert:[^;]*;/g, "" ) ) ) { errors.push( "The page has no content" ); if( block ) where[ "The page has no content" ] = { elementId: block.id, field: "html" }; }
      return { errors: unique( errors ), warnings: unique( warnings ), where: where };
    }
    if( siteConfig ) {
      if( siteConfig.templates.indexOf( page.template.id ) === -1 ) errors.push( "This site does not offer the '" + page.template.id + "' template" );
      if( page.theme && ( page.theme.id !== siteConfig.theme.id || page.theme.version !== siteConfig.theme.version ) ) {
        setting( warnings, "The page keeps its own theme (" + page.theme.id + " v" + page.theme.version + "); the site now uses " + siteConfig.theme.id + " v" + siteConfig.theme.version, "theme" );
      }
    }
    if( !page.slug ) setting( errors, "Choose a URL slug", "slug" );
    if( !( Templates.getTitle( page ) || "" ).trim() ) setting( errors, "Add a title", "title" );

    var metadata = page.metadata || {};
    if( !( metadata.summary || "" ).trim() ) setting( warnings, "Write a short summary for cards and search results", "summary" );
    if( page.template.id === "blog-article" ) {
      if( !( metadata.author || "" ).trim() ) setting( warnings, "The byline has no author", "author" );
      if( !metadata.publishDate ) setting( warnings, "The byline has no publish date", "publishDate" );
    }
    ( metadata.relatedPages || [] ).forEach( function( path ) {
      if( options.pageExists && !options.pageExists( path ) ) setting( warnings, "Related page " + path + " does not exist yet", "relatedPages" );
    } );

    if( JSON.stringify( page.root ).indexOf( PENDING_LINK ) !== -1 ) errors.push( "Finish or remove the link you started" );
    var layout = page.layout || {};
    if( Schema.TEMPLATE_MODES.indexOf( layout.templateMode ) === -1 ) setting( errors, "Choose how the page gets its template: link, copy or none", "layout" );
    else if( layout.templateMode === "own" ) setting( errors, "Only an existing site page can keep its own template; choose link, copy or none", "layout" );

    var elements = checkElements( page.root );
    if( /"type":"(layout|content-slot)"/.test( JSON.stringify( page.root ) ) ) errors.push( "A page cannot contain a layout or its content place; pages choose a layout instead" );
    errors = errors.concat( elements.errors );
    warnings = warnings.concat( elements.warnings );
    for( var message in elements.where ) if( !where[ message ] ) where[ message ] = elements.where[ message ];
    var bodyText = elements.bodyText;
    if( !bodyText ) {
      errors.push( "The page has no body text" );
      var body = null;
      eachElement( page.root, function( element ) { if( !body && element.role === "body" ) body = element; } );
      if( body ) where[ "The page has no body text" ] = { elementId: body.id, field: body.type === "rich-text" ? "body" : null };
    }

    // options.layout(id) - optional, the library's layout summary (CON-T-048).
    if( options.layout && layout.id && layout.templateMode !== "none" ) {
      var chosen = options.layout( layout.id );
      if( !chosen ) setting( errors, "The page's layout is not in this site's library", "layout" );
      else {
        if( chosen.version > layout.version ) setting( warnings, "The page uses version " + layout.version + " of the " + chosen.name + " layout; version " + chosen.version + " is in the library", "layout" );
        if( chosen.archived ) setting( warnings, "The " + chosen.name + " layout has been archived", "layout" );
      }
    }

    // options.latestComponentVersion(id) - optional, the library's latest
    // version of a component (CON-T-046). Only components placed directly
    // in the page are compared; nested ones update with their parent.
    if( options.latestComponentVersion ) {
      eachElement( page.root, function( element, component ) {
        if( element.type !== "component" || component || !element.fields ) return;
        var latest = options.latestComponentVersion( element.fields.componentId );
        if( latest && latest > element.fields.componentVersion ) {
          var behind = "The " + element.fields.name + " component is at version " + element.fields.componentVersion + "; version " + latest + " is in the library";
          warnings.push( behind );
          if( !where[ behind ] ) where[ behind ] = { elementId: element.id, field: null };
        }
      } );
    }

    return { errors: unique( errors ), warnings: unique( warnings ), where: where };
  }

  function unique( list ) {
    return list.filter( function( item, i ) { return list.indexOf( item ) === i; } );
  }

  // The published markup: the template render without editor-only
  // attributes or empty image placeholders.
  function renderBody( page ) {
    return cleanMarkup( Templates.renderPage( page ) );
  }

  // Any rendered markup (a component or layout on its own) made publishable.
  function cleanMarkup( html ) {
    return String( html ).replace( EMPTY_IMAGE, "" ).replace( EDITOR_ONLY_ATTRIBUTES, "" );
  }

  // "+" in text and attribute values becomes &#43;, which the browser
  // reads back as "+", so the markup cannot contain the closing marker.
  // Style blocks are not entity-decoded, so they are left as they are and
  // checkOutput refuses any "+++" left in them.
  function toWikiSafe( html ) {
    return String( html ).split( /(<style\b[\s\S]*?<\/style>)/i ).map( function( part, i ) {
      return i % 2 === 1 ? part : part.replace( /\+/g, "&#43;" );
    } ).join( "" );
  }

  function buildCss( page ) {
    var theme = page.theme ? Themes.getTheme( page.theme.id, page.theme.version ) : null;
    return ( theme ? Themes.buildCss( theme ) : "" ) + Renderer.renderResponsiveCss( page );
  }

  // PHW-T-002: an existing page publishes its own markup in the form the
  // site already uses - the page's protected scripts, then the markup, its
  // &insert: parts as directives - with no theme CSS and no no-markup
  // block (older page renderers do not honour one; the markup is already
  // wiki-safe).
  function renderExisting( page, target ) {
    var block = page.root.children[ 0 ] || { fields: {} };
    var markup = ( block.fields.html || {} ).html || "";
    var scripts = ( block.fields.scripts || [] ).map( function( src ) { return "<script src=\"" + Renderer.escapeHtml( src ) + "\"></script>\n"; } ).join( "" );
    var pageContent = "<!--Published from the Content Editor: " + Renderer.escapeHtml( target.pageId || page.pageId ) +
      " revision " + Renderer.escapeHtml( target.revision ) + ". Edit it there; changes made here are replaced when it is next published.-->\n" +
      scripts + markup + "\n";
    return { pageContent: pageContent, html: markup, css: "", scripts: block.fields.scripts || [] };
  }

  function render( page, target ) {
    if( page.template && page.template.id === "existing-page" ) return renderExisting( page, target );
    var body = renderBody( page );
    var css = buildCss( page );
    var html = toWikiSafe( "<style>" + css + "</style>\n" + body );
    var pageContent = "<!--Published from the Content Editor: " + Renderer.escapeHtml( target.pageId || page.pageId ) +
      " revision " + Renderer.escapeHtml( target.revision ) + ". Edit it there; changes made here are replaced when it is next published.-->\n" +
      NO_MARKUP + html + NO_MARKUP + "\n";
    return { pageContent: pageContent, html: html, css: css };
  }

  // A data.json value is placed into the page template by the page builder
  // and then wiki-rendered with it, so it is HTML-escaped and the
  // characters that start wiki markup become character references.
  function escapeField( text ) {
    return String( text === undefined || text === null ? "" : text )
      .replace( /[&<>"'\[\](){}|_~^*!#+=\/\\-]/g, function( c ) { return "&#" + c.charCodeAt( 0 ) + ";"; } );
  }

  var FORBIDDEN_OUTPUT = [
    { pattern: /\sdata-field-id=/, reason: "editor field markers" },
    { pattern: /\scontenteditable/i, reason: "editable regions" },
    { pattern: /ce-image-empty/, reason: "an empty image placeholder" },
    { pattern: /<\s*(script|iframe|object|embed|form|base|meta)\b/i, reason: "a disallowed tag" },
    { pattern: /\son[a-z]+\s*=/i, reason: "an event handler attribute" },
    { pattern: /javascript\s*:/i, reason: "a javascript: address" },
    { pattern: /#ce-link-pending/, reason: "an unfinished link" },
    { pattern: /\+\+\+/, reason: "the wiki no-markup marker +++" }
  ];

  // page (optional): an existing page may keep its own forms (PHW-T-002);
  // its protected scripts are not part of html.
  function checkOutput( html, page ) {
    var existing = !!( page && page.template && page.template.id === "existing-page" );
    var problems = [];
    FORBIDDEN_OUTPUT.forEach( function( rule ) {
      var pattern = existing && rule.reason === "a disallowed tag" ? /<\s*(script|iframe|object|embed|base|meta)\b/i : rule.pattern;
      if( pattern.test( html ) ) problems.push( "The published page would contain " + rule.reason );
    } );
    return problems;
  }

  var api = {
    NO_MARKUP: NO_MARKUP,
    validate: validate,
    checkElements: checkElements,
    renderBody: renderBody,
    cleanMarkup: cleanMarkup,
    render: render,
    toWikiSafe: toWikiSafe,
    escapeField: escapeField,
    checkOutput: checkOutput
  };

  if( typeof module !== "undefined" && module.exports ) module.exports = api;
  if( typeof window !== "undefined" ) window.ContentEditorPublication = api;
  return api;
})(
  typeof require !== "undefined" ? require("./templates.js") : window.ContentEditorTemplates,
  typeof require !== "undefined" ? require("./renderer.js") : window.ContentEditorRenderer,
  typeof require !== "undefined" ? require("./themes.js") : window.ContentEditorThemes,
  typeof require !== "undefined" ? require("./content-store.js") : window.ContentEditorContentStore,
  typeof require !== "undefined" ? require("./schema.js") : window.ContentEditorSchema
);
