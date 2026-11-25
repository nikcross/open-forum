OpenForum.includeScript("/OpenForum/Javascript/Application/Tabs.js");
OpenForum.includeScript("/OpenForum/Javascript/Application/Panels.js");

var tabList = [
  {title: "About"},
  {title: "Capability Map"},
  {title: "Actions"},
  {title: "Extensions"},
  {title: "Javascript"},
  {title: "User Management"},
  {title: "Site Management"},
  {title: "Add Ons"}
];

OpenForum.init = function() {
  Panels.makeResizeable(document.getElementById("rightPanel"),document.getElementById("leftPanel"));
  
  OpenForum.hideElement("splash");
  OpenForum.showElement("application");
  pageTabs = new Tabs( "tabViews",tabList );
  createFileTree("tree","/OpenForum");
};

function createFileTree(id,root) {
  var tree = new Tree(id,"Loading...","");
  JSON.get("/OpenForum/Javascript/Tree","getPageTree","pageName="+root).onSuccess(
    function(result) {
      tree.setJSON(result);
      tree.render();
      tree.getRoot().expand();
      tree.init();
    }
  ).go();

  return tree;
}