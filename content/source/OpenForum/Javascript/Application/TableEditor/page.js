OpenForum.includeScript("/OpenForum/AddOn/Update/UpdateClient.js");

OpenForum.init = function() {
};

function addToContentEditor() {
  UpdateClient.upsertToJSONList( {"name": "/OpenForum/Javascript/Application/TableEditor Block", "className": "/OpenForum/Javascript/Application/TableEditor","description": "", "pageName": "/OpenForum/Javascript/Application/TableEditor"}, "name","/OpenForum/AddOn/ContentEditor", "page-block-list.extended.json", function() {
    alert("/OpenForum/Javascript/Application/TableEditor Block added to Content Editor");
  });
}