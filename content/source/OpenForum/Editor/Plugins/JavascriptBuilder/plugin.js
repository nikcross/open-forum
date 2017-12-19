/*
* Author: 
* Description: 
*/
var javascriptBuilder = {
  open: false
};

addPlugin( {
  name: "Javascript Builder",
  editorIndex: 0,
  init: function() {
    if(javascriptBuilder.open===true) {
      return;
    }
    javascriptBuilder.open=true;
    editorIndex++;
    this.editorIndex = editorIndex;
    var editor = document.createElement("div");
    editor.setAttribute("id","editor"+editorIndex);
    editor.setAttribute("style","display:block;");
    document.getElementById("editors").appendChild(editor);

    OpenForum.crawl(document.getElementById("editor"+editorIndex));

    var content = OpenForum.loadFile("/OpenForum/Actions/RenderWikiData?pageName=/Development/Planner&sourcePageName=/OpenForum/Javascript/Builder&fileName=build-client.content");
    OpenForum.setElement("editor"+editorIndex,content);    

    OpenForum.crawl(document.getElementById("editor"+editorIndex));

    DependencyService.createNewDependency()
    .addDependency("/OpenForum/Javascript/Builder/build-client.js")
    .setOnLoadTrigger( function() {
      loadBuildScript();
    } ).loadDependencies();

    OpenForum.addTab("editor"+editorIndex);
    editorList[editorIndex] = {id: editorIndex, tabButtonStyle: "tab", tabId: "editor"+editorIndex, name: "Javascript Builder", changed: ""};
    showTab(editorIndex);
    return editorList[editorIndex];

  },
  run: function(tabName) {
    
  }
});

