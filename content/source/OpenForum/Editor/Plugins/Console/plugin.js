var console = {
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
    this.addToHistory( script );
    this.log("js> "+script);
    try{
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
    this.cliText="run:"+tabName;
    this.runCli();
  }
};

addPlugin( {
  name: "Console",
  editorIndex: 0,
  init: function() {
    if(console.open===true) {
      return;
    }
    console.open=true;
    editorIndex++;
    this.editorIndex = editorIndex;
    var editor = document.createElement("div");
    editor.setAttribute("id","editor"+editorIndex);
    editor.setAttribute("style","display:block;");
    document.getElementById("editors").appendChild(editor);

    var content = OpenForum.loadFile("/OpenForum/Editor/Plugins/Console/page.html.fragment");
    OpenForum.setElement("editor"+editorIndex,content);

    // Create a js editor
    console.cliText = CodeMirror.fromTextArea(
      document.getElementById("console.cliText"),
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

    console.cliText.setSize(null,"100%");

    console.cliText.on("change", function() {
      if(this.errorMarker) {
        this.errorMarker.clear();
      }
    });
    // END Create a js editor

    OpenForum.crawl(document.getElementById("editor"+editorIndex));

    OpenForum.addTab("editor"+editorIndex);
    editorList[editorIndex] = {id: editorIndex, tabButtonStyle: "tab", tabId: "editor"+editorIndex, name: "Console", changed: "", options: []};
    showTab(editorIndex);
    console.log("Console Ready");
    return editorList[editorIndex];
  },
  run: function(tabName) {
    console.runTab(tabName);
  }
});
