OpenForum.includeScript("/OpenForum/AddOn/Update/UpdateClient.js");

OpenForum.init = function() {
};

function addToContentEditor() {
  UpdateClient.upsertToJSONList( {"name": "AttachmentsList Block", "className": "AttachmentsList","description": "", "pageName": "/OpenForum/Extensions/AttachmentsList"}, "name","/OpenForum/AddOn/ContentEditor", "page-block-list.extended.json", function() {
    alert("AttachmentsList Block added to Content Editor");
  });
}