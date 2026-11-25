OpenForum.loadScript("/OpenForum/Javascript/VideoCapture/VideoCapture.js");

function SimpleHTMLEditor(editorIndex,pageName,fileName,markChanged) {
  var self = this;
  var containerId = "editor" + editorIndex;
  var rootId = "simpleHtmlEditor" + editorIndex;
  var editableId = "simpleHtmlEditor" + editorIndex + "Surface";
  var fileInputId = "simpleHtmlEditor" + editorIndex + "FileInput";
  var photoModalId = "simpleHtmlEditor" + editorIndex + "PhotoModal";
  var photoCanvasId = "simpleHtmlEditor" + editorIndex + "PhotoCanvas";
  var photoCaptureButtonId = "simpleHtmlEditor" + editorIndex + "CapturePhotoButton";
  var photoInsertButtonId = "simpleHtmlEditor" + editorIndex + "InsertPhotoButton";
  var photoFacingSelectId = "simpleHtmlEditor" + editorIndex + "PhotoFacing";
  var editable = null;
  var fileInput = null;
  var photoCapture = null;
  var photoPaused = false;
  var photoCaptured = false;
  var photoModalVisible = false;
  var photoFacing = localStorage.getItem("OpenForum.SimpleHTMLEditor.photoFacing") || "environment";
  var source = "";
  var changeListeners = [];
  var savedRange = null;
  var codeMirrorAdapter = null;

  self.ready = false;
  self.changed = "";
  window.SimpleHTMLEditorInstances = window.SimpleHTMLEditorInstances || {};
  window.SimpleHTMLEditorInstances[editorIndex] = self;

  self.requestFullscreen = function() {
    document.getElementById( containerId ).requestFullscreen();
  };

  var loadSource = function() {
    if(OpenForum.file.attachmentExists(pageName,fileName)==="true") {
      return OpenForum.loadFile(pageName+"/"+fileName,null,true);
    }

    if(OpenForum.file.attachmentExists("/OpenForum/FileTemplates/html",fileName+".default")==="true") {
      return OpenForum.loadFile("/OpenForum/FileTemplates/html/"+fileName+".default");
    }

    if(fileName == "unnamed.html") {
      return "";
    }

    return OpenForum.loadFile("/OpenForum/FileTemplates/html/default.html");
  };

  var getSelectionRange = function() {
    var selection = window.getSelection();
    if(selection && selection.rangeCount) {
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
    if(editable) {
      editable.focus();
    }
  };

  var insertNodeAtCursor = function(node) {
    restoreRange();
    focusEditor();

    var selection = window.getSelection();
    if(selection && selection.rangeCount) {
      var range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(node);
      range.setStartAfter(node);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      editable.appendChild(node);
    }

    notifyChange();
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

  var notifyChange = function() {
    if(!editable) return;

    var currentSource = self.getValue();
    if(source != currentSource) {
      source = currentSource;
      self.changed = "*";
      if(editorList[editorIndex]) {
        editorList[editorIndex].changed = "*";
      }
      for(var listenerIndex in changeListeners) {
        changeListeners[listenerIndex](codeMirrorAdapter, {origin: "simple-html"});
      }
    }
  };

  var setEditorContent = function(newData, markAsChanged) {
    if(!editable) return;

    editable.innerHTML = newData || "";
    // Bare web addresses in loaded content are shown as links; they are saved as links only with the next edit
    linkAddressesIn(editable);
    if(markAsChanged) {
      notifyChange();
    } else {
      source = self.getValue();
    }
  };

  var exec = function(command, value) {
    focusEditor();
    document.execCommand(command, false, value || null);
    notifyChange();
    updateActiveButtons();
  };

  var insertHeading = function(level) {
    var tag = "h" + level;
    var currentBlock = (document.queryCommandValue("formatBlock") || "").toLowerCase();
    exec("formatBlock", currentBlock === tag ? "p" : tag);
  };

  var insertQuote = function() {
    var currentBlock = (document.queryCommandValue("formatBlock") || "").toLowerCase();
    exec("formatBlock", currentBlock === "blockquote" ? "p" : "blockquote");
  };

  var insertHorizontalRule = function() {
    restoreRange();
    focusEditor();

    var selection = window.getSelection();
    var range = getSelectionRange();
    var hr = document.createElement("hr");
    var paragraph = document.createElement("p");
    paragraph.innerHTML = "<br>";

    if(range) {
      range.deleteContents();
      range.insertNode(paragraph);
      range.insertNode(hr);
      range.setStart(paragraph, 0);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      editable.appendChild(hr);
      editable.appendChild(paragraph);
    }

    notifyChange();
  };

  var insertLink = function() {
    restoreRange();
    focusEditor();

    var selection = window.getSelection();
    var selectedText = selection ? selection.toString() : "";
    var url = prompt("Link URL", "https://");
    if(!url) return;

    var linkText = selectedText || prompt("Link text", url) || url;
    var link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = linkText;

    insertNodeAtCursor(link);
  };

  var insertImageNode = function(src, alt) {
    if(!src) return;

    var image = document.createElement("img");
    image.src = src;
    image.alt = alt || "";
    insertNodeAtCursor(image);
  };

  var insertImageFromUrl = function() {
    var url = prompt("Image URL", "https://");
    if(!url) return;

    insertImageNode(url, prompt("Alt text", "") || "");
  };

  var triggerFileInput = function() {
    saveRange();
    if(fileInput) {
      fileInput.click();
    }
  };

  var updatePhotoCaptureButton = function() {
    var button = document.getElementById(photoCaptureButtonId);
    if(button) {
      button.innerHTML = photoPaused ? "Retake" : "Capture";
    }
  };

  var updatePhotoInsertButton = function() {
    var button = document.getElementById(photoInsertButtonId);
    if(button) {
      button.disabled = !photoCaptured;
    }
  };

  var updatePhotoFacingSelect = function() {
    var select = document.getElementById(photoFacingSelectId);
    if(select && select.value !== photoFacing) {
      select.value = photoFacing;
    }
  };

  var stopPhotoCapture = function() {
    if(photoCapture && photoPaused) {
      photoPaused = false;
    }

    if(photoCapture && photoCapture.stop) {
      photoCapture.stop();
    }
    photoCapture = null;

    if(window.stream && window.stream.getTracks) {
      var tracks = window.stream.getTracks();
      for(var trackIndex = 0; trackIndex < tracks.length; trackIndex++) {
        tracks[trackIndex].stop();
      }
      window.stream = null;
    }
  };

  var openPhotoModal = function() {
    photoModalVisible = true;
    var modal = document.getElementById(photoModalId);
    if(modal && modal.parentNode && modal.parentNode !== document.body) {
      document.body.appendChild(modal);
    }
    if(modal) {
      modal.style.display = "block";
      modal.style.visibility = "visible";
      modal.style.opacity = "1";
    }

    if(window.jQuery && $("#" + photoModalId).length && $("#" + photoModalId).foundation) {
      $("#" + photoModalId).foundation("reveal", "open");
      return;
    }

    if(modal) {
      modal.className = modal.className.indexOf("open") >= 0 ? modal.className : modal.className + " open";
    }
  };

  var closePhotoModal = function() {
    photoModalVisible = false;

    if(window.jQuery && $("#" + photoModalId).length && $("#" + photoModalId).foundation) {
      $("#" + photoModalId).foundation("reveal", "close");
      return;
    }

    var modal = document.getElementById(photoModalId);
    if(modal) {
      modal.style.display = "none";
      modal.style.visibility = "hidden";
      modal.style.opacity = "0";
      modal.className = modal.className.replace(/\s*open\b/g, "");
    }
  };

  var waitForVideoCapture = function(callback) {
    if(typeof OpenForum.VideoCapture !== "undefined") {
      callback();
      return;
    }

    setTimeout(function() {
      waitForVideoCapture(callback);
    }, 100);
  };

  var startPhotoCapture = function() {
    stopPhotoCapture();

    if(typeof OpenForum.VideoCapture === "undefined") {
      waitForVideoCapture(startPhotoCapture);
      return;
    }

    var canvas = document.getElementById(photoCanvasId);
    if(!canvas) {
      setTimeout(startPhotoCapture, 200);
      return;
    }

    photoCapture = new OpenForum.VideoCapture(photoCanvasId, {
      width: 1000,
      height: 1000,
      facing: photoFacing
    });
    photoPaused = false;
    photoCaptured = false;
    updatePhotoCaptureButton();
    updatePhotoInsertButton();
    updatePhotoFacingSelect();
  };

  var ensurePhotoCapture = function() {
    if(photoCapture) return;
    startPhotoCapture();
  };

  var changePhotoFacing = function(facing) {
    if(!facing || facing === photoFacing) {
      updatePhotoFacingSelect();
      return;
    }

    photoFacing = facing;
    localStorage.setItem("OpenForum.SimpleHTMLEditor.photoFacing", photoFacing);
    photoCaptured = false;
    updatePhotoInsertButton();
    startPhotoCapture();
  };

  var openPhotoCaptureModal = function() {
    saveRange();
    updatePhotoFacingSelect();
    openPhotoModal();
    setTimeout(ensurePhotoCapture, 200);
    if(photoCapture && photoPaused) {
      photoCapture.resume();
      photoPaused = false;
    }
    photoCaptured = false;
    updatePhotoCaptureButton();
    updatePhotoInsertButton();
  };

  var closePhotoCaptureModal = function() {
    stopPhotoCapture();
    updatePhotoCaptureButton();
    closePhotoModal();
  };

  var capturePhotoFrame = function() {
    ensurePhotoCapture();
    if(!photoCapture) return;

    if(photoPaused) {
      photoCapture.resume();
      photoPaused = false;
    } else {
      photoCapture.pause();
      photoPaused = true;
    }
    photoCaptured = photoPaused;
    updatePhotoCaptureButton();
    updatePhotoInsertButton();
  };

  var insertCapturedPhoto = function() {
    if(!photoCaptured) return;

    var canvas = document.getElementById(photoCanvasId);
    if(!canvas) return;

    var image = document.createElement("img");
    image.src = canvas.toDataURL("image/png");
    image.alt = "captured photo";

    insertNodeAtCursor(image);
    closePhotoCaptureModal();
  };

  var handleFileUpload = function(event) {
    var file = event.target.files[0];
    if(!file) return;

    var reader = new FileReader();
    reader.onload = function(loadEvent) {
      insertImageNode(loadEvent.target.result, file.name);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  var updateActiveButtons = function() {
    var root = document.getElementById(rootId);
    if(!root) return;

    var stateButtons = root.querySelectorAll("[data-simple-state]");
    for(var buttonIndex = 0; buttonIndex < stateButtons.length; buttonIndex++) {
      var button = stateButtons[buttonIndex];
      var command = button.getAttribute("data-simple-state");
      button.className = button.className.replace(/\s*active/g, "");
      if(document.queryCommandState(command)) {
        button.className += " active";
      }
    }

    var currentBlock = (document.queryCommandValue("formatBlock") || "").toLowerCase();
    var headingButtons = root.querySelectorAll("[data-simple-heading]");
    for(var headingIndex = 0; headingIndex < headingButtons.length; headingIndex++) {
      var headingButton = headingButtons[headingIndex];
      var headingTag = "h" + headingButton.getAttribute("data-simple-heading");
      headingButton.className = headingButton.className.replace(/\s*active/g, "");
      if(currentBlock === headingTag) {
        headingButton.className += " active";
      }
    }

    var quoteButton = root.querySelector("[data-simple-action='quote']");
    if(quoteButton) {
      quoteButton.className = quoteButton.className.replace(/\s*active/g, "");
      if(currentBlock === "blockquote") {
        quoteButton.className += " active";
      }
    }
  };

  var bindToolbar = function() {
    var root = document.getElementById(rootId);
    if(!root) return;

    var toolbarButtons = root.querySelectorAll("button");
    for(var toolbarButtonIndex = 0; toolbarButtonIndex < toolbarButtons.length; toolbarButtonIndex++) {
      toolbarButtons[toolbarButtonIndex].onmousedown = function(event) {
        event.preventDefault();
      };
    }

    var commandButtons = root.querySelectorAll("[data-simple-command]");
    for(var commandIndex = 0; commandIndex < commandButtons.length; commandIndex++) {
      commandButtons[commandIndex].onclick = function() {
        exec(this.getAttribute("data-simple-command"));
        return false;
      };
    }

    var headingButtons = root.querySelectorAll("[data-simple-heading]");
    for(var headingIndex = 0; headingIndex < headingButtons.length; headingIndex++) {
      headingButtons[headingIndex].onclick = function() {
        insertHeading(this.getAttribute("data-simple-heading"));
        return false;
      };
    }

    var quoteButton = root.querySelector("[data-simple-action='quote']");
    var hrButton = root.querySelector("[data-simple-action='hr']");
    var linkButton = root.querySelector("[data-simple-action='link']");
    var imageUrlButton = root.querySelector("[data-simple-action='image-url']");
    var imageUploadButton = root.querySelector("[data-simple-action='image-upload']");
    var photoInsertButton = document.getElementById(photoInsertButtonId);

    if(quoteButton) {
      quoteButton.onclick = function() {
        insertQuote();
        return false;
      };
    }
    if(hrButton) {
      hrButton.onclick = function() {
        insertHorizontalRule();
        return false;
      };
    }
    if(linkButton) {
      linkButton.onclick = function() {
        saveRange();
        insertLink();
        return false;
      };
    }
    if(imageUrlButton) {
      imageUrlButton.onclick = function() {
        saveRange();
        insertImageFromUrl();
        return false;
      };
    }
    if(imageUploadButton) {
      imageUploadButton.onclick = function() {
        triggerFileInput();
        return false;
      };
    }

    var capturePhotoButton = root.querySelector("[data-simple-action='capture-photo']");
    if(capturePhotoButton) {
      capturePhotoButton.onclick = function() {
        openPhotoCaptureModal();
        return false;
      };
    }

    if(photoInsertButton) {
      photoInsertButton.disabled = true;
    }
  };

  var bindEditable = function() {
    editable.oninput = notifyChange;
    editable.onkeyup = updateActiveButtons;
    editable.onmouseup = function() {
      saveRange();
      updateActiveButtons();
    };
    editable.onblur = saveRange;
    bindLinkHint(editable);
    // A typed web address becomes a link when it is followed by a space or Enter (OFS-R-002)
    editable.addEventListener("keydown", function(event) {
      if((event.key !== " " && event.key !== "Enter") || event.ctrlKey || event.metaKey || event.altKey) return;
      var found = addressBeforeCaret(editable);
      if(found) {
        linkAddressBeforeCaret(found);
        notifyChange();
      }
    });
    editable.onclick = function(event) {
      if(!(event.ctrlKey || event.metaKey)) return;

      var link = event.target.closest ? event.target.closest("a") : null;
      if(!link) return;

      event.preventDefault();
      window.open(link.href, "_blank", "noopener");
    };
    editable.onpaste = function(event) {
      // Plain text with web addresses: paste it with the addresses as links (OFS-R-002)
      var clipboard = event.clipboardData;
      var plain = clipboard ? clipboard.getData("text/plain") : "";
      if(clipboard && !clipboard.getData("text/html") && plain && /https?:\/\//i.test(plain)) {
        event.preventDefault();
        focusEditor();
        document.execCommand("insertHTML", false, plainTextWithLinks(plain));
        notifyChange();
        return;
      }

      var items = event.clipboardData && event.clipboardData.items;
      if(!items) return;

      for(var itemIndex = 0; itemIndex < items.length; itemIndex++) {
        var item = items[itemIndex];
        if(item.type.indexOf("image/") === 0) {
          event.preventDefault();
          var file = item.getAsFile();
          var reader = new FileReader();
          reader.onload = function(loadEvent) {
            insertImageNode(loadEvent.target.result, "pasted image");
          };
          reader.readAsDataURL(file);
          return;
        }
      }
    };

    if(fileInput) {
      fileInput.onchange = handleFileUpload;
    }
  };

  self.init = function() {
    var content = OpenForum.loadFile("/OpenForum/Editor/Editors/SimpleHTMLEditor/editor.html.fragment",null,true);
    content = content.replace(/\{\{editorIndex\}\}/g,editorIndex);
    OpenForum.setElement(containerId,content);

    editable = document.getElementById(editableId);
    fileInput = document.getElementById(fileInputId);

    bindToolbar();
    bindEditable();
    setEditorContent(loadSource(), false);
    updatePhotoInsertButton();

    self.ready = true;
  };

  self.getValue = function() {
    if(!editable) return "";
    return editable.innerHTML;
  };

  self.setValue = function(newData) {
    setEditorContent(newData, false);
  };

  self.getCodeMirror = function(){
    return codeMirrorAdapter;
  };

  self.refresh = function() {
  };

  self.openPhotoCapture = openPhotoCaptureModal;
  self.closePhotoCapture = closePhotoCaptureModal;
  self.togglePhotoCapture = capturePhotoFrame;
  self.insertCapturedPhoto = insertCapturedPhoto;
  self.changePhotoFacing = changePhotoFacing;

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
    {pageName: "OpenForum/Editor/Editors/SimpleHTMLEditor", title:"Simple HTML Editor"}
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

  OpenForum.loadCSS("/OpenForum/Editor/Editors/SimpleHTMLEditor/page.css");

  self.init();
}
