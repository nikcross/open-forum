var giraffe = {
  text: "",
  open: false,
  clear: function() {this.text = "";},
  reset: function() { this.canvas.graphicsObjects = []; },
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
      
      canvas = giraffe.canvas;
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
      this.log(cursor+"<br/>");
      
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
  close: function() {
    giraffe.open = false;
  }
};

addPlugin( {
  name: "Giraffe",
  init: function() {
      if(giraffe.open===true) {
        return;
      }
      giraffe.open=true;
      editorIndex++;
      this.editorIndex = editorIndex;
      var editor = document.createElement("div");
      editor.setAttribute("id","editor"+editorIndex);
      editor.setAttribute("style","display:block;");
      document.getElementById("editors").appendChild(editor);

      var content = OpenForum.loadFile("/OpenForum/Editor/Plugins/Giraffe/page.html.fragment");
      OpenForum.setElement("editor"+editorIndex,content);
    
          OpenForum.crawl(document.getElementById("editor"+editorIndex));
    
      DependencyService.createNewDependency()
          .addDependency("/OpenForum/Giraffe/giraffe-0.0.3.js")
          .addDependency("/OpenForum/Actions/SaveImage/save-canvas.js")
        .setOnLoadTrigger(  function() {

          document.getElementById("exampleCanvas").width = screen.width-120;
          giraffe.canvas = new Canvas("exampleCanvas");
          Giraffe.Interactive.setInteractive(giraffe.canvas);
          Giraffe.setAnimated(giraffe.canvas);
          giraffe.canvas.startAnimation(60,100,true);
          
      }
          ).loadDependencies();

            OpenForum.addTab("editor"+editorIndex);
            editorList[editorIndex] = {id: editorIndex, tabButtonStyle: "tab", tabId: "editor"+editorIndex, name: "Giraffe", changed: "", plugin: giraffe};
            showTab(editorIndex);
            console.log("giraffe Ready");
            return editorList[editorIndex];
          }
      }
         ) ;

giraffe.run = function(tabName,canvas) {
  eval( findEditor(tabName).editor.getValue() );
};