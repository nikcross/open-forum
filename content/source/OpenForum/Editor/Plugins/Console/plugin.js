var console = {
  text: "",
  open: false,
  clear: function() {this.text = "";},
  log: function(message) {this.text += message + "<br/>";},
  cliText: "",
  runCli: function() {
    this.addToHistory(this.cliText);
    this.log("js> "+this.cliText);
    try{
      var script = this.cliText;
      if(script.substring(0,4)==="run:") {
        this.log("Running script from tab "+script.substring(4));
        script = findEditor(script.substring(4).trim()).editor.getValue();
      }
      
      var result = eval(script);
      if(typeof(result)==="undefined") {
      } else if(typeof(result)==="object"){
        this.log(JSON.stringify(result));
      } else {
        this.log(result);
      }
    } catch (e) {
      var message = ""+e;
      var cursor = ""+e.stack;
      console.log(cursor+"<br/>");
      
		cursor = cursor.substring( 0,cursor.indexOf("Object.console.runCli") );
		cursor = cursor.substring(cursor.indexOf("scriptLoaded:")+13);
		cursor = cursor.substring(0,cursor.indexOf(" at")-5);
		cursor = cursor.substring(cursor.indexOf(", :")+3);
      
      this.log(message + " on line " + cursor);
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
  runTab: function(editorName) {
      var editor = findEditor(editorName);
      eval(editor.editor.getValue());
  }
};

addPlugin( {
  name: "Console",
  init: function() {
      if(console.open===true) {
        return;
      }
      console.open=true;
      editorIndex++;
      var editor = document.createElement("div");
      editor.setAttribute("id","editor"+editorIndex);
      editor.setAttribute("style","display:block;");
      document.getElementById("editors").appendChild(editor);

      var content = OpenForum.loadFile("/OpenForum/Editor/Plugins/Console/page.html.fragment");
      OpenForum.setElement("editor"+editorIndex,content);

      OpenForum.crawl(document.getElementById("editor"+editorIndex));
    
      OpenForum.addTab("editor"+editorIndex);
      editorList[editorIndex] = {id: editorIndex, tabButtonStyle: "tab", tabId: "editor"+editorIndex, name: "Console", changed: ""};
      showTab(editorIndex);
      console.log("Console Ready");
      return editorList[editorIndex];
    }
});
