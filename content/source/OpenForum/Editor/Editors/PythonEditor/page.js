OpenForum.includeScript("/OpenForum/Editor/Editors/StandaloneEditor.js");

var editor;

OpenForum.init = function() {

  var editorConfig = {
    flavour: "Python",
    editingPageName: "/TheLab/Sandbox",
    editingFileName: "sandbox-giraffe.py",
    elementId: "pythonEditor"
  };
  if(OpenForum.getParameter("pageName")) {
    editorConfig.editingPageName = OpenForum.getParameter("pageName");
    editorConfig.editingFileName = "page.content";
    editorConfig.autoSave = false;
  }

  editor = new StandaloneEditor( editorConfig );
};