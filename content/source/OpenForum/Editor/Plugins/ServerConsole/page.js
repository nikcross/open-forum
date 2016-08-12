var id=1;
var pageName = "";
var serverConsole={ text: " " };

OpenForum.init = function() {
  /*OpenForum.setElement("history","<div id=\"editors\" style=\"height: inherit;\"></div>");
  document.getElementById("history").id="";*/
  OpenForum.loadScript("/OpenForum/Editor/Plugins/ServerConsole/plugin.js");
};

var editorIndex = 0;
var editorList = [];
function addPlugin( plugin ) {
  serverConsole.text="Console Ready";
}
function showTab() {}