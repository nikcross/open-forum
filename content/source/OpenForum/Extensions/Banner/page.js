OpenForum.includeScript("/OpenForum/AddOn/Update/UpdateClient.js");

OpenForum.init = function() {
};

function addToContentEditor() {
  UpdateClient.upsertToJSONList( {"name": "Banner Block", "className": "Banner","description": "", "pageName": "/OpenForum/Extensions/Banner"}, "name","/OpenForum/AddOn/ContentEditor", "page-block-list.extended.json", function() {
    alert("Banner Block added to Content Editor");
  });
}