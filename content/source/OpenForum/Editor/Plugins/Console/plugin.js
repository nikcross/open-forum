if( typeof localConsole === "undefined" ) {
  localConsole = {
    STORAGE_ID: "localConsole",
    text: "",
    open: false,
    clear: function() {this.text = "";},
    log: function(message) {this.text += message + "<br/>";},
    cliText: "",
    errorMarker: null,
    runCli: function() {
      if(this.errorMarker) {
        this.errorMarker.clear();
      }
      var script = this.cliText.getValue(); 
      OpenForum.Storage.set( localConsole.STORAGE_ID+"."+pageName,script );
      
      this.addToHistory( script );
      //this.log("js> "+script);
      try{
        if(script.substring(0,7)==="// run:") {
          this.log("Running script from tab "+script.substring(7));
          script = findEditor(script.substring(7).trim()).editor.getValue();
        }

        var result = OpenForum.evaluate(script);
        if(typeof(result)==="undefined") {
        } else if(typeof(result)==="object"){
          this.log(JSON.stringify(result));
        } else {
          this.log(result);
        }
      } catch (e) {
        var message = ""+e;
        var cursor = ""+e.stack;
        this.log("<xmp style='overflow: scroll'>" + cursor + "</xmp>");

        var line = cursor.substring( cursor.indexOf("<anonymous>:")+12 );
        line = line.substring( 0,line.indexOf(")") );
        var column = parseInt(line.substring(line.indexOf(":")+1),10);
        line = parseInt(line.substring(0,line.indexOf(":")),10);

        this.log(message + " on line "+line+" column "+column);
        this.errorMarker = this.cliText.markText({line: line-1, ch: 0}, {line: line, ch: 0}, {className: "styled-background"});
      }
    },
    cliHistory: [],
    cliHistoryCursor: 0,
    addToHistory: function() {
      this.cliHistory[this.cliHistory.length] = this.cliText;
      this.cliHistoryCursor = this.cliHistory.length;
    },
    historyCli: function(change) {
      this.cliHistoryCursor += change;
      if(this.cliHistoryCursor>=this.cliHistory.length-1) {
        this.cliHistoryCursor = this.cliHistory.length-1;
      } else if(this.cliHistoryCursor<0) {
        this.cliHistoryCursor=0;
      }
      this.cliText = this.cliHistory[this.cliHistoryCursor];
    },
    loadFromTab: function(editorName) {
      var editor = findEditor(editorName);
      return editor.editor.getValue();
    },
    saveToTab: function(editorName,data) {
      var editor = findEditor(editorName);
      editor.editor.setValue(data);
    },
    runTab: function(tabName) {
      this.cliText.setValue("// run:"+tabName);
      this.runCli();
    },
    getEditorList: function() {
      var editors = [];
      for(var i in editorList) {
        var editor = editorList[i];
        if(editor.editor) editors.push(editor);
      }
      return editors;
    },
  close: function() {
    localConsole.open = false;
  }
  };

  addPlugin( {
    name: "Console",
    editorIndex: 0,
    init: function() {
      if(localConsole.open===true) {
        return;
      }
      localConsole.open=true;
      editorIndex++;
      this.editorIndex = editorIndex;
      var editor = document.createElement("div");
      editor.setAttribute("id","editor"+editorIndex);
      editor.setAttribute("style","display:block; height: inherit;");
      document.getElementById("editors").appendChild(editor);

      var content = OpenForum.loadFile("/OpenForum/Editor/Plugins/Console/page.html.fragment");
      OpenForum.setElement("editor"+editorIndex,content);

      // Create a js editor
      localConsole.cliText = CodeMirror.fromTextArea(
        document.getElementById("localConsole.cliText"),
        { 
          theme: 'rubyblue',
          lineNumbers: true,
          matchBrackets: true,
          autoMatchParens: true,
          continueComments: "Enter",
          extraKeys: {
            "Ctrl-Q": "toggleComment",
            "Ctrl-Space": "autocomplete"
          },
          viewportMargin: Infinity,
          mode: "javascript",
          styleActiveLine: true,
          gutters: ["CodeMirror-linenumbers", "CodeMirror-lint-markers"],
          lint: true
        }
      );

      localConsole.cliText.setSize(null,"100%");

      localConsole.cliText.on("change", function() {
        if(this.errorMarker) {
          this.errorMarker.clear();
        }
      });
      
      var code = OpenForum.Storage.get( localConsole.STORAGE_ID+"."+pageName );
      if(code!==null) localConsole.cliText.setValue(code);
      // END Create a js editor

      OpenForum.crawl(document.getElementById("editor"+editorIndex));

      OpenForum.addTab("editor"+editorIndex);
      editorList[editorIndex] = {
        id: editorIndex,
        tabButtonStyle: "tab",
        tabId: "editor"+editorIndex,
        name: "Console",
        changed: "",
        options: [], plugin: localConsole
      };
      showTab(editorIndex);
      
      var _log = console.log;
      console = {
        log: function(message) {
          _log(message);
          localConsole.log(message);
        }
      };
      println = function(message) { console.log(message+"\n"); };
      
      localConsole.log("Console Ready");
      return editorList[editorIndex];
    },
    run: function(tabName) {
      localConsole.runTab(tabName);
    }
  });
} else {
  for(var i in editorList) {
    if(editorList[i].name==="Console") {
      showTab( editorList[i].id );
      break;
    }
  }
}