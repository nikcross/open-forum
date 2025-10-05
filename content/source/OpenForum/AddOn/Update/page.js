/*
* Author: Nik Cross
*/

var host = "https://open-forum.onestonesoup.org";
var releases = [];
var autoUpdate = [];
var releaseTemplate = {
  releaseTimeStamp: "",
  releaseTime: "",
  pageName: "",
  zipFileName: "",
  zipFileSize_VIEW: "",
  releasePackage: "",
  extra: { extra: {notes: ""}, requires: [] }
};
var release = releaseTemplate;
var rowFilter="";

OpenForum.init = function() {
  release = OpenForum.clone( releaseTemplate );
  OpenForum.loadVersion();

  getReleases();
  OpenForum.getObject("rowFilter").addListener(updateRowFilter);

  if(OpenForum.getParameter("pageName")!="") {
    targetPageName = OpenForum.getParameter("pageName");
    getUpdateInfo();
  }
};

function updateRowFilter() {
  OpenForum.scan();
  OpenForum.Table.applyRowFilter("releases",releases,"pagename",rowFilter);
}

function getUpdate() {
  OpenForum.scan();
  OFX.get("/OpenForum/AddOn/Update").withAction("getUpdate").withData( { pageName: targetPageName } ).onSuccess(
    function(response) {
      if(response.result=="ok") {
        alert( response.data );
      } else {
        var error = response.message.replaceAll("\n","<br />");
        error = "Failed to update " + targetPageName + "<br />" + error;
        error += "<br />  Install anyway ?";
        if( confirm(error) ) {
          OFX.get("/OpenForum/AddOn/Update").withAction("getUpdate").withData( { pageName: targetPageName, ignoreChanges: true } ).onSuccess(
            function(response) {
              if(response.result=="ok") {
                alert( response.data );
              } else {
                alert( "Error" + response.message );
              }
            }).go();
        }
      }
    }
  ).go();
}

function getAutoUpdate() {
  OpenForum.loadJSON("/OpenForum/AddOn/Update/auto-update.json",
                     function(newAutoUpdate) {
    autoUpdate = newAutoUpdate;
    for(var r in releases) {
      releases[r].autoUpdate = "<a class='button round tiny' onClick='addAutoupdate(\""+releases[r].pagename+"\"); return false;'>Auto Update</a>";
    }
    for(a in autoUpdate) {
      entry = autoUpdate[a];
      for(var r in releases) {
        if(releases[r].pagename==entry.pageName) {
          releases[r].autoUpdate = "<a class='button round tiny success' onClick='removeAutoupdate(\""+releases[r].pagename+"\"); return false;'>Stop Auto Update</a>";
        }
      }
    }
    OpenForum.scan();
  },
                     true);
}

function addAutoupdate(pageName) {
  for(var i in autoUpdate) {
    if(autoUpdate[i].pageName == pageName) return;
  }
  autoUpdate.push( {pageName: pageName} );
  OpenForum.saveFile("/OpenForum/AddOn/Update/auto-update.json",JSON.stringify(autoUpdate,null,4),getAutoUpdate);
}

function removeAutoupdate(pageName) {
  var newAutoUpate = [];
  for(var i in autoUpdate) {
    if(autoUpdate[i].pageName != pageName) {
      newAutoUpate.push( autoUpdate[i] );
    }
  }
  autoUpdate = newAutoUpate;
  OpenForum.saveFile("/OpenForum/AddOn/Update/auto-update.json",JSON.stringify(autoUpdate,null,4),getAutoUpdate);
}

function getUpdateInfo() {
  OpenForum.scan();
  release = OpenForum.clone( releaseTemplate );
  OFX.get("/OpenForum/AddOn/Update").withAction("getUpdateInfo").withData( { pageName: targetPageName } ).onSuccess(
    function(response) {
      response.data.zipfilesize_VIEW = addSuffix( response.data.zipfilesize," kB", " MB", " GB" );
      response.data.releaseTime = "" + new Date( parseInt(response.data.timestamp) );
      OpenForum.copyDifferencesFromTo( response.data, release );
      
      release.extra.extra.notes = release.extra.extra.notes.replaceAll("\n","<br/>");
    }
  ).go();
}

function getReleases() {
  releases = [];
  OpenForum.scan();
  OFX.get("/OpenForum/AddOn/Update").withAction("getReleases").onSuccess(
    function(response) {
      var rows = response.data;
      for(var i=0;i<rows.length;i++) {
        var row = rows[i];
        var releaseTime = new Date( parseInt(row.timestamp) );
        row.releaseTime = releaseTime.toDateString() + " " + releaseTime.toLocaleTimeString();
        row.autoUpdate = "";
        row.zipfilesize_VIEW = addSuffix( row.zipfilesize," kB", " MB", " GB" );
      }
      releases = rows;
      getAutoUpdate();
      OpenForum.scan();
    }
  ).go();
}

function addSuffix(v,k,m,g) {
  v=v/1000;
  if(v<1) { //K
    return Math.round(v*1000)+k;
  } else if(v>1000) { //G
    return Math.round(v/1000)+g;
  } else { //M
    return Math.round(v) + m;
  }
}
