/*
* ContentEditorDiff
* Structured comparison of two page models (CON-T-026, FR-HIST-002,
* FR-HIST-007, CON-R-009). Elements are matched by their stable ids, so a
* change is reported as what it is - an element added, removed or moved, a
* field or style changed, a page detail changed - rather than as changed
* HTML. diffHtml is only a diagnostic view of the rendered output.
* Pure functions: the same two pages always give the same changes.
*/
var ContentEditorDiff = (function(Schema, Definitions) {

  // Page-level settings compared as whole values.
  var PAGE_PROPERTIES = [
    { key: "slug", label: "Page address" },
    { key: "template", label: "Page type" },
    { key: "theme", label: "Site style" },
    { key: "layout", label: "Layout" }
  ];

  function same(a, b) {
    return JSON.stringify(a === undefined ? null : a) === JSON.stringify(b === undefined ? null : b);
  }

  // A short, readable form of a value for the change list.
  function shortText(value) {
    if (value === undefined || value === null || value === "") return "(empty)";
    if (typeof value === "object" && typeof value.html === "string") value = value.html.replace(/<[^>]*>/g, " ");
    var text = typeof value === "string" ? value : JSON.stringify(value);
    text = String(text).replace(/\s+/g, " ").trim();
    if (!text) return "(empty)";
    return text.length > 80 ? text.slice(0, 77) + "..." : text;
  }

  // id -> { element, parentId, slot, order } for every element below root.
  function index(root) {
    var found = {};
    (function walk(element, parentId, slot, order) {
      found[element.id] = { element: element, parentId: parentId, slot: slot, order: order };
      Schema.childGroups(element).forEach(function(group) {
        group.items.forEach(function(child, i) { walk(child, element.id, group.slot || null, i); });
      });
    })(root, null, null, 0);
    return found;
  }

  // "Heading “Notice the moment”", "The title", "Image (element_x)".
  function describe(element) {
    var def = Definitions.getDefinition(element.type);
    var name = element.role ? "The " + element.role.replace(/-/g, " ") : (def ? def.label : element.type);
    var fields = element.fields || {};
    var text = typeof fields.text === "string" ? fields.text : typeof fields.name === "string" ? fields.name : "";
    return text ? name + " “" + shortText(text) + "”" : name;
  }

  // In each container, the ids both pages have in that same container, in
  // order - so an element leaving a container doesn't make its old
  // neighbours look moved.
  function commonOrder(entries, otherEntries) {
    var byContainer = {};
    Object.keys(entries).forEach(function(id) {
      var e = entries[id], other = otherEntries[id];
      if (e.parentId === null || !other || other.parentId !== e.parentId || (other.slot || null) !== (e.slot || null)) return;
      var key = e.parentId + "|" + (e.slot || "");
      (byContainer[key] = byContainer[key] || []).push({ id: id, order: e.order });
    });
    Object.keys(byContainer).forEach(function(key) {
      byContainer[key] = byContainer[key].sort(function(a, b) { return a.order - b.order; }).map(function(x) { return x.id; });
    });
    return byContainer;
  }

  // { changes: [{ kind, elementId, label, field, from, to }], changedIds,
  //   counts: { added, removed, moved, edited, page } }
  // kind is "added", "removed", "moved", "field", "style", "metadata" or "page".
  function diffPages(before, after) {
    var changes = [];
    var a = index(before.root), b = index(after.root);

    PAGE_PROPERTIES.forEach(function(p) {
      if (!same(before[p.key], after[p.key])) changes.push({ kind: "page", elementId: null, label: p.label, field: p.key, from: shortText(before[p.key]), to: shortText(after[p.key]) });
    });
    var metaBefore = before.metadata || {}, metaAfter = after.metadata || {};
    Object.keys(metaBefore).concat(Object.keys(metaAfter)).filter(function(k, i, all) { return all.indexOf(k) === i; }).sort().forEach(function(key) {
      if (!same(metaBefore[key], metaAfter[key])) changes.push({ kind: "metadata", elementId: null, label: "Page detail: " + key, field: key, from: shortText(metaBefore[key]), to: shortText(metaAfter[key]) });
    });

    // Moves: a different container, or a different place among the
    // elements both pages have in the same container.
    var orderBefore = commonOrder(a, b), orderAfter = commonOrder(b, a);
    Object.keys(b).forEach(function(id) {
      var now = b[id], was = a[id];
      if (now.parentId === null) return;
      if (!was) { changes.push({ kind: "added", elementId: id, label: describe(now.element), field: null, from: null, to: null }); return; }
      var key = now.parentId + "|" + (now.slot || "");
      var moved = was.parentId !== now.parentId || (was.slot || null) !== (now.slot || null) ||
        (orderBefore[key] || []).indexOf(id) !== (orderAfter[key] || []).indexOf(id);
      if (moved) changes.push({ kind: "moved", elementId: id, label: describe(now.element), field: null, from: null, to: null });
      var fieldsBefore = was.element.fields || {}, fieldsAfter = now.element.fields || {};
      Object.keys(fieldsBefore).concat(Object.keys(fieldsAfter)).filter(function(k, i, all) { return all.indexOf(k) === i; }).sort().forEach(function(field) {
        if (!same(fieldsBefore[field], fieldsAfter[field])) changes.push({ kind: "field", elementId: id, label: describe(now.element), field: field, from: shortText(fieldsBefore[field]), to: shortText(fieldsAfter[field]) });
      });
      var styleBefore = was.element.style || {}, styleAfter = now.element.style || {};
      Object.keys(styleBefore).concat(Object.keys(styleAfter)).filter(function(k, i, all) { return all.indexOf(k) === i; }).sort().forEach(function(style) {
        if (!same(styleBefore[style], styleAfter[style])) changes.push({ kind: "style", elementId: id, label: describe(now.element), field: style, from: shortText(styleBefore[style]), to: shortText(styleAfter[style]) });
      });
    });
    Object.keys(a).forEach(function(id) {
      if (a[id].parentId !== null && !b[id]) changes.push({ kind: "removed", elementId: id, label: describe(a[id].element), field: null, from: null, to: null });
    });

    var changedIds = [];
    changes.forEach(function(c) { if (c.elementId && c.kind !== "removed" && changedIds.indexOf(c.elementId) === -1) changedIds.push(c.elementId); });
    var counts = { added: 0, removed: 0, moved: 0, edited: 0, page: 0 };
    var editedIds = {};
    changes.forEach(function(c) {
      if (c.kind === "added" || c.kind === "removed" || c.kind === "moved") counts[c.kind]++;
      else if (c.kind === "field" || c.kind === "style") editedIds[c.elementId] = true;
      else counts.page++;
    });
    counts.edited = Object.keys(editedIds).length;
    return { changes: changes, changedIds: changedIds, counts: counts };
  }

  // Diagnostic only: the lines of rendered HTML that differ, using a
  // longest-common-subsequence over lines split between tags. Capped so a
  // large page can't stall the editor.
  function diffHtml(beforeHtml, afterHtml, maxLines) {
    var limit = maxLines || 1500;
    function lines(html) { return String(html || "").replace(/>\s*</g, ">\n<").split("\n"); }
    var x = lines(beforeHtml), y = lines(afterHtml);
    if (x.length > limit || y.length > limit) return { tooLarge: true, removed: [], added: [] };
    var n = x.length, m = y.length, table = [];
    for (var i = 0; i <= n; i++) { table.push(new Array(m + 1).fill(0)); }
    for (i = n - 1; i >= 0; i--) {
      for (var j = m - 1; j >= 0; j--) table[i][j] = x[i] === y[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
    }
    var removed = [], added = [];
    i = 0; j = 0;
    while (i < n && j < m) {
      if (x[i] === y[j]) { i++; j++; }
      else if (table[i + 1][j] >= table[i][j + 1]) removed.push(x[i++]);
      else added.push(y[j++]);
    }
    while (i < n) removed.push(x[i++]);
    while (j < m) added.push(y[j++]);
    return { tooLarge: false, removed: removed, added: added };
  }

  var api = {
    diffPages: diffPages,
    diffHtml: diffHtml,
    describe: describe
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof window !== "undefined") window.ContentEditorDiff = api;
  return api;
})(
  typeof require !== "undefined" ? require("./schema.js") : window.ContentEditorSchema,
  typeof require !== "undefined" ? require("./element-definitions.js") : window.ContentEditorElementDefinitions
);
