var editorIndex = 0;

OpenForum.init = function () {
  DependencyService.createNewDependency()
  .addDependency("/OpenForum/Javascript/JavaWrapper/File/File.js")
  .addDependency("/OpenForum/Javascript/CodeMirror/lib/codemirror.js")
  
    .setOnLoadTrigger( loadAddons ).loadDependencies();
};

function loadAddons() {  DependencyService.createNewDependency()
  .addDependency("/OpenForum/Javascript/CodeMirror/addon/search/search.js")
  .addDependency("/OpenForum/Javascript/CodeMirror/addon/search/searchcursor.js")
  .addDependency("/OpenForum/Javascript/CodeMirror/addon/dialog/dialog.js")
  .addDependency("/OpenForum/Javascript/CodeMirror/addon/display/fullscreen.js")
  .addDependency("/OpenForum/Javascript/CodeMirror/addon/selection/active-line.js")
  
  .addDependency("/OpenForum/Editor/Editors/HTMLEditor/editor.js")
  
    .setOnLoadTrigger( ready ).loadDependencies();
}

function ready() {
  var pageName = "/OpenForum/Editor/Editors/HTMLEditor";
  var fileName = "page.html";
  new HtmlEditor(editorIndex,pageName,fileName);
};