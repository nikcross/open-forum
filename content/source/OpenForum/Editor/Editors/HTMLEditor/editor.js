function HtmlEditor(editorIndex,pageName,fileName) {
  var self = this;
  var cm = null;

  this.init = function() {
    var content = OpenForum.loadFile("/OpenForum/Editor/Editors/HTMLEditor/page.html.fragment");
    content = content.replace(/\{\{editorIndex\}\}/g,editorIndex);
    OpenForum.setElement("editor"+editorIndex,content);
    cm = CodeMirror.fromTextArea(
      document.getElementById("editor"+editorIndex+"Src"),
      { 
        theme: 'rubyblue',
        lineNumbers: true,
        matchBrackets: true,
        viewportMargin: Infinity,
        mode: "htmlmixed",
        styleActiveLine: true
      }
    );
    cm.setValue("Loading...");

    var source = "";
    //load source if exists
    if(OpenForum.file.attachmentExists(pageName,fileName)==="true") {
      source = OpenForum.loadFile(pageName+"/"+fileName);
    } else if(OpenForum.file.attachmentExists("/OpenForum/FileTemplates/html",fileName+".default")==="true") {
      source = OpenForum.loadFile("/OpenForum/FileTemplates/html/"+fileName+".default");
    } else {
      source = OpenForum.loadFile("/OpenForum/FileTemplates/html/default.html");
    }
    cm.setValue(source);
    cm.refresh();

    cm.on("change", function(cm, change) {
      editorList[editorIndex].changed="*";
    });
  };

  this.getCodeMirror = function() {
    return cm;
  };

  this.refresh = function() {
    if(cm) cm.refresh();
  };

  this.getValue = function() {
    return cm.getValue();
  };

  OpenForum.loadCSS("/OpenForum/Javascript/CodeMirror/theme/rubyblue.css");

  this.documentation = [
    {pageName: "/OpenForumDocumentation/OpenForumJavascript/KitchenSink", title:"OpenForum JS Binding"}
  ];

  DependencyService.createNewDependency()
  .addDependency("/OpenForum/Javascript/CodeMirror/mode/javascript/javascript.js")
  .addDependency("/OpenForum/Javascript/CodeMirror/mode/xml/xml.js")
  .addDependency("/OpenForum/Javascript/CodeMirror/mode/css/css.js")
  .addDependency("/OpenForum/Javascript/CodeMirror/mode/htmlmixed/htmlmixed.js")
  .addDependency("/OpenForum/Javascript/CodeMirror/addon/lint/javascript-lint.js")
  .addDependency("/OpenForum/Javascript/CodeMirror/addon/jshint.js")
  .setOnLoadTrigger( function() {
    var o = self;
    o.init();
  } ).loadDependencies();

}
