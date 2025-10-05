throw( "Not in use. See /OpenForum/AddOn/DataTransformer" );

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

var id=1;

OpenForum.init = function() {
  OpenForum.setElement("dataTransform","<div id=\"editors\" style=\"height: inherit;\"></div>");
  document.getElementById("dataTransform").id="";
  OpenForum.loadScript("/OpenForum/Editor/Plugins/DataTransform/plugin.js");
};

var editorIndex = 0;
var editorList = [];
function addPlugin( plugin ) {
  plugin.init();
  OpenForum.setElement("dataTransformInstructions","");
}
function showTab() {}