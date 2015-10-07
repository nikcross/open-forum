function XmlEditor(editorIndex,pageName,fileName) {
  var self = this;
  var cm = null;
  
  this.init = function() {
    OpenForum.setElement("editor"+editorIndex,"<textarea id=\"editor"+editorIndex+"Src\">Loading...</textarea>");
    cm = CodeMirror.fromTextArea(
        document.getElementById("editor"+editorIndex+"Src"),
        { 
                theme: 'rubyblue',
                lineNumbers: true,
                matchBrackets: true,
                mode: "xml",
                onGutterClick: CodeMirror.newFoldFunction(CodeMirror.braceRangeFinder)
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
  };

  this.refresh = function() {
    if(cm) cm.refresh();
  };
  
  this.getValue = function() {
    return cm.getValue();
  };

  OpenForum.loadCSS("/OpenForum/Javascript/CodeMirror/theme/rubyblue.css");
  
  DependencyService.createNewDependency()
  	.addDependency("/OpenForum/Javascript/CodeMirror/mode/javascript/javascript.js")
  	.addDependency("/OpenForum/Javascript/CodeMirror/mode/xml/xml.js")
  	.addDependency("/OpenForum/Javascript/CodeMirror/util/foldcode.js")
    .setOnLoadTrigger( function() {
        var o = self;
        o.init();
      } ).loadDependencies();
  
}