function CSSEditor(editorIndex,pageName,fileName) {
  var self = this;
  var cm = null;

  console.log("Loading css editor");

  self.init = function() {
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
    if(OpenForum.file.attachmentExists(pageName,fileName)==="true") {
      source = OpenForum.loadFile(pageName+"/"+fileName);
    } else if(OpenForum.file.attachmentExists("/OpenForum/FileTemplates/css",fileName+".default")==="true") {
      source = OpenForum.loadFile("/OpenForum/FileTemplates/css/"+fileName+".default");
    } else {
      source = OpenForum.loadFile("/OpenForum/FileTemplates/css/default.css");
    }
    cm.setValue(source);
    
    cm.setSize(null,"100%");
    
    cm.refresh();

    cm.on("change", function(cm, change) {
      editorList[editorIndex].changed="*";
    });

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
    data += renderTabOption("Save","Save "+pageName+"/"+fileName,"saveFile( '"+pageName+"' , '"+fileName+"' )");
    return data;
  };

  OpenForum.loadCSS("/OpenForum/Javascript/CodeMirror/theme/ambiance.css");

  DependencyService.createNewDependency()
  .addDependency("/OpenForum/Javascript/CodeMirror/mode/css/css.js")
  .setOnLoadTrigger( function() {
    var o = self;
    o.init();
  } ).loadDependencies();

}