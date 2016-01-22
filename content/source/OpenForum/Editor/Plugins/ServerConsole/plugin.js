var serverConsole = {
  queueName: "/OpenForum/Editor/Plugins/ServerConsole/serverConsole.log@"+new Date().getTime()+":r:"+Math.random(),
  text: "",
  open: false,
  clear: function() {this.text = "";},
  log: function(message) {this.text += message + "<br/>";},
  cliText: "",
  runCli: function() {
    this.addToHistory(this.cliText);
    this.log("sjs> "+this.cliText);
    try{

      var script = this.cliText;
      if(script.substring(0,4)==="run:") {
        serverConsole.log("Running script from tab "+script.substring(4));
        script = findEditor(script.substring(4)).editor.getValue();
      }

      JSON.post("/OpenForum/Actions/RJSC","run","queueName="+serverConsole.queueName+"&code="+script).
      onSuccess(
        function(response) {
          if(response.message) {
          	serverConsole.log("sjs> "+response.message);
          } else {
          	serverConsole.log("sjs> "+JSON.stringify(response.result));
          }

          serverConsole.log("sjs> Finished");
        }
      ).
      onError(
        function(response) {
          serverConsole.log("sjs> "+response);

          serverConsole.log("sjs> Finished");
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
  }
};

addPlugin( {
  name: "Server Console",
  init: function() {
    if(serverConsole.open===true) {
      return;
    }
    serverConsole.open=true;
    editorIndex++;
    var editor = document.createElement("div");
    editor.setAttribute("id","editor"+editorIndex);
    editor.setAttribute("style","display:block;");
    document.getElementById("editors").appendChild(editor);

    OpenForum.crawl(document.getElementById("editor"+editorIndex));

    var content = OpenForum.loadFile("/OpenForum/Editor/Plugins/ServerConsole/page.html.fragment");
    OpenForum.setElement("editor"+editorIndex,content);    

    OpenForum.crawl(document.getElementById("editor"+editorIndex));

    DependencyService.createNewDependency()
    .addDependency("/OpenForum/MessageQueue/MessageQueue.js")
    .setOnLoadTrigger( function() {

      serverConsole.messageQueue = new MessageQueue( serverConsole.queueName );
      serverConsole.messageQueue.processMessages = function(messages) {
        for(var i=0;i<messages.length;i++) {
          serverConsole.log(messages[i]);
        }
      };
      setInterval( function() {
        serverConsole.messageQueue.pull();
      }
                  ,1000);

    } ).loadDependencies();

    OpenForum.addTab("editor"+editorIndex);
    editorList[editorIndex] = {id: editorIndex, tabButtonStyle: "tab", tabId: "editor"+editorIndex, name: "ServerConsole", changed: ""};
    showTab(editorIndex);
    serverConsole.log("serverConsole Ready");
    return editorList[editorIndex];

  }
});

