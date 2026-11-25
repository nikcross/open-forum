/*
* ContentEditorSchema
* Canonical page/element data model (requirements doc section 8) and stable
* ID generation (section 7.4). Pure functions, no DOM/OpenForum dependency,
* so this can be unit tested with plain node as well as loaded in-browser.
*/
var ContentEditorSchema = (function() {

  // Version 2 (CON-T-038) adds template, theme and metadata; version 3
  // (CON-T-044) adds the page's layout - see ContentEditorMigrations.
  var SCHEMA_VERSION = 3;

  // How a published page gets its page.html.template (CON-T-044): a .link
  // to its layout's template, a copy of it, or none (the page inherits the
  // template of the pages above it, as any OpenForum page does). "own"
  // (CON-B-003) is for existing site pages only: the page keeps the
  // template files it had before it was in the editor.
  var TEMPLATE_MODES = ["link", "copy", "none", "own"];

  function createLayoutChoice() {
    // id null is the site's default template.
    return { id: null, version: null, templateMode: "link" };
  }

  function generateId(prefix) {
    var random = Math.random().toString(36).slice(2, 10);
    var time = Date.now().toString(36);
    return (prefix || "id") + "_" + time + random;
  }

  function createElement(type, overrides) {
    overrides = overrides || {};
    var element = {
      id: generateId("element"),
      type: type,
      definitionVersion: 1,
      fields: {},
      style: {}
    };
    for (var key in overrides) {
      element[key] = overrides[key];
    }
    return element;
  }

  function createPage(title, slug) {
    var now = new Date().toISOString();
    return {
      schemaVersion: SCHEMA_VERSION,
      pageId: generateId("page"),
      title: title || "",
      slug: slug || "",
      status: "draft",
      root: createElement("page-root", { children: [] }),
      seo: {},
      // Pinned {id, version} of the template and theme a templated page was
      // created with (CON-T-038), and its typed template metadata. All
      // empty for a free-form page.
      template: null,
      theme: null,
      metadata: {},
      layout: createLayoutChoice(),
      createdAt: now,
      updatedAt: now
    };
  }

  // Returns every child collection on an element as a list of
  // {slot, items} pairs, regardless of whether the element uses a flat
  // `children` array (page-root, section) or named `slots` (two-column).
  function childGroups(element) {
    if (element.slots) {
      var groups = [];
      for (var slotName in element.slots) {
        groups.push({ slot: slotName, items: element.slots[slotName] || [] });
      }
      return groups;
    }
    return [{ slot: null, items: element.children || [] }];
  }

  // Depth-first search for the element with the given id, starting at
  // root (usually pageModel.root). Returns null if not found. Used by the
  // command system (CON-T-013) and inspector (CON-T-011) to resolve a
  // selection id reported by the canvas back to the live model node.
  function findElementById(root, elementId) {
    if (root.id === elementId) return root;
    var groups = childGroups(root);
    for (var g = 0; g < groups.length; g++) {
      var items = groups[g].items;
      for (var i = 0; i < items.length; i++) {
        var found = findElementById(items[i], elementId);
        if (found) return found;
      }
    }
    return null;
  }

  // Depth-first search returning the parent context of elementId - its
  // parent element, the slot name it lives in (null for a flat `children`
  // array), and its index within that array. Returns null for the root
  // itself or an unknown id (both "no parent to report"). Used by the
  // insert/move/duplicate/delete commands (CON-T-015/016) to locate and
  // splice a specific child without the caller needing to know whether its
  // container is a flat array or a two-column-style named slot.
  function findParentInfo(root, elementId) {
    if (root.id === elementId) return null;
    var groups = childGroups(root);
    for (var g = 0; g < groups.length; g++) {
      var items = groups[g].items;
      for (var i = 0; i < items.length; i++) {
        if (items[i].id === elementId) {
          return { parent: root, slot: groups[g].slot, index: i };
        }
        var found = findParentInfo(items[i], elementId);
        if (found) return found;
      }
    }
    return null;
  }

  // Returns the live, mutable child array for the given slot on element
  // (element.children for slot===null, element.slots[slot] otherwise),
  // creating it if missing. Every insert/move/duplicate/remove command
  // splices this array directly rather than replacing it, so apply()/
  // invert() pairs that captured a reference to it stay valid.
  function childArray(element, slot) {
    if (slot) {
      if (!element.slots) element.slots = {};
      if (!element.slots[slot]) element.slots[slot] = [];
      return element.slots[slot];
    }
    if (!element.children) element.children = [];
    return element.children;
  }

  // Deep-clones an element subtree, assigning a brand-new id to the clone
  // and to every descendant (section 7.4: every element instance must have
  // its own stable id - a duplicate is a new instance, not an alias of the
  // original). Used by createDuplicateElementCommand (CON-T-016).
  function cloneWithNewIds(element) {
    var clone = JSON.parse(JSON.stringify(element));
    clone.id = generateId("element");
    childGroups(clone).forEach(function(group) {
      for (var i = 0; i < group.items.length; i++) {
        group.items[i] = cloneWithNewIds(group.items[i]);
      }
    });
    return clone;
  }

  var api = {
    SCHEMA_VERSION: SCHEMA_VERSION,
    TEMPLATE_MODES: TEMPLATE_MODES,
    createLayoutChoice: createLayoutChoice,
    generateId: generateId,
    createElement: createElement,
    createPage: createPage,
    childGroups: childGroups,
    findElementById: findElementById,
    findParentInfo: findParentInfo,
    childArray: childArray,
    cloneWithNewIds: cloneWithNewIds
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof window !== "undefined") window.ContentEditorSchema = api;
  return api;
})();
