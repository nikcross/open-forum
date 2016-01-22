//---- DependencyService ----

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
};

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