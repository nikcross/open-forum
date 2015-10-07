var video = {
  text: "",
  open: false,
  clear: function() {},
  insert: function(clipName) {
    var clip = OpenForum.loadFile("/OpenForum/Editor/Plugins/Video/Examples/"+clipName+".js");
    video.code.setValue(clip);
  },
  runScript: function() {
    canvas = video.canvas;
    eval(video.code.getValue());
  }
};

addPlugin( {
  name: "video",
  init: function() {
      if(video.open===true) {
        return;
      }
      video.open=true;
      editorIndex++;
      var editor = document.createElement("div");
      editor.setAttribute("id","editor"+editorIndex);
      editor.setAttribute("style","display:block;");
      document.getElementById("editors").appendChild(editor);

      var content = OpenForum.loadFile("/OpenForum/Editor/Plugins/Video/page.html.fragment");
      OpenForum.setElement("editor"+editorIndex,content);
    
        video.code = CodeMirror.fromTextArea(
        document.getElementById("video.code"),
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
    video.code.setSize(null,200);
    
      DependencyService.createNewDependency()
          .addDependency("/OpenForum/Editor/Plugins/Video/video.js")
        .setOnLoadTrigger(  function() {

          videoOut = new Video("videoOut");
          

      }
          ).loadDependencies();

            OpenForum.addTab("editor"+editorIndex);
            editorList[editorIndex] = {id: editorIndex, tabButtonStyle: "tab", tabId: "editor"+editorIndex, name: "Video", changed: ""};
            showTab(editorIndex);
            console.log("Video Ready");
            return editorList[editorIndex];
          }
      }
         ) ;

video.run = function(tabName,canvas) {
  eval( findEditor(tabName).editor.getValue() );
};