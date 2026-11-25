OpenForum.includeScript("/OpenForum/AddOn/Update/UpdateClient.js");

OpenForum.init = function() {
};

function addToContentEditor() {
  UpdateClient.upsertToJSONList( {"name": "/OpenForum/Images/IconsIndex Block", "className": "/OpenForum/Images/IconsIndex","description": "", "pageName": "/OpenForum/Images/IconsIndex"}, "name","/OpenForum/AddOn/ContentEditor", "page-block-list.extended.json", function() {
    alert("/OpenForum/Images/IconsIndex Block added to Content Editor");
  });
}