OpenForum.action = {};
OpenForum.action.copyPage = function(pageName,newPageName) {
  OpenForum.loadFile("/OpenForum/Actions/Copy?newPageName="+newPageName+"&pageName="+pageName);
};

OpenForum.action.movePage = function(pageName,newPageName) {
  OpenForum.loadFile("/OpenForum/Actions/Copy?newPageName="+newPageName+"&pageName="+pageName);
};

OpenForum.action.zipPage = function(pageName) {
  window.location = "/OpenForum/Actions/Zip?action=zip&pageName="+pageName;
};

OpenForum.action.deletePage = function(pageName) {
  OpenForum.loadFile(window.location = "/OpenForum/Actions/Delete?pageName="+pageName);
};
