OpenForum.includeScript("/OpenForum/AddOn/SQL/DB.js");
OpenForum.includeScript("/OpenForum/Editor/Editors/StandaloneEditor.js");
OpenForum.includeScript("/OpenForum/Javascript/FluentTemplateProcessor/FluentTemplateProcessor.js");

OpenForum.includeScript("/OpenForum/AddOn/SQL/sql-editor.js");

OpenForum.init = function() { 
  SQLEditorController.init();

  sqlEditor = new StandaloneEditor( SQLEditorController.editorConfig );
  sqlEditor.onLoad = function() {
    OpenForum.setElement("editorButtons","<li><a href='#' onClick='SQLEditorController.runSQLScript(); return false;'>Run</a></li><li><a href='#' onClick='SQLEditorController.generateSQLCode(); return false;'>Generate Code</a></li>");
  };
};


