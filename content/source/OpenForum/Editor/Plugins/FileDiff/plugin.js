var fileDiff = {
  text: "",
  open: false,
  file1: pageName+"/untitled.txt",
  file2: pageName+"/untitled.txt",
  source1: "s1",
  source2: "s2",
  source3: null,
  editor: null,
  view: null,
  
  ready: function() {
    fileDiff.view = CodeMirror.MergeView(fileDiff.editor, {
    value: fileDiff.source1,
    origLeft: fileDiff.source3,
    orig: fileDiff.source2,
    lineNumbers: true,
    mode: "text/html",
    highlightDifferences: true,
    connect: null,
    viewportMargin: Infinity,
    collapseIdentical: false,
    allowEditingOriginals: true
  }); 
  },
  
  saveFile1: function() {
  OpenForum.saveFile(fileDiff.file1,fileDiff.view.edit.getValue());
  }
};

addPlugin( {
  name: "Server Console",
  init: function() {
      if(fileDiff.open===true) {
        return;
      }
      fileDiff.open=true;
      editorIndex++;
      var editor = document.createElement("div");
      editor.setAttribute("id","editor"+editorIndex);
      editor.setAttribute("style","display:block;");
      document.getElementById("editors").appendChild(editor);

      var content = OpenForum.loadFile("/OpenForum/Editor/Plugins/FileDiff/page.html.fragment");
      OpenForum.setElement("editor"+editorIndex,content);   
        OpenForum.crawl(document.getElementById("editor"+editorIndex));
    
	fileDiff.editor = editor;
    
      OpenForum.addTab("editor"+editorIndex);
      editorList[editorIndex] = {id: editorIndex, tabButtonStyle: "tab", tabId: "editor"+editorIndex, name: "FileDiff", changed: ""};
      showTab(editorIndex);
    
        DependencyService.createNewDependency()
    .addDependency("/OpenForum/Javascript/CodeMirror/addon/merge/merge.js")
    .setOnLoadTrigger( fileDiff.ready )
    .loadDependencies();
    
      return editorList[editorIndex];
    }
});