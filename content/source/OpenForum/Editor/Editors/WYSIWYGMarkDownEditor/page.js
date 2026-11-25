OpenForum.includeScript("/OpenForum/Editor/Editors/StandaloneEditor.js");

var editor;

OpenForum.init = function() {
  var editorConfig = {
    flavour: "WYSIWYGMarkDown",
    editorsPage: "/OpenForum/Editor/Editors/",
    editingPageName: "/OpenForum/Editor/Editors/WYSIWYGMarkDownEditor",
    editingFileName: "sample.md",
    fileExtension: "md",
    elementId: "InPageEditor",
    autoSave: false
  };

  if(OpenForum.getParameter("pageName")) {
    editorConfig.editingPageName = OpenForum.getParameter("pageName");
  }

  if(OpenForum.getParameter("fileName")) {
    editorConfig.editingFileName = OpenForum.getParameter("fileName");
  }

  editor = new StandaloneEditor( editorConfig );
};

