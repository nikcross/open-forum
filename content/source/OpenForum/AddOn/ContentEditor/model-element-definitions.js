/*
* ContentEditorElementDefinitions
* Registry of the MVP built-in page elements (requirements doc section 11.2)
* plus containment/field validation (FR-ELEM-005, FR-ELEM-006). Depends only
* on ContentEditorSchema's childGroups helper.
*/
var ContentEditorElementDefinitions = (function(Schema) {

  var definitions = {
    "page-root": {
      type: "page-root",
      version: 1,
      label: "Page",
      fields: {},
      allowedChildren: ["section", "component", "layout", "html"],
      styleControls: []
    },
    // PHW-T-002: an existing site page's own markup, kept intact and made
    // safe (ContentEditorExistingHtml). scripts are the page's original
    // external <script src> tags, kept unchanged and never run in the editor.
    "html": {
      type: "html",
      version: 1,
      label: "Existing HTML",
      fields: {
        html: { type: "existingHtml", default: { format: "existing-html-v1", html: "" } },
        scripts: { type: "list", default: [] }
      },
      allowedChildren: [],
      styleControls: []
    },
    "section": {
      type: "section",
      version: 1,
      label: "Section",
      fields: {},
      allowedChildren: ["heading", "rich-text", "image", "button", "two-column", "spacer", "component", "content-slot"],
      styleControls: ["background", "spacingTop", "spacingBottom", "maxWidth"]
    },
    "heading": {
      type: "heading",
      version: 1,
      label: "Heading",
      fields: {
        text: { type: "text", default: "Heading" },
        level: { type: "choice", options: ["h1", "h2", "h3", "h4"], default: "h2" }
      },
      allowedChildren: [],
      styleControls: ["alignment"]
    },
    "rich-text": {
      type: "rich-text",
      version: 1,
      label: "Rich Text",
      fields: {
        body: { type: "richText", default: { format: "editor-rich-text-v1", html: "" } }
      },
      allowedChildren: [],
      styleControls: ["spacingTop", "maxWidth"]
    },
    "image": {
      type: "image",
      version: 1,
      label: "Image",
      fields: {
        mediaId: { type: "media", default: null },
        alt: { type: "text", default: "" },
        decorative: { type: "boolean", default: false }
      },
      allowedChildren: [],
      styleControls: ["alignment", "width"]
    },
    "button": {
      type: "button",
      version: 1,
      label: "Button / Link",
      fields: {
        text: { type: "text", default: "Click here" },
        href: { type: "link", default: "" }
      },
      allowedChildren: [],
      styleControls: ["alignment"]
    },
    "two-column": {
      type: "two-column",
      version: 1,
      label: "Two Column Layout",
      fields: {},
      // section is allowed so a column can hold sections that move as one
      // unit (the content page's body sections, CON-T-039).
      allowedChildren: ["section", "heading", "rich-text", "image", "button", "spacer", "component", "content-slot"],
      slots: ["columnA", "columnB"],
      styleControls: ["spacingTop", "spacingBottom"]
    },
    // A component from the site library (CON-T-045). In the library it is
    // the component's container; placed in a page or another component it
    // is an instance holding a copy of one version, which is only changed
    // in the library.
    "component": {
      type: "component",
      version: 1,
      label: "Component",
      fields: {
        componentId: { type: "text", default: "" },
        componentVersion: { type: "number", default: null },
        name: { type: "text", default: "" }
      },
      allowedChildren: ["section", "heading", "rich-text", "image", "button", "two-column", "spacer", "component"],
      styleControls: ["background", "spacingTop", "spacingBottom", "maxWidth"]
    },
    // A page layout from the site library (CON-T-047): the frame published
    // as a page.html.template, with exactly one content slot where each
    // page's own content goes. Only ever edited in the library.
    "layout": {
      type: "layout",
      version: 1,
      label: "Layout",
      fields: {},
      allowedChildren: ["section", "heading", "rich-text", "image", "button", "two-column", "spacer", "component", "content-slot"],
      styleControls: ["background"]
    },
    "content-slot": {
      type: "content-slot",
      version: 1,
      label: "Page content",
      fields: {},
      allowedChildren: [],
      styleControls: ["spacingTop", "spacingBottom"]
    },
    "spacer": {
      type: "spacer",
      version: 1,
      label: "Spacer / Divider",
      fields: {
        height: { type: "spacingToken", default: "space-4" }
      },
      allowedChildren: [],
      styleControls: []
    }
  };

  function getDefinition(type) {
    return definitions[type] || null;
  }

  function canContain(parentType, childType) {
    var def = getDefinition(parentType);
    if (!def) return false;
    return def.allowedChildren.indexOf(childType) !== -1;
  }

  function validateElement(element) {
    var errors = [];
    var def = getDefinition(element.type);
    if (!def) {
      errors.push("Unknown element type '" + element.type + "' (element " + element.id + ")");
      return errors;
    }
    for (var key in def.fields) {
      if (!element.fields || !(key in element.fields)) {
        errors.push("Element " + element.id + " (" + element.type + ") is missing required field '" + key + "'");
      }
    }
    Schema.childGroups(element).forEach(function(group) {
      group.items.forEach(function(child) {
        if (!canContain(element.type, child.type)) {
          errors.push(
            "Element type '" + child.type + "' is not allowed inside '" + element.type +
            "' (parent " + element.id + ", child " + child.id + ")"
          );
        }
      });
    });
    return errors;
  }

  function validatePage(pageModel) {
    var errors = [];
    function walk(element) {
      errors = errors.concat(validateElement(element));
      Schema.childGroups(element).forEach(function(group) {
        group.items.forEach(walk);
      });
    }
    walk(pageModel.root);
    return errors;
  }

  var api = {
    definitions: definitions,
    getDefinition: getDefinition,
    canContain: canContain,
    validateElement: validateElement,
    validatePage: validatePage
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof window !== "undefined") window.ContentEditorElementDefinitions = api;
  return api;
})(typeof require !== "undefined" ? require("./schema.js") : window.ContentEditorSchema);
