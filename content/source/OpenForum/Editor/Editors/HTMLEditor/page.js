OpenForum.includeScript("/OpenForum/Editor/Editors/StandaloneEditor.js");

var editor;

OpenForum.init = function() {

  var editorConfig = {};
  if(OpenForum.getParameter("pageName")) {
    editorConfig = {
      editingPageName: OpenForum.getParameter("pageName"),
      editingFileName: "page.content",
      autoSave: false
    };
  }

    editor = new StandaloneEditor( editorConfig );
  };