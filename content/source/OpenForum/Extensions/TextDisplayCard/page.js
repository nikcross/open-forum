OpenForum.includeScript("/OpenForum/AddOn/Update/UpdateClient.js");

OpenForum.init = function() {
};

function addToContentEditor() {
  UpdateClient.upsertToJSONList( {"name": "TextDisplayCard Block", "className": "TextDisplayCard","description": "", "pageName": "/OpenForum/Extensions/TextDisplayCard"}, "name","/OpenForum/AddOn/ContentEditor", "page-block-list.extended.json", function() {
    alert("TextDisplayCard Block added to Content Editor");
  });
}