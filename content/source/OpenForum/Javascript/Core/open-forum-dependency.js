//---- DependencyService ----
if(typeof OpenForum == "undefined") OpenForum = {};

var DependencyService = new function() {
  //All sets of dependencies
  var dependencies = [];
  //All scripts that have been loaded
  var loadedScripts = [];
  //All scripts that have been requested
  var requestedScripts = [];
  
  var dp = this;
  
  dp.createNewDependency = function() {
    var dependency = new function() {
      //Id of the dependency set
      var id = dependencies.length;
      var self = this;
      //Scripts that need to be loaded
      var scriptsToLoad = [];
      //Scripts that are required
      var requiredScripts = [];
      //Function to call when all required scripts are loaded
      var onLoadTrigger = function() {};
      var loaded = false;

      self.addDependency = function(script) {
        if( requiredScripts.includes(script) ) return this;
        requiredScripts.push(script);
        
        if( requestedScripts.includes(script) == false ) {
        	requestedScripts.push(script);
        }
        
        return self;
      };
      self.setOnLoadTrigger = function(triggerFunction) {
        onLoadTrigger = triggerFunction;
        return self;
      };

      self.loadDependencies = function() {
        if(requiredScripts.length===0) {
          DependencyService.dependencyLoaded(id);
          return;
        }
        
        var openForumDependencies = OpenForum.getDependencies();
        
        var jsServices = {request:""};
        
        //Collate scripts that are required
        scriptsToLoad = [];
        for( var i in requiredScripts) {
          if( loadedScripts.includes(requiredScripts[i]) ){
            continue;
          }
          if(openForumDependencies[requiredScripts[i]]!=null) {
            console.log( "Excluded " + requiredScripts[i] );
            //TODO
            //continue;
          } else {
            openForumDependencies[requiredScripts[i]] = jsServices;
            console.log( "Added " + requiredScripts[i] );
          }
          scriptsToLoad.push(requiredScripts[i]);
        }
        //requiredScripts = [];
        
        if(scriptsToLoad.length==0) {
          DependencyService.dependencyLoaded(id);
          return;
        }
        
        var fileName = "";
        for(var i=0;i<scriptsToLoad.length;i++) {
          if(i>0) fileName+=",";
          fileName+=scriptsToLoad[i];
        }

        var url = "/OpenForum/Javascript/Services?script="+fileName+"&callback=DependencyService.dependencyLoaded&callbackId="+id+"&v="+OpenForum.pageVersion;
        if(OpenForum.pageVersion) url += "&v="+OpenForum.pageVersion;
        
        jsServices.request = url;
        OpenForum.loadScript(url);
      };
      self.checkLoaded = function() {
        return loaded;
      };
      self.setLoaded = function() {
        for(var i in requiredScripts) {
          if(!loadedScripts[requiredScripts[i]]) {
            setTimeout(self.setLoaded,100);
            return;
          }
        }
        loaded = true;
        onLoadTrigger();
      };
      self.getScriptsToLoad = function() {
        return scriptsToLoad;
      };
    };
    dependencies.push(dependency);
    return dependency;
  };
  this.dependencyLoaded = function(id) {
    var newScripts = dependencies[id].getScriptsToLoad();
    for(var i in newScripts) {
      loadedScripts[newScripts[i]]=true;
    }
    dependencies[id].setLoaded();
  };
};

