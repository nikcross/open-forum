//List of active plugins
var plugins = [];

function loadPlugin(pluginName,callback) {
  for(var pi in plugins) {
    if(plugins[pi].name==pluginName) {
      initPlugin(plugins[pi],callback);
      return;
    }
  }

  var fileName = "/OpenForum/Editor/Plugins/"+pluginName+"/plugin.js";

  //If absolute path given, use it
  if(pluginName.charAt(0)=="/") {
    fileName = pluginName;
    //If script not included in path, use default
    if(fileName.indexOf(".js")==-1) fileName = fileName + "/plugin.js";
  }

  DependencyService.createNewDependency()
    .addDependency(fileName)
    .setOnLoadTrigger(
    function() {
      initPlugin(plugins[plugins.length-1],callback);
      editorList[plugins[plugins.length-1].editorIndex].sourcePage = pluginName;
    }
  ).loadDependencies();

}

function addPlugin( plugin ){
  plugins.push(plugin);
}

function initPlugins() {
  for(var pi in plugins) {
    initPlugin(plugins[pi]);
  }
}

function initPlugin(plugin,callback) {
  var editor = plugin.init();
  if(editor) {
    if(!editor.options) editor.options = [];
    editor.options.push( renderTabOption("Close","Close editor","closeEditor( "+editorIndex+" )") );
  } else {

  }
  if(callback) {
    callback(plugin);
  }
}

function initAvailablePlugins() {
  //Load page specific plugins
  OpenForum.file.attachmentExists(
    pageName,
    "editor-plugins.json",
    function(response) {
      if(response==true) {
        OpenForum.loadFile(
          pageName + "/editor-plugins.json",
          function(data) {
            availablePlugins = availablePlugins.concat( JSON.parse(data) );
          }
        );
      }
    }
  );

  //Load users plugins
  if( user.profile.pages && user.profile.pages.defaults ) {
    OpenForum.file.attachmentExists(
      user.profile.pages.defaults,
      "editor-plugins.json",
      function(response) {
        if(response==true) {
          OpenForum.loadFile(
            user.profile.pages.defaults + "/editor-plugins.json",
            function(data) {
              availablePlugins = availablePlugins.concat( JSON.parse(data) );
            }
          );
        }
      }
    );
  }
}
