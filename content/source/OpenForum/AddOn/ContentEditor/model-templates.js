/*
* ContentEditorTemplates
* The Blog Article and Content/Service Page templates (CON-T-038,
* CON-R-017), translated from the reusable-blog-editor prototype into the
* structured model.
*
* Everything a reader sees and edits in place is an ordinary registered
* element (heading, rich-text, image, two-column, button) carrying a role
* that says which template slot it fills, so it keeps a stable id and goes
* through the same commands, renderer and canvas as any other element.
* Everything else (category, summary, author, date, tags, related pages)
* is typed metadata on page.metadata, validated against the template.
*
* A templated page pins page.template and page.theme as {id, version}.
* Template and theme versions are never edited once published; a change is
* a new version, so an existing page keeps rendering the way it was made.
*/
var ContentEditorTemplates = (function(Schema, Definitions, Renderer, Themes) {

  var RICH_TEXT_FORMAT = "editor-rich-text-v1";

  // Metadata field types: text (max length), date (YYYY-MM-DD or empty),
  // list (of short strings) and pathList (of site paths).
  var COMMON_METADATA = {
    category: { type: "text", max: 60, default: "" },
    summary: { type: "text", max: 320, default: "" }
  };

  function withCommon( fields ) {
    var all = {};
    for( var key in COMMON_METADATA ) all[ key ] = COMMON_METADATA[ key ];
    for( var key2 in fields ) all[ key2 ] = fields[ key2 ];
    return all;
  }

  // roles: which element type fills each slot, and whether a page must
  // have it (required) and may have only one (unique).
  var templates = {
    "blog-article": {
      1: {
        id: "blog-article",
        version: 1,
        label: "Blog article",
        roles: {
          "header": { type: "section", required: true, unique: true },
          "title": { type: "heading", required: true, unique: true },
          "standfirst": { type: "rich-text", required: true, unique: true },
          "hero-section": { type: "section", required: true, unique: true },
          "hero": { type: "image", required: true, unique: true },
          "content": { type: "section", required: true, unique: true },
          "body": { type: "rich-text", required: true, unique: true }
        },
        // Article-only metadata.
        metadata: withCommon( {
          author: { type: "text", max: 100, default: "" },
          publishDate: { type: "date", default: "" },
          tags: { type: "list", max: 12, itemMax: 40, default: [] },
          relatedPages: { type: "pathList", max: 6, default: [] }
        } )
      }
    },
    "content-page": {
      1: {
        id: "content-page",
        version: 1,
        label: "Content page",
        roles: {
          "header": { type: "section", required: true, unique: true },
          "title": { type: "heading", required: true, unique: true },
          "standfirst": { type: "rich-text", required: true, unique: true },
          "hero-section": { type: "section", required: true, unique: true },
          "hero": { type: "image", required: true, unique: true },
          "content": { type: "section", required: true, unique: true },
          "columns": { type: "two-column", required: true, unique: true },
          // The sectioned body: one or more text blocks, with optional
          // section headings between them.
          "body": { type: "rich-text", required: true, unique: false },
          "section-heading": { type: "heading", required: false, unique: false },
          // Content-page-only call to action panel.
          "cta-heading": { type: "heading", required: true, unique: true },
          "cta-text": { type: "rich-text", required: true, unique: true },
          "cta": { type: "button", required: true, unique: true }
        },
        metadata: withCommon( {} )
      },
      // v2 (CON-T-039): each body section is a section element holding its
      // heading and text, so a section moves, duplicates and deletes as
      // one unit. v1 stays defined for pages already pinned to it.
      2: {
        id: "content-page",
        version: 2,
        label: "Content page",
        roles: {
          "header": { type: "section", required: true, unique: true },
          "title": { type: "heading", required: true, unique: true },
          "standfirst": { type: "rich-text", required: true, unique: true },
          "hero-section": { type: "section", required: true, unique: true },
          "hero": { type: "image", required: true, unique: true },
          "content": { type: "section", required: true, unique: true },
          "columns": { type: "two-column", required: true, unique: true },
          "body": { type: "rich-text", required: true, unique: false },
          "content-section": { type: "section", required: false, unique: false },
          "section-heading": { type: "heading", required: false, unique: false },
          "cta-heading": { type: "heading", required: true, unique: true },
          "cta-text": { type: "rich-text", required: true, unique: true },
          "cta": { type: "button", required: true, unique: true }
        },
        metadata: withCommon( {} )
      }
    },
    // PHW-T-002: a site's existing page, adopted with its own markup kept
    // intact in one Existing HTML block. Any site may adopt its pages, so
    // the site configuration need not list it. Its title is page detail.
    "existing-page": {
      1: {
        id: "existing-page",
        version: 1,
        label: "Existing page",
        roles: {
          "page-html": { type: "html", required: true, unique: true }
        },
        metadata: withCommon( {
          title: { type: "text", max: 200, default: "" }
        } )
      }
    }
  };

  var EXISTING_HTML_FORMAT = "existing-html-v1";

  function getTemplate( id, version ) {
    if( !templates.hasOwnProperty( id ) || !templates[ id ].hasOwnProperty( version ) ) return null;
    return templates[ id ][ version ];
  }

  function latestVersion( id ) {
    if( !templates.hasOwnProperty( id ) ) return null;
    var versions = Object.keys( templates[ id ] ).map( Number );
    return Math.max.apply( null, versions );
  }

  function richText( html ) {
    return { format: RICH_TEXT_FORMAT, html: html || "" };
  }

  function element( type, role, fields, extra ) {
    var overrides = { role: role, fields: fields };
    for( var key in extra || {} ) overrides[ key ] = extra[ key ];
    return Schema.createElement( type, overrides );
  }

  function heroElement( content ) {
    return element( "image", "hero", {
      mediaId: null,
      mediaUrl: content.heroUrl || "",
      alt: content.heroAlt || "",
      decorative: !!content.heroDecorative
    } );
  }

  function headerSection( content ) {
    return element( "section", "header", {}, { children: [
      element( "heading", "title", { text: content.title || "", level: "h1" } ),
      element( "rich-text", "standfirst", { body: richText( content.standfirst ) } )
    ] } );
  }

  function ctaColumn( content ) {
    var cta = content.cta || {};
    return [
      element( "heading", "cta-heading", { text: cta.heading || "How can we help?", level: "h3" } ),
      element( "rich-text", "cta-text", { body: richText( cta.html || "<p>Take the next step when you are ready.</p>" ) } ),
      element( "button", "cta", { text: cta.text || "Get in touch", href: cta.href || "" } )
    ];
  }

  function contentPageFrame( content, columnA ) {
    return [
      headerSection( content ),
      element( "section", "hero-section", {}, { children: [ heroElement( content ) ] } ),
      element( "section", "content", {}, { children: [
        element( "two-column", "columns", {}, { slots: { columnA: columnA, columnB: ctaColumn( content ) } } )
      ] } )
    ];
  }

  // builders[templateId][version](content) -> the root's children.
  var builders = { "blog-article": {}, "content-page": {}, "existing-page": {} };

  // content: { title, html, scripts } - html already cleaned.
  builders[ "existing-page" ][ 1 ] = function( content ) {
    return [ element( "html", "page-html", { html: { format: EXISTING_HTML_FORMAT, html: content.html || "" }, scripts: ( content.scripts || [] ).slice() } ) ];
  };

  // content: { title, standfirst, heroUrl, heroAlt, heroDecorative, bodyHtml }
  builders[ "blog-article" ][ 1 ] = function( content ) {
    return [
      headerSection( content ),
      element( "section", "hero-section", {}, { children: [ heroElement( content ) ] } ),
      element( "section", "content", {}, { children: [
        element( "rich-text", "body", { body: richText( content.bodyHtml ) } )
      ] } )
    ];
  };

  // content: { title, standfirst, hero..., introHtml, sections: [{heading, html}],
  //            cta: { heading, html, text, href } }
  builders[ "content-page" ][ 1 ] = function( content ) {
    var columnA = [ element( "rich-text", "body", { body: richText( content.introHtml ) } ) ];
    ( content.sections || [] ).forEach( function( section ) {
      columnA.push( element( "heading", "section-heading", { text: section.heading || "", level: "h2" } ) );
      columnA.push( element( "rich-text", "body", { body: richText( section.html ) } ) );
    } );
    return contentPageFrame( content, columnA );
  };

  builders[ "content-page" ][ 2 ] = function( content ) {
    var columnA = [ element( "rich-text", "body", { body: richText( content.introHtml ) } ) ];
    ( content.sections || [] ).forEach( function( section ) {
      columnA.push( element( "section", "content-section", {}, { children: [
        element( "heading", "section-heading", { text: section.heading || "", level: "h2" } ),
        element( "rich-text", "body", { body: richText( section.html ) } )
      ] } ) );
    } );
    return contentPageFrame( content, columnA );
  };

  // A new, empty section for a content page body (v2 and later).
  function createContentSection( heading ) {
    return element( "section", "content-section", {}, { children: [
      element( "heading", "section-heading", { text: heading || "New section", level: "h2" } ),
      element( "rich-text", "body", { body: richText( "<p></p>" ) } )
    ] } );
  }

  function defaultMetadata( template ) {
    var metadata = {};
    for( var key in template.metadata ) {
      var value = template.metadata[ key ].default;
      metadata[ key ] = Array.isArray( value ) ? value.slice() : value;
    }
    return metadata;
  }

  // Creates a new page from a template for the site described by the
  // trusted siteConfig. Throws, creating nothing, if the config is invalid
  // or the site does not offer the template - a missing or broken config
  // must never fall back to some other site's theme.
  // options.version picks an older template version (tests, migrations);
  // new pages normally use the latest.
  function createPage( templateId, siteConfig, content, options ) {
    content = content || {};
    var configErrors = Themes.validateSiteConfig( siteConfig );
    if( configErrors.length > 0 ) throw "Invalid site configuration: " + configErrors.join( "; " );
    if( siteConfig.templates.indexOf( templateId ) === -1 && templateId !== "existing-page" ) throw "This site does not offer the '" + templateId + "' template";
    var version = ( options && options.version ) || latestVersion( templateId );
    var template = getTemplate( templateId, version );
    if( !template ) throw "Unknown template '" + templateId + "' v" + version;

    var page = Schema.createPage( content.title || "", content.slug || "" );
    page.template = { id: templateId, version: version };
    page.theme = { id: siteConfig.theme.id, version: siteConfig.theme.version };
    page.metadata = defaultMetadata( template );
    for( var key in content.metadata || {} ) page.metadata[ key ] = content.metadata[ key ];
    page.root.children = builders[ templateId ][ version ]( content );
    if( templateId === "existing-page" ) {
      page.metadata.title = content.title || "";
      page.layout.templateMode = "own"; // CON-B-003: keeps its own template
    }
    return page;
  }

  function eachElement( root, visit ) {
    visit( root );
    Schema.childGroups( root ).forEach( function( group ) {
      group.items.forEach( function( child ) { eachElement( child, visit ); } );
    } );
  }

  function findByRole( page, role ) {
    var found = [];
    eachElement( page.root, function( item ) { if( item.role === role ) found.push( item ); } );
    return found;
  }

  // The title element is the page's title; page.title is a copy for
  // listings until page persistence (CON-T-024) keeps it in step.
  function getTitle( page ) {
    if( page.template && page.template.id === "existing-page" ) return ( page.metadata && page.metadata.title ) || page.title || "";
    var titles = findByRole( page, "title" );
    return titles.length ? titles[ 0 ].fields.text : page.title;
  }

  function validateMetadataValue( key, spec, value ) {
    var errors = [];
    var label = "metadata." + key;
    if( spec.type === "text" ) {
      if( typeof value !== "string" ) errors.push( label + " must be text" );
      else if( value.length > spec.max ) errors.push( label + " must be at most " + spec.max + " characters" );
    } else if( spec.type === "date" ) {
      if( value !== "" && !( typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test( value ) ) ) errors.push( label + " must be a YYYY-MM-DD date or empty" );
    } else if( spec.type === "list" || spec.type === "pathList" ) {
      if( !Array.isArray( value ) ) {
        errors.push( label + " must be a list" );
      } else {
        if( value.length > spec.max ) errors.push( label + " may have at most " + spec.max + " items" );
        value.forEach( function( item ) {
          if( typeof item !== "string" || item.length === 0 ) errors.push( label + " items must be non-empty text" );
          else if( spec.type === "list" && item.length > spec.itemMax ) errors.push( label + " items must be at most " + spec.itemMax + " characters" );
          else if( spec.type === "pathList" && !/^\/[A-Za-z0-9_\/-]*$/.test( item ) ) errors.push( label + " item '" + item + "' must be a site path like /Blog/my-article" );
        } );
      }
    }
    return errors;
  }

  // Structural validation of a templated page: its pins, element tree,
  // template slots and metadata. Publication checks (alt text, link
  // targets, slug uniqueness) belong to the publish pipeline (CON-T-029/040).
  function validatePage( page ) {
    var errors = [];
    if( !page.template ) return [ "Page has no template" ];
    var template = getTemplate( page.template.id, page.template.version );
    if( !template ) return [ "Unknown template " + page.template.id + " v" + page.template.version ];
    if( !page.theme || Themes.getTheme( page.theme.id, page.theme.version ) === null ) {
      errors.push( "Page must pin a published theme version" );
    }
    errors = errors.concat( Definitions.validatePage( page ) );

    var counts = {};
    eachElement( page.root, function( item ) {
      if( !item.role ) return;
      var spec = template.roles[ item.role ];
      if( !spec ) {
        errors.push( "Element " + item.id + " has role '" + item.role + "', which the " + template.label + " template does not define" );
        return;
      }
      if( item.type !== spec.type ) errors.push( "Role '" + item.role + "' must be a " + spec.type + ", not a " + item.type );
      counts[ item.role ] = ( counts[ item.role ] || 0 ) + 1;
    } );
    for( var role in template.roles ) {
      var spec = template.roles[ role ];
      if( spec.required && !counts[ role ] ) errors.push( "Missing required '" + role + "' element" );
      if( spec.unique && counts[ role ] > 1 ) errors.push( "Only one '" + role + "' element is allowed" );
    }

    var metadata = page.metadata || {};
    for( var key in metadata ) {
      if( !template.metadata.hasOwnProperty( key ) ) errors.push( "metadata." + key + " is not a field of the " + template.label + " template" );
    }
    for( var field in template.metadata ) {
      if( !metadata.hasOwnProperty( field ) ) errors.push( "metadata." + field + " is missing" );
      else errors = errors.concat( validateMetadataValue( field, template.metadata[ field ], metadata[ field ] ) );
    }
    if( page.slug && !/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test( page.slug ) ) {
      errors.push( "slug may only use letters, digits, hyphens and underscores" );
    }
    return errors;
  }

  var MONTHS = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

  // Fixed format, no locale lookup, so rendering stays deterministic.
  function formatDate( isoDate ) {
    var parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec( isoDate || "" );
    if( !parts ) return "Draft";
    return Number( parts[ 3 ] ) + " " + MONTHS[ Number( parts[ 2 ] ) - 1 ] + " " + parts[ 1 ];
  }

  function readMinutes( page ) {
    var words = 0;
    findByRole( page, "body" ).forEach( function( item ) {
      var text = ( ( item.fields.body || {} ).html || "" ).replace( /<[^>]*>/g, " " ).trim();
      if( text ) words += text.split( /\s+/ ).length;
    } );
    return Math.max( 1, Math.ceil( words / 220 ) );
  }

  // Renders a templated page: the element tree through ContentEditorRenderer,
  // plus the parts the template draws from metadata - the category kicker,
  // the article byline and tags. Same page in, same HTML out.
  function renderPage( page ) {
    var template = getTemplate( page.template.id, page.template.version );
    // An existing page is its own markup in the site's own design: no
    // template wrapper or theme CSS.
    if( template.id === "existing-page" ) {
      return "<div class=\"ce-existing-page\"" + Renderer.elementAttrs( page.root ) + ">" +
        page.root.children.map( function( child ) { return Renderer.renderElement( child ); } ).join( "" ) + "</div>";
    }
    var metadata = page.metadata || {};
    var escape = Renderer.escapeHtml;
    var isArticle = template.id === "blog-article";
    var html = "";
    page.root.children.forEach( function( section ) {
      if( section.role === "header" && metadata.category ) {
        html += "<p class=\"ce-kicker\">" + escape( metadata.category ) + "</p>";
      }
      html += Renderer.renderElement( section );
      if( section.role === "header" && isArticle ) {
        html += "<p class=\"ce-byline\">By " + escape( metadata.author || "Author" ) + " · " +
          escape( formatDate( metadata.publishDate ) ) + " · " + readMinutes( page ) + " min read</p>";
      }
    } );
    if( isArticle && metadata.tags && metadata.tags.length ) {
      html += "<p class=\"ce-tags\">" + escape( metadata.tags.join( ", " ) ) + "</p>";
    }
    return "<div class=\"ce-template ce-template--" + escape( template.id ) + "\">" +
      "<div class=\"ce-page\"" + Renderer.elementAttrs( page.root ) + ">" + html + "</div></div>";
  }

  // The prototype's own example content, used for demos and tests.
  var examples = {
    "blog-article": {
      title: "Designing tools around real work",
      slug: "designing-tools-around-real-work",
      standfirst: "<p>The most useful features often begin with a small frustration noticed at just the right moment.</p>",
      heroAlt: "",
      heroDecorative: true,
      bodyHtml: "<p>Good ideas are often hiding in ordinary routines. A task feels harder than it should, someone finds a clever workaround, and a better way begins to take shape.</p>" +
        "<h2>Notice the moment</h2><p>Look for the points where someone pauses, repeats a step, or needs to find information elsewhere. That moment is a useful place to start.</p>" +
        "<h2>Make the first version</h2><p>Give readers a direct opening, useful headings and a clear next step. Keep the first version focused, then learn from what people actually do.</p>",
      metadata: {
        category: "Design & workflow",
        summary: "A practical look at finding useful ideas in the work people already do.",
        author: "Nicholas Cross",
        tags: [ "Tools", "Design" ]
      }
    },
    "content-page": {
      title: "Telecommunications & wayleaves",
      slug: "TelecommunicationsWayleaves",
      standfirst: "<p>Specialist property advice for infrastructure and telecommunications matters.</p>",
      heroAlt: "",
      heroDecorative: true,
      introHtml: "<p>Telecommunications infrastructure can involve complex property interests and agreements. This page explains the scope of the service and gives visitors a clear route to make an enquiry.</p>",
      sections: [
        { heading: "Property interests", html: "<p>Outline the land, buildings and infrastructure matters covered by the service.</p>" },
        { heading: "Agreements and negotiations", html: "<p>Explain how the team supports discussions, reviews and ongoing management.</p>" },
        { heading: "How to get started", html: "<p>Tell prospective clients what information to include when they get in touch.</p>" }
      ],
      cta: { text: "Contact our team", href: "/ContactUs" },
      metadata: {
        category: "Our services",
        summary: "Specialist property advice for telecommunications infrastructure and wayleaves."
      }
    }
  };

  var api = {
    RICH_TEXT_FORMAT: RICH_TEXT_FORMAT,
    templates: templates,
    examples: examples,
    getTemplate: getTemplate,
    latestVersion: latestVersion,
    createPage: createPage,
    createContentSection: createContentSection,
    findByRole: findByRole,
    EXISTING_HTML_FORMAT: EXISTING_HTML_FORMAT,
    getTitle: getTitle,
    validatePage: validatePage,
    formatDate: formatDate,
    renderPage: renderPage
  };

  if( typeof module !== "undefined" && module.exports ) module.exports = api;
  if( typeof window !== "undefined" ) window.ContentEditorTemplates = api;
  return api;
})(
  typeof require !== "undefined" ? require("./schema.js") : window.ContentEditorSchema,
  typeof require !== "undefined" ? require("./element-definitions.js") : window.ContentEditorElementDefinitions,
  typeof require !== "undefined" ? require("./renderer.js") : window.ContentEditorRenderer,
  typeof require !== "undefined" ? require("./themes.js") : window.ContentEditorThemes
);
