OpenForum.includeScript("/OpenForum/Editor/Editors/StandaloneEditor.js");

var editor;

OpenForum.init = function() {

  var editorConfig = {
    flavour: "YAML",
    editorsPage: "/OpenForum/Editor/Editors/",
    editingPageName: "/TheLab/Sandbox",
    editingFileName: "sandbox.yaml",
    fileExtension: "yaml",
    elementId: "InPageEditor",
    fullScreen: true
  };
  var parameters = new URLSearchParams(window.location.search);
  if(parameters.get("pageName")) {
    editorConfig.editingPageName = parameters.get("pageName");
    editorConfig.editingFileName = parameters.get("fileName") || "config.yaml";
    editorConfig.autoSave = false;
  }

  editor = new StandaloneEditor( editorConfig );
};

