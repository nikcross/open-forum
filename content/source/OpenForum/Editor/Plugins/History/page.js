OpenForum.loadCSS("/OpenForum/Javascript/CodeMirror/lib/codemirror.css");
OpenForum.loadCSS("/OpenForum/Editor/code-mirror.css");
OpenForum.loadCSS("/OpenForum/Javascript/CodeMirror/theme/rubyblue.css");

OpenForum.includeScript("/OpenForum/Javascript/CodeMirror/lib/codemirror.js");
OpenForum.includeScript("/OpenForum/Javascript/CodeMirror/addon/search/search.js");
OpenForum.includeScript("/OpenForum/Javascript/CodeMirror/addon/search/searchcursor.js");
OpenForum.includeScript("/OpenForum/Javascript/CodeMirror/addon/dialog/dialog.js");
OpenForum.includeScript("/OpenForum/Javascript/CodeMirror/addon/display/fullscreen.js");
OpenForum.includeScript("/OpenForum/Javascript/CodeMirror/addon/selection/active-line.js");

OpenForum.includeScript("OpenForum/Javascript/CodeMirror/mode/javascript/javascript.js");
OpenForum.includeScript("/OpenForum/Javascript/CodeMirror/addon/hint/show-hint.js");
OpenForum.includeScript("/OpenForum/Javascript/CodeMirror/addon/hint/javascript-hint.js");
OpenForum.includeScript("/OpenForum/Javascript/CodeMirror/addon/lint/lint.js");
OpenForum.includeScript("/OpenForum/Javascript/CodeMirror/addon/lint/javascript-lint.js");
OpenForum.includeScript("/OpenForum/Javascript/CodeMirror/addon/jshint.js");
OpenForum.includeScript("/OpenForum/Javascript/CodeMirror/addon/edit/matchbrackets.js");
OpenForum.includeScript("/OpenForum/Javascript/CodeMirror/addon/comment/continuecomment.js");
OpenForum.includeScript("/OpenForum/Javascript/CodeMirror/addon/comment/comment.js");
OpenForum.loadScript("/OpenForum/Javascript/CodeMirror/addon/merge/diff_match_patch.js"); 

var id=1;
var pageName = "";

OpenForum.init = function() {
  pageName = OpenForum.getParameter("pageName");
  if(!pageName) {
    pageName = "/OpenForum/HomePage";
  }
  
  OpenForum.setElement("history","<div id=\"editors\" style=\"height: inherit;\"></div>");
  document.getElementById("history").id="";
  OpenForum.loadScript("/OpenForum/Editor/Plugins/History/plugin.js");
};

var editorIndex = 0;
var editorList = [];
function addPlugin( plugin ) {
  plugin.init();
}
function showTab() {}