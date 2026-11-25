/*
* ContentEditorThemes
* Versioned site themes and trusted site configuration for the Blog Article
* and Content/Service Page templates (CON-T-038, CON-R-017).
*
* A theme is a small set of approved tokens (colours and a display font),
* never freeform CSS. Each published theme version is immutable: a page
* pins the {id, version} it was created with, so changing a site's current
* theme can never restyle an existing page without an explicit migration.
* The starting tokens are the site palettes from the reusable-blog-editor
* prototype.
*
* The site config is trusted deployment configuration, not an editor field:
* it names the site, its current theme version, which templates the site
* offers and where it publishes. There is no website selector - each site
* supplies its own config.
*/
var ContentEditorThemes = (function() {

  // Display fonts a theme may use. Web fonts are not loaded by the editor
  // canvas (its CSP only allows the site's own origin), so each entry ends
  // in a safe fallback.
  var DISPLAY_FONTS = {
    "georgia": "Georgia, serif",
    "dm-serif-display": "'DM Serif Display', Georgia, serif",
    "palatino": "'Palatino Linotype', Palatino, 'Book Antiqua', serif",
    "system-sans": "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
    "arial": "Arial, sans-serif"
  };

  // Body text fonts (CON-T-050). A theme without one uses Arial.
  var BODY_FONTS = {
    "arial": "Arial, sans-serif",
    "system-sans": "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
    "verdana": "Verdana, Geneva, sans-serif",
    "georgia": "Georgia, serif"
  };

  // A site icon is a site path or an https address (CON-T-050).
  var ICON_URL = /^(\/[A-Za-z0-9_\/.-]+|https:\/\/[^\s"'<>()]+)$/;

  var COLOUR_TOKENS = [ "accent", "soft", "paper", "ink", "muted" ];

  // themes[id][version] - never edit a published version, add a new one.
  var themes = {
    "wet-wired-tools": { 1: { name: "Wet-Wired Tools", accent: "#286d9c", soft: "#e3eef4", paper: "#f4f6f6", ink: "#18232e", muted: "#596978", display: "georgia" } },
    "twisted-sheep": { 1: { name: "Twisted Sheep", accent: "#a35e46", soft: "#f2e5d7", paper: "#faf6ee", ink: "#352b28", muted: "#685e58", display: "dm-serif-display" } },
    "at-my-gate": { 1: { name: "At My Gate", accent: "#497b48", soft: "#e6efdb", paper: "#f7f6ee", ink: "#21372e", muted: "#596a5c", display: "dm-serif-display" } },
    "rensmart": { 1: { name: "RenSMART", accent: "#087e75", soft: "#dcefeb", paper: "#f3f7f5", ink: "#183b37", muted: "#536b68", display: "georgia" } },
    "powis-hughes": { 1: { name: "Powis Hughes", accent: "#365f69", soft: "#e5ecec", paper: "#f4f3f0", ink: "#252c30", muted: "#5f696c", display: "georgia" } },
    "neutral": { 1: { name: "Neutral", accent: "#256e56", soft: "#e7eee5", paper: "#f7f4ed", ink: "#182726", muted: "#52615d", display: "dm-serif-display" } }
  };

  var TEMPLATE_IDS = [ "blog-article", "content-page", "existing-page" ];
  var BUILT_IN = Object.keys( themes );

  function isColour( value ) {
    return typeof value === "string" && /^#[0-9a-f]{6}$/i.test( value );
  }

  function validateTheme( theme ) {
    var errors = [];
    if( !theme || typeof theme !== "object" ) return [ "Theme is missing" ];
    for( var i = 0; i < COLOUR_TOKENS.length; i++ ) {
      if( !isColour( theme[ COLOUR_TOKENS[ i ] ] ) ) errors.push( "Theme colour '" + COLOUR_TOKENS[ i ] + "' must be a #rrggbb value" );
    }
    if( !DISPLAY_FONTS.hasOwnProperty( theme.display ) ) errors.push( "Theme display font '" + theme.display + "' is not an approved font" );
    if( theme.body !== undefined && !BODY_FONTS.hasOwnProperty( theme.body ) ) errors.push( "Theme body font '" + theme.body + "' is not an approved font" );
    if( theme.icon !== undefined && theme.icon !== "" && !ICON_URL.test( String( theme.icon ) ) ) errors.push( "The site icon must be a site path or an https:// address" );
    return errors;
  }

  // Adds a site style version from the site library (CON-T-050) as a theme.
  // Built-in themes and versions already known are never replaced.
  function registerTheme( id, version, theme ) {
    if( !/^[a-z0-9-]{1,60}$/.test( id ) || !( version > 0 ) ) throw "Not a theme version: " + id + " v" + version;
    var problems = validateTheme( theme );
    if( problems.length ) throw problems.join( "; " );
    if( !themes.hasOwnProperty( id ) ) themes[ id ] = {};
    else if( BUILT_IN.indexOf( id ) !== -1 ) throw "Theme " + id + " is built in";
    if( !themes[ id ].hasOwnProperty( version ) ) themes[ id ][ version ] = JSON.parse( JSON.stringify( theme ) );
    return themes[ id ][ version ];
  }

  function luminance( hex ) {
    var channels = [ 1, 3, 5 ].map( function( i ) {
      var c = parseInt( hex.substr( i, 2 ), 16 ) / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow( ( c + 0.055 ) / 1.055, 2.4 );
    } );
    return 0.2126 * channels[ 0 ] + 0.7152 * channels[ 1 ] + 0.0722 * channels[ 2 ];
  }

  function contrast( a, b ) {
    var la = luminance( a ), lb = luminance( b );
    return ( Math.max( la, lb ) + 0.05 ) / ( Math.min( la, lb ) + 0.05 );
  }

  // WCAG 2.2 AA contrast for the pairings the templates use (CON-R-014).
  function contrastWarnings( theme ) {
    if( validateTheme( theme ).length ) return [];
    var warnings = [];
    function check( fg, bg, minimum, text ) {
      var ratio = contrast( fg, bg );
      if( ratio < minimum ) warnings.push( text + " is " + ratio.toFixed( 1 ) + ":1; it needs " + minimum + ":1" );
    }
    check( theme.ink, theme.paper, 4.5, "Text on the page background" );
    check( theme.muted, theme.paper, 4.5, "Muted text on the page background" );
    check( theme.accent, theme.paper, 4.5, "Links in the accent colour on the page background" );
    check( "#ffffff", theme.accent, 4.5, "White button text on the accent colour" );
    check( theme.ink, theme.soft, 4.5, "Text on the soft panel colour" );
    return warnings;
  }

  function getTheme( id, version ) {
    if( !themes.hasOwnProperty( id ) || !themes[ id ].hasOwnProperty( version ) ) return null;
    return themes[ id ][ version ];
  }

  // Returns a list of problems; an empty list means the config is usable.
  function validateSiteConfig( config ) {
    var errors = [];
    if( !config || typeof config !== "object" ) return [ "Site configuration is missing" ];
    if( typeof config.siteId !== "string" || !/^[a-z0-9-]+$/.test( config.siteId ) ) errors.push( "siteId must be lower-case letters, digits and hyphens" );
    if( typeof config.name !== "string" || config.name.length === 0 ) errors.push( "name is required" );
    if( typeof config.baseUrl !== "string" || !/^https?:\/\/[^\s/]+$/.test( config.baseUrl ) ) errors.push( "baseUrl must be an http(s) origin with no path" );
    if( !config.theme || getTheme( config.theme.id, config.theme.version ) === null ) {
      errors.push( "theme must name a published theme version" );
    }
    if( !Array.isArray( config.templates ) || config.templates.length === 0 ) {
      errors.push( "templates must list at least one template" );
    } else {
      for( var i = 0; i < config.templates.length; i++ ) {
        if( TEMPLATE_IDS.indexOf( config.templates[ i ] ) === -1 ) errors.push( "Unknown template '" + config.templates[ i ] + "'" );
      }
    }
    var publishing = config.publishing || {};
    [ "articlePath", "pagePath" ].forEach( function( key ) {
      if( typeof publishing[ key ] !== "string" || !/^\/([A-Za-z0-9_-]+\/)*$/.test( publishing[ key ] ) ) {
        errors.push( "publishing." + key + " must be a site path starting and ending with /" );
      }
    } );
    return errors;
  }

  // CSS for the template layouts, from the prototype's article and page
  // designs. Only validated token values are interpolated, so no theme can
  // inject arbitrary CSS.
  function buildCss( theme ) {
    if( validateTheme( theme ).length > 0 ) return "";
    var display = DISPLAY_FONTS[ theme.display ];
    var body = BODY_FONTS[ theme.body || "arial" ];
    return ".ce-template{" +
        "--ce-accent:" + theme.accent + ";--ce-soft:" + theme.soft + ";--ce-paper:" + theme.paper + ";" +
        "--ce-ink:" + theme.ink + ";--ce-muted:" + theme.muted + ";--ce-display:" + display + ";--ce-body:" + body + ";" +
        "box-sizing:border-box;min-height:100%;background:var(--ce-paper);color:var(--ce-ink);font:16px/1.75 var(--ce-body);}" +
      ".ce-template *{box-sizing:border-box;}" +
      ".ce-template .ce-page{max-width:850px;margin:auto;padding:54px 25px 90px;}" +
      ".ce-template--content-page .ce-page{max-width:1050px;padding-top:52px;}" +
      ".ce-template .ce-kicker{margin:0;font:700 11px var(--ce-body);letter-spacing:.15em;text-transform:uppercase;color:var(--ce-accent);}" +
      ".ce-template h1,.ce-template h2,.ce-template h3,.ce-template blockquote{font-family:var(--ce-display);font-weight:400;letter-spacing:-.035em;}" +
      ".ce-template [data-role='title']{font-size:clamp(43px,7vw,78px);line-height:1.06;margin:20px 0;}" +
      ".ce-template [data-role='standfirst']{font-size:21px;line-height:1.45;color:var(--ce-muted);max-width:720px;}" +
      ".ce-template [data-role='standfirst'] p{margin:0;}" +
      ".ce-template .ce-byline{font:12px var(--ce-body);color:var(--ce-muted);margin:24px 0 36px;}" +
      ".ce-template [data-role='hero']{display:block;width:100%;height:300px;object-fit:cover;border-radius:11px;background:var(--ce-soft);}" +
      ".ce-template--content-page [data-role='hero']{height:250px;margin:30px 0;}" +
      ".ce-template [data-role='body']{max-width:690px;margin:50px auto 0;}" +
      ".ce-template--content-page [data-role='body']{max-width:none;margin:0;}" +
      ".ce-template [data-role='body'] p{margin:0 0 23px;}" +
      ".ce-template [data-role='body'] h2{font-size:38px;line-height:1.2;margin:52px 0 14px;}" +
      ".ce-template--content-page [data-role='body'] h2,.ce-template--content-page [data-role='section-heading']{font-size:34px;line-height:1.2;margin:35px 0 14px;}" +
      ".ce-template [data-role='body'] h3{font-size:27px;margin-top:35px;}" +
      ".ce-template [data-role='body'] blockquote{border-left:3px solid var(--ce-accent);padding-left:20px;font-size:28px;margin:35px 0;}" +
      ".ce-template [data-role='body'] a{color:var(--ce-accent);}" +
      ".ce-template [data-role='body'] ul,.ce-template [data-role='body'] ol{padding-left:24px;}" +
      ".ce-template .ce-tags{border-top:1px solid #d8e0df;margin-top:60px;padding-top:22px;color:var(--ce-muted);font:12px var(--ce-body);}" +
      ".ce-template [data-role='columns']{display:grid;grid-template-columns:minmax(0,1fr) 255px;gap:65px;margin-top:20px;}" +
      ".ce-template [data-role='columns']>[data-slot='columnB']{align-self:start;background:var(--ce-soft);border-radius:12px;padding:23px;}" +
      ".ce-template [data-role='cta-heading']{display:block;font:normal 25px var(--ce-display);margin:0 0 8px;}" +
      ".ce-template [data-role='cta-text']{font-size:13px;color:var(--ce-muted);}" +
      ".ce-template .ce-button{display:inline-block;text-decoration:none;background:var(--ce-accent);color:#fff;padding:9px 16px;border-radius:30px;font-size:14px;font-weight:bold;}" +
      ".ce-template [data-role='cta']{display:inline-block;text-decoration:none;background:var(--ce-accent);color:#fff;padding:9px 14px;border-radius:30px;font-size:13px;font-weight:bold;}" +
      "@media (max-width:700px){.ce-template [data-role='columns']{grid-template-columns:1fr;gap:24px;}}";
  }

  var api = {
    DISPLAY_FONTS: DISPLAY_FONTS,
    BODY_FONTS: BODY_FONTS,
    registerTheme: registerTheme,
    contrast: contrast,
    contrastWarnings: contrastWarnings,
    TEMPLATE_IDS: TEMPLATE_IDS,
    themes: themes,
    getTheme: getTheme,
    validateTheme: validateTheme,
    validateSiteConfig: validateSiteConfig,
    buildCss: buildCss
  };

  if( typeof module !== "undefined" && module.exports ) module.exports = api;
  if( typeof window !== "undefined" ) window.ContentEditorThemes = api;
  return api;
})();
