function JavascriptEditor(editorIndex,pageName,fileName,markChanged) {
  var self = this;
  var cm = null;

  self.init = function() {
    var content = OpenForum.loadFile("/OpenForum/Editor/Editors/JavascriptEditor/page.html.fragment");
    content = content.replace(/\{\{editorIndex\}\}/g,editorIndex);
    OpenForum.setElement("editor"+editorIndex,content);

    var autocomplete = new Autocomplete( "javascript" );
    autocomplete.addCompleter(
      function (params) {
        var list = [];
        var exclusive = false;
        if(params.toCursor.endsWith("O")) {
          list.push("penForum");
        } else if(params.toCursor.endsWith("OpenForum")) {
          list.push(".setElement();");
          list.push(".getElement();");
          list.push(".showTab();");
          list.push(".loadScript();");
          exclusive = true;
        }
        return {list: list, exclusive: exclusive};
      }
    );

    cm = CodeMirror.fromTextArea(
      document.getElementById("editor"+editorIndex+"Src"),
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
        gutters: ["CodeMirror-lint-markers","CodeMirror-linenumbers"],
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

    cm.setSize(null,"100%");

    cm.refresh();

    cm.on("change", function(cm, change) {
      if(markChanged) {
        editorList[editorIndex].changed="*";
      }
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
    cm.setValue(newData);
  };

  self.renderOptions = function() {
    //renderTabOption(name,toolTip,action)
    var data = "";

    data += renderTabOption("Close","Close editor","closeEditor( "+editorIndex+" )");
    data += renderTabOption("Save","Save "+pageName+"/"+fileName,"saveFile( '"+pageName+"' , '"+fileName+"' )");
    data += renderTabOption("Run","Run "+pageName+"/"+fileName,"editorList["+editorIndex+"].editor.run()");

    return data;
  };

  self.run = function() {
    var pluginName = "Console";
    if(fileName.indexOf(".sjs")!=-1) {
      pluginName = "ServerConsole";
    }

    loadPlugin(pluginName,
               function(plugin) {
      showTab(plugin.editorIndex);
      plugin.run(fileName);
    }
              );
  };

  self.documentation = [
    {pageName: "StandardJavascript/Global", title:"Global JS"},
    {pageName: "StandardJavascript/Array", title:"JS Arrays"},
    {pageName: "StandardJavascript/Math", title:"JS Math"},
    {pageName: "StandardJavascript/String", title:"JS Strings"},
    {pageName: "StandardJavascript/JSON", title:"JS JSON"},
    {pageName: "StandardJavascript/Date", title:"JS Dates"}
  ];

  if(fileName.indexOf(".js")!=-1) {
    self.documentation.push( {pageName: "OpenForumJavascript/Overview", title:"OpenForum Javascript"} );
    self.documentation.push( {pageName: "DependencyService/Overview", title:"OpenForum DependencyService"} );
  } else if(fileName==="get.sjs" || fileName==="post.sjs") {
    self.documentation.push( {pageName: "OpenForumServerSideJavascript/OpenForum", title: "SJS Transaction"} );
  }

  if(fileName.indexOf(".sjs")!=-1) {
    self.documentation.push( {pageName: "OpenForumServerSideJavascript/KitchenSink", title: "Javascript Helpers"} );
  }

  OpenForum.loadCSS("/OpenForum/Javascript/CodeMirror/theme/rubyblue.css");

  DependencyService.createNewDependency()
    .addDependency("OpenForum/Javascript/CodeMirror/mode/javascript/javascript.js")
    
    .addDependency("/OpenForum/Javascript/CodeMirror/addon/hint/show-hint.js")
    .addDependency("/OpenForum/Javascript/CodeMirror/addon/hint/javascript-hint.js")
  
    .addDependency("/OpenForum/Javascript/CodeMirror/addon/lint/lint.js")
    .addDependency("/OpenForum/Javascript/CodeMirror/addon/lint/javascript-lint.js")
    .addDependency("/OpenForum/Javascript/CodeMirror/addon/jshint.js")
  
    .addDependency("/OpenForum/Javascript/CodeMirror/addon/edit/matchbrackets.js")
    .addDependency("/OpenForum/Javascript/CodeMirror/addon/comment/continuecomment.js")
    .addDependency("/OpenForum/Javascript/CodeMirror/addon/comment/comment.js")
    .addDependency("/OpenForum/Editor/Editors/HTMLEditor/Autocomplete.js")

    .setOnLoadTrigger( function() {
    var o = self;
    o.init();
  } ).loadDependencies();

}
