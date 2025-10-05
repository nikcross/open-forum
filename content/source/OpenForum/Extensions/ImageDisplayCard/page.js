OpenForum.includeScript("/OpenForum/AddOn/Update/UpdateClient.js");

OpenForum.init = function() {
};

function addToContentEditor() {
  UpdateClient.upsertToJSONList( {"name": "ImageDisplayCard Block", "className": "ImageDisplayCard","description": "", "pageName": "/OpenForum/Extensions/ImageDisplayCard"}, "name","/OpenForum/AddOn/ContentEditor", "page-block-list.extended.json", function() {
    alert("ImageDisplayCard Block added to Content Editor");
  });
}