OpenForum.includeScript("/OpenForum/AddOn/Update/UpdateClient.js");

OpenForum.init = function() {
};

function addToContentEditor() {
  UpdateClient.upsertToJSONList( {"name": "InsertPage Block", "className": "InsertPage","description": "", "pageName": "/OpenForum/Extensions/InsertPage"}, "name","/OpenForum/AddOn/ContentEditor", "page-block-list.extended.json", function() {
    alert("InsertPage Block added to Content Editor");
  });
}