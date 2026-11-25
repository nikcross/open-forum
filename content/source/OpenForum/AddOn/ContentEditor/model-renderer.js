/*
* ContentEditorRenderer
* Deterministic page-model -> HTML renderer (FR-PUB-007, section 7.2).
* Every rendered element/field carries data-element-id/data-field-id so the
* selection layer (CON-T-009) can map DOM nodes back to model nodes. Pure
* function of its input: same model in, same HTML out, every time.
*/
var ContentEditorRenderer = (function(Schema, Definitions, Tokens) {

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // CON-T-017/018: maps one resolved (already-validated) CSS value for a
  // style-control key onto the real CSS declarations it produces. alignment
  // is handled differently for text elements (text-align on the element's
  // own text) versus block/inline elements like button and image (which
  // need to be repositioned as a whole box via display+margin, since
  // text-align has no effect on an element's own position).
  function declarationsForControl(element, controlKey, cssValue) {
    switch (controlKey) {
      case "background":
        return ["background-color: " + cssValue];
      case "spacingTop":
        return ["padding-top: " + cssValue];
      case "spacingBottom":
        return ["padding-bottom: " + cssValue];
      case "maxWidth":
        return ["max-width: " + cssValue, "margin-left: auto", "margin-right: auto"];
      case "width":
        return ["width: " + cssValue];
      case "alignment":
        if (element.type === "heading" || element.type === "rich-text") {
          return ["text-align: " + cssValue];
        }
        if (cssValue === "center") return ["display: block", "width: fit-content", "margin-left: auto", "margin-right: auto"];
        if (cssValue === "right") return ["display: block", "width: fit-content", "margin-left: auto", "margin-right: 0"];
        return ["display: block", "width: fit-content", "margin-left: 0", "margin-right: auto"];
      default:
        return [];
    }
  }

  // Only ever resolves style-control keys the element's own definition
  // declares in styleControls (FR-STYLE-001: only permitted controls are
  // shown/applied - enforced here at render time, not just hidden in the
  // inspector UI, matching how containment is enforced in
  // ContentEditorElementDefinitions rather than left to the UI alone).
  function resolveBaseStyleDeclarations(element) {
    var def = Definitions.getDefinition(element.type);
    var allowedControls = (def && def.styleControls) || [];
    var declarations = [];
    allowedControls.forEach(function(controlKey) {
      var raw = element.style && element.style[controlKey];
      var tokenValue = Tokens.getStyleValueAt(raw, "base");
      var cssValue = Tokens.resolve(controlKey, tokenValue);
      if (!cssValue) return; // empty or unrecognised token - never reaches output (FR-STYLE-006)
      declarations = declarations.concat(declarationsForControl(element, controlKey, cssValue));
    });
    return declarations;
  }

  function styleAttr(element, extra) {
    var declarations = resolveBaseStyleDeclarations(element).concat(extra || []);
    return declarations.length ? " style=\"" + escapeHtml(declarations.join("; ")) + "\"" : "";
  }

  // CON-T-022: an image's crop and focal point, kept on the element and
  // drawn with CSS, so the original file is never changed. Both fields are
  // optional (pages saved before them render exactly as before); unknown
  // crops are ignored and the focal point is clamped to 0-100%.
  var IMAGE_CROPS = [
    { value: "original", label: "Original shape", ratio: null },
    { value: "16:9", label: "Wide (16:9)", ratio: "16 / 9" },
    { value: "3:2", label: "Landscape (3:2)", ratio: "3 / 2" },
    { value: "4:3", label: "Classic (4:3)", ratio: "4 / 3" },
    { value: "1:1", label: "Square (1:1)", ratio: "1 / 1" },
    { value: "4:5", label: "Portrait (4:5)", ratio: "4 / 5" }
  ];

  function focusPercent(value) {
    var n = Math.round(Number(value));
    return isFinite(n) ? Math.max(0, Math.min(100, n)) : 50;
  }

  // { x, y } in whole percent; the centre when none is set.
  function imageFocus(element) {
    var focus = field(element, "focus");
    if (!focus || typeof focus !== "object") return { x: 50, y: 50 };
    return { x: focusPercent(focus.x), y: focusPercent(focus.y) };
  }

  function imageCropDeclarations(element) {
    var declarations = [];
    var chosen = IMAGE_CROPS.filter(function(c) { return c.value === field(element, "crop") && c.ratio; })[0];
    if (chosen) declarations.push("aspect-ratio: " + chosen.ratio, "object-fit: cover");
    var focus = imageFocus(element);
    if (focus.x !== 50 || focus.y !== 50) declarations.push("object-position: " + focus.x + "% " + focus.y + "%");
    return declarations;
  }

  // PHW-T-002: the fragments that &insert: parts of existing markup show in
  // the canvas, { path: html }, given by the editor (the server never needs
  // them: published markup keeps its &insert: directives).
  var insertFragments = {};
  function setInsertFragments(map) { insertFragments = map || {}; }

  function existingHtmlModule() {
    if (typeof window !== "undefined" && window.ContentEditorExistingHtml) return window.ContentEditorExistingHtml;
    return typeof require !== "undefined" ? require("./existing-html.js") : null;
  }

  // data-role is only present on elements a template placed in one of its
  // slots (CON-T-038), so pages without templates render exactly as before.
  function elementAttrs(element, extraStyle) {
    return " data-element-id=\"" + escapeHtml(element.id) + "\"" +
      " data-element-type=\"" + escapeHtml(element.type) + "\"" +
      (element.role ? " data-role=\"" + escapeHtml(element.role) + "\"" : "") +
      styleAttr(element, extraStyle);
  }

  function renderGroup(group) {
    return group.items.map(renderElement).join("");
  }

  function renderChildren(element) {
    return Schema.childGroups(element).map(renderGroup).join("");
  }

  function field(element, name) {
    return (element.fields && element.fields[name] !== undefined) ? element.fields[name] : undefined;
  }

  function renderElement(element) {
    var attrs = elementAttrs(element);

    switch (element.type) {
      case "page-root":
        return "<div class=\"ce-page\"" + attrs + ">" + renderChildren(element) + "</div>";

      case "section":
        return "<section class=\"ce-section\"" + attrs + ">" + renderChildren(element) + "</section>";

      case "heading": {
        var level = field(element, "level") || "h2";
        return "<" + level + " class=\"ce-heading\"" + attrs + " data-field-id=\"text\">" +
          escapeHtml(field(element, "text")) + "</" + level + ">";
      }

      case "rich-text": {
        var body = field(element, "body") || {};
        return "<div class=\"ce-rich-text\"" + attrs + " data-field-id=\"body\">" + (body.html || "") + "</div>";
      }

      case "image": {
        // No image chosen yet: a placeholder box rather than a broken
        // <img src=""> (a new image element, or a template's empty cover).
        if (!field(element, "mediaUrl")) {
          return "<div class=\"ce-image ce-image-empty\"" + attrs + " data-field-id=\"mediaId\"></div>";
        }
        var decorative = !!field(element, "decorative");
        var alt = decorative ? "" : escapeHtml(field(element, "alt"));
        var crop = imageCropDeclarations(element);
        if (crop.length) attrs = elementAttrs(element, crop);
        return "<img class=\"ce-image\"" + attrs + " data-field-id=\"mediaId\"" +
          " src=\"" + escapeHtml(field(element, "mediaUrl") || "") + "\" alt=\"" + alt + "\"" +
          (decorative ? " role=\"presentation\"" : "") + "/>";
      }

      case "button":
        return "<a class=\"ce-button\"" + attrs + " data-field-id=\"text\" href=\"" +
          escapeHtml(field(element, "href")) + "\">" + escapeHtml(field(element, "text")) + "</a>";

      case "two-column": {
        var groups = Schema.childGroups(element);
        return "<div class=\"ce-two-column\"" + attrs + ">" +
          groups.map(function(group) {
            return "<div class=\"ce-column\" data-slot=\"" + escapeHtml(group.slot) + "\">" + renderGroup(group) + "</div>";
          }).join("") +
          "</div>";
      }

      case "layout":
        return "<div class=\"ce-layout\"" + attrs + ">" + renderChildren(element) + "</div>";

      // The marker comment is where a layout's template puts &content;
      // (CON-T-047); the editor shows the empty slot as a placeholder.
      case "content-slot":
        return "<div class=\"ce-content-slot\"" + attrs + "><!--ce-content-slot--></div>";

      // PHW-T-002: existing markup, with its &insert: parts expanded into
      // locked parts for the editor.
      case "html": {
        var markup = (field(element, "html") || {}).html || "";
        var existing = existingHtmlModule();
        return "<div class=\"ce-existing-html\"" + attrs + " data-field-id=\"html\">" +
          (existing ? existing.forCanvas(markup, insertFragments) : markup) + "</div>";
      }

      case "component":
        return "<div class=\"ce-component\"" + attrs + " data-component=\"" + escapeHtml(field(element, "componentId") || "") + "\">" +
          renderChildren(element) + "</div>";

      case "spacer":
        return "<div class=\"ce-spacer\"" + attrs + " data-spacing=\"" + escapeHtml(field(element, "height")) + "\"></div>";

      default:
        return "<!-- unknown element type: " + escapeHtml(element.type) + " -->";
    }
  }

  function renderPage(pageModel) {
    return renderElement(pageModel.root);
  }

  // The base value (resolveBaseStyleDeclarations/styleAttr) is rendered as
  // a plain inline style="" attribute, which has higher CSS specificity
  // than any selector-based rule - including one inside a matching @media
  // block - so a responsive override can never actually win against it
  // without !important. Confirmed live: without this, the override CSS was
  // present and structurally correct, and the iframe's own viewport was
  // genuinely narrower than the breakpoint, but the base colour still won
  // every time. Scoped to just the override declarations (never the base
  // ones), so this doesn't affect ordinary specificity anywhere else.
  function withImportant(declarations) {
    return declarations.map(function(d) { return d + " !important"; });
  }

  // CON-T-018 (FR-STYLE-005): walks the whole page collecting any tablet/
  // phone overrides that genuinely differ from the base value, and returns
  // them as real @media CSS text scoped by data-element-id - not a fake
  // "preview mode" switch, but actual media queries that respond to the
  // canvas iframe's own real viewport width. Tablet rules are always
  // emitted before phone rules (source order matters for equal-specificity
  // max-width queries that both match at the narrowest widths), so a phone
  // viewport correctly gets the more specific phone value.
  function renderResponsiveCss(pageModel) {
    var rules = { tablet: [], phone: [] };

    function walk(element) {
      var def = Definitions.getDefinition(element.type);
      var allowedControls = (def && def.styleControls) || [];
      allowedControls.forEach(function(controlKey) {
        var raw = element.style && element.style[controlKey];
        if (!raw) return;
        var baseToken = Tokens.getStyleValueAt(raw, "base");
        ["tablet", "phone"].forEach(function(breakpoint) {
          var overrideToken = Tokens.getStyleValueAt(raw, breakpoint);
          if (!overrideToken || overrideToken === baseToken) return; // no real override at this breakpoint
          var cssValue = Tokens.resolve(controlKey, overrideToken);
          if (!cssValue) return; // invalid/unrecognised token - never reaches output (FR-STYLE-006)
          var declarations = withImportant(declarationsForControl(element, controlKey, cssValue));
          if (declarations.length === 0) return;
          rules[breakpoint].push(
            "[data-element-id=\"" + escapeHtml(element.id) + "\"]{" + declarations.join(";") + ";}"
          );
        });
      });
      Schema.childGroups(element).forEach(function(group) {
        group.items.forEach(walk);
      });
    }
    walk(pageModel.root);

    var css = "";
    if (rules.tablet.length) css += "@media " + Tokens.BREAKPOINT_MEDIA.tablet + "{" + rules.tablet.join("") + "}";
    if (rules.phone.length) css += "@media " + Tokens.BREAKPOINT_MEDIA.phone + "{" + rules.phone.join("") + "}";
    return css;
  }

  var api = {
    renderPage: renderPage,
    renderElement: renderElement,
    renderResponsiveCss: renderResponsiveCss,
    elementAttrs: elementAttrs,
    IMAGE_CROPS: IMAGE_CROPS,
    setInsertFragments: setInsertFragments,
    imageFocus: imageFocus,
    escapeHtml: escapeHtml
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof window !== "undefined") window.ContentEditorRenderer = api;
  return api;
})(
  typeof require !== "undefined" ? require("./schema.js") : window.ContentEditorSchema,
  typeof require !== "undefined" ? require("./element-definitions.js") : window.ContentEditorElementDefinitions,
  typeof require !== "undefined" ? require("./style-tokens.js") : window.ContentEditorStyleTokens
);
