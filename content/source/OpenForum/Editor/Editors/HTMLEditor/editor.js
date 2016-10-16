function HTMLEditor(editorIndex,pageName,fileName) {
  var self = this;
  var cm = null;

  self.init = function() {
    var content = OpenForum.loadFile("/OpenForum/Editor/Editors/HTMLEditor/page.html.fragment");
    content = content.replace(/\{\{editorIndex\}\}/g,editorIndex);
    OpenForum.setElement("editor"+editorIndex,content);

    var autocomplete = new Autocomplete( "html" );
    autocomplete.addCompleter(
      function (params) {
        var list = [];
        var exclusive = false;
        if(params.toCursor.endsWith("[")) {
          list.push("{Icon name=\"\"}]");
        } else if(params.toCursor.endsWith("[{icon name=\"")) {
          list.push("chart pie");
          exclusive = true;
        }
        return {list: list, exclusive: exclusive};
      }
    );

    cm = CodeMirror.fromTextArea(
      document.getElementById("editor"+editorIndex+"Src"),
      { 
        theme: 'rubyblue',
        matchTags: {bothTags: true},
        lineNumbers: true,
        matchBrackets: true,
        extraKeys: {
          "Ctrl-J": "toMatchingTag",
          "Ctrl-Q": "toggleComment",
          "Ctrl-Space": "autocomplete"
        },
        viewportMargin: Infinity,
        mode: "text/html",
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

    cm.setSize(null,"100%");

    cm.refresh();

    cm.on("change", function(cm, change) {
      editorList[editorIndex].changed="*";
    });
  };

  self.getCodeMirror = function() {
    return cm;
  };

  self.refresh = function() {
    if(cm) cm.refresh();
  };

  self.getValue = function() {
    return cm.getValue();
  };


  self.setValue = function(newData) {
    return cm.setValue(newData);
  };

  self.renderOptions = function() {
    //renderTabOption(name,toolTip,action)
    var data = "";

    data += renderTabOption("Close","Close editor","closeEditor( "+editorIndex+" )");
    data += renderTabOption("Save","Save "+pageName+"/"+fileName,"saveFile( '"+pageName+"' , '"+fileName+"' )");
    return data;
  };

  OpenForum.loadCSS("/OpenForum/Javascript/CodeMirror/theme/rubyblue.css");

  self.documentation = [
    {pageName: "/OpenForumJavascript/KitchenSink", title:"OpenForum JS Binding"},
    {pageName: "/OpenForumMarkup/KitchenSink", title: "OpenForum Markup"},
    {pageName: "/OpenForumExtensions", title: "OpenForum Extended Markup"}
  ];

  DependencyService.createNewDependency()
    .addDependency("/OpenForum/Javascript/CodeMirror/addon/fold/xml-fold.js")
    .addDependency("/OpenForum/Javascript/CodeMirror/addon//edit/matchtags.js")
    .addDependency("/OpenForum/Javascript/CodeMirror/mode/xml/xml.js")
    .addDependency("/OpenForum/Javascript/CodeMirror/mode/css/css.js")
    .addDependency("/OpenForum/Javascript/CodeMirror/mode/htmlmixed/htmlmixed.js")
    .addDependency("/OpenForum/Javascript/CodeMirror/addon/hint/show-hint.js")
    .addDependency("/OpenForum/Javascript/CodeMirror/addon/hint/xml-hint.js")
    .addDependency("/OpenForum/Javascript/CodeMirror/addon/hint/html-hint.js")
    .addDependency("/OpenForum/Javascript/CodeMirror/addon/hint/javascript-hint.js")
    .addDependency("/OpenForum/Editor/Editors/HTMLEditor/Autocomplete.js")
    .setOnLoadTrigger( function() {
    var o = self;
    o.init();
  } ).loadDependencies();

}