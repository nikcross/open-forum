//---- DependencyService ----

var DependencyService = new function() {
  var dependencies = [];
  this.createNewDependency = function() {
    var dependency = new function() {
      var id = dependencies.length;
      var self = this;
      var scripts = [];
      var onLoadTrigger = function() {};
      var loaded = false;
        
      
        self.addDependency = function(script) {
          scripts.push(script);
          return this;
        };
        self.setOnLoadTrigger = function(triggerFunction) {
          onLoadTrigger = triggerFunction;
          return this;
        };
      
        self.loadDependencies = function() {
          var fileName = "";
          for(var i=0;i<scripts.length;i++) {
            if(i>0) fileName+=",";
            fileName+=scripts[i];
          }
          
      	  OpenForum.loadScript("/OpenForum/Javascript/Services?script="+fileName+"&callback=DependencyService.scriptLoaded&callbackId="+id);
        };
        self.checkLoaded = function() {
          return loaded;
        };
      self.setLoaded = function() {
        loaded = true;
        onLoadTrigger();
      };
    };
    dependencies.push(dependency);
    return dependency;
  };
  this.scriptLoaded = function(id) {
    dependencies[id].setLoaded();
  };
};


/*
var DependencyService = new function() {
  var libraries = [];
  var dependencySet = [];
  
  this.createNewDependency = function() {
    var dependency = new Dependency(this);
    dependencySet.push(dependency);
    return dependency;
  };
  
  this.addScriptToLoad = function(fileName) {
    if(!libraries[fileName]) {
      libraries[fileName] = {"fileName": fileName,"loaded": false,"loading": false};
    }
    return this;
  };
  
  this.loadScripts = function() {
    for(var fileName in libraries) {
      if(libraries[fileName].loaded===false && libraries[fileName].loading===false) {
      	OpenForum.loadScript("/OpenForum/Javascript/Services?script="+fileName+"&callback=DependencyService.scriptLoaded");
        libraries[fileName].loading=false;
      }
    }
  };
  
  this.scriptLoaded = function(fileName) {
    libraries[fileName].loading=false;
    libraries[fileName].loaded=true;
    for(var index in dependencySet) {
      dependencySet[index].checkLoaded();
    }
  };
  
  this.isLoaded = function(fileName) {
    return libraries[fileName].loaded;
  };
};*/

/*
//---- Dependancy ----

function Dependency(serviceReference) {
  var service = serviceReference;
  var dependencies = [];
  var onLoadFunction = function() {};
  var triggered = false;
  
  this.addDependency = function(script) {
    dependencies.push(script);
    service.addScriptToLoad(script);
    return this;
  };
  this.loadDependencies = function() {
    if(this.checkLoaded()===false) {
    	service.loadScripts();
  	}
  };
  this.setOnLoadTrigger = function(triggerFunction) {
    onLoadFunction = triggerFunction;
    return this;
  };
  this.checkLoaded = function() {
    if(triggered===true) {
      return true;
    }
    
    var ready = true;
    for(var index in dependencies) {
      if(service.isLoaded(dependencies[index])===false) {
        ready = false;
      }
    }
    
    if(ready === true) {
      triggered = true;
      onLoadFunction();
      return true;
    } else {
      return false;
    }
  };
}
*/