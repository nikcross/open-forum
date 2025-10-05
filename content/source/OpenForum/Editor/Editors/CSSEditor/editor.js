function CSSEditor(editorIndex,pageName,fileName,markChanged) {
  var self = this;
  var cm = null;
  self.ready = false;

  //console.log("Loading css editor");

  self.requestFullscreen = function() {
    document.getElementById( "editor"+editorIndex ).requestFullscreen();
  };
  
  self.init = function() {
    OpenForum.setElement("editor"+editorIndex,"<textarea id=\"editor"+editorIndex+"Src\">Loading...</textarea>");
    
    var autocomplete = new Autocomplete( "css" );
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
        theme: 'ambiance',
        lineNumbers: true,
        matchBrackets: true,
        mode: "css",
        extraKeys: {
          "Ctrl-Space": "autocomplete"
        }
      }
    );
    cm.setValue("Loading...");

    var source = "";
    //load source if exists
    if(OpenForum.file.attachmentExists(pageName,fileName)==="true") {
      source = OpenForum.loadFile(pageName+"/"+fileName,null,true);
    } else if(OpenForum.file.attachmentExists("/OpenForum/FileTemplates/css",fileName+".default")==="true") {
      source = OpenForum.loadFile("/OpenForum/FileTemplates/css/"+fileName+".default");
    } else {
      source = OpenForum.loadFile("/OpenForum/FileTemplates/css/default.css");
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
    console.log("Css editor loaded");
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

  self.getCodeMirror = function() {
    return cm;
  };

  self.renderOptions = function() {
    //renderTabOption(name,toolTip,action)
    var data = "";

    data += renderTabOption("Close","Close editor","closeEditor( "+editorIndex+" )");
    data += renderTabOption("Full Screen","Full Screen "+pageName+"/"+fileName,"editorList["+editorIndex+"].editor.requestFullscreen()");
    data += renderTabOption("Save","Save "+pageName+"/"+fileName,"saveFile( '"+pageName+"' , '"+fileName+"' )");
    return data;
  };

  OpenForum.loadCSS("/OpenForum/Javascript/CodeMirror/theme/ambiance.css");

  DependencyService.createNewDependency()
  .addDependency("/OpenForum/Javascript/CodeMirror/mode/css/css.js")
    .addDependency("/OpenForum/Editor/Editors/Autocomplete.js")
  .setOnLoadTrigger( function() {
    var o = self;
    o.init();
  } ).loadDependencies();

}