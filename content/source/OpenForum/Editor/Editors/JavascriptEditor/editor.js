function JavascriptEditor(editorIndex,pageName,fileName) {
  var self = this;
  var cm = null;
  
  this.init = function() {
    var content = OpenForum.loadFile("/OpenForum/Editor/Editors/JavascriptEditor/page.html.fragment");
    content = content.replace(/\{\{editorIndex\}\}/g,editorIndex);
    OpenForum.setElement("editor"+editorIndex,content);
    cm = CodeMirror.fromTextArea(
        document.getElementById("editor"+editorIndex+"Src"),
        { 
                theme: 'rubyblue',
                lineNumbers: true,
                matchBrackets: true,
                extraKeys: {
                  "Ctrl-Space": "autocomplete"
                },
                viewportMargin: Infinity,
                mode: "javascript",
                styleActiveLine: true,
                gutters: ["CodeMirror-lint-markers"],
                lint: true
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
  
  this.setValue = function(newData) {
    cm.setValue(newData);
  };

  OpenForum.loadCSS("/OpenForum/Javascript/CodeMirror/theme/rubyblue.css");
  
  
  DependencyService.createNewDependency()
  	.addDependency("OpenForum/Javascript/CodeMirror/mode/javascript/javascript.js")
  	.addDependency("/OpenForum/Javascript/CodeMirror/addon/hint/show-hint.js")
  	.addDependency("/OpenForum/Javascript/CodeMirror/addon/hint/javascript-hint.js")
  	.addDependency("/OpenForum/Javascript/CodeMirror/addon/lint/lint.js")
  	.addDependency("/OpenForum/Javascript/CodeMirror/addon/lint/javascript-lint.js")
  	.addDependency("/OpenForum/Javascript/CodeMirror/addon/jshint.js")
    .setOnLoadTrigger( function() {
        var o = self;
        o.init();
      } ).loadDependencies();
  
}
