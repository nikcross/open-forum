var plugins = [];

function loadPlugin(pluginName,callback) {
  for(var pi in plugins) {
    if(plugins[pi].name==pluginName) {
      if(callback) {
        callback(plugins[pi]);
        return;
      }
    }
  }
  
    DependencyService.createNewDependency()
  .addDependency("/OpenForum/Editor/Plugins/"+pluginName+"/plugin.js")
    .setOnLoadTrigger(
      function() {
         initPlugin(plugins[plugins.length-1],callback);
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
  plugin.init();
  if(callback) {
    callback(plugin);
  }
}