/*
 * Author: Claude
 * Description: Markdown preview for any page (OFS-R-002, OFS-T-008). Shows Markdown as formatted,
 * read-only HTML with a Formatted / Markdown switch, turns http:// and https:// addresses into links
 * that open in a new tab, and can do the same for the text of existing HTML (linkifyElement).
 * Raw HTML in the Markdown is shown as text, never run, because previews can show other people's content.
 *
 * Include only this file; it loads markdown-it from the same folder when needed.
 *   MarkdownView.ready().then(function() { MarkdownView.preview(element, markdown, { storageKey: "myApp.preview" }); });
 */
var MarkdownView = (function() {
  "use strict";

  // The folder markdown-it is loaded from. When this file is loaded by its own address (a script tag),
  // that address's folder, so a Development copy uses the Development markdown-it. OpenForum.includeScript
  // serves scripts combined through /OpenForum/Javascript/Services, so then a page can set
  // window.MarkdownViewFolder, otherwise the released library folder is used (markdown-it is the same file).
  // Derived rather than written out, so publishing doesn't change its meaning.
  var folder = (function() {
    var script = document.currentScript;
    var src = script && script.src ? script.src.split("?")[0] : "";
    if (/\/markdown-view\.js$/.test(src)) return src.substring(0, src.lastIndexOf("/"));
    return window.MarkdownViewFolder || "/OpenForum/Javascript/MarkDown";
  })();

  var URL_PATTERN = /\bhttps?:\/\/[^\s<>"'`]+/gi;
  var TRAILING = /[.,;:!?)\]}'"]+$/;
  var renderer = null;
  var loading = null;

  function safeHref(href) {
    return /^(https?:|mailto:)/i.test(String(href || "").trim());
  }

  function decorate(link) {
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  }

  function createRenderer() {
    var md = window.markdownit({ html: false, linkify: true, typographer: false });
    // Only addresses that start with http:// or https://; no guessing at www. names or emails.
    md.linkify.set({ fuzzyLink: false, fuzzyEmail: false, fuzzyIP: false });
    var allowed = md.validateLink;
    md.validateLink = function(url) { return allowed(url) && safeHref(url); };
    var defaultOpen = md.renderer.rules.link_open || function(tokens, idx, options, env, self) { return self.renderToken(tokens, idx, options); };
    md.renderer.rules.link_open = function(tokens, idx, options, env, self) {
      tokens[idx].attrSet("target", "_blank");
      tokens[idx].attrSet("rel", "noopener noreferrer");
      return defaultOpen(tokens, idx, options, env, self);
    };
    return md;
  }

  // Resolves when markdown-it is loaded. Rejects if it can't be, so callers can keep plain text.
  function ready() {
    if (renderer) return Promise.resolve();
    if (window.markdownit) { renderer = createRenderer(); return Promise.resolve(); }
    if (!loading) {
      loading = new Promise(function(resolve, reject) {
        var script = document.createElement("script");
        script.src = folder + "/markdown-it.min.js";
        script.onload = function() {
          if (!window.markdownit) { loading = null; reject(new Error("markdown-it did not load.")); return; }
          renderer = createRenderer();
          resolve();
        };
        script.onerror = function() { loading = null; reject(new Error("markdown-it could not be loaded.")); };
        document.head.appendChild(script);
      });
    }
    return loading;
  }

  // Formatted HTML for Markdown. Call after ready().
  function render(markdown) {
    if (!renderer) {
      if (!window.markdownit) throw new Error("Call MarkdownView.ready() before render().");
      renderer = createRenderer();
    }
    return renderer.render(String(markdown || ""));
  }

  // Turns bare http(s) addresses in the text of element into links, and makes every link open in a
  // new tab. Text inside links, code, pre, scripts and editable areas is left alone.
  function linkifyElement(element) {
    if (!element) return;
    var walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node) {
        if (!/https?:\/\//i.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        for (var parent = node.parentNode; parent && parent !== element.parentNode; parent = parent.parentNode) {
          if (/^(A|CODE|PRE|SCRIPT|STYLE|TEXTAREA|BUTTON)$/.test(parent.nodeName) || parent.isContentEditable) return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function(node) {
      var text = node.nodeValue, last = 0, fragment = document.createDocumentFragment(), match;
      URL_PATTERN.lastIndex = 0;
      while ((match = URL_PATTERN.exec(text))) {
        var address = match[0], trailing = (address.match(TRAILING) || [""])[0];
        address = address.slice(0, address.length - trailing.length);
        if (!address || !/^https?:\/\/[^/]/i.test(address)) continue;
        fragment.appendChild(document.createTextNode(text.slice(last, match.index)));
        var link = document.createElement("a");
        link.href = address;
        link.textContent = address;
        decorate(link);
        fragment.appendChild(link);
        last = match.index + address.length;
      }
      if (!last) return;
      fragment.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(fragment, node);
    });
    var links = element.querySelectorAll("a[href]");
    for (var i = 0; i < links.length; i++) {
      if (!links[i].closest("[contenteditable=true]")) decorate(links[i]);
    }
  }

  function readChoice(key) {
    if (!key) return null;
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }

  function saveChoice(key, value) {
    if (!key) return;
    try { window.localStorage.setItem(key, value); } catch (e) { /* storage blocked: keep the choice for this page only */ }
  }

  // Shows content in container with a Formatted / Markdown switch.
  // options.storageKey remembers the choice per browser; options.label names it for screen readers;
  // options.html gives ready-made formatted HTML (for example a table plus rendered sections) instead
  // of rendering the whole Markdown; options.className is added to the formatted view.
  function preview(container, markdown, options) {
    options = options || {};
    var choice = readChoice(options.storageKey) === "markdown" ? "markdown" : "formatted";
    container.replaceChildren();
    container.classList.add("mdv");

    var bar = document.createElement("div");
    bar.className = "mdv-switch";
    bar.setAttribute("role", "group");
    bar.setAttribute("aria-label", (options.label || "Preview") + " format");
    var formattedButton = document.createElement("button");
    var markdownButton = document.createElement("button");
    formattedButton.type = markdownButton.type = "button";
    formattedButton.textContent = "Formatted";
    markdownButton.textContent = "Markdown";
    bar.append(formattedButton, markdownButton);

    var formatted = document.createElement("div");
    formatted.className = "mdv-formatted" + (options.className ? " " + options.className : "");
    formatted.innerHTML = options.html !== undefined ? options.html : render(markdown);
    linkifyElement(formatted);

    var raw = document.createElement("pre");
    raw.className = "mdv-markdown";
    raw.tabIndex = 0;
    raw.textContent = markdown || "";

    function show(which, remember) {
      choice = which;
      formatted.hidden = which !== "formatted";
      raw.hidden = which !== "markdown";
      formattedButton.setAttribute("aria-pressed", String(which === "formatted"));
      markdownButton.setAttribute("aria-pressed", String(which === "markdown"));
      if (remember) saveChoice(options.storageKey, which);
    }
    formattedButton.onclick = function() { show("formatted", true); };
    markdownButton.onclick = function() { show("markdown", true); };
    show(choice, false);
    container.append(bar, formatted, raw);
    return { show: show, formatted: formatted, markdown: raw };
  }

  // A heading plus rendered Markdown, as HTML: used to build options.html from parts.
  function escapeHtml(text) {
    return String(text === undefined || text === null ? "" : text).replace(/[&<>"']/g, function(c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c];
    });
  }

  // Basic styles, added once, scoped to .mdv so they don't touch the rest of the page.
  (function addStyles() {
    if (document.getElementById("markdownViewStyles")) return;
    var style = document.createElement("style");
    style.id = "markdownViewStyles";
    style.textContent = [
      ".mdv-switch{display:inline-flex;gap:0;margin:0 0 8px;border:1px solid #cbd5e1;border-radius:6px;overflow:hidden}",
      ".mdv-switch button{margin:0;border:0;border-radius:0;padding:4px 12px;font-size:12px;line-height:1.4;background:#fff;color:#334155;cursor:pointer;box-shadow:none;text-transform:none}",
      ".mdv-switch button+button{border-left:1px solid #cbd5e1}",
      ".mdv-switch button[aria-pressed=true]{background:#1e3a5f;color:#fff}",
      ".mdv-switch button:focus-visible{outline:2px solid #2563eb;outline-offset:-2px}",
      ".mdv-formatted{overflow-wrap:anywhere;line-height:1.5}",
      // Page frameworks (Foundation) size p, li and table text themselves; follow the preview's own size
      ".mdv-formatted p,.mdv-formatted li,.mdv-formatted ul,.mdv-formatted ol,.mdv-formatted td,.mdv-formatted th,.mdv-formatted blockquote,.mdv-formatted table{font-size:inherit;line-height:inherit;font-family:inherit;color:inherit}",
      ".mdv-formatted table{background:none;border:0}.mdv-formatted tr,.mdv-formatted tr:nth-of-type(even){background:none}",
      ".mdv-formatted h1,.mdv-formatted h2,.mdv-formatted h3,.mdv-formatted h4{margin:1em 0 .4em;line-height:1.25}",
      ".mdv-formatted h1{font-size:1.4em}.mdv-formatted h2{font-size:1.2em}.mdv-formatted h3{font-size:1.05em}.mdv-formatted h4{font-size:1em}",
      ".mdv-formatted>:first-child{margin-top:0}",
      ".mdv-formatted p,.mdv-formatted ul,.mdv-formatted ol,.mdv-formatted table,.mdv-formatted pre,.mdv-formatted blockquote{margin:0 0 .8em}",
      ".mdv-formatted ul,.mdv-formatted ol{padding-left:1.5em;margin-left:0}",
      ".mdv-formatted a{color:#1d4ed8;text-decoration:underline}",
      ".mdv-formatted code{background:#f1f5f9;padding:1px 4px;border-radius:3px;font-size:.92em}",
      ".mdv-formatted pre{background:#f1f5f9;padding:10px;border-radius:6px;overflow:auto;white-space:pre-wrap}",
      ".mdv-formatted pre code{background:none;padding:0}",
      ".mdv-formatted blockquote{border-left:3px solid #cbd5e1;padding-left:10px;color:#475569}",
      ".mdv-formatted table{border-collapse:collapse;max-width:100%;display:block;overflow:auto}",
      ".mdv-formatted th,.mdv-formatted td{border:1px solid #e2e8f0;padding:4px 8px;text-align:left;vertical-align:top}",
      ".mdv-markdown{white-space:pre-wrap;overflow-wrap:anywhere;margin:0}",
      ".mdv [hidden]{display:none!important}"
    ].join("\n");
    document.head.appendChild(style);
  })();

  return { ready: ready, render: render, preview: preview, linkifyElement: linkifyElement, escapeHtml: escapeHtml, safeHref: safeHref };
})();
