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
        autoMatchParens: true,
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

    if(OpenForum.file.attachmentExists(pageName,fileName)==="true") {
      source = OpenForum.loadFile(pageName+"/"+fileName);
    } else if(OpenForum.file.attachmentExists("/OpenForum/FileTemplates/js",fileName+".default")==="true") {
      source = OpenForum.loadFile("/OpenForum/FileTemplates/js/"+fileName+".default");
    } else {
      source = OpenForum.loadFile("/OpenForum/FileTemplates/js/default.js");
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

  this.setValue = function(newData) {
    cm.setValue(newData);
  };

  this.documentation = [
    {pageName: "/Development/StandardJavascript/Global", title:"Global JS"},
    {pageName: "/Development/StandardJavascript/Array", title:"JS Arrays"},
    {pageName: "/Development/StandardJavascript/Math", title:"JS Math"},
    {pageName: "/Development/StandardJavascript/String", title:"JS Strings"},
    {pageName: "/Development/StandardJavascript/JSON", title:"JS JSON"},
    {pageName: "/Development/StandardJavascript/Date", title:"JS Dates"}
  ];

  if(fileName.indexOf(".js")!=-1) {
    this.documentation.push( {pageName: "/Development/OpenForumJavascript/Overview", title:"OpenForum Javascript"} );
    this.documentation.push( {pageName: "/Development/OpenForumJavascript/DependencyService/Overview", title:"OpenForum DependencyService"} );
  } else if(fileName==="get.sjs" || fileName==="post.sjs") {
    this.documentation.push( {pageName: "/OpenForumDocumentation/OpenForumServerSideJavascript/OpenForum", title: "SJS Transaction"} );
  }

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
