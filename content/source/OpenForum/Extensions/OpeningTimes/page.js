OpenForum.includeScript("/OpenForum/AddOn/Update/UpdateClient.js");

OpenForum.init = function() {
};

function addToContentEditor() {
  UpdateClient.upsertToJSONList( {"name": "OpeningTimes Block", "className": "OpeningTimes","description": "", "pageName": "/OpenForum/Extensions/OpeningTimes"}, "name","/OpenForum/AddOn/ContentEditor", "page-block-list.extended.json", function() {
    alert("OpeningTimes Block added to Content Editor");
  });
}