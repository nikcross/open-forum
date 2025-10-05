function JavascriptEditor(editorIndex,pageName,fileName,markChanged) {
  var self = this;
  var cm = null;
  self.ready = false;

  self.requestFullscreen = function() {
    document.getElementById( "editor"+editorIndex ).requestFullscreen();
  };
  
  self.init = function() {
    var content = OpenForum.loadFile("/OpenForum/Editor/Editors/JavascriptEditor/page.html.fragment",null,true);
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
        gutters: ["comments","CodeMirror-lint-markers","CodeMirror-linenumbers"],
        lint: {
          "esversion": 6
        }
      }
    );
    cm.setValue("Loading...");

    var source = "";
    //load source if exists

    if(OpenForum.file.attachmentExists(pageName,fileName)==="true") {
      source = OpenForum.loadFile(pageName+"/"+fileName,null,true);
    } else if(OpenForum.file.attachmentExists("/OpenForum/FileTemplates/js",fileName+".default")==="true") {
      source = OpenForum.loadFile("/OpenForum/FileTemplates/js/"+fileName+".default");
      source = source.replace("Author:","Author: " +user.profile.userName);
    } else {
      if(fileName.indexOf(".json")!=-1) {
        source = OpenForum.loadFile("/OpenForum/FileTemplates/js/default.json");
    	source = source.replace("Author:","Author: " +user.profile.userName);
      } else {
        source = OpenForum.loadFile("/OpenForum/FileTemplates/js/default.js");
    	source = source.replace("Author:","Author: " +user.profile.userName);
      }
    }
    cm.setValue(source);

    cm.setSize(null,"100%");

    cm.refresh();
    
    cm.on("change", function(cm, change) {
      if(markChanged) {
        //Search because array size can change if tabs closed
        //but editorIndex is a closure in this case
        for(var i in editorList) {
          if(editorList[i].id==editorIndex) {
            editorList[i].changed="*";
            return;
          }
        }
      }
    });
    self.ready = true;
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
      data += renderTabOption("Full Screen","Full Screen "+pageName+"/"+fileName,"editorList["+editorIndex+"].editor.requestFullscreen()");
    data += renderTabOption("Save","Save "+pageName+"/"+fileName,"saveFile( '"+pageName+"' , '"+fileName+"' )");
    if(fileName.indexOf(".json")!=-1) {
      data += renderTabOption("Prettify","Prettify "+pageName+"/"+fileName,"editorList["+editorIndex+"].editor.prettifyJson()");
    } else if(fileName.indexOf(".test.sjs")!=-1) {
      data += renderTabOption("Run Test","Run Test "+pageName+"/"+fileName,"editorList["+editorIndex+"].editor.runAsTest()");
    } else {
      data += renderTabOption("Run","Run "+pageName+"/"+fileName,"editorList["+editorIndex+"].editor.run()");
      data += renderTabOption("Generate Docs","Generate Documentation","window.open('/OpenForum/AddOn/ServiceBuilder/JavascriptDocumentationGenerator?fileName=" + pageName+"/"+fileName + "&autorun=true','')");
    }
    if(fileName.indexOf(".sjs")!=-1 && fileName.indexOf(".test.sjs")==-1) {
      data += renderTabOption("Create Test","Create Test for "+pageName+"/"+fileName,"editorList["+editorIndex+"].editor.createTest()");
    }
    data += renderTabOption("Download to desktop","Download "+pageName+"/"+fileName,"OpenForum.Browser.download( '"+fileName+"',editorList["+editorIndex+"].editor.getValue() )");
    data += renderTabOption("Copy","Copy to clipboard","OpenForum.copyData( editorList["+editorIndex+"].editor.getValue() )");

    if( pageName.indexOf("/Development/") == 0 ) {
      if( OpenForum.fileExists( pageName.substring(12) + "/" + fileName ) ) {
        data += renderTabOption("Compare","Compare with Production","editorList["+editorIndex+"].editor.compareWithProduction();");
      }
    }

    return data;
  };

  self.compareWithProduction = function() {
    if( pageName.indexOf("/Development/") != 0 ) return;

    if( typeof fileDiff == "undefined" ) {
      loadPlugin("FileDiff", self.compareWithProduction);
      return;
    }

    fileDiff.openFile1(pageName,fileName);
    fileDiff.openFile2(pageName.substring(12),fileName);
  };

  self.prettifyJson = function() {
    self.setValue( JSON.stringify( JSON.parse(self.getValue()),null,4 ) );
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
  
  self.runAsTest = function() {
    window.open( "/OpenForum/AddOn/Tester?pageName=" + pageName + "&testFileName=" + fileName + "&run=true", "tester" );
  };
  
  self.createTest = function() {
    window.open( "/OpenForum/AddOn/Tester/CreateTest?pageName=" + pageName + "&testFileName=" + fileName, "CreateTest" );
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
    self.documentation.push( {pageName: "/OpenForum/Giraffe/QuickReference", title:"Giraffe Graphics Library"} );
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
    .addDependency("/OpenForum/Editor/Editors/Autocomplete.js")

    .setOnLoadTrigger( function() {
    var o = self;
    o.init();
  } ).loadDependencies();

}
