OpenForum.includeScript("/OpenForum/AddOn/Update/UpdateClient.js");

OpenForum.init = function() {
};

function addToContentEditor() {
  UpdateClient.upsertToJSONList( {"name": "UploadFileInputField Block", "className": "UploadFileInputField","description": "", "pageName": "/OpenForum/Extensions/UploadFileInputField"}, "name","/OpenForum/AddOn/ContentEditor", "page-block-list.extended.json", function() {
    alert("UploadFileInputField Block added to Content Editor");
  });
}