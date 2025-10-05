var fileDiff = {
  text: "",
  open: false,
  file1: "File1.txt",
  file2: "File2.txt",
  source1: "",
  source2: "",
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

  openFile1: function(pageName, fileName) {
    if(typeof fileName == "undefined") {
      fileDiff.file1 = pageName;
    } else {
      fileDiff.file1 = pageName + "/" + fileName;
    }
    OpenForum.loadFile( fileDiff.file1, function(data) { 
      fileDiff.source1 = data;
      new Process().waitFor( function() { if(fileDiff.view && fileDiff.view.edit) return true; else return false; } ).then( function() {
        fileDiff.view.edit.setValue( fileDiff.source1 );
        document.title = fileDiff.file1 + " - " + fileDiff.file2 + " Differences";
      }).run();
    }, true );
  },

  openFile2: function(pageName, fileName) {    
    if(typeof fileName == "undefined") {
      fileDiff.file2 = pageName;
    } else {
      fileDiff.file2 = pageName + "/" + fileName;
    }
    OpenForum.loadFile( fileDiff.file2, function(data) { 
      fileDiff.source2 = data; 
      new Process().waitFor( function() { if(fileDiff.view && fileDiff.view.rightOriginal) return true; else return false; } ).then( function() {
        fileDiff.view.rightOriginal().setValue( fileDiff.source2 );
        document.title = fileDiff.file1 + " - " + fileDiff.file2 + " Differences";
      }).run();
    }, true );
  },

  saveFile1: function() {
    if( fileDiff.file1 == "" ) {
      alert( "No file is currently open" );
      return;
    }
    OpenForum.saveFile(fileDiff.file1,fileDiff.view.edit.getValue());
  },
  
  uploadFile1: function() {
    OpenForum.Browser.upload( function(data) { fileDiff.view.edit.setValue(data); } );
  },
  
  downloadFile1: function() {
    OpenForum.Browser.download(fileDiff.file1,fileDiff.view.edit.getValue());
  },
  
  saveFile2: function() {
    if( fileDiff.file2 == "" ) {
      alert( "No file is currently open" );
      return;
    }
    OpenForum.saveFile(fileDiff.file2,fileDiff.view.rightOriginal().getValue());
  },
  
  uploadFile2: function() {
    OpenForum.Browser.upload( function(data) { fileDiff.view.rightOriginal().setValue(data); } );
  },
  
  downloadFile2: function() {
    OpenForum.Browser.download(fileDiff.file2,fileDiff.view.rightOriginal().getValue());
  },
  
  close: function() {
    fileDiff.open = false;
  }
};

addPlugin( {
  name: "FileDiff",
  init: function() {
    if(fileDiff.open===true) {
      return;
    }
    fileDiff.open=true;
    editorIndex++;
    this.editorIndex = editorIndex;
    var editor = document.createElement("div");
    editor.setAttribute("id","editor"+editorIndex);
    editor.setAttribute("style","display:block;");
    document.getElementById("editors").appendChild(editor);

    var content = OpenForum.loadFile("/OpenForum/Editor/Plugins/FileDiff/page.html.fragment");
    OpenForum.setElement("editor"+editorIndex,content);   
    OpenForum.crawl(document.getElementById("editor"+editorIndex));

    fileDiff.editor = editor;

    OpenForum.addTab("editor"+editorIndex);
    editorList[editorIndex] = {id: editorIndex, tabButtonStyle: "tab", tabId: "editor"+editorIndex, name: "FileDiff", changed: "", plugin: fileDiff};
    showTab(editorIndex);

    DependencyService.createNewDependency()
      .addDependency("/OpenForum/Javascript/CodeMirror/addon/merge/merge.js")
      .setOnLoadTrigger( fileDiff.ready )
      .loadDependencies();

    return editorList[editorIndex];
  }
});