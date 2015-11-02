var plugins = [];

function loadPlugin(pluginName) {
    DependencyService.createNewDependency()
  .addDependency("/OpenForum/Editor/Plugins/"+pluginName+"/plugin.js")
    .setOnLoadTrigger(
      function() {
         initPlugin(plugins[plugins.length-1]);
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

function initPlugin(plugin) {
  plugin.init();
}