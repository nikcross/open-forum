function DefaultEditor(editorIndex,pageName,fileName) {
  var self = this;

  OpenForum.loadCSS("/OpenForum/Javascript/CodeMirror/theme/elegant.css");

  OpenForum.setElement("editor"+editorIndex,"<textarea id=\"editor"+editorIndex+"Src\">Loading...</textarea>");
  var cm = CodeMirror.fromTextArea(
    document.getElementById("editor"+editorIndex+"Src"),
    {                 
      theme: 'elegant',
      lineNumbers: true,
      matchBrackets: true,
      extraKeys: {
        Tab: function(cm) {
          var spaces = Array(cm.getOption("indentUnit") + 1).join("    ");
          cm.replaceSelection(spaces);
        },
        "Ctrl-.": function(cm) {
          var range = { from: cm.getCursor(true), to: cm.getCursor(false) };
          cm.autoFormatRange(range.from, range.to); 
        }
      }
    }
  );
  cm.setValue("Loading...");
  
  cm.setSize(null,"100%");
  
  var source = "";
  //load source if exists
  if(OpenForum.file.attachmentExists(pageName,fileName)==="true") {
    source = OpenForum.loadFile(pageName+"/"+fileName);
  } else if(OpenForum.file.attachmentExists("/OpenForum/FileTemplates/default",fileName+".default")==="true") {
    source = OpenForum.loadFile("/OpenForum/FileTemplates/default/"+fileName+".default");
  } else {
    source = OpenForum.loadFile("/OpenForum/FileTemplates/default/default.txt");
  }
  cm.setValue(source);
    
  cm.setSize(null,"100%"); 
  
  cm.refresh();

  self.init = function() {};
  
  self.refresh = function() {
    if(cm) cm.refresh();
  };

  self.getValue = function() {
    return cm.getValue();
  };

  self.getCodeMirror = function() {
    return cm;
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

  cm.on("change", function(cm, change) {
    editorList[editorIndex].changed="*";
  });

};