var historyConsole = {
  open: false,
  fileTables: " ",
  pageName: " ",
  mergeTitle: " ",
  fileName: " ",

  updateHistory: function() {
    JSON.get("/OpenForum/Actions/History","list","pageName="+pageName).onSuccess( historyConsole.displayHistory ).go();
  },

  displayHistory: function(result) {
    var today  = new Date();
    historyConsole.fileTables="<ul class='accordion' data-accordion>";
    for(var i=0; i<result.length; i++) {
      var file = result[i];
      historyConsole.fileTables+="<li class='accordion-navigation'>";
      historyConsole.fileTables+="<a href='#historyConsoleAttachment"+i+"'>"+file.file+"</a>";

      historyConsole.fileTables+="<div id='historyConsoleAttachment"+i+"' class='content' style='overflow-y: auto; height: 200px;'><ul>";
      for(var j=0; j<file.history.length; j++) {
        var version = file.history[j];
        
        //2016-01-15-11-43-58-0738
        var parts = version.time.split("-");
        version.dateTime = new Date(0);
        version.dateTime.setFullYear( parts[0] );
        version.dateTime.setMonth( parts[1]-1 );
        version.dateTime.setDate( parts[2] );
        version.dateTime.setHours( parts[3] );
        version.dateTime.setMinutes( parts[4] );
        parts = (""+version.dateTime).split(" ");
        
 		var daysAgo = Math.round(-(version.dateTime.getTime() - new Date().getTime())/version.dateTime.DAY_IN_MILLIS);
        if(daysAgo===0) {
           daysAgo = "Today";
           } else if(daysAgo===1) {
             daysAgo = "Yesterday";
           } else {
             daysAgo = daysAgo + " days ago";
           }
        
        version.dateTime = parts[0]+" "+parts[1]+" "+parts[2]+" "+parts[3]+" at "+parts[4] + " ("+daysAgo+")";
        
        historyConsole.fileTables+="<li><a class='button tiny' onclick=\"historyConsole.setCurrentSourceFile('"+historyConsole.pageName+"/"+file.file+"'); " +
          "historyConsole.setHistoricSourceFile('"+historyConsole.pageName+"/history/"+version.file+"'); " +
          "historyConsole.mergeTitle='Compare current version of "+file.file+" with version from "+version.dateTime+"'; " +
          "return false;\">"+version.dateTime+"</a></li>";
      }
      historyConsole.fileTables+="</ul></div>";
      historyConsole.fileTables+="</li>";
    }
    historyConsole.fileTables+="</ul>";
      
    setTimeout( function(){ $(document).foundation('reflow'); },500);
  },

  editor: null,
  view: null,

  ready: function() {
    historyConsole.editor = document.getElementById("historyConsoleEditor");
    historyConsole.view = CodeMirror.MergeView(historyConsole.editor, {
      value: "",
      origLeft: null,
      orig: "",
      lineNumbers: true,
      mode: "text/html",
      highlightDifferences: true,
      connect: null,
      viewportMargin: Infinity,
      collapseIdentical: false
    });
  },

  setCurrentSourceFile: function(fileName) {
    historyConsole.fileName = fileName;
    historyConsole.setCurrentSource( OpenForum.loadFile(historyConsole.fileName) );
  },
  
  setCurrentSource: function(data) {
    historyConsole.view.edit.setValue(data);
  },

  setHistoricSourceFile: function(fileName) {
    historyConsole.setHistoricSource( OpenForum.loadFile(fileName) );
  },
  
  setHistoricSource: function(data) {
    historyConsole.view.right.orig.setValue(data);
  },
  
  saveCurrentSource: function() {
    var data = historyConsole.view.edit.getValue();
    OpenForum.saveFile(historyConsole.fileName,data);
  }
};

addPlugin( {
  name: "History",
  init: function() {
    if(historyConsole.open===true) {
      historyConsole.updateHistory();
      return;
    }
    historyConsole.pageName = pageName;
    historyConsole.open=true;
    editorIndex++;
    var editor = document.createElement("div");
    editor.setAttribute("id","editor"+editorIndex);
    editor.setAttribute("style","display:block;");
    document.getElementById("editors").appendChild(editor);

    OpenForum.crawl(document.getElementById("editor"+editorIndex));

    var content = OpenForum.loadFile("/OpenForum/Editor/Plugins/History/page.html.fragment");
    OpenForum.setElement("editor"+editorIndex,content);    

    OpenForum.crawl(document.getElementById("editor"+editorIndex));

    historyConsole.updateHistory();

    OpenForum.addTab("editor"+editorIndex);
    editorList[editorIndex] = {id: editorIndex, tabButtonStyle: "tab", tabId: "editor"+editorIndex, name: "History", changed: ""};
    showTab(editorIndex);

    DependencyService.createNewDependency()
    .addDependency("/OpenForum/Javascript/CodeMirror/addon/merge/merge.js")
    .setOnLoadTrigger( historyConsole.ready )
    .loadDependencies();

    return editorList[editorIndex];
  }
});