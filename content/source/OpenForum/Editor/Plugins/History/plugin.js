if( typeof historyConsole === "undefined" ) {
  historyConsole = {
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
      for(var i=0; i<result.data.length; i++) {
        var file = result.data[i];
        historyConsole.fileTables+="<li class='accordion-navigation'>";

        var lastModified = historyConsole.convertTimeStampToDateString(file.history[0].time,true);
        var fileName = file.file;
        historyConsole.fileTables+="<a href='#historyConsoleAttachment"+i+"'>"+fileName+" (changed "+lastModified+")</a>";

        historyConsole.fileTables+="<div id='historyConsoleAttachment"+i+"' class='content' style='overflow-y: auto; height: 200px;'><table>";
        for(var j=0; j<file.history.length; j++) {
          var version = file.history[j];

          version.dateTime = historyConsole.convertTimeStampToDateString(version.time);

          historyConsole.fileTables+="<tr><td>"+version.dateTime+"</td><td><a class='button tiny' onclick=\"historyConsole.setCurrentSourceFile('"+historyConsole.pageName+"/"+file.file+"'); " +
            "historyConsole.setHistoricSourceFile('"+historyConsole.pageName+"/history/"+version.file+"'); " +
            "historyConsole.mergeTitle='Compare current version of "+file.file+" with version from "+version.dateTime+"'; " +
            "return false;\">Open</a></td></tr>";
        }
        historyConsole.fileTables+="</table></div>";
        historyConsole.fileTables+="</li>";
      }
      historyConsole.fileTables+="</ul>";

      setTimeout( function(){ $(document).foundation('reflow'); },500);
    },

    convertTimeStampToDateString: function(time,short) {
      //2016-01-15-11-43-58-0738
      var parts = time.split("-");
      var dateTime = new Date(0);
      dateTime.setFullYear( parts[0] );
      dateTime.setMonth( parts[1]-1 );
      dateTime.setDate( parts[2] );
      dateTime.setHours( parts[3] );
      dateTime.setMinutes( parts[4] );
      parts = (""+dateTime).split(" ");

      var daysAgo = Math.round(-(dateTime.getTime() - new Date().getTime())/dateTime.DAY_IN_MILLIS);
      if(daysAgo===0) {
        daysAgo = "Today";
      } else if(daysAgo===1) {
        daysAgo = "Yesterday";
      } else {
        daysAgo = daysAgo + " days ago";
      }

      if(short) {
        return daysAgo;
      } else {
        return parts[0]+" "+parts[1]+" "+parts[2]+" "+parts[3]+" at "+parts[4] + " ("+daysAgo+")";
      }
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
    },
  close: function() {
    historyConsole.open = false;
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
      this.editorIndex = editorIndex;
      
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
      editorList[editorIndex] = {id: editorIndex, tabButtonStyle: "tab", tabId: "editor"+editorIndex, name: "History", changed: "", options: [], plugin: history};
      showTab(editorIndex);

      DependencyService.createNewDependency()
        .addDependency("/OpenForum/Javascript/CodeMirror/addon/merge/merge.js")
        .setOnLoadTrigger( historyConsole.ready )
        .loadDependencies();

      return editorList[editorIndex];
    }
  });
} else {
  for(var i in editorList) {
    if(editorList[i].name==="History") {
      showTab( editorList[i].id );
      break;
    }
  }
}