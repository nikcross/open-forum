OpenForum.includeScript("/OpenForum/AddOn/Update/UpdateClient.js");

OpenForum.init = function() {
};

function addToContentEditor() {
  UpdateClient.upsertToJSONList( {"name": "CTABanner Block", "className": "CTABanner","description": "", "pageName": "/OpenForum/Extensions/CTABanner"}, "name","/OpenForum/AddOn/ContentEditor", "page-block-list.extended.json", function() {
    alert("CTABanner Block added to Content Editor");
  });
}