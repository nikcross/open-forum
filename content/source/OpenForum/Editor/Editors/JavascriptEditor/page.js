OpenForum.includeScript("/OpenForum/Editor/Editors/StandaloneEditor.js");

var editor;

OpenForum.init = function() {

  var editorConfig = {
    flavour: "Javascript",
    fileExtension: "js",
    editingPageName: "/TheLab/Sandbox",
    editingFileName: "sandbox-giraffe.js",
    elementId: "InPageEditor",
    fullScreen: true
  };
  if(OpenForum.getParameter("pageName")) {
    editorConfig.editingPageName = OpenForum.getParameter("pageName");
    editorConfig.editingFileName = "page.content";
    editorConfig.autoSave = false;
  }

  editor = new StandaloneEditor( editorConfig );
};