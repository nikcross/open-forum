/*
 * WYSIWYG Markdown editor for StandaloneEditor.
 * Edits Markdown visually on a contenteditable surface (based on SimpleHTMLEditor),
 * and loads and saves plain Markdown using markdown-it and turndown.
 * StandaloneEditor flavour: "WYSIWYGMarkDown"
 */
function WYSIWYGMarkDownEditor(editorIndex,pageName,fileName,markChanged) {
  var self = this;
  var editorPath = (window.OpenForumEditorPaths && window.OpenForumEditorPaths.WYSIWYGMarkDownEditor) ||
    "/OpenForum/Editor/Editors/WYSIWYGMarkDownEditor";
  var editorsPath = editorPath.substring(0, editorPath.lastIndexOf("/"));
  // Load the libraries from the same tree as the editor (e.g. a Development copy uses Development libraries).
  // Derived from editorPath rather than written out, so publishing doesn't change its meaning.
  var libraryPath = editorPath.substring(0, editorPath.indexOf("/OpenForum/")) + "/OpenForum/Javascript/MarkDown";

  var containerId = "editor" + editorIndex;
  var rootId = "wmdEditor" + editorIndex;
  var root = null;
  var surface = null;
  var fileInput = null;
  var tableBar = null;
  var statusElement = null;
  var dialogBackdrop = null;
  var dialogOptions = null;

  var markdownRenderer = null;
  var turndownService = null;

  // The document is kept as Markdown. It stays exactly as loaded or typed in source mode until
  // the visual surface is edited, so opening and saving a file without visual edits never rewrites it.
  var markdown = "";
  var visualDirty = false;
  var lastNotifiedMarkdown = "";
  var contentReport = null;

  var mode = "visual";
  var sourceEditor = null;
  var sourceLoading = false;
  var sourceReadyCallbacks = [];
  var sourceSyncing = false;
  var sourceTimer = null;

  var changeListeners = [];
  var savedRange = null;
  var changeTimer = null;
  var history = [];
  var historyIndex = -1;
  var historyTimer = null;
  var codeMirrorAdapter = null;

  self.ready = false;
  self.changed = "";
  window.WYSIWYGMarkDownEditorInstances = window.WYSIWYGMarkDownEditorInstances || {};
  window.WYSIWYGMarkDownEditorInstances[editorIndex] = self;

  self.requestFullscreen = function() {
    document.getElementById( containerId ).requestFullscreen();
  };

  // ---------------------------------------------------------------- Markdown conversion

  var createConverters = function() {
    markdownRenderer = window.markdownit({ html: true, linkify: true, typographer: false });
    // Only addresses that start with http:// or https:// become links (OFS-R-002); no guessing at www. names or emails.
    markdownRenderer.linkify.set({ fuzzyLink: false, fuzzyEmail: false, fuzzyIP: false });

    turndownService = new TurndownService({
      headingStyle: "atx",
      hr: "---",
      bulletListMarker: "-",
      codeBlockStyle: "fenced",
      fence: "```",
      emDelimiter: "*",
      strongDelimiter: "**",
      linkStyle: "inlined"
    });
    turndownService.use(turndownPluginGfm.gfm);
    // markdown-it only understands ~~double~~ tildes, the gfm plugin writes ~single~ ones
    turndownService.addRule("doubleTildeStrikethrough", {
      filter: ["del", "s", "strike"],
      replacement: function(content) {
        return "~~" + content + "~~";
      }
    });
    // A table cell can't hold a Markdown line break, so keep it as an HTML <br>
    turndownService.addRule("tableCellBreak", {
      filter: function(node) {
        return node.nodeName === "BR" && node.parentNode && /^(TD|TH)$/.test(node.parentNode.nodeName);
      },
      replacement: function() {
        return "<br>";
      }
    });
    // A link whose text is exactly its http(s) address is written back as the bare address, so
    // documents with bare addresses (shown as links since OFS-R-002) save unchanged.
    turndownService.addRule("bareAddressLink", {
      filter: function(node) {
        var href = node.nodeName === "A" ? node.getAttribute("href") : null;
        return !!href && /^https?:\/\//i.test(href) && !node.getAttribute("title") && node.textContent === href &&
          node.parentNode && !/^(CODE|PRE)$/.test(node.parentNode.nodeName);
      },
      replacement: function(content, node) {
        return node.getAttribute("href");
      }
    });
    // HTML comments are carried through as <wmd-comment> placeholders (see htmlToMarkdown)
    turndownService.addRule("htmlComment", {
      filter: function(node) {
        return node.nodeName === "WMD-COMMENT";
      },
      replacement: function(content, node) {
        var comment = "<!--" + node.getAttribute("data-text") + "-->";
        return node.getAttribute("data-block") === "true" ? "\n\n" + comment + "\n\n" : comment;
      }
    });
    // Markdown has no syntax for these, so keep them as HTML rather than dropping the markup
    turndownService.keep(["kbd", "sup", "sub", "u", "mark", "ins", "abbr", "details", "summary", "iframe", "video", "audio"]);
    // Write "- item" and "1. item" rather than turndown's padded "-   item", indenting nested lines to match
    turndownService.addRule("compactListItem", {
      filter: "li",
      replacement: function(content, node, options) {
        var prefix = options.bulletListMarker + " ";
        var parent = node.parentNode;
        if(parent.nodeName === "OL") {
          var start = parent.getAttribute("start");
          var index = Array.prototype.indexOf.call(parent.children, node);
          prefix = (start ? Number(start) + index : index + 1) + ". ";
        }
        var indent = new Array(prefix.length + 1).join(" ");
        content = content.replace(/^\n+/, "").replace(/\n+$/, "\n").replace(/\n/gm, "\n" + indent);
        return prefix + content + (node.nextSibling && !/\n$/.test(content) ? "\n" : "");
      }
    });
  };

  var markdownToHtml = function(markdown) {
    return markdownRenderer.render(markdown || "");
  };

  var htmlToMarkdown = function(html) {
    var container = document.createElement("div");
    container.innerHTML = html || "";

    // Browsers put <br> in code blocks and empty table cells; Markdown needs real new lines there, or nothing
    var codeBreaks = container.querySelectorAll("pre br");
    for(var codeIndex = 0; codeIndex < codeBreaks.length; codeIndex++) {
      codeBreaks[codeIndex].parentNode.replaceChild(document.createTextNode("\n"), codeBreaks[codeIndex]);
    }
    var cellBreaks = container.querySelectorAll("td br, th br");
    for(var cellIndex = 0; cellIndex < cellBreaks.length; cellIndex++) {
      var cellBreak = cellBreaks[cellIndex];
      if(!cellBreak.nextSibling || cellBreak.parentNode.textContent.trim() === "") {
        cellBreak.parentNode.removeChild(cellBreak);
      }
    }

    // turndown skips comment nodes, so swap them for placeholder elements it can convert
    var walker = document.createTreeWalker(container, NodeFilter.SHOW_COMMENT, null, false);
    var comments = [];
    while(walker.nextNode()) {
      comments.push(walker.currentNode);
    }
    for(var commentIndex = 0; commentIndex < comments.length; commentIndex++) {
      var comment = comments[commentIndex];
      var placeholder = document.createElement("wmd-comment");
      placeholder.setAttribute("data-text", comment.nodeValue);
      placeholder.setAttribute("data-block", comment.parentNode === container ? "true" : "false");
      placeholder.textContent = "comment";
      comment.parentNode.replaceChild(placeholder, comment);
    }

    return turndownService.turndown(container);
  };

  // Compare what a Markdown document would become after a visual edit with the original
  var normaliseHtml = function(html) {
    return (html || "").replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();
  };

  var analyseMarkdown = function(text) {
    text = text || "";
    var report = { exact: true, sameMeaning: true, rawHtml: false, footnotes: false };
    var rewritten = htmlToMarkdown(markdownToHtml(text));
    report.exact = rewritten.trim() === text.trim();
    if(report.exact) return report;

    report.sameMeaning = normaliseHtml(markdownToHtml(text)) === normaliseHtml(markdownToHtml(rewritten));
    report.footnotes = /\[\^[^\]\s]+\]/.test(text);
    var tokens = markdownRenderer.parse(text, {});
    for(var tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++) {
      var token = tokens[tokenIndex];
      var isComment = /^\s*<!--[\s\S]*-->\s*$/.test(token.content || "");
      if(token.type === "html_block" && !isComment) report.rawHtml = true;
      var children = token.children || [];
      for(var childIndex = 0; childIndex < children.length; childIndex++) {
        if(children[childIndex].type === "html_inline" && !/^<!--/.test(children[childIndex].content)) report.rawHtml = true;
      }
    }
    return report;
  };

  var describeReport = function(report) {
    if(!report || report.exact) return null;
    if(report.sameMeaning) {
      return { kind: "info", text: "Editing visually will tidy how some of this Markdown is written. The content stays the same." };
    }
    var reasons = [];
    if(report.rawHtml) reasons.push("it contains HTML that Markdown can't express, which may be simplified");
    if(report.footnotes) reasons.push("footnotes aren't supported and will become plain text");
    if(reasons.length === 0) reasons.push("some of its formatting isn't supported");
    return { kind: "warning", text: "Warning: editing this file visually will change it: " + reasons.join("; ") + ". Use Source to edit it without changes." };
  };

  var loadSource = function() {
    try {
      if(OpenForum.file.attachmentExists(pageName,fileName)==="true") {
        return OpenForum.loadFile(pageName+"/"+fileName,null,true);
      }
      if(/^unnamed\./.test(fileName)) {
        return "";
      }
      // New files start from the same templates as the Markdown editor
      if(OpenForum.file.attachmentExists("/OpenForum/FileTemplates/md",fileName+".default")==="true") {
        return OpenForum.loadFile("/OpenForum/FileTemplates/md/"+fileName+".default");
      }
      if(OpenForum.file.attachmentExists("/OpenForum/FileTemplates/md","default.md")==="true") {
        return OpenForum.loadFile("/OpenForum/FileTemplates/md/default.md");
      }
    } catch(e) {
      console.log(e);
    }
    return "";
  };

  // ---------------------------------------------------------------- Status

  var showStatus = function(message, kind) {
    if(statusElement) {
      statusElement.textContent = message || "";
      statusElement.className = "wmd-status" + (kind ? " wmd-status-" + kind : "");
    }
  };

  // ---------------------------------------------------------------- Selection helpers

  var getSelectionRange = function() {
    var selection = window.getSelection();
    if(selection && selection.rangeCount && surface && surface.contains(selection.getRangeAt(0).commonAncestorContainer)) {
      return selection.getRangeAt(0);
    }
    return null;
  };

  var saveRange = function() {
    var range = getSelectionRange();
    if(range) {
      savedRange = range.cloneRange();
    }
  };

  var restoreRange = function() {
    if(!savedRange) return;
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(savedRange);
  };

  var focusEditor = function() {
    if(surface && document.activeElement !== surface) {
      surface.focus();
      restoreRange();
    }
  };

  var selectionNode = function() {
    var range = getSelectionRange() || savedRange;
    if(!range) return null;
    return range.startContainer;
  };

  var closestInSurface = function(node, selector) {
    while(node && node !== surface) {
      if(node.nodeType === 1 && node.matches(selector)) {
        return node;
      }
      node = node.parentNode;
    }
    return null;
  };

  var topBlock = function(node) {
    if(!node) return null;
    if(node === surface) {
      var range = getSelectionRange() || savedRange;
      if(range && range.startContainer === surface) {
        return surface.childNodes[Math.max(0, range.startOffset - 1)] || null;
      }
      return null;
    }
    while(node && node.parentNode && node.parentNode !== surface) {
      node = node.parentNode;
    }
    return (node && node.parentNode === surface) ? node : null;
  };

  var isEmptyBlock = function(block) {
    if(block.nodeType === 3) return block.textContent.trim() === "";
    return block.textContent.trim() === "" && !block.querySelector("img,hr,table,pre");
  };

  var placeCaret = function(element, atEnd) {
    var range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(!atEnd);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    savedRange = range.cloneRange();
  };

  var newParagraph = function() {
    var paragraph = document.createElement("p");
    paragraph.innerHTML = "<br>";
    return paragraph;
  };

  var insertNodeAtCursor = function(node) {
    focusEditor();
    var range = getSelectionRange();
    if(range) {
      range.deleteContents();
      range.insertNode(node);
      range.setStartAfter(node);
      range.collapse(true);
      var selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      surface.appendChild(node);
    }
  };

  // Insert a block element (table, code block, rule) after the current block
  var insertBlock = function(node) {
    focusEditor();
    var block = topBlock(selectionNode());
    if(block && isEmptyBlock(block)) {
      surface.replaceChild(node, block);
    } else if(block) {
      surface.insertBefore(node, block.nextSibling);
    } else {
      surface.appendChild(node);
    }
    if(!node.nextSibling) {
      surface.appendChild(newParagraph());
    }
  };

  var unwrap = function(element) {
    var parent = element.parentNode;
    while(element.firstChild) {
      parent.insertBefore(element.firstChild, element);
    }
    parent.removeChild(element);
  };

  // ---------------------------------------------------------------- Automatic links (OFS-R-002)
  // Web addresses starting with http:// or https:// become links: when one is typed and followed
  // by a space or Enter, when it is pasted as plain text, and when content is loaded.
  // Never inside links, code or pre. Ctrl or Cmd and click opens a link in a new tab.
  var AUTO_LINK_END = /(^|[\s(\[{"'])(https?:\/\/[^\s<>"'`]+)$/i;
  var AUTO_LINK_ANY = /\bhttps?:\/\/[^\s<>"'`]+/gi;
  var AUTO_LINK_TRAILING = /[.,;:!?)\]}'"]+$/;

  var trimAddress = function(address) {
    var trailing = (address.match(AUTO_LINK_TRAILING) || [""])[0];
    address = address.slice(0, address.length - trailing.length);
    return /^https?:\/\/[^\/\s]/i.test(address) ? address : "";
  };

  var insideNoLinkZone = function(node, root) {
    for(var parent = node.parentNode; parent && parent !== root; parent = parent.parentNode) {
      if(/^(A|CODE|PRE)$/.test(parent.nodeName)) return true;
    }
    return false;
  };

  // The address just before the caret, if there is one: {node, start, address}.
  var addressBeforeCaret = function(root) {
    var selection = window.getSelection();
    if(!selection.rangeCount || !selection.isCollapsed) return null;
    var range = selection.getRangeAt(0);
    var node = range.startContainer;
    if(node.nodeType !== 3 || !root.contains(node) || insideNoLinkZone(node, root)) return null;
    var match = AUTO_LINK_END.exec(node.nodeValue.slice(0, range.startOffset));
    if(!match) return null;
    var address = trimAddress(match[2]);
    if(!address) return null;
    return { node: node, start: range.startOffset - match[2].length, address: address, typed: match[2] };
  };

  // Wraps the address before the caret in a link and leaves the caret after it, outside the link.
  var linkAddressBeforeCaret = function(found) {
    var addressNode = found.node.splitText(found.start);
    var rest = addressNode.splitText(found.address.length);
    var link = document.createElement("a");
    link.setAttribute("href", found.address);
    addressNode.parentNode.replaceChild(link, addressNode);
    link.appendChild(addressNode);
    var range = document.createRange();
    range.setStart(rest, found.typed.length - found.address.length);
    range.collapse(true);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  };

  // Links every bare address in the text under root. Returns true if anything changed.
  var linkAddressesIn = function(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while(walker.nextNode()) {
      if(/https?:\/\//i.test(walker.currentNode.nodeValue) && !insideNoLinkZone(walker.currentNode, root)) nodes.push(walker.currentNode);
    }
    nodes.forEach(function(node) {
      var text = node.nodeValue, last = 0, fragment = document.createDocumentFragment(), match;
      AUTO_LINK_ANY.lastIndex = 0;
      while((match = AUTO_LINK_ANY.exec(text))) {
        var address = trimAddress(match[0]);
        if(!address) continue;
        fragment.appendChild(document.createTextNode(text.slice(last, match.index)));
        var link = document.createElement("a");
        link.setAttribute("href", address);
        link.textContent = address;
        fragment.appendChild(link);
        last = match.index + address.length;
      }
      if(!last) return;
      fragment.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(fragment, node);
    });
    return nodes.length > 0;
  };

  // Plain text as HTML, with its addresses as links and its line breaks kept.
  var plainTextWithLinks = function(text) {
    var escape = function(value) {
      return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    };
    var html = "", last = 0, match;
    AUTO_LINK_ANY.lastIndex = 0;
    while((match = AUTO_LINK_ANY.exec(text))) {
      var address = trimAddress(match[0]);
      if(!address) continue;
      html += escape(text.slice(last, match.index)) + "<a href=\"" + escape(address) + "\">" + escape(address) + "</a>";
      last = match.index + address.length;
    }
    return (html + escape(text.slice(last))).replace(/\r?\n/g, "<br>");
  };

  // A hint while the pointer is over a link (set on the surface, so it is never saved in the content).
  var bindLinkHint = function(root) {
    root.addEventListener("mouseover", function(event) {
      var link = event.target.closest ? event.target.closest("a") : null;
      root.title = link && root.contains(link) ? "Ctrl+click (Cmd+click on a Mac) to open " + link.getAttribute("href") + " in a new tab" : "";
    });
  };

  // ---------------------------------------------------------------- Change tracking and history

  var recordHistory = function() {
    if(historyTimer) {
      clearTimeout(historyTimer);
      historyTimer = null;
    }
    if(!surface) return;
    var html = surface.innerHTML;
    if(history[historyIndex] === html) return;
    history = history.slice(0, historyIndex + 1);
    history.push(html);
    if(history.length > 200) {
      history.shift();
    }
    historyIndex = history.length - 1;
  };

  var resetHistory = function() {
    history = [surface.innerHTML];
    historyIndex = 0;
  };

  // Called whenever the visual surface changes, so the Markdown is regenerated from it
  var markVisualEdit = function() {
    if(!visualDirty && contentReport && !contentReport.sameMeaning) {
      // Remind the user at the moment a lossy file is first edited visually
      var message = describeReport(contentReport);
      if(message) showStatus(message.text, message.kind);
    }
    visualDirty = true;
  };

  var notifyChange = function() {
    if(changeTimer) {
      clearTimeout(changeTimer);
      changeTimer = null;
    }
    if(!surface) return;

    var current = self.getValue();
    if(lastNotifiedMarkdown != current) {
      lastNotifiedMarkdown = current;
      self.changed = "*";
      if(markChanged !== false && typeof editorList !== "undefined" && editorList[editorIndex]) {
        editorList[editorIndex].changed = "*";
      }
      for(var listenerIndex in changeListeners) {
        changeListeners[listenerIndex](codeMirrorAdapter, {origin: "wysiwyg-markdown"});
      }
    }
    if(mode === "split") {
      setSourceText(current);
    }
  };

  var scheduleChange = function() {
    updateEmptyState();
    markVisualEdit();
    if(changeTimer) clearTimeout(changeTimer);
    changeTimer = setTimeout(notifyChange, 250);
    if(historyTimer) clearTimeout(historyTimer);
    historyTimer = setTimeout(recordHistory, 400);
  };

  // Chrome's editing commands can leave block elements (lists, quotes, headings) inside a <p>,
  // which isn't valid HTML and confuses later commands. Split such paragraphs, keeping the caret.
  var blockSelector = "p,div,ul,ol,blockquote,pre,table,h1,h2,h3,h4,h5,h6,hr";

  var normaliseBlocks = function() {
    var paragraphs = surface.querySelectorAll("p");
    for(var paragraphIndex = paragraphs.length - 1; paragraphIndex >= 0; paragraphIndex--) {
      var paragraph = paragraphs[paragraphIndex];
      var hasBlock = false;
      for(var childIndex = 0; childIndex < paragraph.children.length; childIndex++) {
        if(paragraph.children[childIndex].matches(blockSelector)) {
          hasBlock = true;
          break;
        }
      }
      if(!hasBlock) continue;

      var parent = paragraph.parentNode;
      var run = null;
      while(paragraph.firstChild) {
        var child = paragraph.firstChild;
        if(child.nodeType === 1 && child.matches(blockSelector)) {
          run = null;
          parent.insertBefore(child, paragraph);
        } else if(child.nodeType === 3 && child.textContent.trim() === "" && !run) {
          paragraph.removeChild(child);
        } else {
          if(!run) {
            run = document.createElement("p");
            parent.insertBefore(run, paragraph);
          }
          run.appendChild(child);
        }
      }
      parent.removeChild(paragraph);
    }
  };

  // Wrap every toolbar action so it is recorded in history and reported as a change
  var edit = function(action) {
    return function() {
      recordHistory();
      action.apply(null, arguments);
      normaliseBlocks();
      updateEmptyState();
      recordHistory();
      markVisualEdit();
      notifyChange();
      updateActiveButtons();
    };
  };

  var undo = function() {
    if(mode === "source" && sourceEditor) {
      sourceEditor.getCodeMirror().undo();
      return;
    }
    recordHistory();
    if(historyIndex <= 0) {
      showStatus("Nothing to undo");
      return;
    }
    historyIndex--;
    surface.innerHTML = history[historyIndex];
    placeCaret(surface, true);
    markVisualEdit();
    notifyChange();
    updateActiveButtons();
  };

  var redo = function() {
    if(mode === "source" && sourceEditor) {
      sourceEditor.getCodeMirror().redo();
      return;
    }
    recordHistory();
    if(historyIndex >= history.length - 1) {
      showStatus("Nothing to redo");
      return;
    }
    historyIndex++;
    surface.innerHTML = history[historyIndex];
    placeCaret(surface, true);
    markVisualEdit();
    notifyChange();
    updateActiveButtons();
  };

  // An empty document still gets a paragraph, so typing starts inside a block element
  var ensureParagraph = function() {
    var hasContent = false;
    for(var childIndex = 0; childIndex < surface.childNodes.length; childIndex++) {
      var child = surface.childNodes[childIndex];
      if(child.nodeType === 1 || (child.nodeType === 3 && child.textContent.trim() !== "")) {
        hasContent = true;
        break;
      }
    }
    if(!hasContent) {
      surface.appendChild(newParagraph());
    }
  };

  var updateEmptyState = function() {
    var empty = surface.textContent.trim() === "" && !surface.querySelector("img,hr,table,pre,li");
    surface.classList.toggle("wmd-empty", empty);
  };

  var renderSurface = function() {
    surface.innerHTML = markdownToHtml(markdown);
    ensureParagraph();
    updateEmptyState();
    visualDirty = false;
    resetHistory();
  };

  var showContentReport = function() {
    var message = describeReport(contentReport);
    showStatus(message ? message.text : "", message ? message.kind : null);
  };

  var setEditorContent = function(newMarkdown, markAsChanged) {
    if(!surface) return;
    markdown = newMarkdown || "";
    renderSurface();
    setSourceText(markdown);

    if(markAsChanged) {
      notifyChange();
    } else {
      lastNotifiedMarkdown = markdown;
    }

    contentReport = analyseMarkdown(markdown);
    showContentReport();
  };

  // ---------------------------------------------------------------- Source and split modes

  // Put text into the source editor without it being treated as a source edit
  var setSourceText = function(text) {
    if(!sourceEditor || !sourceEditor.ready) return;
    var codeMirror = sourceEditor.getCodeMirror();
    if(codeMirror.getValue() === text) return;
    sourceSyncing = true;
    codeMirror.setValue(text);
    sourceSyncing = false;
  };

  var onSourceChange = function() {
    if(sourceSyncing) return;
    markdown = sourceEditor.getCodeMirror().getValue();
    visualDirty = false;
    if(sourceTimer) clearTimeout(sourceTimer);
    sourceTimer = setTimeout(function() {
      sourceTimer = null;
      if(mode === "split") {
        renderSurface();
      }
      contentReport = analyseMarkdown(markdown);
      notifyChange();
    }, 300);
  };

  // The source view reuses the Markdown editor (CodeMirror in markdown mode), loaded the first time it is needed
  var ensureSourceEditor = function(callback) {
    if(sourceEditor && sourceEditor.ready) {
      callback();
      return;
    }
    sourceReadyCallbacks.push(callback);
    if(sourceLoading) return;
    sourceLoading = true;
    showStatus("Loading the source editor...");

    DependencyService.createNewDependency()
      .addDependency("/OpenForum/Javascript/CodeMirror/lib/codemirror.js")
      .addDependency(editorsPath + "/MarkDownEditor/editor.js")
      .setOnLoadTrigger( function() {
        sourceEditor = new MarkDownEditor(editorIndex + "Source", pageName, fileName, false);
        new Process().waitFor( function() { return sourceEditor.ready; } ).then( function() {
          // The Markdown editor's page fragment carries id="InPageEditor"; drop it so ids stay unique
          var host = root.querySelector(".wmd-source-host");
          var duplicate = host ? host.querySelector("#InPageEditor") : null;
          if(duplicate) duplicate.removeAttribute("id");

          var codeMirror = sourceEditor.getCodeMirror();
          sourceSyncing = true;
          codeMirror.setValue(self.getValue());
          sourceSyncing = false;
          codeMirror.clearHistory();
          codeMirror.on("change", onSourceChange);
          sourceLoading = false;
          showContentReport();

          var callbacks = sourceReadyCallbacks;
          sourceReadyCallbacks = [];
          for(var callbackIndex = 0; callbackIndex < callbacks.length; callbackIndex++) {
            callbacks[callbackIndex]();
          }
        }).run();
      } ).loadDependencies();
  };

  var applyMode = function(newMode) {
    var current = self.getValue();
    if(mode === "source" && newMode !== "source") {
      renderSurface();
      contentReport = analyseMarkdown(markdown);
      showContentReport();
    }
    mode = newMode;
    root.setAttribute("data-wmd-mode", mode);

    if(mode !== "visual") {
      setSourceText(current);
      sourceEditor.refresh();
    }

    var modeButtons = root.querySelectorAll("[data-wmd-mode]");
    for(var modeIndex = 0; modeIndex < modeButtons.length; modeIndex++) {
      setActive(modeButtons[modeIndex], modeButtons[modeIndex].getAttribute("data-wmd-mode") === mode);
    }

    // Formatting buttons only apply to the visual view
    var toolbar = root.querySelector(".wmd-toolbar");
    var buttons = toolbar.querySelectorAll("button");
    for(var buttonIndex = 0; buttonIndex < buttons.length; buttonIndex++) {
      var action = buttons[buttonIndex].getAttribute("data-wmd-action");
      buttons[buttonIndex].disabled = mode === "source" && action !== null && action !== "undo" && action !== "redo";
      buttons[buttonIndex].tabIndex = -1;
    }
    root.querySelector("[data-wmd-mode='" + mode + "']").tabIndex = 0;

    if(mode === "source") {
      sourceEditor.getCodeMirror().focus();
    }
  };

  var setMode = function(newMode) {
    if(newMode === mode) return;
    if(newMode === "visual") {
      applyMode(newMode);
    } else {
      ensureSourceEditor(function() { applyMode(newMode); });
    }
  };

  // ---------------------------------------------------------------- Formatting actions

  var exec = function(command, value) {
    focusEditor();
    document.execCommand(command, false, value || null);
  };

  var currentBlockFormat = function() {
    return (document.queryCommandValue("formatBlock") || "").toLowerCase();
  };

  var toggleHeading = function(level) {
    var tag = "h" + level;
    if(currentBlockFormat() === tag) {
      exec("formatBlock", "p");
    } else {
      exec("formatBlock", tag);
    }
  };

  var toggleQuote = function() {
    focusEditor();
    if(closestInSurface(selectionNode(), "blockquote")) {
      exec("outdent");
    } else {
      exec("formatBlock", "blockquote");
    }
  };

  var toggleInlineCode = function() {
    focusEditor();
    var node = selectionNode();
    if(closestInSurface(node, "pre")) return;

    var code = closestInSurface(node, "code");
    if(code) {
      unwrap(code);
      return;
    }

    var range = getSelectionRange();
    if(!range) return;
    var element = document.createElement("code");
    element.textContent = range.collapsed ? "code" : range.toString();
    range.deleteContents();
    range.insertNode(element);
    var selection = window.getSelection();
    var newRange = document.createRange();
    newRange.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(newRange);
  };

  var insertHorizontalRule = function() {
    var rule = document.createElement("hr");
    insertBlock(rule);
    if(rule.nextSibling) {
      placeCaret(rule.nextSibling, false);
    }
  };

  // ---------------------------------------------------------------- Dialogs

  var openDialog = function(options) {
    saveRange();
    dialogOptions = options;

    var form = dialogBackdrop.querySelector(".wmd-dialog");
    var title = dialogBackdrop.querySelector(".wmd-dialog-title");
    var fields = dialogBackdrop.querySelector(".wmd-dialog-fields");
    var removeButton = dialogBackdrop.querySelector(".wmd-dialog-remove");
    var okButton = dialogBackdrop.querySelector(".wmd-dialog-ok");

    var titleId = rootId + "DialogTitle";
    title.id = titleId;
    title.textContent = options.title;
    form.setAttribute("aria-labelledby", titleId);
    okButton.textContent = options.okLabel || "OK";

    fields.innerHTML = "";
    for(var fieldIndex = 0; fieldIndex < options.fields.length; fieldIndex++) {
      var field = options.fields[fieldIndex];
      var fieldId = rootId + "Field" + fieldIndex;
      var label = document.createElement("label");
      label.setAttribute("for", fieldId);
      label.textContent = field.label;
      var input = document.createElement("input");
      input.id = fieldId;
      input.name = field.name;
      input.type = field.type || "text";
      input.value = field.value || "";
      if(field.min !== undefined) input.min = field.min;
      if(field.max !== undefined) input.max = field.max;
      if(field.placeholder) input.placeholder = field.placeholder;
      fields.appendChild(label);
      fields.appendChild(input);
    }

    // Set display directly: the shared button style would otherwise override the hidden attribute
    if(options.removeLabel) {
      removeButton.textContent = options.removeLabel;
      removeButton.hidden = false;
      removeButton.style.display = "";
    } else {
      removeButton.hidden = true;
      removeButton.style.display = "none";
    }

    dialogBackdrop.hidden = false;
    var first = fields.querySelector("input");
    if(first) {
      first.focus();
      first.select();
    }
  };

  var closeDialog = function() {
    dialogBackdrop.hidden = true;
    dialogOptions = null;
    focusEditor();
  };

  var dialogValues = function() {
    var values = {};
    var inputs = dialogBackdrop.querySelectorAll(".wmd-dialog-fields input");
    for(var inputIndex = 0; inputIndex < inputs.length; inputIndex++) {
      values[inputs[inputIndex].name] = inputs[inputIndex].value;
    }
    return values;
  };

  var bindDialog = function() {
    var form = dialogBackdrop.querySelector(".wmd-dialog");
    form.onsubmit = function(event) {
      event.preventDefault();
      var options = dialogOptions;
      var values = dialogValues();
      closeDialog();
      if(options && options.onOk) {
        edit(function() { options.onOk(values); })();
      }
      return false;
    };
    dialogBackdrop.querySelector(".wmd-dialog-cancel").onclick = function() {
      closeDialog();
      return false;
    };
    dialogBackdrop.querySelector(".wmd-dialog-remove").onclick = function() {
      var options = dialogOptions;
      closeDialog();
      if(options && options.onRemove) {
        edit(options.onRemove)();
      }
      return false;
    };
    dialogBackdrop.onkeydown = function(event) {
      if(event.key === "Escape") {
        event.preventDefault();
        closeDialog();
        return;
      }
      if(event.key === "Tab") {
        // Keep keyboard focus inside the dialog
        var focusable = [];
        var candidates = form.querySelectorAll("input,button");
        for(var candidateIndex = 0; candidateIndex < candidates.length; candidateIndex++) {
          if(!candidates[candidateIndex].hidden) focusable.push(candidates[candidateIndex]);
        }
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if(event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if(!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    dialogBackdrop.onmousedown = function(event) {
      if(event.target === dialogBackdrop) {
        closeDialog();
      }
    };
  };

  // ---------------------------------------------------------------- Links

  var editLink = function() {
    focusEditor();
    saveRange();
    var link = closestInSurface(selectionNode(), "a");
    var range = getSelectionRange();
    var selectedText = range ? range.toString() : "";

    openDialog({
      title: link ? "Edit link" : "Insert link",
      okLabel: link ? "Update" : "Insert",
      removeLabel: link ? "Remove link" : null,
      fields: [
        { name: "text", label: "Link text", value: link ? link.textContent : selectedText },
        { name: "url", label: "URL", type: "url", value: link ? link.getAttribute("href") : "https://" }
      ],
      onOk: function(values) {
        if(!values.url) return;
        if(link) {
          link.setAttribute("href", values.url);
          if(values.text && values.text !== link.textContent) {
            link.textContent = values.text;
          }
          return;
        }
        restoreRange();
        var newLink = document.createElement("a");
        newLink.setAttribute("href", values.url);
        newLink.textContent = values.text || values.url;
        insertNodeAtCursor(newLink);
      },
      onRemove: function() {
        if(link) unwrap(link);
      }
    });
  };

  // ---------------------------------------------------------------- Images

  var insertImageNode = function(src, alt) {
    if(!src) return;
    var image = document.createElement("img");
    image.src = src;
    image.alt = alt || "";
    insertNodeAtCursor(image);
  };

  var insertImageFromUrl = function() {
    openDialog({
      title: "Insert image",
      okLabel: "Insert",
      fields: [
        { name: "url", label: "Image URL", type: "url", value: "https://" },
        { name: "alt", label: "Description (alt text)", value: "" }
      ],
      onOk: function(values) {
        restoreRange();
        insertImageNode(values.url, values.alt);
      }
    });
  };

  var readImageFile = function(file, alt) {
    var reader = new FileReader();
    reader.onload = function(loadEvent) {
      edit(function() {
        restoreRange();
        insertImageNode(loadEvent.target.result, alt);
      })();
    };
    reader.readAsDataURL(file);
  };

  // ---------------------------------------------------------------- Pasting

  // Chrome's insertHTML adds inline font styles to match the surrounding text; the surface never needs them
  var removeInlineStyles = function() {
    var styled = surface.querySelectorAll("[style]");
    for(var styledIndex = 0; styledIndex < styled.length; styledIndex++) {
      styled[styledIndex].removeAttribute("style");
    }
    var spans = surface.querySelectorAll("span");
    for(var spanIndex = 0; spanIndex < spans.length; spanIndex++) {
      if(spans[spanIndex].attributes.length === 0) {
        unwrap(spans[spanIndex]);
      }
    }
  };

  var cleanPastedHtml = function(html) {
    var fromOffice = /mso-|class="?Mso|urn:schemas-microsoft-com|docs-internal-guid|<o:p/i.test(html);
    var container = document.createElement("div");
    container.innerHTML = html;

    var junk = container.querySelectorAll("style,script,meta,link,title,xml");
    for(var junkIndex = 0; junkIndex < junk.length; junkIndex++) {
      junk[junkIndex].parentNode.removeChild(junk[junkIndex]);
    }
    var officeParagraphs = container.getElementsByTagName("o:p");
    while(officeParagraphs.length) {
      officeParagraphs[0].parentNode.removeChild(officeParagraphs[0]);
    }
    // Clipboard HTML often carries comments (for example StartFragment markers) that shouldn't be kept
    var walker = document.createTreeWalker(container, NodeFilter.SHOW_COMMENT, null, false);
    var comments = [];
    while(walker.nextNode()) comments.push(walker.currentNode);
    for(var commentIndex = 0; commentIndex < comments.length; commentIndex++) {
      comments[commentIndex].parentNode.removeChild(comments[commentIndex]);
    }

    return { html: markdownToHtml(htmlToMarkdown(container.innerHTML)), fromOffice: fromOffice };
  };

  var handleFileUpload = function(event) {
    var file = event.target.files[0];
    if(!file) return;
    readImageFile(file, file.name);
    event.target.value = "";
  };

  // ---------------------------------------------------------------- Code blocks

  var editCodeBlock = function() {
    focusEditor();
    saveRange();
    var pre = closestInSurface(selectionNode(), "pre");
    var code = pre ? pre.querySelector("code") : null;
    var currentLanguage = "";
    if(code) {
      var match = (code.getAttribute("class") || "").match(/language-(\S+)/);
      if(match) currentLanguage = match[1];
    }
    var range = getSelectionRange();
    var selectedText = range ? range.toString() : "";

    openDialog({
      title: pre ? "Code block" : "Insert code block",
      okLabel: pre ? "Update" : "Insert",
      removeLabel: pre ? "Remove code block" : null,
      fields: [
        { name: "language", label: "Language (optional, for example javascript)", value: currentLanguage, placeholder: "none" }
      ],
      onOk: function(values) {
        var language = (values.language || "").trim().replace(/\s+/g, "-");
        if(pre) {
          if(!code) {
            code = document.createElement("code");
            while(pre.firstChild) code.appendChild(pre.firstChild);
            pre.appendChild(code);
          }
          if(language) {
            code.setAttribute("class", "language-" + language);
          } else {
            code.removeAttribute("class");
          }
          return;
        }
        restoreRange();
        var newRange = getSelectionRange();
        if(newRange && !newRange.collapsed) {
          newRange.deleteContents();
        }
        var newPre = document.createElement("pre");
        var newCode = document.createElement("code");
        if(language) newCode.setAttribute("class", "language-" + language);
        newCode.textContent = selectedText ? selectedText + "\n" : "\n";
        newPre.appendChild(newCode);
        insertBlock(newPre);
        placeCaret(newCode, false);
      },
      onRemove: function() {
        if(!pre) return;
        var lines = pre.textContent.replace(/\n$/, "").split("\n");
        var paragraph = document.createElement("p");
        for(var lineIndex = 0; lineIndex < lines.length; lineIndex++) {
          if(lineIndex > 0) paragraph.appendChild(document.createElement("br"));
          paragraph.appendChild(document.createTextNode(lines[lineIndex]));
        }
        pre.parentNode.replaceChild(paragraph, pre);
        placeCaret(paragraph, true);
      }
    });
  };

  // ---------------------------------------------------------------- Tables

  var createCell = function(tagName, text) {
    var cell = document.createElement(tagName);
    if(text) {
      cell.textContent = text;
    } else {
      cell.innerHTML = "<br>";
    }
    return cell;
  };

  var insertTable = function() {
    openDialog({
      title: "Insert table",
      okLabel: "Insert",
      fields: [
        { name: "columns", label: "Columns", type: "number", value: "3", min: 1, max: 20 },
        { name: "rows", label: "Rows (not counting the header row)", type: "number", value: "2", min: 1, max: 100 }
      ],
      onOk: function(values) {
        var columns = Math.max(1, Math.min(20, parseInt(values.columns, 10) || 3));
        var rows = Math.max(1, Math.min(100, parseInt(values.rows, 10) || 2));

        var table = document.createElement("table");
        var head = document.createElement("thead");
        var headRow = document.createElement("tr");
        for(var headIndex = 0; headIndex < columns; headIndex++) {
          headRow.appendChild(createCell("th", "Heading " + (headIndex + 1)));
        }
        head.appendChild(headRow);
        table.appendChild(head);

        var body = document.createElement("tbody");
        for(var rowIndex = 0; rowIndex < rows; rowIndex++) {
          var row = document.createElement("tr");
          for(var columnIndex = 0; columnIndex < columns; columnIndex++) {
            row.appendChild(createCell("td"));
          }
          body.appendChild(row);
        }
        table.appendChild(body);

        restoreRange();
        insertBlock(table);
        placeCaret(headRow.firstChild, true);
      }
    });
  };

  var currentCell = function() {
    return closestInSurface(selectionNode(), "td,th");
  };

  var cellIndex = function(cell) {
    return Array.prototype.indexOf.call(cell.parentNode.children, cell);
  };

  var tableAction = function(action) {
    var cell = currentCell();
    if(!cell) return;
    var row = cell.parentNode;
    var table = closestInSurface(row, "table");
    var index = cellIndex(cell);
    var rows = table.querySelectorAll("tr");
    var rowIndex;

    if(action === "add-row") {
      var newRow = document.createElement("tr");
      for(var addIndex = 0; addIndex < row.children.length; addIndex++) {
        newRow.appendChild(createCell("td"));
      }
      if(row.parentNode.tagName === "THEAD") {
        var body = table.querySelector("tbody");
        if(!body) {
          body = document.createElement("tbody");
          table.appendChild(body);
        }
        body.insertBefore(newRow, body.firstChild);
      } else {
        row.parentNode.insertBefore(newRow, row.nextSibling);
      }
      placeCaret(newRow.children[Math.min(index, newRow.children.length - 1)], true);
    } else if(action === "add-column") {
      for(rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        var isHead = rows[rowIndex].parentNode.tagName === "THEAD";
        var newCell = createCell(isHead ? "th" : "td", isHead ? "Heading" : null);
        var reference = rows[rowIndex].children[index];
        rows[rowIndex].insertBefore(newCell, reference ? reference.nextSibling : null);
      }
      placeCaret(row.children[index + 1], true);
    } else if(action === "delete-row") {
      if(row.parentNode.tagName === "THEAD") {
        showStatus("The header row can't be deleted. Delete the table instead.");
        return;
      }
      var target = row.nextElementSibling || row.previousElementSibling;
      row.parentNode.removeChild(row);
      if(target) {
        placeCaret(target.children[Math.min(index, target.children.length - 1)], true);
      } else {
        var headCell = table.querySelector("th");
        if(headCell) placeCaret(headCell, true);
      }
    } else if(action === "delete-column") {
      if(row.children.length <= 1) {
        tableAction("delete-table");
        return;
      }
      for(rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        var columnCell = rows[rowIndex].children[index];
        if(columnCell) rows[rowIndex].removeChild(columnCell);
      }
      placeCaret(row.children[Math.max(0, index - 1)], true);
    } else if(action === "delete-table") {
      var paragraph = newParagraph();
      table.parentNode.replaceChild(paragraph, table);
      placeCaret(paragraph, false);
    }
  };

  var moveBetweenCells = function(backwards) {
    var cell = currentCell();
    if(!cell) return false;
    var table = closestInSurface(cell, "table");
    var cells = table.querySelectorAll("th,td");
    var position = Array.prototype.indexOf.call(cells, cell) + (backwards ? -1 : 1);
    if(position >= 0 && position < cells.length) {
      placeCaret(cells[position], true);
    } else if(!backwards) {
      edit(function() { tableAction("add-row"); })();
    }
    return true;
  };

  var updateTableBar = function() {
    if(!tableBar) return;
    tableBar.hidden = !currentCell();
  };

  // ---------------------------------------------------------------- Toolbar state

  var setActive = function(button, active) {
    button.className = button.className.replace(/\s*active/g, "");
    if(active) {
      button.className += " active";
    }
    button.setAttribute("aria-pressed", active ? "true" : "false");
  };

  var updateActiveButtons = function() {
    if(!root) return;
    var inSurface = getSelectionRange() !== null;
    var node = selectionNode();
    var block = currentBlockFormat();
    var inPre = closestInSurface(node, "pre");

    var states = {
      // Headings are bold by default, so look for real bold markup rather than asking the browser
      bold: function() { return closestInSurface(node, "b,strong") !== null; },
      italic: function() { return document.queryCommandState("italic"); },
      strikethrough: function() { return document.queryCommandState("strikeThrough"); },
      code: function() { return !inPre && closestInSurface(node, "code") !== null; },
      h1: function() { return block === "h1"; },
      h2: function() { return block === "h2"; },
      h3: function() { return block === "h3"; },
      h4: function() { return block === "h4"; },
      insertUnorderedList: function() { return document.queryCommandState("insertUnorderedList"); },
      insertOrderedList: function() { return document.queryCommandState("insertOrderedList"); },
      blockquote: function() { return closestInSurface(node, "blockquote") !== null; },
      pre: function() { return inPre !== null; },
      link: function() { return closestInSurface(node, "a") !== null; }
    };

    var buttons = root.querySelectorAll("[data-wmd-state]");
    for(var buttonIndex = 0; buttonIndex < buttons.length; buttonIndex++) {
      var state = states[buttons[buttonIndex].getAttribute("data-wmd-state")];
      setActive(buttons[buttonIndex], inSurface && state ? state() : false);
    }
    updateTableBar();
  };

  // ---------------------------------------------------------------- Binding

  var actions = {
    "bold": edit(function() { exec("bold"); }),
    "italic": edit(function() { exec("italic"); }),
    "strikethrough": edit(function() { exec("strikeThrough"); }),
    "code": edit(toggleInlineCode),
    "heading": function(button) { edit(function() { toggleHeading(button.getAttribute("data-wmd-level")); })(); },
    "bullet-list": edit(function() { exec("insertUnorderedList"); }),
    "numbered-list": edit(function() { exec("insertOrderedList"); }),
    "quote": edit(toggleQuote),
    "code-block": editCodeBlock,
    "hr": edit(insertHorizontalRule),
    "link": editLink,
    "table": insertTable,
    "image-url": function() { focusEditor(); saveRange(); insertImageFromUrl(); },
    "image-upload": function() { focusEditor(); saveRange(); if(fileInput) fileInput.click(); },
    "undo": undo,
    "redo": redo
  };

  var bindToolbar = function() {
    var toolbar = root.querySelector(".wmd-toolbar");
    var buttons = toolbar.querySelectorAll("button");

    for(var buttonIndex = 0; buttonIndex < buttons.length; buttonIndex++) {
      var button = buttons[buttonIndex];
      // Roving tab index: Tab reaches the toolbar once, arrow keys move along it
      button.tabIndex = buttonIndex === 0 ? 0 : -1;
      button.onmousedown = function(event) {
        event.preventDefault();
      };
      button.onclick = function() {
        var modeName = this.getAttribute("data-wmd-mode");
        if(modeName) {
          setMode(modeName);
          return false;
        }
        var action = actions[this.getAttribute("data-wmd-action")];
        if(action) action(this);
        return false;
      };
    }

    toolbar.onkeydown = function(event) {
      var list = Array.prototype.slice.call(toolbar.querySelectorAll("button")).filter(function(button) {
        return !button.disabled;
      });
      var position = list.indexOf(document.activeElement);
      if(position < 0) return;
      var next = -1;
      if(event.key === "ArrowRight") next = (position + 1) % list.length;
      if(event.key === "ArrowLeft") next = (position - 1 + list.length) % list.length;
      if(event.key === "Home") next = 0;
      if(event.key === "End") next = list.length - 1;
      if(event.key === "Escape") {
        event.preventDefault();
        focusEditor();
        return;
      }
      if(next >= 0) {
        event.preventDefault();
        list[position].tabIndex = -1;
        list[next].tabIndex = 0;
        list[next].focus();
      }
    };

    var tableButtons = tableBar.querySelectorAll("button");
    for(var tableIndex = 0; tableIndex < tableButtons.length; tableIndex++) {
      tableButtons[tableIndex].onmousedown = function(event) {
        event.preventDefault();
      };
      tableButtons[tableIndex].onclick = function() {
        var tableActionName = this.getAttribute("data-wmd-table");
        focusEditor();
        edit(function() { tableAction(tableActionName); })();
        return false;
      };
    }

    if(fileInput) {
      fileInput.onchange = handleFileUpload;
    }
  };

  var handleShortcut = function(event) {
    var ctrl = event.ctrlKey || event.metaKey;
    var key = (event.key || "").toLowerCase();

    // A typed web address becomes a link when it is followed by a space or Enter (OFS-R-002)
    if((event.key === " " || event.key === "Enter") && !ctrl && !event.altKey) {
      var found = addressBeforeCaret(surface);
      if(found) {
        // Keep the text before the link as an undo step; the link and the space or Enter that follows
        // are recorded together by the normal input handling, so one Undo removes the link.
        recordHistory();
        linkAddressBeforeCaret(found);
      }
    }

    if(event.key === "Tab" && currentCell()) {
      event.preventDefault();
      moveBetweenCells(event.shiftKey);
      return;
    }

    if(event.key === "Enter" && !ctrl && closestInSurface(selectionNode(), "pre")) {
      // Keep new lines inside a code block as real new line characters, not <br> or new paragraphs
      event.preventDefault();
      recordHistory();
      var range = getSelectionRange();
      if(range) {
        var codeElement = closestInSurface(selectionNode(), "pre");
        codeElement = codeElement.querySelector("code") || codeElement;
        range.deleteContents();
        var newLine = document.createTextNode("\n");
        range.insertNode(newLine);
        // A new line at the very end of the block needs a second one after it to be visible
        var rest = document.createRange();
        rest.setStartAfter(newLine);
        rest.setEnd(codeElement, codeElement.childNodes.length);
        if(rest.toString() === "") {
          codeElement.appendChild(document.createTextNode("\n"));
        }
        range.setStartAfter(newLine);
        range.collapse(true);
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
      scheduleChange();
      return;
    }

    var enterCode = event.key === "Enter" && !ctrl ? closestInSurface(selectionNode(), "code") : null;
    if(enterCode && !closestInSurface(enterCode, "pre")) {
      // At the end of inline code, step outside it before the new line is made, so it isn't carried on
      var enterRange = getSelectionRange();
      var after = document.createRange();
      after.setStart(enterRange.endContainer, enterRange.endOffset);
      after.setEnd(enterCode, enterCode.childNodes.length);
      if(enterRange.collapsed && after.toString() === "") {
        var outside = document.createRange();
        outside.setStartAfter(enterCode);
        outside.collapse(true);
        var enterSelection = window.getSelection();
        enterSelection.removeAllRanges();
        enterSelection.addRange(outside);
      }
    }

    if(event.key === "Enter" && !ctrl && closestInSurface(selectionNode(), "code")) {
      // Chrome carries inline code onto the new line, either as an empty code element or as a
      // remembered typing style. Remove the element, and reset the selection to clear the style.
      setTimeout(function() {
        var range = getSelectionRange();
        if(!range) return;
        var code = closestInSurface(range.startContainer, "code");
        if(code && !closestInSurface(code, "pre") && code.textContent.replace(/​/g, "") === "") {
          var block = code.parentNode;
          unwrap(code);
          if(block && block.textContent === "" && !block.querySelector("br")) {
            block.appendChild(document.createElement("br"));
          }
          placeCaret(block, false);
        } else {
          var selection = window.getSelection();
          var copy = range.cloneRange();
          selection.removeAllRanges();
          selection.addRange(copy);
        }
        updateActiveButtons();
      }, 0);
    }

    if(event.key === "Enter" && ctrl) {
      // Ctrl+Enter leaves a code block, table or quote and starts a new paragraph after it
      var block = closestInSurface(selectionNode(), "pre,table,blockquote");
      if(block) {
        event.preventDefault();
        edit(function() {
          var paragraph = newParagraph();
          block.parentNode.insertBefore(paragraph, block.nextSibling);
          placeCaret(paragraph, false);
        })();
      }
      return;
    }

    if(!ctrl) return;

    if(event.altKey && /^[1-4]$/.test(event.key)) {
      event.preventDefault();
      edit(function() { toggleHeading(event.key); })();
      return;
    }

    if(event.shiftKey) {
      if(key === "x") { event.preventDefault(); actions.strikethrough(); }
      else if(key === "8" || key === "*") { event.preventDefault(); actions["bullet-list"](); }
      else if(key === "7" || key === "&") { event.preventDefault(); actions["numbered-list"](); }
      else if(key === "9" || key === "(") { event.preventDefault(); actions.quote(); }
      else if(key === "z") { event.preventDefault(); redo(); }
      return;
    }

    if(key === "b") { event.preventDefault(); actions.bold(); }
    else if(key === "i") { event.preventDefault(); actions.italic(); }
    else if(key === "e") { event.preventDefault(); actions.code(); }
    else if(key === "k") { event.preventDefault(); editLink(); }
    else if(key === "z") { event.preventDefault(); undo(); }
    else if(key === "y") { event.preventDefault(); redo(); }
    else if(key === "u") { event.preventDefault(); showStatus("Markdown has no underline."); }
  };

  var bindSurface = function() {
    surface.oninput = scheduleChange;
    bindLinkHint(surface);
    surface.onkeydown = handleShortcut;
    surface.onblur = saveRange;
    surface.addEventListener("beforeinput", function(event) {
      // Browser menu undo/redo would bypass this editor's own history
      if(event.inputType === "historyUndo") { event.preventDefault(); undo(); }
      if(event.inputType === "historyRedo") { event.preventDefault(); redo(); }
    });
    surface.onclick = function(event) {
      if(!(event.ctrlKey || event.metaKey)) return;
      var link = event.target.closest ? event.target.closest("a") : null;
      if(!link) return;
      event.preventDefault();
      window.open(link.href, "_blank", "noopener");
    };
    surface.onpaste = function(event) {
      var clipboard = event.clipboardData;
      if(!clipboard) return;

      // Inside a code block, always paste plain text
      if(closestInSurface(selectionNode(), "pre")) {
        event.preventDefault();
        edit(function() { document.execCommand("insertText", false, clipboard.getData("text/plain")); })();
        return;
      }

      // Rich content (Word, Google Docs, web pages) is passed through Markdown so that only
      // what Markdown can hold is pasted. Word also puts a picture of the selection on the
      // clipboard, so the HTML is checked before any image.
      var html = clipboard.getData("text/html");
      if(html) {
        var cleaned = cleanPastedHtml(html);
        if(cleaned.html.trim() !== "") {
          event.preventDefault();
          edit(function() {
            document.execCommand("insertHTML", false, cleaned.html);
            removeInlineStyles();
          })();
          if(cleaned.fromOffice) {
            showStatus("Pasted text was converted to Markdown. Colours, fonts and page layout from the original were removed.", "info");
          }
          return;
        }
      }

      // Plain text with web addresses: paste it with the addresses as links (OFS-R-002)
      var plain = clipboard.getData("text/plain");
      if(plain && /https?:\/\//i.test(plain)) {
        event.preventDefault();
        edit(function() { document.execCommand("insertHTML", false, plainTextWithLinks(plain)); removeInlineStyles(); })();
        return;
      }

      var items = clipboard.items;
      if(!items) return;
      for(var itemIndex = 0; itemIndex < items.length; itemIndex++) {
        if(items[itemIndex].type.indexOf("image/") === 0) {
          event.preventDefault();
          saveRange();
          readImageFile(items[itemIndex].getAsFile(), "pasted image");
          return;
        }
      }
    };

    document.addEventListener("selectionchange", function() {
      if(getSelectionRange()) {
        saveRange();
        updateActiveButtons();
      }
    });
  };

  // ---------------------------------------------------------------- Editor contract

  self.init = function() {
    if(typeof window.markdownit === "undefined" || typeof TurndownService === "undefined" || typeof turndownPluginGfm === "undefined") {
      OpenForum.setElement(containerId, "Error: the Markdown libraries could not be loaded from " + libraryPath);
      return;
    }
    createConverters();

    var content = OpenForum.loadFile(editorPath + "/editor.html.fragment", null, true);
    content = content.replace(/\{\{editorIndex\}\}/g, editorIndex);
    OpenForum.setElement(containerId, content);

    root = document.getElementById(rootId);
    surface = root.querySelector(".wmd-surface");
    fileInput = root.querySelector(".wmd-file-input");
    tableBar = root.querySelector(".wmd-table-bar");
    statusElement = root.querySelector(".wmd-status");
    dialogBackdrop = root.querySelector(".wmd-dialog-backdrop");

    try {
      document.execCommand("defaultParagraphSeparator", false, "p");
    } catch(e) {}

    bindToolbar();
    bindSurface();
    bindDialog();
    setEditorContent(loadSource(), false);

    self.ready = true;
  };

  self.getValue = function() {
    if(surface && visualDirty) {
      markdown = htmlToMarkdown(surface.innerHTML);
      visualDirty = false;
    }
    return markdown;
  };

  self.getMode = function() {
    return mode;
  };

  self.setMode = setMode;

  self.setValue = function(newData) {
    setEditorContent(newData, false);
  };

  self.getCodeMirror = function() {
    return codeMirrorAdapter;
  };

  self.refresh = function() {
    if(sourceEditor && sourceEditor.ready) {
      sourceEditor.refresh();
    }
  };

  self.renderOptions = function() {
    var data = "";

    data += renderTabOption("Close","Close editor","closeEditor( "+editorIndex+" )");
    data += renderTabOption("Full Screen","Full Screen "+pageName+"/"+fileName,"editorList["+editorIndex+"].editor.requestFullscreen()");
    data += renderTabOption("Save","Save "+pageName+"/"+fileName,"saveFile( '"+pageName+"' , '"+fileName+"' )");
    data += renderTabOption("Download to desktop","Download "+pageName+"/"+fileName,"OpenForum.Browser.download( '"+fileName+"',editorList["+editorIndex+"].editor.getValue() )");
    data += renderTabOption("Copy","Copy to clipboard","OpenForum.copyData( editorList["+editorIndex+"].editor.getValue() )");

    return data;
  };

  self.documentation = [
    {pageName: "OpenForum/Editor/Editors/WYSIWYGMarkDownEditor", title:"WYSIWYG Markdown Editor"}
  ];

  codeMirrorAdapter = {
    on: function(event,fn) {
      if(event == "change") {
        changeListeners.push(fn);
      }
    },
    setValue: function(newValue) {
      setEditorContent(newValue, true);
    },
    getValue: function() {
      return self.getValue();
    },
    focus: function() {
      focusEditor();
    }
  };

  OpenForum.loadCSS(editorsPath + "/SimpleHTMLEditor/page.css");
  OpenForum.loadCSS(editorPath + "/page.css");

  DependencyService.createNewDependency()
    .addDependency(libraryPath + "/markdown-it.min.js")
    .addDependency(libraryPath + "/turndown.js")
    .addDependency(libraryPath + "/turndown-plugin-gfm.js")
    .setOnLoadTrigger( function() {
      self.init();
    } ).loadDependencies();
}
