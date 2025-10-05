OpenForum.includeScript("/OpenForum/AddOn/Update/UpdateClient.js");

OpenForum.init = function() {
};

function addToContentEditor() {
  UpdateClient.upsertToJSONList( {"name": "ContrastBlock Block", "className": "ContrastBlock","description": "", "pageName": "/OpenForum/Extensions/ContrastBlock"}, "name","/OpenForum/AddOn/ContentEditor", "page-block-list.extended.json", function() {
    alert("ContrastBlock Block added to Content Editor");
  });
}