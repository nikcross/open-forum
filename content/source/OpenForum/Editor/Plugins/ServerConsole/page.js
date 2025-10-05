var id=1;
var pageName = "";
//var serverConsole={ text: " " };
var editorIndex = -1;

OpenForum.includeScript("/OpenForum/Editor/Plugins/ServerConsole/plugin.js");

OpenForum.init = function() {
  //OpenForum.loadScript("/OpenForum/Editor/Plugins/ServerConsole/plugin.js");
};

var editorIndex = 0;
var editorList = [];
function addPlugin( plugin ) {
  document.getElementById("serverConsoleInstructions").style.display="none";
  serverConsole.text="Console Ready";
}
function showTab() {}