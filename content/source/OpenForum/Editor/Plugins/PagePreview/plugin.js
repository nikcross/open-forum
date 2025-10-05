var pagePreview = {
  text: "",
  open: false,
  pageToWatch: pageName,
  lastModified: 0,
  ready: false,
  index: 0,
  init: function(index) {
    pagePreview.index = index;
    setInterval(pagePreview.checkPageChanged,5000);
    setTimeout(pagePreview.checkPageChanged,100);
  },
  checkPageChanged: function() {
    JSON.get("/OpenForum/Actions/Attachments","","pageName="+pagePreview.pageToWatch+"&metaData=true").onSuccess(pagePreview.processPageChanged).go();
  },
  processPageChanged: function(response) {
    if(preview.contentWindow.location.pathname) {
      if(preview.contentWindow.location.pathname==pagePreview.pageToWatch) {
        pagePreview.ready = true;
      }
      else if(pagePreview.ready===true) {
        pagePreview.pageToWatch = preview.contentWindow.location.pathname;
      }
    }

    if(response.lastModified > pagePreview.lastModified) {
      document.getElementById("preview").src = pagePreview.pageToWatch;
      pagePreview.lastModified = response.lastModified;
      setTimeout(function() {
        document.getElementById("editor-tab-"+pagePreview.index).children[0].style.backgroundColor="blue";
      },500);
      setTimeout(function() {
        document.getElementById("editor-tab-"+pagePreview.index).children[0].style.backgroundColor="";
      },5000);
    }

    PagePreview.updateStatus();
  },
  toggleShowStatus: function() {
    if( document.getElementById("preview-status").style.display=="block" ) {
      document.getElementById("preview-status").style.display="none";
      document.getElementById("preview-status-toggle").innerHTML = "Show Status";
    } else {
      document.getElementById("preview-status").style.display="block";
      document.getElementById("preview-status-toggle").innerHTML = "Hide Status";
    }
  },
  close: function() {
    pagePreview.open = false;
  }
};

addPlugin( {
  name: "Page Preview",
  init: function() {
    if(pagePreview.open===true) {
      return;
    }
    pagePreview.open=true;
    editorIndex++;
    this.editorIndex = editorIndex;
    var editor = document.createElement("div");
    editor.setAttribute("id","editor"+editorIndex);
    editor.style.display="block";
    editor.style.height="inherit";
    document.getElementById("editors").appendChild(editor);

    var content = OpenForum.loadFile("/OpenForum/Editor/Plugins/PagePreview/plugin.html.fragment");
    OpenForum.setElement("editor"+editorIndex,content);

    OpenForum.addTab("editor"+editorIndex);
    editorList[editorIndex] = {id: editorIndex, tabButtonStyle: "tab", tabId: "editor"+editorIndex, name: "PagePreview", changed: "", plugin: pagePreview};
    showTab(editorIndex);

    OpenForum.addScript("/OpenForum/Javascript/QRCode/qr-code.js")
      .addScript("/OpenForum/Editor/Plugins/PagePreview/page-preview.js")
      .then( function() {
      pagePreview.init(editorIndex);
    });

    return editorList[editorIndex];
  }
});