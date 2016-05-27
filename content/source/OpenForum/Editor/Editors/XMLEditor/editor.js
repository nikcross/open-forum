function XMLEditor(editorIndex,pageName,fileName) {
  var self = this;
  var cm = null;

  self.init = function() {
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
    if(OpenForum.file.attachmentExists(pageName,fileName)==="true") {
      source = OpenForum.loadFile(pageName+"/"+fileName);
    } else if(OpenForum.file.attachmentExists("/OpenForum/FileTemplates/xml",fileName+".default")==="true") {
      source = OpenForum.loadFile("/OpenForum/FileTemplates/xml/"+fileName+".default");
    } else {
      source = OpenForum.loadFile("/OpenForum/FileTemplates/xml/default.xml");
    }
    cm.setValue(source);
    cm.refresh();

    cm.on("change", function(cm, change) {
      editorList[editorIndex].changed="*";
    });
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