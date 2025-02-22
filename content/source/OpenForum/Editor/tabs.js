
function showTab(editorId) {
  var editor = findEditorById(editorId);
  OpenForum.showTab(editor.tabId);
  for(var edId in editorList) {
    editorList[edId].tabButtonStyle="";
  }
  editor.tabButtonStyle = "active";
  documentation = [];
  if(editor.editor && editor.editor!==null) {
    editor.editor.refresh();
      if(editor.editor.documentation && editor.editor.documentation!==null) {
        documentation = editor.editor.documentation;
      }
  }
  currentEditor = editor;
}

