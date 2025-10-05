OpenForum.includeScript("/OpenForum/Editor/Editors/StandaloneEditor.js");

var editor;

OpenForum.init = function() {

  var editorConfig = {
      fullScreen: true,
      elementId: "InPageEditor"
  };
  if(OpenForum.getParameter("pageName")) {
    editorConfig = {
      editingPageName: OpenForum.getParameter("pageName"),
      editingFileName: "page.content",
      autoSave: false,
      fullScreen: true,
      elementId: "InPageEditor"
    };
  }

    editor = new StandaloneEditor( editorConfig );
  };