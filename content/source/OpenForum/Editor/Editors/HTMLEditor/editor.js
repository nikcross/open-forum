function HTMLEditor(editorIndex,pageName,fileName,markChanged) {
  var self = this;
  var cm = null;
  self.ready = false;

  self.requestFullscreen = function() {
    document.getElementById( "editor"+editorIndex ).requestFullscreen();
  };
  
  self.init = function() {
    var content = OpenForum.loadFile("/OpenForum/Editor/Editors/HTMLEditor/page.html.fragment");
    content = content.replace(/\{\{editorIndex\}\}/g,editorIndex);
    OpenForum.setElement("editor"+editorIndex,content);

    var extensions = [];
    OpenForum.loadJSON( "/OpenForum/Extensions/examples.json", function(data) {extensions = data;} );
    
    var markup = [];
    if(fileName.indexOf(".wiki")!=-1 || fileName=="page.content") {
    	OpenForum.loadJSON( "/OpenForum/Javascript/Renderer/markup.json", function(data) {markup = data;} );
    }
    
    var autocomplete = new Autocomplete( "html" );
    autocomplete.addCompleter(
      function (params) {
        var list = [];
        var exclusive = false;
        if(params.toCursor.endsWith("[{")) {
          for(var x in extensions) {
          	list.push( extensions[x].substring(2,extensions[x].indexOf(" ") ));
          }
        } else {
          for(var x in extensions) {
            if(params.toCursor.endsWith( extensions[x].substring(0,extensions[x].indexOf(" ")).toLowerCase() )) {
          		list.push( extensions[x].substring( extensions[x].indexOf(" ") ) );
            }
          }
        }
        for(var m in markup) {
          list.push( markup[m] );
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
        styleActiveLine: true,
        gutters: ["comments", "CodeMirror-linenumbers"]
      }
    );
    cm.setValue("Loading...");

    var source = "";
    //load source if exists
    if(OpenForum.file.attachmentExists(pageName,fileName)==="true") {
      source = OpenForum.loadFile(pageName+"/"+fileName,null,true);
    } else if(OpenForum.file.attachmentExists("/OpenForum/FileTemplates/html",fileName+".default")==="true") {
      source = OpenForum.loadFile("/OpenForum/FileTemplates/html/"+fileName+".default");
    } else {
      source = OpenForum.loadFile("/OpenForum/FileTemplates/html/default.html");
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
    return cm.setValue(newData);
  };

  self.renderOptions = function() {
    //renderTabOption(name,toolTip,action)
    var data = "";

    data += renderTabOption("Close","Close editor","closeEditor( "+editorIndex+" )");
    data += renderTabOption("Full Screen","Full Screen "+pageName+"/"+fileName,"editorList["+editorIndex+"].editor.requestFullscreen()");
    data += renderTabOption("Save","Save "+pageName+"/"+fileName,"saveFile( '"+pageName+"' , '"+fileName+"' )");
    data += renderTabOption("Download to desktop","Download "+pageName+"/"+fileName,"OpenForum.Browser.download( '"+fileName+"',editorList["+editorIndex+"].editor.getValue() )");
    data += renderTabOption("Copy","Copy to clipboard","OpenForum.copyData( editorList["+editorIndex+"].editor.getValue() )");

    return data;
  };

  OpenForum.loadCSS("/OpenForum/Javascript/CodeMirror/theme/rubyblue.css");

  self.documentation = [
    {pageName: "OpenForumJavascript/KitchenSink", title:"OpenForum JS Binding"},
    {pageName: "OpenForumMarkup/KitchenSink", title: "OpenForum Markup"},
    {pageName: "OpenForum/Extensions", title: "OpenForum Extended Markup"},
    {pageName: "Foundation", title: "Foundation Framework"}
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
    .addDependency("/OpenForum/Editor/Editors/Autocomplete.js")
    .setOnLoadTrigger( function() {
    var o = self;
    o.init();
  } ).loadDependencies();

}