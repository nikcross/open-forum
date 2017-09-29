/*
* Author: 
*/
var pageToWatch = "/OpenForum/HomePage";
var lastModified = 0;
var ready = false;

OpenForum.init = function() {
  var newPageToWatch = OpenForum.getParameter("pageName");
  if(newPageToWatch.length>0) {
    pageToWatch = newPageToWatch;
  }
  setInterval(checkPageChanged,5000);
  checkPageChanged();
};


function checkPageChanged() {
  JSON.get("/OpenForum/Actions/Attachments","","pageName="+pageToWatch+"&metaData=true").onSuccess(processPageChanged).go();
}

function processPageChanged(response) {
  if(ifrm.contentWindow.location.pathname) {
    if(ifrm.contentWindow.location.pathname==pageToWatch) {
      ready = true;
    }
    else if(ready===true) {
      pageToWatch = ifrm.contentWindow.location.pathname;
    }
  }

  if(response.lastModified > lastModified) {
    document.getElementById("ifrm").src = pageToWatch;
    lastModified = response.lastModified;
  }

  var status = "<h4>Viewing "+pageToWatch+" <a href=\""+pageToWatch+"?edit\" target=\"editor\">Edit</a></h4>";

  var now = new Date();
  var displayNow = now.getDisplayString();
  status += "<p>Checked for changes on "+displayNow;

  var lastModifiedDate = new Date();
  lastModifiedDate.setTime(lastModified);
  var displayLastModifiedDate = lastModifiedDate.getDisplayString();
  status += "</br> Changed at "+displayLastModifiedDate;

  status += "</p>";

  document.getElementById("overlay").innerHTML = status;
}