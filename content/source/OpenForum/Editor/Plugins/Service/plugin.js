var service = {
  open: false,
  close: function() {
    service.open = false;
  }
};

addPlugin( {
  name: "service",
  init: function() {
      if(service.open===true) {
        return;
      }
      service.open=true;
      editorIndex++;
      this.editorIndex = editorIndex;
    
      var editor = document.createElement("div");
      editor.setAttribute("id","editor"+editorIndex);
      editor.setAttribute("style","display:block;");
      document.getElementById("editors").appendChild(editor);

      var content = OpenForum.loadFile("/OpenForum/Editor/Plugins/Service/page.html.fragment");
      OpenForum.setElement("editor"+editorIndex,content);
    
      OpenForum.crawl(document.getElementById("editor"+editorIndex));
    
      DependencyService.createNewDependency()
          .addDependency("/OpenForum/Service/service.js")
        .setOnLoadTrigger(  function() {

      }
          ).loadDependencies();

            OpenForum.addTab("editor"+editorIndex);
            editorList[editorIndex] = {id: editorIndex, tabButtonStyle: "tab", tabId: "editor"+editorIndex, name: "Service", changed: "", options: [], plugin: service};
            showTab(editorIndex);
            return editorList[editorIndex];
          }
      }
) ;

service.parameters = [];
service.parameters[0] =  {name: "test",type: "",optional: true, actions: "<button onClick=\"service.editParameter(0)\">Edit</button>"};
service.parameter = service.parameters["test"];

service.addParameter = function() {
  service.parameter = {name: "<name>",type: "type",optional: true, actions: "<button onClick=\"service.editParameter("+service.getParameterIndex("<name>")+")\">Edit</button>"};
  service.parameters[ service.getParameterIndex(service.parameter.name) ]  = service.parameter;
};

service.editParameter = function(index) {
  service.parameter = service.parameters[index];
};

service.getParameterIndex = function (name) {
  for(var i in service.parameters) {
    if( service.parameters[i].name===name) {
      return i;
    }
  }
  return service.parameters.length;
};
