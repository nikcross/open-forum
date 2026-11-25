/*
* ContentEditorLayouts
* Turns a version of a site library layout (CON-T-047) into an OpenForum
* page.html.template. Each version is written once, as its own file on the
* library page, so a page that links to it keeps exactly that frame.
*
* The default page builder fills in fields (&title;, &content; ...) and then
* wiki-renders the whole template, so the layout's own markup and styles
* are in +++ no-markup blocks either side of &content; - the page's content
* is a block of its own (CON-T-044).
*
* templateFileName(id, version) -> "layout-<id>-v<version>.html.template"
* renderTemplate(layout, theme) -> template text
*   layout: { id, name, version, content } - content is the layout element.
*   theme: the site theme tokens to style it with (ContentEditorThemes).
* splitAtSlot(html) -> { before, after } around the content slot.
*/
var ContentEditorLayouts = (function(Renderer, Themes, Publication) {

  var SLOT_MARKER = "<!--ce-content-slot-->";
  // A layout's own parts sit in the same centred column as page content.
  var LAYOUT_CSS = ".ce-template--layout>.ce-layout>.ce-section,.ce-template--layout>.ce-layout>.ce-component,.ce-template--layout>.ce-layout>.ce-two-column" +
    "{max-width:1050px;margin:0 auto;padding:18px 25px;}" +
    ".ce-template--layout .ce-content-slot>.ce-template{min-height:0;}";
  var NO_MARKUP = Publication.NO_MARKUP;

  function templateFileName( id, version ) {
    if( !/^[a-z0-9-]{1,60}$/.test( id ) || !( version > 0 ) ) throw "Not a layout version: " + id + " v" + version;
    return "layout-" + id + "-v" + version + ".html.template";
  }

  function splitAtSlot( html ) {
    var at = html.indexOf( SLOT_MARKER );
    if( at === -1 || html.indexOf( SLOT_MARKER, at + 1 ) !== -1 ) throw "A layout needs exactly one place for the page content";
    return { before: html.substring( 0, at ), after: html.substring( at + SLOT_MARKER.length ) };
  }

  // The layout's markup and style, made safe for the wiki-rendered template.
  function block( html ) {
    return NO_MARKUP + Publication.toWikiSafe( html ) + NO_MARKUP;
  }

  function renderTemplate( layout, theme ) {
    var markup = Publication.cleanMarkup( Renderer.renderElement( layout.content ) );
    var parts = splitAtSlot( "<div class=\"ce-template ce-template--layout\" data-layout=\"" + Renderer.escapeHtml( layout.id ) + "\">" + markup + "</div>" );
    var css = ( theme ? Themes.buildCss( theme ) : "" ) + LAYOUT_CSS + Renderer.renderResponsiveCss( { root: layout.content } );
    var problems = Publication.checkOutput( Publication.toWikiSafe( "<style>" + css + "</style>" + parts.before + parts.after ) );
    if( problems.length ) throw "The layout cannot be published: " + problems.join( "; " );
    return "<!doctype html>\n" +
      "<!--Layout " + Publication.escapeField( layout.name ) + " (" + Renderer.escapeHtml( layout.id ) + ") version " + layout.version + ", written by the Content Editor. Edit the layout there; this file never changes.-->\n" +
      "<html lang=\"en\">\n" +
      "  <head>\n" +
      "    <meta charset=\"utf-8\" />\n" +
      "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n" +
      "    <title>&title;</title>\n" +
      ( theme && theme.icon ? "    <link rel=\"icon\" href=\"" + Publication.toWikiSafe( Renderer.escapeHtml( theme.icon ) ) + "\" />\n" : "" ) +
      "    <script type=\"text/javascript\" src=\"/OpenForum/Javascript/open-forum.js?ts=&time;\"></script>\n" +
      "    <script type=\"text/javascript\" src=\"&pageName;/page.js?ts=&time;\"></script>\n" +
      "    " + block( "<style>html,body{margin:0;}" + css + "</style>" ) + "\n" +
      "  </head>\n" +
      "  <body>\n" +
      "    " + block( parts.before ) + "\n" +
      "&content;\n" +
      "    " + block( parts.after ) + "\n" +
      "  </body>\n" +
      "</html>\n";
  }

  var api = {
    SLOT_MARKER: SLOT_MARKER,
    LAYOUT_CSS: LAYOUT_CSS,
    templateFileName: templateFileName,
    splitAtSlot: splitAtSlot,
    renderTemplate: renderTemplate
  };

  if( typeof module !== "undefined" && module.exports ) module.exports = api;
  if( typeof window !== "undefined" ) window.ContentEditorLayouts = api;
  return api;
})(
  typeof require !== "undefined" ? require("./renderer.js") : window.ContentEditorRenderer,
  typeof require !== "undefined" ? require("./themes.js") : window.ContentEditorThemes,
  typeof require !== "undefined" ? require("./publication.js") : window.ContentEditorPublication
);
