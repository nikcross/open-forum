OpenForum.includeScript("/OpenForum/Editor/Editors/StandaloneEditor.js");
OpenForum.includeScript("/OpenForum/Editor/Editors/DefaultEditor/editor.js");

var id=1;
var pageName = "";

OpenForum.init = function() {
  OpenForum.setElement("tableBuilder","<div id=\"editors\" style=\"height: inherit;\"></div>");
  document.getElementById("tableBuilder").id="";
  OpenForum.loadScript("/OpenForum/Editor/Plugins/TableBuilder/plugin.js");
};

var editorIndex = 0;
var editorList = [];
function addPlugin( plugin ) {
  plugin.init();
}
function showTab() {}

function displayContentTab() {
  $('#tableBuilderInstructions').foundation('reveal', 'open');
}
