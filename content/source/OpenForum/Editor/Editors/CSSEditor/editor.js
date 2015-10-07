function CssEditor(editorIndex,pageName,fileName) {
  var self = this;
  var cm = null;
  
  console.log("Loading css editor");
  
  this.init = function() {
    OpenForum.setElement("editor"+editorIndex,"<textarea id=\"editor"+editorIndex+"Src\">Loading...</textarea>");
    cm = CodeMirror.fromTextArea(
        document.getElementById("editor"+editorIndex+"Src"),
        { 
                theme: 'ambiance',
                lineNumbers: true,
                matchBrackets: true,
                mode: "css"
        }
    );
    cm.setValue("Loading...");
    
    var source = "";
    //load source if exists
    source = OpenForum.loadFile(pageName+"/"+fileName);
    cm.setValue(source);
    cm.refresh();

    cm.on("change", function(cm, change) {
      editorList[editorIndex].changed="*";
    });
    
	console.log("Css editor loaded");
  };

  this.refresh = function() {
    if(cm) cm.refresh();
  };
  
  this.getValue = function() {
    return cm.getValue();
  };

  OpenForum.loadCSS("/OpenForum/Javascript/CodeMirror/theme/ambiance.css");
  
  DependencyService.createNewDependency()
	.addDependency("/OpenForum/Javascript/CodeMirror/mode/css/css.js")
    .setOnLoadTrigger( function() {
        var o = self;
        o.init();
      } ).loadDependencies();
  
}