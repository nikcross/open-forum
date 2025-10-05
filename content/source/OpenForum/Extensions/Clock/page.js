OpenForum.includeScript("/OpenForum/AddOn/Update/UpdateClient.js");

OpenForum.init = function() {
};

function addToContentEditor() {
  UpdateClient.upsertToJSONList( {"name": "Clock Block", "className": "Clock","description": "", "pageName": "/OpenForum/Extensions/Clock"}, "name","/OpenForum/AddOn/ContentEditor", "page-block-list.extended.json", function() {
    alert("Clock Block added to Content Editor");
  });
}