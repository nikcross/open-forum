OpenForum.loadCSS("/OpenForum/Javascript/CodeMirror/lib/codemirror.css");
OpenForum.loadCSS("/OpenForum/Editor/code-mirror.css");
OpenForum.loadCSS("/OpenForum/Javascript/CodeMirror/addon/merge/merge.css");
OpenForum.includeScript("/OpenForum/Javascript/CodeMirror/lib/codemirror.js");
OpenForum.includeScript("/OpenForum/Editor/Editors/JavascriptEditor/editor.js");
OpenForum.loadScript("http://cdnjs.cloudflare.com/ajax/libs/diff_match_patch/20121119/diff_match_patch.js");

var id=1;

OpenForum.init = function() {
  OpenForum.setElement("fileDiff","<div id=\"editors\" style=\"height: inherit;\"></div>");
  document.getElementById("fileDiff").id="";
  OpenForum.loadScript("/OpenForum/Editor/Plugins/FileDiff/plugin.js");
};

var editorIndex = 0;
var editorList = [];
function addPlugin( plugin ) {
  plugin.init();
}
function showTab() {}