OpenForum.includeScript("/OpenForum/AddOn/Update/UpdateClient.js");

OpenForum.init = function() {
};

function addToContentEditor() {
  UpdateClient.upsertToJSONList( {"name": "LinkButton Block", "className": "LinkButton","description": "", "pageName": "/OpenForum/Extensions/LinkButton"}, "name","/OpenForum/AddOn/ContentEditor", "page-block-list.extended.json", function() {
    alert("LinkButton Block added to Content Editor");
  });
}