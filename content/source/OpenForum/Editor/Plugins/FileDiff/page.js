OpenForum.loadCSS("/OpenForum/Javascript/CodeMirror/lib/codemirror.css");
OpenForum.loadCSS("/OpenForum/Editor/code-mirror.css");
OpenForum.loadCSS("/OpenForum/Javascript/CodeMirror/addon/merge/merge.css");
OpenForum.includeScript("/OpenForum/Javascript/CodeMirror/lib/codemirror.js");
OpenForum.includeScript("/OpenForum/Editor/Editors/JavascriptEditor/editor.js");
OpenForum.includeScript("/OpenForum/Javascript/CodeMirror/lib/diff_match_patch.js");

var id=1;

OpenForum.init = function() {
  OpenForum.setElement("fileDiff","<div id=\"editors\" style=\"height: inherit;\"></div>");
  document.getElementById("fileDiff").id="";
  OpenForum.loadScript("/OpenForum/Editor/Plugins/FileDiff/plugin.js");
  
  new Process().waitFor( function() { 
    if(typeof fileDiff == "undefined") return false;
    return fileDiff.view!=null;
  } ).then( function() { 
    var fileA = OpenForum.getParameter("fileA");
    var fileB = OpenForum.getParameter("fileB");
    
    if(fileA!="") {
      fileDiff.openFile1( fileA );
    }
    if(fileB!="") {
      fileDiff.openFile2( fileB );
    }
  } ).run();
};

var editorIndex = 0;
var editorList = [];
function addPlugin( plugin ) {
  plugin.init();
}
function showTab() {}