var id=1;
var pageName = "";
//var console={ text: " " };
OpenForum.includeScript("/OpenForum/Editor/Plugins/Console/plugin.js");

OpenForum.init = function() {
  /*OpenForum.setElement("history","<div id=\"editors\" style=\"height: inherit;\"></div>");
  document.getElementById("history").id="";*/
  //OpenForum.loadScript("/OpenForum/Editor/Plugins/Console/plugin.js");
};

var editorIndex = 0;
var editorList = [];
function addPlugin( plugin ) {
  console.text="Console Ready";
}
function showTab() {}