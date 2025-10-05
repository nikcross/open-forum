OpenForum.includeScript("/OpenForum/AddOn/Update/UpdateClient.js");

var actionCount = 0;

OpenForum.init = function() {
};

function doAction() {
  actionCount ++;
}

function addToContentEditor() {
  UpdateClient.upsertToJSONList( {"name": "CountDown Block", "className": "CountDown","description": "", "pageName": "/OpenForum/Extensions/CountDown"}, "name","/OpenForum/AddOn/ContentEditor", "page-block-list.extended.json", function() {
    alert("CountDown Block added to Content Editor");
  });
}