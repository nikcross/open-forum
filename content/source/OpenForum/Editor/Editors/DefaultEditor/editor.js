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
  
     var source = "";
    //load source if exists
    source = OpenForum.loadFile(pageName+"/"+fileName);
    cm.setValue(source);
    cm.refresh();

  this.refresh = function() {
    if(cm) cm.refresh();
  };

  this.getValue = function() {
    return cm.getValue();
  };
  
    this.setValue = function(newData) {
    return cm.setValue(newData);
  };

  cm.on("change", function(cm, change) {
    editorList[editorIndex].changed="*";
  });
  
  this.getCodeMirror = function() {
    return cm;
  };
};