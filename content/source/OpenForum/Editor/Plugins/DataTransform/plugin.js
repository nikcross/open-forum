var dataTransform = {
  input:null,
  process:null,
  output: null,
  text: "",
  open: false,
  clear: function() {this.text = "";},
  log: function(message) {this.text += message + "<br/>";}
};

addPlugin( {
  name: "Data Transform",
  init: function() {
      if(dataTransform.open===true) {
        return;
      }
      dataTransform.open=true;
      editorIndex++;
      var editor = document.createElement("div");
      editor.setAttribute("id","editor"+editorIndex);
      editor.setAttribute("style","display:block;");
      document.getElementById("editors").appendChild(editor);

      var content = OpenForum.loadFile("/OpenForum/Editor/Plugins/DataTransform/page.html.fragment");
      OpenForum.setElement("editor"+editorIndex,content);

      dataTransform.input = CodeMirror.fromTextArea(
          document.getElementById("dataTransform.input"),
          {                 
                  theme: 'elegant',
                  lineNumbers: true,
                  matchBrackets: true
          }
      );
    dataTransform.input.setSize(null,200);
    
       dataTransform.process = CodeMirror.fromTextArea(
        document.getElementById("dataTransform.process"),
        { 
                theme: 'rubyblue',
                lineNumbers: true,
                matchBrackets: true,
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
    
    dataTransform.process.setSize(null,200);
    
      dataTransform.output = CodeMirror.fromTextArea(
          document.getElementById("dataTransform.output"),
          {                 
                  theme: 'elegant',
                  lineNumbers: true,
                  matchBrackets: true
          }
      );
    dataTransform.output.setSize(null,200);
    
      OpenForum.addTab("editor"+editorIndex);
      editorList[editorIndex] = {id: editorIndex, tabButtonStyle: "tab", tabId: "editor"+editorIndex, name: "Data Transform", changed: ""};
      showTab(editorIndex);
    
      dataTransform.log("Data Transform Ready");
      return editorList[editorIndex];
    }
  
});

dataTransform.run = function(editorName,input) {
  var editor = findEditor(editorName);
  dataTransform.log("Running script from tab "+editorName);
  return eval( editor.editor.getValue() );
};

dataTransform.imp = function(editorName) {
  var editor = findEditor(editorName);
  dataTransform.input.setValue( editor.editor.getValue() );
};

dataTransform.exp = function(editorName,output) {
  var editor = findEditor(editorName);
  editor.editor.setValue( output );
};

dataTransform.applyTransform = function() {
  var process = "var input = dataTransform.input.getValue(); output=\"\"; " + dataTransform.process.getValue() + "; output;";
  dataTransform.output.setValue( eval( process ) );
};