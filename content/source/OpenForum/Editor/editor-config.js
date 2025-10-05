/*
* Author: 
* Description: 
*/

function openEditorConfig() {
  for( var e in editorConfig.editors ) {
    var editorDef = editorConfig.editors[e];
    if( editorDef.type == "editor" ) {
    	openFile( editorDef.pageName, editorDef.fileName );
  	} else if( editorDef.type == "plugin" ) {
    	loadPlugin( editorDef.sourcePage );
  	}
  }
  pageName = editorConfig.pageName;
  document.getElementById("pageTitle").title="Editing "+pageName;
}

function saveEditorConfig() {
  var editorConfig = { editors: [] };
  editorConfig.pageName = pageName;
  editorConfig.fileName = editorConfigFile;
  for( var e in editorList ) {
    var editor = editorList[e];
    
    if(editor.editor) {
      editorConfig.editors.push( { type: "editor", pageName: editor.pageName, fileName: editor.fileName} );
    } else if(editor.plugin) {
      editorConfig.editors.push( { type: "plugin", sourcePage: editor.sourcePage } );
    }
  }
  
  OpenForum.saveJSON( pageName + "/" + editorConfigFile, editorConfig, function() { alert("Editor configuration saved to " + editorConfigFile ); } );
  
  OpenForum.loadJSON( pageName + "/data.json", function(pageData) {
  	pageData.editorConfig = pageName + "/" + editorConfigFile;
    OpenForum.saveJSON( pageName + "/data.json", pageData);
  });
}
