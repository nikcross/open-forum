OpenForum.includeScript("/OpenForum/Editor/Editors/StandaloneEditor.js");

var editor;

OpenForum.init = function() {

  var editorConfig = {
    flavour: "Javascript",
    editingPageName: "/TheLab/Sandbox",
    editingFileName: "sandbox-giraffe.js",
    elementId: "javascriptEditor"
  };
  if(OpenForum.getParameter("pageName")) {
    editorConfig.editingPageName = OpenForum.getParameter("pageName");
    editorConfig.editingFileName = "page.content";
    editorConfig.autoSave = false;
  }

  editor = new StandaloneEditor( editorConfig );
};