var serverConsole = {
  text: "",
  open: false,
  clear: function() {this.text = "";},
  log: function(message) {this.text += message + "<br/>";},
  cliText: "",
  runCli: function() {
    this.addToHistory(this.cliText);
    this.log("sjs> "+this.cliText);
    try{
      var result = this.log("TODO "+this.cliText);
      if(typeof(result)==="undefined") {
      } else if(typeof(result)==="object"){
        this.log(JSON.stringify(result));
      } else {
        this.log(result);
      }
    } catch (e) {
      this.log(e);
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
  close: function() {
    serverConsole.open = false;
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

      var content = OpenForum.loadFile("/OpenForum/Editor/Plugins/ServerConsole/page.html.fragment");
      OpenForum.setElement("editor"+editorIndex,content);

      OpenForum.addTab("editor"+editorIndex);
      editorList[editorIndex] = {id: editorIndex, tabButtonStyle: "tab", tabId: "editor"+editorIndex, name: "ServerConsole", changed: "", plugin: serverConsole};
      showTab(editorIndex);
      serverConsole.log("serverConsole Ready");
      return editorList[editorIndex];
    }
});

function runOnServer(editorName) {
  var editor = findEditor(editorName);
  serverConsole.log("TODO "+editor.editor.getValue());
  //eval( editor.editor.getValue() );
}