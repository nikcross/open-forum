var vision = {
  text: "",
  open: false,
  clear: function() {},
  insert: function(clipName) {
    var clip = OpenForum.loadFile("/OpenForum/Editor/Plugins/Vision/Examples/"+clipName+".js");
    vision.code.setValue(clip);
  },
  runScript: function() {
    canvas = vision.canvas;
    eval(vision.code.getValue());
  },
  close: function() {
    vision.open = false;
  }
};

addPlugin( {
  name: "Vision",
  init: function() {
      if(vision.open===true) {
        return;
      }
      vision.open=true;
      editorIndex++;
      this.editorIndex = editorIndex;
      var editor = document.createElement("div");
      editor.setAttribute("id","editor"+editorIndex);
      editor.setAttribute("style","display:block;");
      document.getElementById("editors").appendChild(editor);

      var content = OpenForum.loadFile("/OpenForum/Editor/Plugins/Vision/page.html.fragment");
      OpenForum.setElement("editor"+editorIndex,content);
    
        vision.code = CodeMirror.fromTextArea(
        document.getElementById("vision.code"),
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
    vision.code.setSize(null,200);
    
      DependencyService.createNewDependency()
          .addDependency("/OpenForum/Editor/Plugins/Video/video.js")
        .setOnLoadTrigger(  function() {

          visionOut = new Video("visionOut");
          

      }
          ).loadDependencies();

            OpenForum.addTab("editor"+editorIndex);
            editorList[editorIndex] = {id: editorIndex, tabButtonStyle: "tab", tabId: "editor"+editorIndex, name: "vision", changed: "", plugin: vision};
            showTab(editorIndex);
            console.log("Vision Ready");
            return editorList[editorIndex];
          }
      }
         ) ;

vision.run = function(tabName,canvas) {
  eval( findEditor(tabName).editor.getValue() );
};
