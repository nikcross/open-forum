if( typeof serverConsole === "undefined" ) {
  serverConsole = {
    STORAGE_ID: "serverConsole",
    queueName: "/OpenForum/Editor/Plugins/ServerConsole/serverConsole.log@"+new Date().getTime()+":r:"+Math.random(),
    text: "",
    status: "",
    open: false,
    clear: function() {this.text = "";},
    log: function(message) {
      this.text += message + "<br/>";
      console.log("sjs > "+message);
    },
    cliText: "",
    runCli: function() {
      this.addToHistory(this.cliText);
      //this.log("sjs> "+this.cliText);
      try{

        if(this.errorMarker) {
          this.errorMarker.clear();
        }
        var script = this.cliText.getValue();

        OpenForum.Storage.set( serverConsole.STORAGE_ID+"."+pageName,script );

        if(script.substring(0,7)==="// run:") {
          serverConsole.status = "Running script from tab " + script.substring(7);
          script = findEditor(script.substring(7)).editor.getValue();
        }

        var postData = encodeURIComponent("remoteDebug=true;\n" + script);

        JSON.post("/OpenForum/Actions/RJSC","run","queueName="+serverConsole.queueName+"&code="+postData).
        onSuccess(
          function(response) {

            if(response.result.message) {
              serverConsole.status = response.result.message;
            } else {
              serverConsole.status = JSON.stringify(response.result);
            }

            serverConsole.status += " Finished";

          }
        ).
        onError(
          function(response) {
            /*
                var message = ""+e;
                var cursor = ""+e.stack;
                this.log("<xmp style='overflow: scroll'>" + cursor + "</xmp>");

                var line = cursor.substring( cursor.indexOf("<anonymous>:")+12 );
                line = line.substring( 0,line.indexOf(")") );
                var column = parseInt(line.substring(line.indexOf(":")+1),10);
                line = parseInt(line.substring(0,line.indexOf(":")),10);

                this.log(message + " on line "+line+" column "+column);
                this.errorMarker = this.cliText.markText({line: line-1, ch: 0}, {line: line, ch: 0}, {className: "styled-background"});
          */

            serverConsole.status = JSON.stringify(response);

            serverConsole.status += " Finished";
          }
        ).go();
      } catch(e) {
        serverConsole.log("Error "+e);
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
      serverConsole.open = false;
    }
  };

  addPlugin( {
    name: "ServerConsole",
    editorIndex: 0,
    init: function() {
      if(serverConsole.open===true) {
        return;
      }
      serverConsole.open=true;
      editorIndex++;
      this.editorIndex = editorIndex;
      var editor = document.createElement("div");
      editor.setAttribute("id","editor"+editorIndex);
      editor.setAttribute("style","display:block; height: inherit;");
      document.getElementById("editors").appendChild(editor);

      OpenForum.crawl(document.getElementById("editor"+editorIndex));

      var content = OpenForum.loadFile("/OpenForum/Editor/Plugins/ServerConsole/page.html.fragment");
      OpenForum.setElement("editor"+editorIndex,content);    

      // Create a js editor
      serverConsole.cliText = CodeMirror.fromTextArea(
        document.getElementById("serverConsole.cliText"),
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

      serverConsole.cliText.setSize(null,"100%");

      serverConsole.cliText.on("change", function() {
        if(this.errorMarker) {
          this.errorMarker.clear();
        }
      });

      var code = OpenForum.Storage.get( serverConsole.STORAGE_ID+"."+pageName );
      if(code!==null) serverConsole.cliText.setValue(code);
      // END Create a js editor

      OpenForum.crawl(document.getElementById("editor"+editorIndex));

      OpenForum.addScript("/OpenForum/MessageQueue/MessageQueue.js").then(
        function() {

          serverConsole.messageQueue = new MessageQueue( serverConsole.queueName );
          
          serverConsole.messageQueue.processMessages = function(messages) {
            for(var i=0;i<messages.length;i++) {
              var text = messages[i].substring( messages[i].indexOf(":")+1 );
              if(text.indexOf("Status:")===0) {
                serverConsole.status = text.substring( text.indexOf("Status:") + 8 );
              } else {
                serverConsole.log(text);
              }
            }
          };
          
          setInterval( function() { serverConsole.messageQueue.pull(); }, 1000 );

        }
      );

      OpenForum.addTab("editor"+editorIndex);
      editorList[editorIndex] = {id: editorIndex, tabButtonStyle: "tab", tabId: "editor"+editorIndex, name: "Server Console", changed: "", options: [], plugin: serverConsole};
      showTab(editorIndex);
      serverConsole.status = "Server Console Ready";
      return editorList[editorIndex];

    },
    run: function(tabName) {
      serverConsole.runTab(tabName);
    }
  });
} else {
  for(var i in editorList) {
    if(editorList[i].name==="Server Console") {
      showTab( editorList[i].id );
      break;
    }
  }
}
