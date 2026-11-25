/*
* ContentEditorCommands
* Serialisable command model with undo/redo (section 15, FR-HIST-004). Every
* command carries an id, page id, target ids, a timestamp, and enough
* inverse data to undo it. UpdateField (CON-T-011/012) plus
* Insert/Remove/Duplicate/Move (CON-T-015/016) exist now; UpdateStyle/
* ReplaceMedia/UpdatePageMetadata/ApplyTemplateMigration arrive with the
* later tasks that need them, following the same factory + apply/invert
* shape.
*
* CommandStack is intentionally decoupled from ContentEditorSchema/DOM - it
* only ever calls the apply/invert functions a command factory gave it, so
* it's fully unit testable with plain objects.
*/
var ContentEditorCommands = (function(Schema, Definitions, Tokens) {

  function createUpdateFieldCommand(pageModel, elementId, fieldName, newValue, actor) {
    var element = Schema.findElementById(pageModel.root, elementId);
    if (!element) throw "createUpdateFieldCommand: no element with id " + elementId;
    var previousValue = element.fields ? element.fields[fieldName] : undefined;

    return {
      id: Schema.generateId("cmd"),
      type: "UpdateField",
      pageId: pageModel.pageId,
      targetIds: [elementId],
      ts: Date.now(),
      actor: actor || "local",
      apply: function() {
        if (!element.fields) element.fields = {};
        element.fields[fieldName] = newValue;
      },
      invert: function() {
        element.fields[fieldName] = previousValue;
      }
    };
  }

  // CON-T-017/018: sets a single style-control's value at a single
  // breakpoint (base/tablet/phone - CON-T-018's explicit override storage,
  // ContentEditorStyleTokens). Refuses up front - before mutating anything
  // - for an unknown breakpoint or a token that isn't in that control's own
  // token set, so an invalid style value can never reach the undo stack,
  // the same "the model enforces it, not just the UI" pattern used by
  // InsertElement/MoveElement's containment check (FR-STYLE-006).
  function createUpdateStyleCommand(pageModel, elementId, styleKey, breakpoint, newValue, actor) {
    var element = Schema.findElementById(pageModel.root, elementId);
    if (!element) throw "createUpdateStyleCommand: no element with id " + elementId;
    if (Tokens.BREAKPOINTS.indexOf(breakpoint) === -1) {
      throw "createUpdateStyleCommand: unknown breakpoint '" + breakpoint + "'";
    }
    if (newValue && !Tokens.isValidToken(styleKey, newValue)) {
      throw "createUpdateStyleCommand: '" + newValue + "' is not a valid token for '" + styleKey + "'";
    }
    var previousRaw = element.style ? element.style[styleKey] : undefined;
    var previousValue = Tokens.getStyleValueAt(previousRaw, breakpoint);

    return {
      id: Schema.generateId("cmd"),
      type: "UpdateStyle",
      pageId: pageModel.pageId,
      targetIds: [elementId],
      ts: Date.now(),
      actor: actor || "local",
      apply: function() {
        if (!element.style) element.style = {};
        element.style[styleKey] = Tokens.withStyleValueAt(element.style[styleKey], breakpoint, newValue);
      },
      invert: function() {
        element.style[styleKey] = Tokens.withStyleValueAt(element.style[styleKey], breakpoint, previousValue);
      }
    };
  }

  // Inserts a fully-formed element (built by the caller, e.g. the element
  // library's default-instance factory) into parentId's children/slot array
  // at index. Refuses up front - before mutating anything - if Definitions
  // says parentType cannot contain element.type (FR-ELEM-005: containment
  // must be enforced by the model, not merely hidden in the UI), so an
  // invalid insert never reaches the undo stack at all.
  function createInsertElementCommand(pageModel, parentId, slot, index, element, actor) {
    var parent = Schema.findElementById(pageModel.root, parentId);
    if (!parent) throw "createInsertElementCommand: no element with id " + parentId;
    if (!Definitions.canContain(parent.type, element.type)) {
      throw "createInsertElementCommand: '" + element.type + "' is not allowed inside '" + parent.type + "'";
    }

    return {
      id: Schema.generateId("cmd"),
      type: "InsertElement",
      pageId: pageModel.pageId,
      targetIds: [element.id],
      ts: Date.now(),
      actor: actor || "local",
      apply: function() {
        var array = Schema.childArray(parent, slot);
        var at = (index == null || index > array.length) ? array.length : index;
        array.splice(at, 0, element);
      },
      invert: function() {
        var array = Schema.childArray(parent, slot);
        var at = array.indexOf(element);
        if (at !== -1) array.splice(at, 1);
      }
    };
  }

  // Removes elementId from its parent (FR-ELEM-002). Whether the removed
  // subtree contains nested content, and any user confirmation for that, is
  // a UI-layer concern (CON-T-016) - the command itself just needs enough
  // captured state (the parent array reference, the original index, and the
  // removed element itself) to invert cleanly, satisfying FR-ELEM-007's
  // "must be undoable".
  function createRemoveElementCommand(pageModel, elementId, actor) {
    var info = Schema.findParentInfo(pageModel.root, elementId);
    if (!info) throw "createRemoveElementCommand: cannot remove the page root or an unknown element " + elementId;
    var array = Schema.childArray(info.parent, info.slot);
    var removedElement = array[info.index];
    var originalIndex = info.index;

    return {
      id: Schema.generateId("cmd"),
      type: "RemoveElement",
      pageId: pageModel.pageId,
      targetIds: [elementId],
      ts: Date.now(),
      actor: actor || "local",
      apply: function() {
        var at = array.indexOf(removedElement);
        if (at !== -1) array.splice(at, 1);
      },
      invert: function() {
        array.splice(originalIndex, 0, removedElement);
      }
    };
  }

  // Duplicates elementId as a new sibling immediately after it, with a
  // freshly generated id for the clone and every descendant (section 7.4 -
  // a duplicate is a new stable-id instance, never an alias of the
  // original).
  function createDuplicateElementCommand(pageModel, elementId, actor) {
    var info = Schema.findParentInfo(pageModel.root, elementId);
    if (!info) throw "createDuplicateElementCommand: cannot duplicate the page root or an unknown element " + elementId;
    var array = Schema.childArray(info.parent, info.slot);
    var original = array[info.index];
    var clone = Schema.cloneWithNewIds(original);
    var insertAt = info.index + 1;

    return {
      id: Schema.generateId("cmd"),
      type: "DuplicateElement",
      pageId: pageModel.pageId,
      targetIds: [elementId, clone.id],
      ts: Date.now(),
      actor: actor || "local",
      apply: function() {
        var at = (insertAt > array.length) ? array.length : insertAt;
        array.splice(at, 0, clone);
      },
      invert: function() {
        var at = array.indexOf(clone);
        if (at !== -1) array.splice(at, 1);
      }
    };
  }

  // Moves elementId out of its current parent/slot and into
  // targetParentId/targetSlot at targetIndex. Covers both the MVP "move
  // up/down within the same container" interaction (target === current
  // parent, index +/-1) and a general cross-container move, on the same
  // code path. Refuses up front if the target cannot contain the element's
  // type, same as InsertElement.
  function createMoveElementCommand(pageModel, elementId, targetParentId, targetSlot, targetIndex, actor) {
    var info = Schema.findParentInfo(pageModel.root, elementId);
    if (!info) throw "createMoveElementCommand: cannot move the page root or an unknown element " + elementId;
    var sourceParent = info.parent, sourceSlot = info.slot, sourceIndex = info.index;
    var element = Schema.childArray(sourceParent, sourceSlot)[sourceIndex];

    var targetParent = Schema.findElementById(pageModel.root, targetParentId);
    if (!targetParent) throw "createMoveElementCommand: no element with id " + targetParentId;
    if (!Definitions.canContain(targetParent.type, element.type)) {
      throw "createMoveElementCommand: '" + element.type + "' is not allowed inside '" + targetParent.type + "'";
    }

    return {
      id: Schema.generateId("cmd"),
      type: "MoveElement",
      pageId: pageModel.pageId,
      targetIds: [elementId],
      ts: Date.now(),
      actor: actor || "local",
      apply: function() {
        var srcArray = Schema.childArray(sourceParent, sourceSlot);
        srcArray.splice(srcArray.indexOf(element), 1);
        var dstArray = Schema.childArray(targetParent, targetSlot);
        var at = (targetIndex == null || targetIndex > dstArray.length) ? dstArray.length : (targetIndex < 0 ? 0 : targetIndex);
        dstArray.splice(at, 0, element);
      },
      invert: function() {
        var dstArray = Schema.childArray(targetParent, targetSlot);
        dstArray.splice(dstArray.indexOf(element), 1);
        var srcArray = Schema.childArray(sourceParent, sourceSlot);
        srcArray.splice(sourceIndex, 0, element);
      }
    };
  }

  function createCommandStack() {
    var undoStack = [];
    var redoStack = [];

    function apply(command) {
      command.apply();
      undoStack.push(command);
      redoStack = [];
    }

    function undo() {
      var command = undoStack.pop();
      if (!command) return null;
      command.invert();
      redoStack.push(command);
      return command;
    }

    function redo() {
      var command = redoStack.pop();
      if (!command) return null;
      command.apply();
      undoStack.push(command);
      return command;
    }

    return {
      apply: apply,
      undo: undo,
      redo: redo,
      canUndo: function() { return undoStack.length > 0; },
      canRedo: function() { return redoStack.length > 0; },
      history: function() { return undoStack.slice(); }
    };
  }

  // Updates a placed component to another version from the site library
  // (CON-T-046): the instance keeps its own id, place and style, and takes
  // the parts and version of newInstance (from ContentEditorSiteLibrary
  // .instantiate). Undo puts the earlier version back.
  function createReplaceComponentCommand(pageModel, elementId, newInstance, actor) {
    var element = Schema.findElementById(pageModel.root, elementId);
    if (!element || element.type !== "component") throw "createReplaceComponentCommand: " + elementId + " is not a placed component";
    if (!newInstance || newInstance.type !== "component" || newInstance.fields.componentId !== element.fields.componentId) {
      throw "createReplaceComponentCommand: the replacement is not a version of the same component";
    }
    var before = { fields: element.fields, children: element.children };
    var after = { fields: JSON.parse(JSON.stringify(newInstance.fields)), children: newInstance.children };
    return {
      id: Schema.generateId("cmd"),
      type: "ReplaceComponent",
      pageId: pageModel.pageId,
      targetIds: [elementId],
      ts: Date.now(),
      actor: actor || "local",
      apply: function() {
        element.fields = after.fields;
        element.children = after.children;
      },
      invert: function() {
        element.fields = before.fields;
        element.children = before.children;
      }
    };
  }

  var api = {
    createUpdateFieldCommand: createUpdateFieldCommand,
    createUpdateStyleCommand: createUpdateStyleCommand,
    createInsertElementCommand: createInsertElementCommand,
    createRemoveElementCommand: createRemoveElementCommand,
    createDuplicateElementCommand: createDuplicateElementCommand,
    createMoveElementCommand: createMoveElementCommand,
    createReplaceComponentCommand: createReplaceComponentCommand,
    createCommandStack: createCommandStack
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof window !== "undefined") window.ContentEditorCommands = api;
  return api;
})(
  typeof require !== "undefined" ? require("./schema.js") : window.ContentEditorSchema,
  typeof require !== "undefined" ? require("./element-definitions.js") : window.ContentEditorElementDefinitions,
  typeof require !== "undefined" ? require("./style-tokens.js") : window.ContentEditorStyleTokens
);
