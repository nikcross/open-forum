remoteEditor = {
  open: false;
}

addPlugin( {
  name: "Remote Editor",
  init: function() {
      if(remoteEditor.open===true) {
        return;
      }
      remoteEditor.open=true;
      editorIndex++;
      var editor = document.createElement("div");
      editor.setAttribute("id","editor"+editorIndex);
      editor.setAttribute("style","display:block;");
      document.getElementById("editors").appendChild(editor);

      var content = OpenForum.loadFile("/OpenForum/Editor/Plugins/RemoteEditor/page.html.fragment");
      OpenForum.setElement("editor"+editorIndex,content);
    
    
    
         ) ;