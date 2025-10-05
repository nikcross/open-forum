/*
* Author: 
*/
OpenForum.includeScript("/OpenForum/Javascript/QRCode/qr-code.js");
OpenForum.includeScript("/OpenForum/Editor/Plugins/PagePreview/page-preview.js");

var pageToWatch = "/OpenForum/HomePage";
var lastModified = 0;
var ready = false;

var pagePreview = {
    toggleShowStatus: function() {
    if( document.getElementById("preview-status").style.display=="block" ) {
      document.getElementById("preview-status").style.display="none";
      document.getElementById("preview-status-toggle").innerHTML = "Show Status";
    } else {
      document.getElementById("preview-status").style.display="block";
      document.getElementById("preview-status-toggle").innerHTML = "Hide Status";
    }
  },
  pageToWatch: "",
  lastModified: ""
};

OpenForum.init = function() {
  var newPageToWatch = OpenForum.getParameter("pageName");
  if(newPageToWatch.length>0) {
    pageToWatch = newPageToWatch;
  }
  pagePreview.pageToWatch = pageToWatch;
  setInterval(checkPageChanged,5000);
  checkPageChanged();

};


function checkPageChanged() {
  JSON.get("/OpenForum/Actions/Attachments","","pageName="+pageToWatch+"&metaData=true").onSuccess(processPageChanged).go();
  document.title = preview.contentDocument.title;
}

function processPageChanged(response) {
  if(preview.contentWindow.location.pathname) {
    if(preview.contentWindow.location.pathname==pageToWatch) {
      ready = true;
    }
    else if(ready===true) {
      pageToWatch = preview.contentWindow.location.pathname;
    }
  }

  if(response.lastModified > lastModified) {
    document.getElementById("preview").src = pageToWatch;
    lastModified = response.lastModified;
    pagePreview.lastModified = lastModified;
  }

  PagePreview.updateStatus();
}