//==============================================================================================================//
/* Version 1.17.5*/
/* Built on Sun May 04 2025 11:57:09 GMT-0000 (GMT) */
/* Built by OpenForum Javascript Builder.*/
/* Do not edit as changes may be overwritten */
//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Javascript/Core/open-forum-header.js*/
//==============================================================================================================//
/*
* Author: Nik Cross
* Description: A set of browser side js functions to make life better.
*/

/* End of: /OpenForum/Javascript/Core/open-forum-header.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Javascript/Core/open-forum-dependency.js*/
//==============================================================================================================//
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


/* End of: /OpenForum/Javascript/Core/open-forum-dependency.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Javascript/Core/open-forum-scanner.js*/
//==============================================================================================================//
//---- OpenForum ----

var OpenForum = new function(){
  this.FIELD_DELIMETER_START = "{"+"{";
  this.FIELD_DELIMETER_END = "}"+"}";
  this.pageVersion = "build-" + new Date(document.lastModified).getTime();
  var self = this;
  var objects= [];
  var tables = [];
  var tabs = [];
  var persistentObjectIds = [];
  var nextId = 0;
  var hash;
  var hashCalls = [];
  var nodeProcessors = [];
  var scanners = [];
  var initialisers = [];
  var dependencies = [];
  var waitingScripts = null;
  var watchers = [];
  var defaultScanPeriod = 500;

  self.interval = null;

  self.getVersion = function() {
    return "1.17.5";
  };

  self.getBuildDate = function() {
    return "Sun May 04 2025 11:57:09 GMT-0000 (GMT)";
  };

  self.initDependencies = DependencyService.createNewDependency();

  self.includeScript = function( scriptName ) {
    if(dependencies[scriptName]) return;
    dependencies[scriptName] = self.initDependencies.addDependency( scriptName );
  };

  self.getDependencies = function() {
    return dependencies;
  };

  //Fluent dependency interface
  //Example: OpenForum.addScript("my script 1).addScript("my script 2").then( function() { console.log("Loaded"); } );
  //Example: OpenForum.addScript("my script 1).addScript("my script 2").go();
  self.addScript = function( scriptUrl ) {

    if(waitingScripts == null) {
      waitingScripts = new function() {
        var self = this;
        var dependencyService = DependencyService.createNewDependency();
        self.addScript = function( scriptUrl ) {
          dependencyService.addDependency( scriptUrl );
          return self;
        };
        self.then = function( thenFn ) {
          dependencyService.setOnLoadTrigger( thenFn);
          dependencyService.loadDependencies();
          waitingScripts = null;
        };
        self.go = function() {
          dependencyService.loadDependencies();
          waitingScripts = null;
        };
      };
    }

    return waitingScripts.addScript( scriptUrl );
  };

  self.getRoot = function() {
    var root = document.location.toString();
    root = root.substring( root.indexOf("://")+3 );
    root = root.substring( root.indexOf("/")+1 );
    root = "/"+root.substring( 0,root.indexOf("/") );
    return root;
  };

  self.addNodeProcessor = function(processor) {
    nodeProcessors.push(processor);
  };

  self.addScanner = function(scanner) {
    scanners.push(scanner);
  };

  self.addInitialiser = function( fn ) {
    initialisers.push(fn);
  };
  self.addHashCall = function(hash,callFn) {
    hashCalls[hash] = callFn;
  };

  self.addTable = function(table) {
    tables[table.getId()]=table;
  };

  self.getTable = function(ofId) {
    return tables[ofId];
  };

  self.getNextId = function() {
    nextId++;
    return nextId;
  };

  self.getObject= function(id) {
    //id = id.replace(/\./g,"_dot_");
    if(objects[id]===undefined) {
      objects[id] = new OpenForumObject(id);
    }
    return objects[id];
  };

  self.removeObject = function(id) {
    if(objects[id]!=undefined) {
      delete objects[id];
    }
  };
  
  self.persistObject = function(id) {
    persistentObjectIds.push(id);
  };

  self.storePersistentState = function( key ) {
    if( typeof key == "undefined" ) {
      key = window.location.pathname;
    }
    if( persistentObjectIds.length==0 ) return;
    var json = {};
    for( var i in persistentObjectIds) {
      var object = OpenForum.getObject( persistentObjectIds[i] );
      if( isUndefined(object) ) continue;
      try{
        //Test can be stringified
        JSON.stringify( object.getValue() );
        json[object.getId()] = object.getValue();
      } catch(e) {}
    }
    OpenForum.Storage.set( key + ".persist", JSON.stringify(json) );
  };

  self.restorePersistentState = function( key ) {
    if( typeof key == "undefined" ) {
      key = window.location.pathname;
    }
    var data = OpenForum.Storage.get( key + ".persist" );
    if(data!=null) {
      try{
        var json = JSON.parse( data );
        for(var j in json) {
          //OpenForum.getObject(j).setValue( json[j] );
          try{
            OpenForum.evaluate( j + "=" + JSON.stringify( json[j] ) );
          } catch(e) { console.log(e); }
        }
      } catch(e) { console.log(e); }
    }
  };

  self.addListener = function(id,listener) {
    self.getObject(id).addListener(listener);
  };
  
  self.removeListener = function(id,listener) {
    self.getObject(id).removeListener(listener);
  };

  self.scan = function(firstTime) {
    /*if(self.hash != window.location.hash) {
      self.hash = window.location.hash;
      self._onHash(self.hash);
    }*/
    for(var tableIndex in tables) {
      tables[tableIndex].refresh();
    }

    self.hash = window.location.hash;
    self._onHash(self.hash);

    for(var objectIndex in objects) {
      object = objects[objectIndex];
      if(typeof(object)=="undefined") {
      } else {
        object.scan();
      }
    }
    for(var scanner in scanners) {
      try{
        scanners[scanner]();
      } catch(e) {
        console.log(e);
      }
    }

    if(document.body && document.body!=null && firstTime==true) {
      self.preparePage(document.body);
    }
  };

  self.addNodeProcessor( function(node) {
    if(node.attributes==undefined) return;
    for(var a=0; a<node.attributes.length; a++) {
      //has attribute to map
      if(node.attributes[a].value.indexOf(self.FIELD_DELIMETER_START)!==0) continue;
      var key = node.attributes[a].name;
      var watch = node.attributes[a].value.substring(2,node.attributes[a].value.length-2);
      var value = OpenForum.evaluate( watch );
      node.attributes[a].value = value;
      self.addScanner( function() {
        var newValue = OpenForum.evaluate( watch );
        if(value==newValue) return;
        value = newValue;
        node.attributes[key].value = value;
      }
                     );
    }
  });                 

  self.crawl = function (node) {
    self.crawlTables(node);
    self.crawlParts(node);
  };

  self.preparePage = function(node) {
    //Copy all attributes starting ofa-??? to attribute ???
    if(node.attributes) {
      for(var i=0;i<node.attributes.length;i++) {
        var key = node.attributes[i].name;
        if(key.indexOf("ofa-")==0) {
          key = key.substring(4);
          if(node.attributes[i].value.indexOf(self.FIELD_DELIMETER_START)==-1) {
            var term = node.attributes[i].value;//.substring(2,node.attributes[i].value.length-2);
            var value = term;
            if(term.indexOf("js:")==0) {
              try{ 
                value = OpenForum.evaluate( term.substring(3) );
              } catch(e) {
              }
            }
            if(node.getAttribute(key)!=value) {
              node.setAttribute(key, value);
            }
          } else {
            var term = node.attributes[i].value.substring(2,node.attributes[i].value.length-2);
            var value = OpenForum.evaluate( term );
            if(node.getAttribute(key)!=value) {
              node.setAttribute(key, value);
            }
            //node.setAttribute(key, node.attributes[i].value);
            //node.removeAttribute( node.attributes[i].name );
          }

        }
      }
    }
    for(var nodeIndex=0; nodeIndex<node.childNodes.length; nodeIndex++) {
      self.preparePage( node.childNodes[nodeIndex] );
    }
  };

  self.crawlParts = function (node,prefix) {
    if(node.attributes && node.attributes['of-exclude']) {
      return;
    }

    if(typeof(prefix)=="undefined") {
      prefix="";
    }

    for(var ni = 0; ni<nodeProcessors.length; ni++) {
      try{
        nodeProcessors[ni](node);
      } catch(e) {
        console.log(e);
      }
    }

    if(!(node.childNodes && node.childNodes.length>0) || node.type=="select-one" || node.type=="select-multiple" || node.type=="textarea") {          
      if(node.attributes && node.attributes['of-id']) {
        var nodeName = node.attributes['of-id'].value;
        if(prefix.length>0) {
          nodeName = prefix+"."+nodeName;
        }

        var object = OpenForum.getObject(nodeName).add( node );
        objects[objects.length]=object;
      }
      if( typeof(node.innerHTML)!="undefined" && node.innerHTML.indexOf(OpenForum.FIELD_DELIMETER_START)!=-1) {
        self.parseParts(node,objects,prefix);
      }
      if( node.nodeName=="#text" && node.nodeValue.indexOf(OpenForum.FIELD_DELIMETER_START)!=-1) {
        self.parseText(node,objects,prefix);
      }
    }

    for(var nodeIndex=0; nodeIndex<node.childNodes.length; nodeIndex++) {
      var childNode = node.childNodes[nodeIndex];

      self.crawlParts(childNode,prefix);

      if(childNode.id && childNode.id.indexOf("OFTable")===0) {
        self.getTable(childNode.id).setTableNode(childNode);
      }

      if(childNode.id && childNode.id.indexOf("OFTabs")===0) {
        self.getTab(childNode.id).setTabNode(childNode);
      }
    }

    return objects;
  };

  self.crawlTables = function (node) {
    for(var nodeIndex=0; nodeIndex<node.childNodes.length; nodeIndex++) {
      var childNode = node.childNodes[nodeIndex];
      self.crawlTables(childNode);
      if(childNode.attributes && childNode.attributes['of-repeatFor']) {
        self.addTable( new OpenForumTable(childNode) );
      }
    }
  };

  self.parseText= function(node,objects,prefix) {
    var data = node.nodeValue;

    var spans = [];
    while(data.indexOf(OpenForum.FIELD_DELIMETER_START)!=-1) {
      name = data.substring(data.indexOf(OpenForum.FIELD_DELIMETER_START)+2,data.indexOf(OpenForum.FIELD_DELIMETER_END));

      data = data.substring(0,data.indexOf(OpenForum.FIELD_DELIMETER_START))+
        "<span id='OpenForumId"+nextId+"'>&nbsp;</span>"+
        data.substring(data.indexOf(OpenForum.FIELD_DELIMETER_END)+2);
      spans[spans.length] = {id: 'OpenForumId'+nextId,name: name};

      nextId++;
    }
    //node.nodeValue = data;
    newNode = document.createElement("span");
    node.parentNode.replaceChild(newNode,node);
    newNode.innerHTML = data;

    for(var spanIndex in spans) {
      var span = spans[spanIndex];
      var object = self.getObject( span.name );
      object.add( document.getElementById(span.id) );
      objects[objects.length]=object;
    }
  };    

  self.parseParts= function(node,objects,prefix) {
    var data = node.innerHTML;

    var spans = [];
    while(data.indexOf(OpenForum.FIELD_DELIMETER_START)!=-1) {
      name = data.substring(data.indexOf(OpenForum.FIELD_DELIMETER_START)+2,data.indexOf(OpenForum.FIELD_DELIMETER_END));

      data = data.substring(0,data.indexOf(OpenForum.FIELD_DELIMETER_START))+
        "<span id='OpenForumId"+nextId+"'>&nbsp;</span>"+
        data.substring(data.indexOf(OpenForum.FIELD_DELIMETER_END)+2);
      spans.push( {id: 'OpenForumId'+nextId,name: name} );

      nextId++;
    }
    node.innerHTML = data;

    for(var spanIndex = 0; spanIndex<spans.length; spanIndex++) {
      var span = spans[spanIndex];
      var object = self.getObject( span.name );
      object.add( document.getElementById(span.id) );
      objects[objects.length]=object;
    }
  };

  self.loadScript = function(scriptURL) {
    if(dependencies[scriptURL]) return;

    var fileref = document.createElement("script");
    fileref.setAttribute("src",scriptURL);
    if( scriptURL.indexOf("module")!=-1 ) {
      fileref.setAttribute("type","module");
    } else {
      fileref.setAttribute("type","text/javascript");
    }
    document.getElementsByTagName("head")[0].appendChild(fileref);

    dependencies[scriptURL] = fileref;
  };

  self.loadCSS = function(cssURL) {
    if(dependencies[cssURL]) return;

    var fileref = document.createElement("link");
    fileref.setAttribute("rel", "stylesheet");
    fileref.setAttribute("type", "text/css");
    fileref.setAttribute("href", cssURL);
    document.getElementsByTagName("head")[0].appendChild(fileref);

    dependencies[cssURL] = fileref;
  };

  self._onHash= function(hash) {
    hash = hash.substring(1);
    if(hash==="") {
      hash="home";
    }
    if(hashCalls[hash]) {
      hashCalls[hash]();
    }
    self.onHash(hash);
  };
  self.onHash= function(hash) {};
  self.init= function() {};
  self.close= function() {};

  self.onload= function(next) {
    self.initDependencies.loadDependencies();
    self.waitForReady();
  };

  var waitForReadyCount = 0;
  self.waitForReady = function() { 
    if(waitForReadyCount<75) {
      if(self.initDependencies.checkLoaded()===false) {
        setTimeout(OpenForum.waitForReady,200);
        waitForReadyCount++;
        return;
      }
      for(var fni in initialisers) {
        var initialiser = initialisers[fni];
        if(!initialiser.ready) {
          initialiser.ready = initialiser()!==false;
          setTimeout(OpenForum.waitForReady,200);
          waitForReadyCount++;
          return;
        }
      }
    } else {
      console.log("Error: OpenForum.waitForReady timed out.");
    }
    console.log("Running OpenForum Version "+OpenForum.getVersion());

    self.crawl(document.body);
    self.createData();
    self.hash = "";
    self.restorePersistentState();
    self.scan(true); //First Time
    self.init();

    self.startAutoScan();
  };

  self.stopAutoScan = function() {
    if(self.interval !== null ) {
      clearInterval( self.interval );
      self.interval = null;
    }
  };

  self.startAutoScan = function(scanTime) {
    self.stopAutoScan();
    if(scanTime) {
      self.interval = setInterval(self.scan,scanTime,scanTime);
    } else {
      self.interval = setInterval(self.scan,defaultScanPeriod,defaultScanPeriod);
    }
  };

  self.onunload= function() {
    self.storePersistentState();
    this.close();
  };

  self.getObjects = function() {
    return objects;
  };

  self.getTables = function() {
    return tables;
  };

  self.listData = function() {
    var list = [];
    for(var objectIndex in objects) {
      var object = objects[objectIndex];
      if(typeof(object)=="undefined") {
        continue;
      }
      if(object.getId()) {
        list[list.length]=object.getId();
      }
    }	
    return list;
  };

  self.createData = function() {
    for(var objectIndex in objects) {
      var object = objects[objectIndex];
      if(typeof(object)=="undefined") {
        continue;
      }
      this.createParents(object.getId());
      if( OpenForum.evaluate("typeof("+object.getId()+")")==="undefined" ) {
        OpenForum.evaluate(object.getId()+"=\"\";");
        object.setValue("");
      } else {
        object.setValue( OpenForum.evaluate(object.getId()) );
      }
    }
  };

  self.createParents = function(id)  {
    if(id.indexOf(".")==-1) {
      return;
    }
    var parts = id.split(".");
    id = "";
    for(var index=0;index<parts.length-1;index++) {
      if(id.length>0) {
        id+=".";
      }
      id+=parts[index];

      if( OpenForum.evaluate("typeof("+id+")")=="undefined" ) {
        OpenForum.evaluate(id+"={};");
      }
    }
  };

  self.createObjectSignature = function(object) {
    var cache = [];
    var signature = JSON.stringify(object, function(key, value) {
      if (typeof value === 'object' && value !== null) {
        if (cache.indexOf(value) !== -1) {
          // Circular reference found, discard key
          return;
        }
        // Store value in our collection
        cache.push(value);
      }
      return value;
    });
    cache = null;
    return signature;
  };

  self.childCount = function(object) {
    var count=0;

    for(var index in object) {
      count++;
    }
    return count;
  };

  self.addTab = function(id) {
    tabs[id] = document.getElementById(id);
  };

  self.showTab = function(id){
    for(var index in tabs) {
      tabs[index].style.display="none";
    }
    tabs[id].style.display="block";
  };

  self.getTabs = function(){
    return tabs;
  };    

  self.getTab = function(id){
    return tabs[id];
  };

  //Keep all the evil in one place
  self.evaluate = function(script) {
    try{
      return eval(script);
    } catch (e) {
      OpenForum.debug( "ERROR", "Exception evaluating '" + script + "'",e );
      throw e;
    }
  };

  self.globalExists = function( name ) {
    name = name.replace(/\[/g,".").replace(/\]/g,"").replace(/'/g,"").replace(/\(.*\)/g,"");
    var parts = name.split(".");
    var obj = window;
    for(var part in parts) {
      if( typeof obj[parts[part]] === "undefined" ) return false;
      obj = obj[parts[part]];
    }

    return true;
  };

  self.getGlobal = function( name ) {
    name = name.replace(/\[/g,".").replace(/\]/g,"").replace(/'/g,"").replace(/\(.*\)/g,"");
    var parts = name.split(".");
    var obj = window;
    for(var part in parts) obj = obj[parts[part]];

    if(typeof obj === "function") return obj();
    else return obj;
  };

  self.setGlobal = function( name,value,create ) {
    name = name.replace(/\[/g,".").replace(/\]/g,"").replace(/'/g,"");
    var parts = name.split(".");
    var obj = window;
    var i=0;
    for(i=0; i<parts.length-1; i++) {
      if( typeof obj[parts[i]] === "undefined" && create===true ) obj[parts[i]] = {};
      obj = obj[parts[i]];
    }

    obj[parts[i]] = value;
  };

  self.globalLink = function( part1,part2 ) {
    OpenForum.setGlobal(part1,OpenForum.evaluate(part1),true);
    OpenForum.setGlobal(part2,OpenForum.evaluate(part2),true);
    //console.log( "linked" );
    var oldValue1 = OpenForum.getGlobal(part1);
    var oldValue2 = OpenForum.getGlobal(part2);
    setInterval( function() {
      if( OpenForum.getGlobal(part1) != oldValue1 ) {
        oldValue1 = OpenForum.getGlobal(part1);
        OpenForum.setGlobal(part2, OpenForum.getGlobal(part1) );
        oldValue2 = OpenForum.getGlobal(part2);
        //console.log( "part1 changed to " + OpenForum.getGlobal(part1) );

      } else if( OpenForum.getGlobal(part2) != oldValue2 ) {
        oldValue2 = OpenForum.getGlobal(part2);
        OpenForum.setGlobal(part1,OpenForum.getGlobal(part2));
        oldValue1 = OpenForum.getGlobal(part1);
        //console.log( "part2 changed to " + OpenForum.getGlobal(part2) );
      }
    }, 500 );
  };

};

OpenForum.getSystemTime = function(callback) {
  var callTime = new Date().getTime();
  if(!callback) {
    var data = OpenForum.loadFile("/OpenForum/Actions/SystemTime?action=getTime");
    var jsonData = JSON.parse(data);
    var responseTime = new Date().getTime();
    return new Date( jsonData.time - (responseTime-callTime) );
  } else {
    OpenForum.loadFile(
      "/OpenForum/Actions/SystemTime?action=getTime",
      function(data) {
        var jsonData = JSON.parse(data);
        var responseTime = new Date().getTime();
        callback( new Date( jsonData.time ) );
      }
    );
  }
};

OpenForum.stateToJson = function( objectIds ) {
  var objects = [];
  if( !isUndefined( objectIds ) ) {
    for(var o in objectNames) {
      objects.push( OpenForum.getObject( objectIds[o] ) );
    }
  } else {
    objects = OpenForum.getObjects();
  }
  var json = {};
  for( var o in objects) {
    var object = objects[o];
    if( isUndefined(object) ) continue;
    try{
      //Test can be stringified
      JSON.stringify( object.getValue() );
      json[object.getId()] = object.getValue();
    } catch(e) {}
  }
  return json;
};

OpenForum.jsonToState = function(json) {
  for(var j in json) {
    OpenForum.getObject(o).setValue( json[j] );
  }
};

onload = function() {
  OpenForum.onload();
};

onunload = function() {
  OpenForum.onunload();
};


/* End of: /OpenForum/Javascript/Core/open-forum-scanner.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Javascript/Core/open-forum-files.js*/
//==============================================================================================================//
/*
* Author: 
* Description: 
*/

OpenForum.loadScripts = function(scriptURLs,callback) {
  var scripts="&callback="+callback;
  var index=1;
  for(var scriptIndex in scriptURLs) {
    scripts+="&script"+index+"="+scriptURLs[scriptIndex];
    index++;
  }
  var fileref = document.createElement("script");
  fileref.setAttribute("src",OpenForum.getRoot()+"/OpenForum/Javascripts?action=getScripts"+scripts);
  fileref.setAttribute("type","text/javascript");
  document.getElementsByTagName("head")[0].appendChild(fileref);
};

OpenForum.getAttachments = function(pageName,callBack,matching,withMetaData) {
  var params = "pageName="+pageName;
  if(matching) params += "&matching="+matching;
  if(withMetaData) params += "&metaData=true";

  if(callBack) {
    var action = function(response) {
      callBack( JSON.parse(response) );
    };
    Ajax.sendRequest( new AjaxRequest("GET","/OpenForum/Actions/Attachments",params,null,action,null,true));
  } else {
    return JSON.parse( Ajax.sendRequest( new AjaxRequest("GET","/OpenForum/Actions/Attachments",params,null,null,null,false)) );
  }
};

OpenForum.getSubPages = function(pageName, callBack) {
  var params = "action=getSubPages&pageName="+pageName;

  if(callBack) {
    var action = function(response) {
      callBack( JSON.parse(response) );
    };
    Ajax.sendRequest( new AjaxRequest("GET","/OpenForum/Javascript/Tree",params,null,action,null,true));
  } else {
    return Ajax.sendRequest( new AjaxRequest("GET","/OpenForum/Javascript/Tree",params,null,null,null,false));
  }
};

OpenForum.NO_CACHE = "no-cache";

OpenForum.loadFile = function(fileName,callBack,noCache) {
  if(noCache) {
    if(fileName.indexOf("?")!==-1) {
      fileName += "&ts="+new Date().getTime();
    } else {
      fileName += "?ts="+new Date().getTime();
    }
  }

  if(callBack) {
    Ajax.sendRequest( new AjaxRequest("GET",fileName,"",null,callBack,null,true)  );
  } else {
    return Ajax.sendRequest( new AjaxRequest("GET",fileName,"",null,null,null,false)  );
  }
};

OpenForum.loadJSON = function(fileName,callBack,noCache) {
  if(callBack) {
    var action = function(response) {
      callBack( JSON.parse(response) );
    };
    OpenForum.loadFile(fileName,action,noCache);
  } else {
    return JSON.parse( OpenForum.loadFile(fileName,null,noCache) );
  }
};

OpenForum.loadVersion = function(pageName) {
  if(!pageName) {
    pageName = window.location.pathname;
  }
  OpenForum.loadJSON(pageName+"/release-info.json",function(data) {
    VERSION = data.version;
  }, true);
};

OpenForum.loadXML = function(fileName,callBack,noCache) {
  if(callBack) {
    var action = function(response) {
      var parser = new DOMParser();
      response = parser.parseFromString(response,"text/xml");
      callBack( JSON.parse(response) );
    };
    OpenForum.loadFile(fileName,action,noCache);
  } else {
    var text = OpenForum.loadFile(fileName,null,noCache);
    var parser = new DOMParser();
    text = parser.parseFromString(text,"text/xml");
    return JSON.parse( text );
  }
};

OpenForum.loadDataList = function( fileName ) {
  OpenForum.loadJSON(fileName, function(data) {
    for(var d in data) {
      var name = d;
      var variable = OpenForum.evaluate( name + " = " + JSON.stringify(data[d]) + ";" );

      var list = document.createElement("datalist");
      list.setAttribute("id",name);

      for(var i in data[d]) {
        var option = document.createElement("option");
        option.setAttribute( "value", i );
        list.appendChild( option );
      }
      document.body.appendChild( list );
    }
  });
};

OpenForum.saveFile = function(fileName,data,callBack) {
  var pageName = fileName.substring(0,fileName.lastIndexOf("/"));
  fileName = fileName.substring(fileName.lastIndexOf("/")+1);

  data = "pageName="+encodeURIComponent(pageName)+"&fileName="+encodeURIComponent(fileName)+"&data="+encodeURIComponent(data);

  if(callBack) {
    Ajax.sendRequest( new AjaxRequest(
      "POST",
      "/OpenForum/Actions/Save",
      "returnType=json",
      data,
      function(data) {
        callBack(JSON.parse(data));
      },
      null,
      true));
  } else {
    return JSON.parse( Ajax.sendRequest( new AjaxRequest("POST","/OpenForum/Actions/Save","returnType=json",data,null,null,false)) );
  }
};

OpenForum.saveJSON = function(fileName,data,callBack) {
  data = JSON.stringify(data,null,4);
  return OpenForum.saveFile(fileName,data,callBack);
};

OpenForum.saveXML = function(fileName,data,callBack) {
  data = XMLSerializer.serializeToString(data);
  return OpenForum.saveFile(fileName,data,callBack);
};

OpenForum.appendFile = function(fileName,data,callBack) {
  var pageName = fileName.substring(0,fileName.lastIndexOf("/"));
  fileName = fileName.substring(fileName.lastIndexOf("/")+1);

  var parameters = "action=appendStringToFileNoBackup"+
      "&arg0="+encodeURIComponent(pageName)+"&arg1="+encodeURIComponent(fileName)+"&arg2="+encodeURIComponent(data);

  if(callBack) {
    return Ajax.sendRequest( new AjaxRequest("GET","/OpenForum/Javascript/OpenForumServer/File",parameters,null,callBack,null,true));
  } else {
    return JSON.parse( Ajax.sendRequest( new AjaxRequest("GET","/OpenForum/Javascript/OpenForumServer/File",parameters,null,null,null,false)) );
  }
};

OpenForum.deleteFile = function(pageName,fileName,callBack) {

  var parameters = "pageName="+pageName+
      "&fileName="+fileName+
      "&returnType=json";

  if(callBack) {
    return Ajax.sendRequest( new AjaxRequest("GET","/OpenForum/Actions/Delete",parameters,null,
                                             function(response) { callBack(response.deleted); },
                                             null,true));
  } else {
    var response = Ajax.sendRequest( new AjaxRequest("GET","/OpenForum/Actions/Delete",parameters,null,null,null,false));
    return JSON.parse( response ).deleted;
  }
};

OpenForum.copyFile = function(fileName,toFileName,callBack) {
  var pageName = fileName.substring(0,fileName.lastIndexOf("/"));
  fileName = fileName.substring(fileName.lastIndexOf("/")+1);

  var toPageName = toFileName.substring(0,toFileName.lastIndexOf("/"));
  toFileName = toFileName.substring(toFileName.lastIndexOf("/")+1);

  var parameters = "pageName="+pageName+
      "&fileName="+fileName+
      "&newPageName="+toPageName+
      "&newFileName="+toFileName+
      "&returnType=json";
  if(callBack) {
    return Ajax.sendRequest( new AjaxRequest("GET","/OpenForum/Actions/Copy",parameters,null,callBack,null,true));
  } else {
    return JSON.parse( Ajax.sendRequest( new AjaxRequest("GET","/OpenForum/Actions/Copy",parameters,null,null,null,false)));
  }
};

OpenForum.moveFile = function(fileName,toFileName,callBack) {
  var pageName = fileName.substring(0,fileName.lastIndexOf("/"));
  fileName = fileName.substring(fileName.lastIndexOf("/")+1);

  var toPageName = toFileName.substring(0,toFileName.lastIndexOf("/"));
  toFileName = toFileName.substring(toFileName.lastIndexOf("/")+1);

  var parameters = "pageName="+pageName+
      "&fileName="+fileName+
      "&newPageName="+toPageName+
      "&newFileName="+toFileName+
      "&returnType=json";

  if(callBack) {
    return Ajax.sendRequest( new AjaxRequest("GET","/OpenForum/Actions/Move",parameters,null,callBack,null,true));
  } else {
    return JSON.parse( Ajax.sendRequest( new AjaxRequest("GET","/OpenForum/Actions/Move",parameters,null,null,null,false)) );
  }
};

OpenForum.fileExists = function(fileName) {
  var pageName = fileName.substring(0,fileName.lastIndexOf("/"));
  fileName = fileName.substring(fileName.lastIndexOf("/")+1);

  return JSON.parse( Ajax.sendRequest( new AjaxRequest("GET","/OpenForum/Actions/AttachmentExists","pageName="+pageName+"&fileName="+fileName,null,null,null,false)) );
};

OpenForum.uploadFromURL = function(url,uploadPageName,uploadFileName,callback,callbackError) {
  JSON.get("/OpenForum/Actions/Attach","upload","pageName="+uploadPageName+"&fileName="+uploadFileName+"&url="+url)
    .onSuccess( 
    function() {
      if(callback) callback();
    })
    .onError( 
    function() {
      if(callbackError) callbackError();
    }
  ).go();
};

OpenForum.uploadFile = function(id,pageName,callBack,errorCallBack,progressCallback) {
  var fileName = document.getElementById(id).file.value;
  fileName = fileName.replace(/\\/g,"/");
  fileName = fileName.substring(fileName.lastIndexOf("/")+1);
  var result = OpenForum.loadFile("/OpenForum/Actions/AttachmentExists?pageName="+pageName+"&fileName="+fileName);
  if(result==="true" && confirm("Attachment "+fileName+" exists","Replace this attachment ?")===false ) {
    return;
  }

  var formData = new FormData(document.getElementById( id ));
  var xhr = new XMLHttpRequest();  

  if(callBack) {
    xhr.onload = function() {
      callBack();
    };
  }
  if(errorCallBack) {
    xhr.onerror = function() {
      errorCallBack();
    };
  }

  if(progressCallback) {
    xhr.onprogress = function(event) {
      progressCallback( event.loaded, event.total );
    };    
  }

  xhr.open('POST', "/OpenForum/Actions/Attach?page="+pageName, true);
  xhr.send(formData);
};


/* End of: /OpenForum/Javascript/Core/open-forum-files.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Javascript/Core/open-forum-json.js*/
//==============================================================================================================//
//---- JSON ----

if( typeof(JSON)=="undefined" ) {
  JSON = {};
}

JSON.get = function( page,action,parameters ) {
  var request = {method: 'GET',page: page,action: action,parameters: parameters, onSuccess: JSON.onSuccess, onError: JSON.onError, go: JSON.go};
  return request;
};

JSON.post = function( page,action,parameters ) {
  var request = {method: 'POST',page: page,action: action,parameters: parameters, onSuccess: JSON.onSuccess, onError: JSON.onError, go: JSON.go};
  return request;
};
JSON.onSuccess = function(onSuccess) {
  this.onSuccess = function(data) {
    //var object = JSON.parse(data);
    var object = OpenForum.evaluate("("+data+")");
    onSuccess(object);
  };
  return this;
};
JSON.onError = function(onError) {
  this.onError = function(error) {
    onError(error);
  };
  return this;
};
JSON.go = function() {
  var request = null;
  if(this.action && this.action !== null && this.action !== "") request = "action="+this.action;

  if(this.method=="GET") {
    if(this.parameters && this.parameters.length>0) {
      request+="&"+this.parameters;
    }
    OpenForum.debug("INFO","JSON.get page:" + this.page + " request:" + request);
    Ajax.sendRequest( new AjaxRequest(this.method,this.page,request,"",this.onSuccess,this.onError,true) );
  } else {
    if(this.parameters.length<200) {
      OpenForum.debug("INFO","JSON.post page:" + this.page + " request:" + request + " parameters:" + this.parameters);
    } else {
      OpenForum.debug("INFO","JSON.post page:" + this.page + " request:" + request + " parameters:"+this.parameters.substring(0,200)+"... p;arameters size:" + this.parameters.length);
    }
    Ajax.sendRequest( new AjaxRequest(this.method,this.page,request,this.parameters,this.onSuccess,this.onError,true) );
  }
};

JSON.findPath = function( json, path ) {
  var currentNode = json;
  path = path.split(".");

  for( var p in path ) {
    var found = false;
    var name = path[p];
    for(var n in currentNode) {
      if( n == name ) {
        found = true;
        currentNode = currentNode[name];
        break;
      }
    }
    if( found == false ) return;OpenForum.includeScript("/OpenForum/Editor/Editors/StandaloneEditor.js");
  }
  return currentNode;
};

JSON.createPath = function( json, path ) {
  var currentNode = json;
  path = path.split(".");

  for( var p in path ) {
    var found = false;
    var name = path[p];
    for(var n in currentNode) {
      if( n == name ) {
        found = true;
        currentNode = currentNode[name];
        break;
      }
    }
    if( found == false ) {
      currentNode[name] = {};
      currentNode = currentNode[name];
    }
  }
  return currentNode;
};

JSON.webStringify = function( json ) {
  return JSON.stringify( json , null , "    " ).replaceAll("\n","<br/>").replaceAll(" ","&nbsp;");
};


/* End of: /OpenForum/Javascript/Core/open-forum-json.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Javascript/Core/open-forum-ajax-request.js*/
//==============================================================================================================//
//---- AjaxRequest ----

requestCount = 0;
function AjaxRequest(method,url,request,data,onSuccess,onError,asynchronous)
{
  var self=this;
  self.id = "request_"+requestCount;
  requestCount++;
  eval( self.id+"=this;" );

  self.method = method;
  self.url = url;
  self.request = request;
  self.data = data;
  self.onSuccess = onSuccess;
  self.onError = onError;
  self.asynchronous = asynchronous;
  self.transaction = null;

  this.processTransactionStateChange = function processTransactionStateChange(ev) {
    if (self.transaction.readyState == 4) {
      if (self.transaction.status == 200) {
          onSuccess(self.transaction.responseText);
      } else if (self.transaction.status === 0) {
      } else {
        onError( self.transaction.status,self.transaction.statusText );
      }
      eval( self.id+"=null;" );
    }
  };
}
/* End of: /OpenForum/Javascript/Core/open-forum-ajax-request.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Javascript/Core/open-forum-ajax.js*/
//==============================================================================================================//
//---- Ajax ----

Ajax = new function() {

  this.sendRequest = function sendRequest(request) {

    request.transaction = false;

    if(window.XMLHttpRequest)
    {
      try {
        request.transaction = new XMLHttpRequest();
      }
      catch(e)
      {
        alert(e);
        request.transaction = false;
      }
    }
    else if(window.ActiveXObject)
    {
      try {
        request.transaction = new ActiveXObject("Msxml2.XMLHTTP");
      }
      catch(e)
      {
        alert(e);
        try {
          request.transaction = new ActiveXObject("Microsoft.XMLHTTP");
        }
        catch(e)
        {
          alert(e);
          request.transaction = false;
        }
      }
    }
    if(request.transaction)
    {
      if(request.asynchronous === true)
      {
        var fn = eval(request.id+".processTransactionStateChange");
        request.transaction.onreadystatechange= function(ev){ fn(ev); };
        if(request.request!==null && request.request.length>0) {
          request.transaction.open(request.method, request.url+"?"+request.request,true);
          request.transaction.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
          //request.transaction.setRequestHeader("If-Modified-Since", new Date(0));
          request.transaction.send(request.data);
		} else {
          request.transaction.open(request.method, request.url,true);
          request.transaction.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
          //request.transaction.setRequestHeader("If-Modified-Since", new Date(0));
          request.transaction.send(request.data);
        }
      }
      else
      {
        if(request.request!==null && request.request.length>0) {
          request.transaction.open(request.method, request.url+"?"+request.request,false);
          request.transaction.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
        } else {
          request.transaction.open(request.method, request.url,false);
          request.transaction.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
        }
        //request.transaction.setRequestHeader("If-Modified-Since", new Date(0));
        request.transaction.send(request.data);
        this.currentRequest=null;
        return request.transaction.responseText;
      }
    }
    else
    {
      alert("failed");
    }
  };

};
/* End of: /OpenForum/Javascript/Core/open-forum-ajax.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Javascript/Core/open-forum-ajax-post.js*/
//==============================================================================================================//
//---- Post ----

function Post()
{
  this.data = [];

  this.addItem = function(name,value)
  {
    this.item = [];
    this.data[this.data.length] = this.item;
    this.item[0] = name;
    this.item[1] = value;
    
    return this;
  };

  this.addForm = function(formId) {
    form = document.getElementById(formId);
    for(var loop=0;loop<form.elements.length;loop++) {
      name=form.elements[loop].name;
      if(name.length>0) {
        this.addItem(name,form.elements[loop].value);
      }
    }
    
    return this;
  };
  
  this.getData = function() {
    var dataString = "";
    for(var entry in this.data) {
      if(dataString.length>0) {
        dataString +="&";
      }
      dataString += this.data[entry][0]+"="+encodeURIComponent(this.data[entry][1]);
    }
    return dataString;
  };
  //TODO add get parameters method like
  /*
      this.data="";
    for(this.loop=0;this.loop<dataArray.length;this.loop++)
    {
      if(this.loop!=0)
      {
        this.data += "&";
      }
      this.data += dataArray[this.loop][0]+"="+encodeURIComponent(dataArray[this.loop][1]);
    }
    */
}
/* End of: /OpenForum/Javascript/Core/open-forum-ajax-post.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Javascript/Core/open-forum-tree.js*/
//==============================================================================================================//
//---- Tree ----

var NextTreeNodeIndex = 0;
var TreeNodes = [];

function Tree(elementId,name,attributes,modifier) {
  var self = this;
  var jsonModifier = function(json) {
    if(modifier) modifier(json);
  };

  var root = new TreeNode(name,attributes,null,jsonModifier);

  self.setJSONModifier = function(newModifier) {
    modifier = newModifier;
  };

  self.render = function() {
    var element = document.getElementById(elementId);
    element.innerHTML = root.render(0);
    return this;
  };
  self.addChild = function(name,attributes) {
    return root.addChild(name,attributes);
  };
  self.addJSON = function(node) {
    return root.addJSON(node);
  };
  self.setJSON = function(node) {
    root = root.addJSON(node);
    root.setParent(null);
    return root;
  };
  self.toJSON = function() {
    return root.toJSON();
  };
  self.render();

  self.expandAll = function() {
    root.applyToChildren( function(child){ child.expand(); } );
    root.expand();
    return this;
  };

  self.collapseAll = function() {
    root.applyToChildren( function(child){ child.collapse(); } );
    root.collapse();
    return this;
  };
  self.deleteChild = function(node) {
    node.parent.deleteChild(node);
    return this;
  };
  self.getRoot = function() {
    return root;
  };
  self.expandPath = function(path) {

    var nodePath = findPath(path);
    if(nodePath!==null) {
      nodePath.forEach( function(node) {node.expand(); } );
      return true;
    } else {
      return false;
    }
  };
  self.findNode = function(path) {
    return findPath(path);
  };
  self.init = function() {};
  var findPath = function(path) {
    if(path.charAt(0)==="/") {
      path = path.substring(1);
    }
    var parts = path.split("/");
    var node = root;
    var nodePath = [root];
    for(var i=0;i<parts.length;i++) {
      var children = node.getChildren();
      for(var c=0;c<children.length;c++) {
        if(children[c].getName()===parts[i]) {
          node = children[c];
          nodePath.push(node);
          break;
        }
      }
      if(c===children.length) {
        return null; //No path match
      }
    }
    return nodePath;
  };
}

var NextActionId=0;
var Actions = [];
function Action(config) {
  var self = this;
  var fn = OpenForum.evaluate("("+config.fn+")");
  var icon = config.icon;
  var toolTip = config.toolTip;

  var id = "ActionId"+NextActionId;
  NextActionId++;
  Actions[id]=this;

  icon = "/OpenForum/Images/icons/png/" + icon + ".png";

  self.call = function(node) {
    fn(node);
  };
  self.render = function(target)
  {
    data="&nbsp;<a href='#' onClick='Actions[\""+id+"\"].call("+target+");return false;'>"+
      "<i style='background: url(\""+icon+"\") no-repeat scroll; min-width: 16px; min-height: 16px;	display: inline-block;' title='"+toolTip+"'></i></a>";
    return data;
  };
}

function TreeNode(name,attributes,newParent,jsonModifier) {
  var self = this;
  var id = "TreeNode"+NextTreeNodeIndex;
  NextTreeNodeIndex++;
  TreeNodes[id] = self;
  var children = [];
  var expanded = false;
  var SPACE = "&nbsp;&nbsp;&nbsp;&nbsp;";
  var localDepth = 0;
  var lazyLoad = null;
  var parent = newParent;

  var paint = function() {
    document.getElementById(id).innerHTML = self.render(localDepth);
  };
  self.paint = paint;

  self.getId = function() {
    return id;
  };

  self.setLazyLoad = function(lazyLoadFn) {
    lazyLoad = lazyLoadFn;
    return this;
  };

  self.getParent = function() {
    return parent;
  };

  self.setParent = function(newParent) {
    parent =  newParent;
  };

  self.addChild = function(name,attributes) {
    var newChild = new TreeNode(name,attributes,self,jsonModifier);
    children[children.length] = newChild;
    newChild.parent = self;
    return newChild;
  };

  self.addJSON = function(node) {
    if(jsonModifier!==null) jsonModifier(node);
    var child = self.addChild( node.name,node.attributes );
    if(node.leaves) {
      for(var i in node.leaves) {
        child.addJSON( node.leaves[i] );
      }
    }
    return child;
  };

  self.importJSON = function(url,action,parameters) {
    JSON.get(url,action,parameters).onSuccess(
      function(response) {
        for(var i in response.leaves) {
          self.addJSON( response.leaves[i] );
        }
        paint();
      }
    ).go();
  };

  self.toJSON = function() {
    var json = {
      name: name,
      attributes: {},
      leaves: []
    };

    for(var a in attributes) {
      if( typeof a == "string") {
        json.attributes[a] = attributes[a];
      }
    }

    for(var c in children) {
      json.leaves.push( children[c].toJSON() );
    }

    return json;
  };

  self.deleteChild = function(node) {
    for(var index in children) {
      if(children[index].getId()===node.getId()) {
        children.splice(index,1);
        return this;
      }
    }
    return this;
  };

  self.isExpanded = function() {
    return expanded;
  };

  self.expand = function() {
    if(lazyLoad!==null) {
      lazyLoad(self);
      lazyLoad = null;
      return this;
    }
    if(parent && parent.isExpanded()===false) {
      parent.expand();
    }
    expanded=true;
    paint();
    return this;
  };
  self.collapse = function() {
    expanded=false;
    paint();
    return this;
  };
  self.toggle = function() {
    expanded=!expand;
    paint();
    return this;
  };

  self.render = function(depth) {
    if(!depth) {
      depth=0;
    }
    localDepth = depth;
    var data = "";
    data+="<span id='"+id+"' style='white-space: nowrap;'>";
    for(var count=0;count<depth;count++) {
      data+=SPACE;
    }
    if(children.length>0) {
      if(expanded===false) {
        data+="<a href='#' onClick='TreeNodes[\""+id+"\"].expand();return false;'>"+
          "<i  style='background: url(\"/OpenForum/Images/icons/png/add.png\") no-repeat scroll; min-width: 16px; min-height: 16px;	display: inline-block;'></i></a>";
      } else {
        data+="<a href='#' onClick='TreeNodes[\""+id+"\"].collapse();return false;'>"+
          "<i  style='background: url(\"/OpenForum/Images/icons/png/accept.png\") no-repeat scroll; min-width: 16px; min-height: 16px;	display: inline-block;'></i></a>";
      }
    } else {
      data+="&nbsp;";
    }
    if(attributes && attributes.link) {

      if(attributes.toolTip) {
        data += "<a href=\"" + attributes.link + "\" title=\""+ attributes.toolTip +"\" target=\"_pageView\">";
      } else {
        data += "<a href=\"" + attributes.link + "\" target=\"_pageView\">";
      }

      if(attributes.icon) {
        data += "<i style='background: url(\"/OpenForum/Images/icons/png/"+attributes.icon+".png\") no-repeat scroll; min-width: 16px; min-height: 16px;	display: inline-block;'></i>";
      }
      data += name;
      data += "</a>";
    } else {
      if(attributes && attributes.icon) {
        data += "<i style='background: url(\"/OpenForum/Images/icons/png/"+attributes.icon+".png\") no-repeat scroll; min-width: 16px; min-height: 16px;	display: inline-block;'></i>";
      }
      data += name;
    }
    if(attributes && attributes.actions) {
      for(var actionIndex in attributes.actions) {
        var actionConfig = attributes.actions[actionIndex];
        var action = new Action(actionConfig);
        data+=action.render("TreeNodes[\""+id+"\"]");
      }
    }
    data+="<br/>";
    if(expanded===true) {
      for(var childIndex in children) {
        data+=children[childIndex].render(depth+1);
      }
    }
    data+="</span>";
    return data;
  };
  self.getName = function() {
    return name;
  };
  self.setName = function(newName) {
    name = newName;
  };
  self.getAttribute = function(name) {
    return attributes[name];
  };
  self.setAttribute = function(name,value) {
    attributes[name] = value;
  };
  self.applyToChildren = function( fn ) {
    children.forEach( function(child) { fn(child); } );
  };
  self.getChildren = function() {
    return children;
  };
}

OpenForum.createFileTree = function(id,root,fileExtension,modifier) {
  var tree = new Tree(id,"Loading...","",modifier);

  if( isUndefined(fileExtension) ) {
    JSON.get("/OpenForum/Javascript/Tree","getPageTree","pageName="+root).onSuccess(
      function(result) {
        tree.setJSON(result);
        tree.render();
        tree.getRoot().expand();
        tree.init();
      }
    ).go();
  } else {
    JSON.get("/OpenForum/Javascript/Tree","getPageTree","pageName="+root+"&match=.*\."+fileExtension).onSuccess(
      function(result) {
        tree.setJSON(result);
        tree.render();
        tree.getRoot().expand();
        tree.init();
      }
    ).go();
  }

  return tree;
};
/* End of: /OpenForum/Javascript/Core/open-forum-tree.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Javascript/Core/open-forum-js-extensions.js*/
//==============================================================================================================//
//Global extra methods

function typeOf( thing ) {
  return Object.prototype.toString.call( thing ).slice(8, -1).toLowerCase();
}

function isArray( thing ) {
  return typeOf( thing ) == "array";
}

function isObject( thing ) {
  return typeOf( thing ) == "object";
}

function isFunction( thing ) {
  return typeOf( thing ) == "function";
}

function isUndefined( thing ) {
  return typeOf( thing ) == "undefined";
}

function isString( thing ) {
  return typeOf( thing ) == "string";
}

function isNumber( thing ) {
  return typeOf( thing ) == "number";
}

function isFloat( thing ) {
    return thing === +thing && thing !== (thing|0);
}

function isInteger( thing ) {
    return thing === +thing && thing === (thing|0);
}

function isNullOrBlank( thing ) { 
  return (
  		isUndefined(thing) ||
    	thing == null ||
    	( isString( thing ) && thing.trim().length == 0)
    );
}

//---- Math extra methods ----

Math.degToRad = function( deg ) {
  return (deg * Math.PI)/180;
};

Math.radToDeg = function( rad ) {
  return (rad * 180)/Math.PI;
};

//---- String extra methods ----
String.prototype.contains = function(start) {
  return (this.indexOf(start)!==-1);
};

String.prototype.startsWith = function(start) {
  return (this.indexOf(start)===0);
};

String.prototype.endsWith = function(end) {
  if(!this.contains(end)) return false;
  return (this.lastIndexOf(end)===this.length-end.length);
};

String.prototype.between = function(start,end) {
  if(!this.contains(start) || !this.contains(end)) return;
  return this.substring(this.indexOf(start)+start.length,this.indexOf(end));
};

String.prototype.before = function (end) {
  if(!this.contains(end)) return;
  return this.substring(0,this.indexOf(end));
};

String.prototype.beforeLast = function (end) {
  if(!this.contains(end)) return;
  return this.substring(0,this.lastIndexOf(end));
};

String.prototype.after = function (start) {
  if(!this.contains(start)) return;
  return this.substring(this.indexOf(start)+start.length);
};

String.prototype.afterLast = function (start) {
  if(!this.contains(start)) return;
  return this.substring(this.lastIndexOf(start)+start.length);
};

String.prototype.replaceAll = function(find,replace) {
  return this.replace( new RegExp(find,"g"), replace);
};

String.prototype.padBefore = function(padding,targetLength) {
  var result = this;
  while(result.length<targetLength) {
    result = padding+result;
  }
  return result;
};

String.prototype.padAfter = function(padding) {
  var result = this;
  while(result.length<targetLength) {
    result = result+padding;
  }
  return result;
};

//---- Date extra methods
Date.prototype.getDisplayString = function() {
  return (""+this).substring(0,24);
};

Date.prototype.SECOND_IN_MILLIS = 1000;
Date.prototype.MINUTE_IN_MILLIS = Date.prototype.SECOND_IN_MILLIS*60;
Date.prototype.HOUR_IN_MILLIS = Date.prototype.MINUTE_IN_MILLIS*60;
Date.prototype.DAY_IN_MILLIS = Date.prototype.HOUR_IN_MILLIS*24;

Date.prototype.clone = function() {
  return new Date( this.getTime() );
};

Date.prototype.toISODateString = function() {
  return this.toISOString().substring(0,10);
};

Date.prototype.plusSeconds = function(seconds) {
  this.setTime( this.getTime()+(this.SECOND_IN_MILLIS*seconds) );
  return this;
};
Date.prototype.plusMinutes = function(minutes) {
  this.setTime( this.getTime()+(this.HOUR_IN_MILLIS*minutes) );
  return this;
};
Date.prototype.plusHours = function(hours) {
  this.setTime( this.getTime()+(this.HOUR_IN_MILLIS*hours) );
  return this;
};
Date.prototype.plusDays = function(days) {
  this.setTime( this.getTime()+(this.DAY_IN_MILLIS*days) );
  return this;
};

Date.prototype.plusMonths = function(months) {
  this.setMonth( this.getMonth()+months );
  return this;
};

Date.prototype.plusYears = function(years) {
  this.setYear( this.getYears()+years );
  return this;
};

Date.prototype.isOnOrAfter = function(date) {
  return (Math.floor(this.getTime()/this.DAY_IN_MILLIS)>=Math.floor(date.getTime()/this.DAY_IN_MILLIS));
};

Date.prototype.isAfter = function(date) {
  return (this.getTime()>date.getTime());
};

Date.prototype.isBefore = function(date) {
  return (this.getTime()<date.getTime());
};

Date.prototype.isOnOrBefore = function(date) {
  return (Math.floor(this.getTime()/this.DAY_IN_MILLIS)<=Math.floor(date.getTime()/this.DAY_IN_MILLIS));
};

//---- New type, time
var Time = function(hours,minutes,seconds) {
  var self = this;

  if(!hours) hours = 0;

  var parts = hours.split(":");
  if(parts.length>1) {
    hours = parts[0];
  }
  if(parts[1]) {
    minutes = parts[1];
  }
  if(parts[2]) {
    seconds = parts[1];
  }
  if(!minutes) minutes = 0;
  if(!seconds) seconds = 0;

  hours = parseInt(hours);
  minutes = parseInt(minutes);
  seconds = parseInt(seconds);

  self.getTime = function() {
    return ((hours * 3600) + (minutes * 60) + seconds)*1000;
  };

  self.plusSeconds = function( newSeconds ) {
    seconds += parseInt(newSeconds);

    minutes += Math.floor(seconds/60);
    seconds = seconds % 60;

    hours += Math.floor(minutes/60);
    minutes = minutes % 60;
  };

  self.getHours = function() { return hours; };
  self.getMinutes = function() { return minutes; };
  self.getSeconds = function() { return seconds; };

  self.setHours = function(newHours) { hours=newHours; };
  self.setMinutes = function(newMinutes) { minutes=newMinutes; };
  self.setSeconds = function(newSeconds) { seconds=newSeconds; };

  self.plusMinutes = function( newMinutes ) {
    minutes += parseInt(newMinutes);

    hours += Math.floor(minutes/60);
    minutes = minutes % 60;
  };

  self.plusHours = function( newHours ) {
    hours += parseInt(newHours);
  };

  self.isAtOrAfter = function(time) {
    if( self.getTime() >= time.getTime() ) 
      return true;
    else 
      return false;
  };

  self.isAfter = function(time) {
    if( self.getTime() > time.getTime() ) 
      return true;
    else 
      return false;
  };

  self.isAtOrBefore = function(time) {
    if( self.getTime() <= time.getTime() ) 
      return true;
    else 
      return false;
  };

  self.isBefore = function(time) {
    if( self.getTime() < time.getTime() ) 
      return true;
    else 
      return false;
  };

  self.toString = function() {
    return ("" + hours).padBefore("0",2) + ":" + ("" + minutes).padBefore("0",2) + ":" + ("" + seconds).padBefore("0",2);
  };

  self.toShortString = function() {
    return ("" + hours).padBefore("0",2) + ":" + ("" + minutes).padBefore("0",2);
  };
};

//---- Async processing helper
function Process() {
  var callFn;
  var waitTest;
  var thenFn;

  var self = this;

  self.call = function(newCallFn) {
    callFn = newCallFn;
    return self;
  };

  self.waitFor = function(newWaitTest) {
    waitTest = newWaitTest;
    return self;
  };

  self.then = function(newThenFn) {
    thenFn = newThenFn;
    return self;
  };

  var wait = function() {
    if(waitTest()===false) {
      setTimeout(wait,100);
    } else {
      if(thenFn) thenFn();
    }
  };

  self.run = function(data) {
    if(callFn) callFn(data);
    wait();
  };
}
/* End of: /OpenForum/Javascript/Core/open-forum-js-extensions.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Javascript/Core/open-forum-object.js*/
//==============================================================================================================//
//---- OpenForumObject ----

function OpenForumObject(objectId) {
  var self = this;
  var id = objectId;
  var value = null;
  var targets=[];
  var listeners=[];
  var quiet = false;

  OpenForum.debug("INFO","Object " + id + " created");

  var notifyListeners = function() {
    if(quiet) {
      OpenForum.debug("INFO","Object " + id + " has changed but is quiet");
      return;
    }
    for(var listenerIndex in listeners) {
      var listener = listeners[listenerIndex];
      listener( self );

      if(listener.getId) {
        OpenForum.debug("INFO","Object " + id + " has notified " + listener.getId() + "of change");
      }
    }
  };

  self.getId = function() {
    return id;
  };

  self.add = function(target) {
    targets.push(target);
    if(value != null) { // If you want to join, you have to take on the value
      var hold = value;
      value = null; // Force the value to be set in all targets as will be seen as a change
      self.setValueQuietly(hold); // Not a real change of value, so quietly does it
    }


    if(target.getId) {
      OpenForum.debug("INFO","Object " + id + " has added new target " + target.getId());
    } else {
      OpenForum.debug("INFO","Object " + id + " has added new target " + target);
    }
  };

  self.reset = function() {
    value = null;
  };

  self.setValueQuietly = function (newValue,exclude,clone) {
    quiet = true;
    self.setValue(newValue,exclude,clone);
    quiet = false;
  };

  self.setValue = function(newValue,exclude,clone) {
    if(OpenForum.isEqual(newValue,value)) {
      return;
    }

    OpenForum.debug("INFO","Object " + id + " value set to " + newValue);

    if(clone && typeof newValue == "object") {
      value = OpenForum.clone(newValue);
    } else {
      value = newValue;
    }
    for(var targetIndex in targets) {
      var target = targets[targetIndex];
      if(target===null) {
        continue;
      }
      if(exclude && exclude===target) {
        continue;
      }
      if(typeof(target.type)!="undefined" && target.type=="checkbox") {
        target.checked = value;
      } else if(typeof(target.type)!="undefined" && target.type=="select-multiple") {
        for(var i in target.options) {
          target.options[i].selected=false;
          for(var j in value) {
            if(target.options[i].value==value[j]) {
              target.options[i].selected=true;
            }
          }
        }
        OpenForum.setGlobal(id,value);
      } else if(typeof(target.value)!="undefined") {
        target.value = value;
      } else if(target.innerHTML) {
        if(value==="") {
          target.innerHTML = " "; 
        } else {
          target.innerHTML = ""+value;
        }
      }
    }
  };

  self.getValue = function() {
    return value;
  };

  self.scan = function() {
    for(var targetIndex=0; targetIndex<targets.length; targetIndex++) {
      try {
        var target = targets[targetIndex];
        if(target===null) {
          continue;
        }

        if(typeof(target.type)!="undefined" && target.type=="checkbox") {

          if(target.checked!==value) {
            //If UI has been checked
            self.setValue(target.checked,target,true);
            OpenForum.setGlobal(id,target.checked);
            OpenForum.debug("INFO","Object (checkbox) " + id + " value set to " + value);
            notifyListeners();
            return;
          }
        } else if(target.type=="select-multiple") {
          var selected = [];
          for(var i in target.options) {
            if(target.options[i].selected) selected.push(target.options[i].value);
          }
          //If UI selection changes
          if(OpenForum.isEqual(value,selected)==false) {
            self.setValue(selected,target,true);

            OpenForum.setGlobal(id,selected);
            OpenForum.debug("INFO","Object (select-multiple) " + id + " value set to " + selected);
            notifyListeners();
            return;
          }
        } else if(typeof(target.value)!="undefined") {
          //If UI value changes
          if(target.value!=value) {
            self.setValue(target.value,target,true);
            OpenForum.setGlobal(id,value);
            OpenForum.debug("INFO","Object " + id + " value set to " + value);
            notifyListeners();
            return;
          }
        }
      } catch(e) {
        OpenForum.debug("ERROR","Object " + id + " error in setting value (case 1).", e);
      }
    }
    try{
      var testId = id;
      if( OpenForum.globalExists(testId) ) {
        //If bound js variable changes
        if( OpenForum.isEqual(value,OpenForum.getGlobal(testId))===false) {
          self.setValue(OpenForum.getGlobal(testId),null,true);
          notifyListeners();
        }
      } else {
        OpenForum.setGlobal(testId,value,true);
        OpenForum.debug("INFO","Global object created " + testId + " and value set to " + value);
      }
    } catch(e) {
      OpenForum.debug("ERROR","Object " + id + " error in setting value (case 2).", e);
    }

  };

  self.addListener = function(listener) {
    listeners.push(listener);
    if(listener.getId) {
      OpenForum.debug("INFO","Object " + id + " has added new listener " + listener.getId());
    } else {
      OpenForum.debug("INFO","Object " + id + " has added new listener " + listener);
    }
  };

  self.removeListener = function(listener) {
    for(var listenerIndex in listeners) {
      if(listeners[listenerIndex].getId && listener.getId && listeners[listenerIndex].getId() == listener.getId() ) {
        listeners.splice(listenerIndex,1);
        break;
      } else if (listeners[listenerIndex] == listener) {
        listeners.splice(listenerIndex,1);
        break;
      } 
    }
    if(listener.getId) {
      OpenForum.debug("INFO","Object " + id + " has added removed a listener " + listener.getId());
    } else {
      OpenForum.debug("INFO","Object " + id + " has added removed a listener " + listener);
    }
  };

  self.getId = function() {
    return id;
  };

  self.getTargets = function() {
    return targets;
  };
}

/* End of: /OpenForum/Javascript/Core/open-forum-object.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Javascript/Core/open-forum-table.js*/
//==============================================================================================================//
//---- OpenForumTable ----

function OpenForumTable(node) {
  var self = this;
  var rowNode = node;
  var tableNode = node.parentNode;
  var value;
  var id;

  if(tableNode.attributes && tableNode.attributes['of-id']) {
    id=tableNode.attributes['of-id'].value;
    /*if( this.tableNode.value ) {
      this.tableNode.value = eval(this.tableNode.id);
      eval(this.tableNode.id+"=\""+this.value+"\";")
    }*/
  } else if(tableNode.id) {
    id=tableNode.id;
  } else {
    id="OFTable"+OpenForum.getNextId();
  } 

  node.parentNode.removeChild(node);

  var temp = document.createElement("table");
  temp.appendChild(node);

  var rowHTML = temp.innerHTML;
  var repeatFor = node.attributes['of-repeatFor'].value;
  var target = repeatFor.substring(repeatFor.indexOf(" in ")+4);
  var element = repeatFor.substring(0,repeatFor.indexOf(" in "));
  var targetObject = OpenForum.getObject(target);
  var targetObjectSignature = OpenForum.createObjectSignature( targetObject.getValue() );

  if(id.indexOf("OFTable")===0) id += "_" + repeatFor.replaceAll(" ","_");

  OpenForum.debug("INFO","Added OpenForum table " + repeatFor + " as " + id);

  var tableTop = tableNode.innerHTML;
  tableNode.id = id;

  self.setTableNode = function(newTableNode) {
    tableNode = newTableNode;
  };

  self.reset = function() {
    targetObjectSignature = null;
    value = null;
  };

  self.updateQuietly = function() {
    targetObjectSignature = OpenForum.createObjectSignature( targetObject.getValue() );
  };
  
  self.refresh = function() {

    try {
      if(tableNode.attributes && tableNode.attributes['of-id'] && typeof tableNode.value != "undefined" ) {
        //Not sure what the empty string was there for, but it stops select working
        //if( this.tableNode.value!=this.value && this.value!="") {
        if( tableNode.value!=value) {
          value = tableNode.value;
          OpenForum.setGlobal(tableNode.id,value);

          OpenForum.debug("INFO","Table " + id + " value changed to " + value);
        } else {
          var newValue = OpenForum.getGlobal(tableNode.id);
          if( typeof tableNode.value !== "undefined" && tableNode.value!=newValue && typeof newValue !== "undefined" && newValue !== null ) {
            tableNode.value=newValue;
            value = newValue;
            if(tableNode.value === newValue) {
              OpenForum.debug("INFO","Table " + id + " value changed to " + value);
            }
          }
        }
      }
    } catch(e) {
      OpenForum.debug("ERROR","Table " + id + " set value failed.", e);
    }

    //check if changed
    var objectSignature = OpenForum.createObjectSignature( targetObject.getValue() );
    if(objectSignature==targetObjectSignature) {
      return;
    }

    var errors = false;
    var tableData = tableTop;
    var collection = targetObject.getValue();
    for( var elementIndex in collection ) {
      try {
        var item = {};
        item[element]= collection[elementIndex];
        item[element].index = elementIndex;

        var data = ""+rowHTML;
        while(data.indexOf(OpenForum.FIELD_DELIMETER_START)!=-1) {
          var name = data.substring(data.indexOf(OpenForum.FIELD_DELIMETER_START)+2,data.indexOf(OpenForum.FIELD_DELIMETER_END));
          var rowValue;
          if(name.indexOf(".")===-1) {
            if(name==element) {
              rowValue = item[element];
            } else {
              rowValue = OpenForum.getGlobal(name);
            }
          } else {
            var parts = name.split(".");
            rowValue = item;
            for(var part in parts) {
              if(parts[part].indexOf("(")!==-1) {
                var fn = parts[part].substring(0,parts[part].indexOf("("));
                var call = parts[part].substring(parts[part].indexOf("("),parts[part].indexOf(")")).split(",");
                rowValue = rowValue[fn].apply( this,call );
              } else if(parts[part].indexOf("=")!==-1) {
                var pName = parts[part].substring(0,parts[part].indexOf("="));
                var value = parts[part].substring(parts[part].indexOf("=")+1).split("?");
                if( rowValue[pName] == value[0] ) {
                  rowValue = value[1];
                } else {
                  rowValue = "";
                }
              }else {
                rowValue = rowValue[parts[part]];
              }
            }
          }

          var dataStart = data.substring(0,data.indexOf(OpenForum.FIELD_DELIMETER_START));
          var dataEnd = data.substring(data.indexOf(OpenForum.FIELD_DELIMETER_END)+2);
          
          if(dataStart.indexOf("of-if=\"")==dataStart.length-7) {
            data = dataStart.substring(0,dataStart.indexOf("of-if=\""))+
              rowValue+
            dataEnd.substring(1);
          } else {
          	data = dataStart + rowValue + dataEnd;
          }

          if( tableNode.type=="select-one") {
            if(OpenForum.getGlobal(id) === rowValue ) {
              data = data.replace("selected=\"\"","selected");

              OpenForum.debug("INFO","Table " + id + " selected  = " + rowValue);
            } else {
              data = data.replace("selected=\"\"","");
            }
          }
        }
        tableData += data;
  
      } catch(e) {
        OpenForum.debug("ERROR","Table " + id + " refresh failed.", e);
        //Fail quietly
        errors = true;
      }
    }
    OpenForum.debug("INFO","Table " + id + " updated.");  
    tableNode.innerHTML=tableData;
    OpenForum.preparePage(tableNode);
    //Only update the signature once the data is in the view without errors
    if(errors==false) {
    	targetObjectSignature=objectSignature;
    }
  };

  self.getId = function() {
    return id;
  };
}
/* End of: /OpenForum/Javascript/Core/open-forum-table.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Javascript/Core/open-forum-browser.js*/
//==============================================================================================================//
if(!OpenForum) {
  OpenForum = {};
}

OpenForum.Browser={};

OpenForum.Browser.download = function(fileName,data){
  var hiddenElement = document.createElement('a');
  hiddenElement.href = 'data:attachment/text,' + encodeURIComponent(data);
  hiddenElement.target = '_blank';
  hiddenElement.style.display = "none";
  hiddenElement.download = fileName;
  document.body.appendChild(hiddenElement);
  hiddenElement.click();
};

OpenForum.Browser.upload = function(callback,onError) {
  var hiddenElement = document.createElement('input');
  hiddenElement.type = "file";
  hiddenElement.style.display = "none";
  hiddenElement.onchange = function(event) {
    var reader = new FileReader();

    reader.onload = function(event) {
      if(event.target.readyState != 2) return;
      if(event.target.error) {
        if(onError) {
          onError('Error while reading file');
        } else {
          alert('Error while reading file');
        }
        return;
      }
      callback( event.target.result );
    };
    reader.readAsText(event.target.files[0]);
  };
  document.body.appendChild(hiddenElement);
  hiddenElement.click();
};

OpenForum.Browser.uploadDataUrl = function(callback,onError) {
  var hiddenElement = document.createElement('input');
  hiddenElement.type = "file";
  hiddenElement.style.display = "none";
  hiddenElement.onchange = function(event) {
    var reader = new FileReader();

    reader.onload = function(event) {
      if(event.target.readyState != 2) return;
      if(event.target.error) {
        if(onError) {
          onError('Error while reading file');
        } else {
          alert('Error while reading file');
        }
        return;
      }
      callback( event.target.result );
    };
    reader.readAsDataURL(event.target.files[0]);
  };
  document.body.appendChild(hiddenElement);
  hiddenElement.click();
};

OpenForum.Browser.overrideSave = function(fn) {
  $(document).bind('keydown', function(e) {
    if(e.ctrlKey && (e.which == 83)) {
      e.preventDefault();
      fn();
      return false;
    }
  });
};

OpenForum.Browser.isBrowserStorageEnabled = function() {
  return ( typeof OpenForum.findBrowserFileTreeNode != "undefined" );
};

OpenForum.Browser.enableBrowserStorage = function() {
  if( OpenForum.Browser.isBrowserStorageEnabled() ) {
    console.log("Browser Storage already enabled");
    return;
  }

  OpenForum.findBrowserFileTreeNode = function( pageName ) {
    pageName = pageName.replace("browser:/","");

    var list = OpenForum.Storage.find("browserFS "+pageName+"*.");
    var data = [];

    var found = {};

    for(var a in list) {
      var fileName = list[a].key.substring( pageName.length + 10);

      if(fileName.startsWith("/")) fileName = fileName.substring(1);

      if(fileName.indexOf("/")!=-1) {
        var page = fileName.substring(0,fileName.indexOf("/"));
        if( page.length==0 ) continue;
        if( typeof found[page] == "undefined" ) {
          data.push( {fileName: page, type: "page"} );
          found[page] = true;
        }
      } else {
        if( fileName.length==0 ) continue;

        if( typeof found[fileName] == "undefined" ) {
          var extension = fileName.substring( fileName.indexOf(".")+1 );
          data.push( {fileName: fileName, type: "file", extension: ""} );
          found[fileName] = true;
        }
      }
    }

    return data;
  };

  OpenForum.remoteSave = OpenForum.saveFile;
  OpenForum.saveFile = function(fileName,data,callBack) {
    if(fileName.startsWith("browser://")) {
      fileName = fileName.replace("browser:/","browserFS ");

      OpenForum.Storage.set(fileName,data);
      if( isUndefined(OpenForum.inq) == false ) OpenForum.inq.send( { type: "browserFS", event: "fileChanged", fileName: fileName } );

      var simpleFileName = fileName.substring( fileName.lastIndexOf("/")+1 );
      var extension = simpleFileName.substring( simpleFileName.lastIndexOf(".")+1 );

      OpenForum.findBrowserFileTreeNode( fileName, { type: "file", size: data.length, created: new Date().getTime(), updated: new Date().getTime(), fileName: simpleFileName, extension: extension } );

      var response = {"result":"ok","message":"Saved " + fileName,"saved":true};
      if(callBack) {
        callBack( response );
      } else {
        return response;
      }
    } else {
      return OpenForum.remoteSave(fileName,data,callBack);
    }
  };

  OpenForum.remoteDelete = OpenForum.deleteFile;
  OpenForum.deleteFile = function(pageName,fileName,callBack) {
    if(fileName.startsWith("browser://")) {
      fileName = fileName.replace("browser:/","browserFS ");

      OpenForum.findBrowserFileTreeNode( fileName, { deleted: true } );

      if( isUndefined(OpenForum.inq) == false ) OpenForum.inq.send( { type: "browserFS", event: "fileDeleted", fileName: fileName } );

      var response = {"result":"ok","message":"Deleted " + fileName,"deleted":true};
      if(callBack) {
        callBack( response );
      } else {
        return response;
      }
    } else {
      return OpenForum.remoteDelete(pageName,fileName,callBack);
    }
  };

  OpenForum.remoteLoad = OpenForum.loadFile;
  OpenForum.loadFile = function(fileName,callBack,noCache) {
    if(fileName.startsWith("browser://")) {
      fileName = fileName.replace("browser:/","browserFS ");

      var data = OpenForum.Storage.get(fileName);

      if(callBack) {
        callBack( data );
      }

      return data;
    } else {
      return OpenForum.remoteLoad(fileName,callBack,noCache);
    }
  };

  OpenForum.remoteAppend = OpenForum.appendFile;
  OpenForum.appendFile = function(fileName,data,callBack) {
    if(fileName.startsWith("browser://")) {
      fileName = fileName.replace("browser:/","browserFS ");

      var currentData = OpenForum.Storage.get(fileName);

      if( currentData == null ) {
        return OpenForum.saveFile(fileName,data,callBack);
      }

      data = currentData + data;
      OpenForum.Storage.set(fileName,data);
      if( isUndefined(OpenForum.inq) == false ) OpenForum.inq.send( { type: "browserFS", event: "fileChanged", fileName: fileName } );

      OpenForum.findBrowserFileTreeNode( fileName, { modified: new Date().getTime(), size: data.length } );

      var response = {"result":"ok","message":"Appended " + fileName,"appended":true};
      if(callBack) {
        callBack( response );
      } else {
        return response;
      }
    } else {
      return OpenForum.remoteAppend(fileName,data,callBack);
    }
  };

  OpenForum.remoteCopy = OpenForum.copyFile;
  OpenForum.copyFile = function(fileName,toFileName,callBack) {
    if(fileName.startsWith("browser://")) {
      fileName = fileName.replace("browser:/","browserFS ");

      var data = OpenForum.Storage.get(fileName);
      OpenForum.saveFile(toFileName,data);

      var response = {"result":"ok","message":"Copied " + fileName,"copied":true};
      if(callBack) {
        callBack( response );
      } else {
        return response;
      }
    } else {
      return OpenForum.remoteCopy(fileName,toFileName,callBack);
    }
  };

  OpenForum.remoteMove = OpenForum.moveFile;
  OpenForum.moveFile = function(fileName,toFileName,callBack) {
    if(fileName.startsWith("browser://")) {
      fileName = fileName.replace("browser:/","browserFS ");

      var data = OpenForum.Storage.get(fileName);
      OpenForum.saveFile(toFileName,data);
      OpenForum.deleteFile(fileName);

      var response = {"result":"ok","message":"Moved " + fileName,"moved":true};
      if(callBack) {
        callBack( response );
      } else {
        return response;
      }
    } else {
      return OpenForum.remoteMove(fileName,toFileName,callBack);
    }
  };

  OpenForum.remoteFileExists = OpenForum.fileExists;
  OpenForum.fileExists = function(fileName) {
    if(fileName.startsWith("browser://")) {
      fileName = fileName.replace("browser:/","browserFS ");

      return OpenForum.Storage.get(fileName) != null;

    } else {
      return OpenForum.remoteFileExists(fileName);
    }
  };

  OpenForum.remoteGetAttachments = OpenForum.getAttachments;
  OpenForum.getAttachments = function(pageName,callBack,matching,withMetaData) {
    if(pageName.startsWith("browser://")) {
      pageName = pageName.replace("browser:/","browserFS ");

      var list = OpenForum.Storage.find(pageName+"*.");
      var json = {
        attachments: [],
        length: 0,
        pageName: pageName
      };
      if(withMetaData) {
        json.size = 0;
      }

      for(var a in list) {
        var fileName = list[a].key.substring( pageName.length+1 );
        if(fileName.indexOf("/")!=-1) continue;

        var attachment = {
          pageName: pageName,
          fileName: fileName
        };

        if(withMetaData) {
          attachment.size = list[a].value.length;
          attachment.lastModified = 0;

          json.size += attachment.size;
        }

        json.length ++;

        json.attachments.push( attachment );
      }

      if(callBack) {
        callBack( json.attachments);
      } else {
        return json.attachments;
      }
    } else {
      return OpenForum.remoteGetAttachments(pageName,callBack,matching,withMetaData);
    }
  };

  OpenForum.remoteGetSubPages = OpenForum.getSubPages;
  OpenForum.getSubPages = function(pageName, callBack) {
    if(pageName.startsWith("browser://")) {
      pageName = pageName.replace("browser:/","browserFS ");

      var list = OpenForum.Storage.find(pageName+"*.");
      var json = [];
      var found = {};

      for(var a in list) {
        var fileName = list[a].key.substring( pageName.length );
        if(fileName.indexOf("/")!=-1) {
          dataPageName = fileName.substring( 0, fileName.indexOf("/") );
          if(typeof found[dataPageName] == "undefined") {
            json.push(dataPageName);
            found[dataPageName] = true;
          }
        }
      }

      if(callBack) {
        callBack( json );
      } else {
        return json;
      }
    } else {
      return OpenForum.remoteGetSubPages(pageName,callBack);
    }
  };

  OpenForum.remoteCreateFileTree = OpenForum.createFileTree;
  OpenForum.createFileTree = function(id,root,fileExtension,modifier) {
    if(root.startsWith("browser://")) {

      var tree = new Tree(id,"Loading...","",modifier);

      var fsJson = OpenForum.findBrowserFileTreeNode( root.replace("browser:/","") );
      //Copy
      //https://open-forum.onestonesoup.org/OpenForum/Javascript/Tree?action=getPageTree&pageName=/TheLab/Experiments/BrowserFileStorage

      var toFileTree = function( depth, name, json, path ) {
        if( isUndefined( path ) ) {
          path = "";
        }
        var newNode = {};
        newNode.name = name;
        newNode.attributes = {
          type: "page",
          pageName: path,
          link: path,
          icon: "book",
          toolTip: "Open page"
        };
        newNode.leaves = [];

        for(var i in json) {
          var node = json[i];

          if(node.type && node.type == "file") {
            if( ( typeof fileExtension != "undefined" ) && node.extension.match( ".*\." + fileExtension ) ) {
              continue;
            }
            var jsonNode = {};
            jsonNode.name = node.fileName;
            jsonNode.leaves = [];
            jsonNode.attributes = {
              type: "file",
              pageName: path,
              fileName: node.fileName,
              link: path + "/" +node.fileName,
              icon: "attach",
              actions: [
                {
                  fn: "function(node){ window.open('/OpenForum/Editor?pageName=' + node.getAttribute('pageName') + '&fileName=' + node.getAttribute('fileName')); }",
                  icon: "pencil",
                  toolTip: "Edit file"
                }
              ]
            };

            newNode.leaves.push( jsonNode );
          } else if(node.type && node.type == "page") {
            var fullPage = path;
            if( fullPage.endsWith("/") == false ) fullPage += "/";
            fullPage += node.fileName;

            var jsonNode = {};
            jsonNode.name = node.fileName;
            jsonNode.leaves = [];
            jsonNode.attributes = {
              type: "page",
              pageName: node.fileName,
              link: fullPage,
              icon: "page",
              toolTip: "Open page",
              depth: depth
            };

            var fsJson = OpenForum.findBrowserFileTreeNode( fullPage );
            newNode.leaves.push( toFileTree( depth+1, node.fileName, fsJson, fullPage ) );
          }
        }
        return newNode;
      };

      var jsonTree = toFileTree( 0,root.substring( root.lastIndexOf("/")+1 ) ,fsJson, root );

      tree.setJSON(jsonTree);
      tree.render();
      tree.getRoot().expand();
      tree.init();

      return tree;

    } else {
      return OpenForum.remoteCreateFileTree(id,root,fileExtension,modifier);
    }
  };  
};

OpenForum.addInitialiser( function() {
  //browserFS enabled by default. Add ?browserFS=false to stop
  if( OpenForum.getParameter("browserFS")=="false" == false ) {
    OpenForum.Browser.enableBrowserStorage();
  }
});

/* End of: /OpenForum/Javascript/Core/open-forum-browser.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Javascript/Core/open-forum-action.js*/
//==============================================================================================================//
OpenForum.action = {};
OpenForum.action.copyPage = function(pageName,newPageName) {
  window.open("/OpenForum/Actions/Copy?newPageName="+newPageName+"&pageName="+pageName);
};

OpenForum.action.movePage = function(pageName,newPageName) {
  window.location = "/OpenForum/Actions/Move?newPageName="+newPageName+"&pageName="+pageName;
};

OpenForum.action.zipPage = function(pageName) {
  window.location = "/OpenForum/Actions/Zip?action=zip&pageName="+pageName;
};

OpenForum.action.deletePage = function(pageName) {
  window.location = "/OpenForum/Actions/Delete?pageName="+pageName;
};

/* End of: /OpenForum/Javascript/Core/open-forum-action.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Javascript/Core/open-forum-utils.js*/
//==============================================================================================================//
if(!OpenForum) {
  OpenForum = {};
}

/*
* Author: Nik Cross
* Description: A set of functions to help with manipulating doms and js objects
*/

OpenForum.BLANK = ""; //Used in Extensions where "" cannot be used

OpenForum.createObjectSignature = function(object) {
  var cache = [];
  var signature = JSON.stringify(object, function(key, value) {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Circular reference found, discard key
        return;
      }
      // Store value in our collection
      cache.push(value);
    }
    return value;
  });
  cache = null;
  return signature;
};

OpenForum.copyElement = function(id) {
  document.getElementById(id).select();
  document.execCommand('copy');
};

OpenForum.copyData = function(data) {
  var hiddenElement = document.createElement('textarea');
  hiddenElement.value = data;
  document.body.appendChild( hiddenElement );
  hiddenElement.select();
  document.execCommand('copy');
  document.body.removeChild( hiddenElement );
};

OpenForum.setElement = function(id,content) {
  document.getElementById(id).innerHTML = content;
  OpenForum.crawl( document.getElementById(id) );
};

OpenForum.appendToElement = function(id,content) {
  
    var element = content;
    if( typeof content != "object" ) {
    	element = document.createElement( "span" );
    	element.innerHTML = content;
    }
    
    document.getElementById( id ).appendChild( element );
  
  OpenForum.crawl( document.getElementById(id) );
};

OpenForum.showElement = function(id, show) {
  
  if( typeof show != "undefined" && show == false ) {
    OpenForum.hideElement( id );
  } else {
  	document.getElementById(id).style.display = "block";
  }
};

OpenForum.hideElement = function(id) {
  document.getElementById(id).style.display = "none";
};

OpenForum.toggleElement = function(id) {
  if(document.getElementById(id).style.display==="block") {
    document.getElementById(id).style.display = "none";
  } else {
    document.getElementById(id).style.display = "block";
  }
};

OpenForum.setTitle = function(title) {
  document.title = title;
};

OpenForum.setCursor = function(pointer) {
  if(pointer == "wait") {
    document.body.style.cursor = 'wait';
    return;
  } else if(pointer == "zoom-in") {
    document.body.style.cursor = 'zoom-in';
    return;
  } else if(pointer == "pointer") {
    document.body.style.cursor = 'pointer';
    return;
  } else if(pointer == "crosshair") {
    document.body.style.cursor = 'crosshair';
    return;
  } else if(pointer == "default") {
    document.body.style.cursor = 'default';
    return;
  }
  
  if(pointer.indexOf(".")==-1) {
    pointer = "/OpenForum/Images/icons/png/" +pointer+ ".png";
  }
  
  document.getElementsByTagName("body")[0].style.cursor = "url('"+pointer+"'), auto";
};

OpenForum.setTabIcon = function(icon) {
  if(icon.indexOf(".")==-1) {
    icon = "/OpenForum/Images/icons/png/" +icon+ ".png";
  }
  
  var link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = icon;
};

OpenForum.getParameter = function( name ) {
  name = name.replace(/[\[]/g,"\\\[").replace(/[\]]/g,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results === null )
    return "";
  else
    return results[1];
};

OpenForum.getCookie = function(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++)
  {
    var c = ca[i];
    while (c.charAt(0)==' ')
    {
      c = c.substring(1,c.length);
    }
    if (c.indexOf(nameEQ) === 0)
    {
      return c.substring(nameEQ.length,c.length);
    }
  }
  return null;
};

OpenForum.setCookie = function(name,value) {
  document.cookie = name + "=" + value;
};

OpenForum.deleteCookie = function(name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
};

//Keep all the evil in one place
OpenForum.evaluate = function(script) {
  try{
    return eval(script);
  } catch (e) {
    OpenForum.debug( "ERROR", "Exception evaluating '" + script + "'",e );
    throw e;
  }
};

OpenForum.globalExists = function( name ) {
  name = name.replace(/\[/g,".").replace(/\]/g,"").replace(/'/g,"").replace(/\(.*\)/g,"");
  var parts = name.split(".");
  var obj = window;
  for(var part in parts) {
    if( typeof obj[parts[part]] === "undefined" ) return false;
    obj = obj[parts[part]];
  }

  return true;
};

OpenForum.getGlobal = function( name ) {
  name = name.replace(/\[/g,".").replace(/\]/g,"").replace(/'/g,"").replace(/\(.*\)/g,"");
  var parts = name.split(".");
  var obj = window;
  for(var part in parts) obj = obj[parts[part]];

  if(typeof obj === "function") return obj();
  else return obj;
};

OpenForum.setGlobal = function( name,value,create ) {
  name = name.replace(/\[/g,".").replace(/\]/g,"").replace(/'/g,"");
  var parts = name.split(".");
  var obj = window;
  var i=0;
  for(i=0; i<parts.length-1; i++) {
    if( typeof obj[parts[i]] === "undefined" && create===true ) obj[parts[i]] = {};
    obj = obj[parts[i]];
  }

  obj[parts[i]] = value;
};

OpenForum.isEqual = function(a,b,depth,maxDepth) {
  if(typeof b === undefined || typeof a === undefined) return false;
  if(b === null && a === null) return true;
  if(b === null || a === null) return false;
  if(typeof a !== typeof b) return false;

  if(!depth) {
    depth=0;
  }
  if(depth>maxDepth) {
    OpenForum.debug( "Maximum depth exceeded in isEqual." );
    return true;
  }
  if(!maxDepth) {
    maxDepth = 10;
  }

  if( typeof a === "object" ) {
    if(Array.isArray(a)) {
      if(!Array.isArray(b) || a.length!==b.length) return false;
    }
    if(Array.isArray(b)) {
      if(!Array.isArray(a) || a.length!==b.length) return false;
    }
    for(var i in a) {
      if(typeof b[i] === "undefined") return false;

      if( OpenForum.isEqual(a[i],b[i],depth+1,maxDepth)===false) return false;
    }
    return true;
  } else {
    return (a===b);
  }
};

OpenForum.copyDifferencesFromTo = function(a,b,depth,minDepth,maxDepth,doDelete) {
  if(!minDepth) {
    minDepth=1;
  }
  if(!maxDepth) {
    maxDepth = 10;
  }

  if(!depth) {
    depth=1;
  }

  if(depth>maxDepth) {
    OpenForum.debug( "Maximum depth exceeded in isEqual." );
    return null;
  }

  if(doDelete == false && Array.isArray(a) && Array.isArray(b)) {
    for(var i in a) {
      b.push( a[i] );
    }
    return b;
  }

  if( typeof a === "object" ) {

    for(var i in a) {
      if( typeof a[i] == "function" ) { // Do not clone objects with functions
        return null;
      }
    }

    for(var i in a) {
      if(!b[i]) {
        //If it doesn't exist, create it
        if(typeof a[i] === "object") {
          var value;
          if(a[i]==null) value = null;
          else if(Array.isArray(a[i])) value = OpenForum.copyDifferencesFromTo(a[i],[],depth+1,minDepth,maxDepth,doDelete);
          else value = OpenForum.copyDifferencesFromTo(a[i],{},depth+1,minDepth,maxDepth,doDelete);
          if(value==null) {
            if(depth<=maxDepth) {
              b[i] = a[i];
            } else {
              return null;
            }
          } else {
            b[i] = value;
          }
        } else {
          b[i] = a[i];
        }
      } else if( OpenForum.isEqual(a[i],b[i])===false) {
        //If it exists but is not equal, copy differences
        var value = OpenForum.copyDifferencesFromTo(a[i],b[i],depth+1,minDepth,maxDepth,doDelete);
        if(value!=null) {
          if(depth<=maxDepth) {
            b[i] = value;
          } else {
            return null;
          }
        }
      }
    }

    for(var i in b) {
      if(typeof a[i] == "undefined" && typeof b[i] != "undefined" ) {
        if(doDelete) {
          delete b[i];
        } else {
          a[i] = b[i];
        }
      }
    }
  } else {
    return a;
  }
  return b;
};

OpenForum.clone = function(a) {
  var b = {};
  if(a.length) b = [];
  OpenForum.copyDifferencesFromTo(a,b);
  return b;
};

OpenForum.clean = function(a) {
  if( typeof a === "object" ) {
    for(var i in a) {
      if(typeof a[i] === "object") {
        a[i] = OpenForum.clean(a[i]);
      } else if(typeof a[i] === "number") {
        a[i] = 0;
      } else if(typeof a[i] === "boolean") {
        a[i] = true;
      } else {
        a[i] = "";
      }
    }
  }
  return a;
};

OpenForum.addFunctionPrefix = function( fn1, fn2 ) {
  var secondFn = ""+fn1;
  var firstFunction = "" + fn2;
  firstFunction = firstFunction.substring(firstFunction.indexOf("{")+1, firstFunction.lastIndexOf("}")-1 );
  secondFn = "f = " + secondFn.substring(0,secondFn.indexOf("{")+1) + " " + firstFunction + " " + secondFn.substring( secondFn.indexOf("{")+1 );
  return OpenForum.evaluate( secondFn );
};

OpenForum.addFunctionSuffix = function( fn1, fn2 ) {
  var secondFn = ""+fn2;
  var firstFunction = "" + fn1;
  firstFunction = firstFunction.substring(firstFunction.indexOf("{")+1, firstFunction.lastIndexOf("}")-1 );
  secondFn = "f = " + secondFn.substring(0,secondFn.indexOf("{")+1) + " " + firstFunction + " " + secondFn.substring( secondFn.indexOf("{")+1 );
  return OpenForum.evaluate( secondFn );
};

OpenForum.setInterval = function(fn,timePeriod,immediate,blocking,doesCallback) {
  if(blocking) {
    var blocked = false;
    if(immediate) {
      blocked = true;
      try{
        if(doesCallback) {
          fn( function() {blocked = false;} );
        } else {
          fn();
          blocked = false;
        }
      } catch (e) {
        blocked = false;
      }
    }

    return setInterval( function() {
      if(blocked) return;
      blocked = true;
      try{
        if(doesCallback) {
          fn( function() {blocked = false;} );
        } else {
          fn();
          blocked = false;
        }
      } catch (e) {
        blocked = false;
      }
    }, timePeriod );

  } else {
    if(immediate) {
      fn();
      return setInterval(fn,timePeriod);
    }
  }
};

OpenForum.waitFor = function(test,callback,pause,timeout) {
  if(!pause) pause=200;
  if(!timeout) timeout = new Date().getTime()+30000;
  else if( new Date().getTime()>timeout ) throw "Timeout waiting for " + test;

  if(test()===true) {
    callback();
  } else {
    setTimeout( 
      function(test,callback,pause,timeout){ 
        return function() { 
          OpenForum.waitFor(test,callback,pause,timeout); 
        }; 
      }(
        test,
        callback,
        pause
      ),
      pause
    );
  }
};

OpenForum.runAsync = function(fn) {
  setTimeout( function() { fn(); },1 );
};

OpenForum.queue = function(process,supplyState) {
  var test = OpenForum.queue.ready;
  if(!test) test = function() { return true; };

  OpenForum.queue.ready = function() { return (!OpenForum.processing); };
  var state = {complete: false};
  if(supplyState===true) {
    OpenForum.queue.ready = function() { 
      if(state.complete===true) delete OpenForum.processing;
      return (state.complete); 
    };
  }

  OpenForum.waitFor(
    test,
    function() {
      OpenForum.processing = process;
      process(state);
      if(!supplyState) {
        delete OpenForum.processing;
      }
    }
  );
};

OpenForum.Table = {};

OpenForum.Table.setCell = function(table,row,column,value) {
  if(typeof value != "undefined") {
    table[row][column] = value;
  } else {
    //Is simple array so value is column
    table[row] = column;
  }
};

OpenForum.Table.editRow = function(table,index) {
  for(var i in table) {
    table[i].view = "display: block;";
    table[i].edit = "display: none;";
  }
  table[index].edit = "display: block;";
  table[index].view = "display: none;";
};

OpenForum.jsonToCsv = function(json,delimiter) {
  if(!delimiter) delimiter = "\t";
  var csv = "";
  if(Array.isArray(json)) {
    for(var i in json) {
      var row = json[i];

      //add column name row
      if(csv.length===0) {
        for (var c in row) {
          if(csv.length>0) {
            csv+=delimiter;
          }
          csv += c;
        }
        csv += "\n";
      }

      //add row
      var csvRow = "";
      for (var r in row) {
        if(csvRow.length>0) {
          csvRow+=delimiter;
        }
        csvRow += row[r];
      }
      csv += csvRow +"\n";
    }
  } else if(typeof json === "object") {
    for(var name in json) {
      csv += name + delimiter + json[name] + "\n";
    }
  }
  return csv;
};

OpenForum.Table.closeTable = function(table) {
  for(var i in table) {
    table[i].view = "display: block;";
    table[i].edit = "display: none;";
  }
};

OpenForum.Table.addRow = function(table,templateRow,clean) {
  if(!templateRow) {
    templateRow = table[table.length-1];
  }
  if(!templateRow.view) {
    templateRow.view = "display: block;";
    templateRow.edit = "display: none;";
  }
  var newRow = OpenForum.clone( templateRow );
  if(clean) {
    OpenForum.clean( newRow );
  }
  table.push( newRow );
  OpenForum.Table.editRow(table,table.length-1);
};

OpenForum.Table.removeRow = function(table,index) {
  return table.splice(index,1)[0];
};

OpenForum.Table.moveRowUp = function(table,index) {
  if(index<=0) return;
  var row = table.splice(index,1)[0];
  table.splice(index-1,0,row);
};

OpenForum.Table.moveRowDown = function(table,index) {
  if(index>=table.length-1) return;
  var row = table.splice(index,1)[0];
  table.splice(index+1,0,row);
};

OpenForum.Table.applyRowFilter = function(tableName,tableData,fieldName,fieldFilter) {
  var table = document.getElementById(tableName);

  var filters = [];
  var allBlank = true;
  if(typeof fieldFilter == "undefined" && fieldName.length) {
    //Assume array of filters
    filters = fieldName;
    for(var i in filters) {
      if(filters[i].fieldFilter!="") allBlank = false;
      filters[i].query = ".*"+filters[i].fieldFilter+".*";
    }
  } else {
    if(fieldFilter!="") allBlank = false;
    filters.push( {fieldName: fieldName, fieldFilter: fieldFilter, query: ".*"+fieldFilter+".*"} );
  }

  var index = 1;
  for(var i  in tableData) {
    var rowData = tableData[i];
    if(allBlank) {
      OpenForum.Table.showRow(table,index);
    } else {
      OpenForum.Table.showRow(table,index);
      for(var j in filters) {
        if( (filters[j].query != ".*.*") && (""+rowData[filters[j].fieldName]).match(filters[j].query) == null) {
          OpenForum.Table.hideRow(table,index);
        }
      }
    }
    index++;
  }
};

OpenForum.Table.sort = function(tableData,fieldName,ascending) {
  tableData.sort( 
    function(a,b) {
      if(ascending) {
        if(a[fieldName]<b[fieldName]) return 1; 
        else return -1;
      } else {
        if(a[fieldName]>b[fieldName]) return 1; 
        else return -1;
      }
    } 
  );
};

OpenForum.Table.hideRow = function(table,row) {
  var nodes = table.querySelectorAll('tbody tr:nth-child(' + row + ')');
  nodes.item(0).style.display = "none";
};

OpenForum.Table.showRow = function(table,row) {
  var nodes = table.querySelectorAll('tbody tr:nth-child(' + row + ')');
  nodes.item(0).style.display = "";
};

OpenForum.Table.renderTable = function(tableName,tableData) {
  var html = "<table id='"+tableName+"'>";

  html += "<thead><tr>"; 
  for(var n in tableData[0]) {
    html += "<td>" + n.replaceAll("_"," ") + "</td>";
  }
  html += "</tr></thead>";
  html += "<tbody>";
  for(var r in tableData) {
    var row = tableData[r];
    html += "<tr>";

    for(var n in row) {
      var cell = row[n];
      if((typeof n == "string" && n.indexOf("url")!=-1) || (typeof cell == "string" && cell.indexOf("http")!=-1)) {
        cell = "<a href='"+cell+"' target='url'>"+cell+"</a>";
      }
      html += "<td>" + cell + "</td>";
    }

    html += "</tr>";
  }
  html+= "</tr></tbody>"; 

  html+="</table>";
  return html;
};


/* End of: /OpenForum/Javascript/Core/open-forum-utils.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Javascript/Core/open-forum-storage.js*/
//==============================================================================================================//
if(!OpenForum) {
  OpenForum = {};
}
OpenForum.Storage = {};

OpenForum.Storage.requestAccess = function() {
  document.requestStorageAccess();
};

OpenForum.Storage.get = function(key) {
  try{
    return localStorage.getItem(key);
  } catch(e) {
    console.log(e);
  }
};

OpenForum.Storage.set = function(key,value) {
  try{
    localStorage.setItem(key,value);
  } catch(e) {
    console.log(e);
  }
};

OpenForum.Storage.find = function(regex) {
  try{
    var found = [];
    for(var i in localStorage) {
      if( i.match(regex)) {
        found.push( {key: i, value: localStorage[i]} );
      }
    }
    return found;
  } catch(e) {
    console.log(e);
  }
};
/* End of: /OpenForum/Javascript/Core/open-forum-storage.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Javascript/Core/open-forum-ofx.js*/
//==============================================================================================================//
/*
* Author: Nik Cross
* Description: A replacement for OpenForum JSON.get and JSON.post
*/
var OFX = {
  fromJson: function( json ) {
    if(json.method == "get" ) {
      return OFX.get( json.url ).withAction( json.action ).withData( json.data );
    } else if(json.method == "post" ) {
      return OFX.post( json.url ).withAction( json.action ).withData( json.data );
    }
  },

  clearOfflineCache: function() {
    OpenForum.Storage.set("OFX.cache","[]");
    console.log("OFX cache cleared.");
  },

  sendOfflineCache: function( callback, callbackError ) {
    if(navigator.onLine===false) {
      return;
    }

    var cache = OFX.getOfflineCache();
    if(cache.length==0) {
      return;
    }
    var request = cache.shift();
    OpenForum.Storage.set("OFX.cache",JSON.stringify(cache));
    OFX.fromJson( request ).onSuccess( callback ).onError( callbackError ).go(true);

    if(cache.length!=0) {
      setTimeout( function() { OFX.sendOfflineCache(callback,callbackError); }, 1000 );
    }
  },

  getOfflineCache: function() {
    var cache = OpenForum.Storage.get("OFX.cache");
    if(cache==null) {
      cache = [];
    } else {
      try{
        cache = JSON.parse(cache);
      } catch(e) {
        console.log("OFX cache error "+e+". Replacing cache.");
        cache = [];
      }
    }
    return cache;
  },

  appendToOfflineCache: function(request) {
    var cache = OFX.getOfflineCache();
    cache.push( request.toJson() );
    OpenForum.Storage.set("OFX.cache",JSON.stringify(cache));
  },

  get: function(url) {
    var GET = function(url) {
      var self = this;
      var action;
      var data;
      var callBack;
      var callOnError;

      self.withAction = function(newAction) {
        action = newAction;
        return self;
      };

      self.withData = function(newData) {
        data = newData;
        return self;
      };

      self.onSuccess = function(newCallBack) {
        callBack = newCallBack;
        return self;
      };

      self.onError = function(newCallOnError) {
        callOnError = newCallOnError;
        return self;
      };

      self.toJson = function() {
        return {
          url: url,
          method: "get",
          action: action,
          data: data,
          requestedTime: new Date().getTime()
        };
      };

      self.go = function( withOfflineCache ) {

        if(navigator.onLine===false && withOfflineCache) {
          OFX.appendToOfflineCache( self );
          return true;
        }

        if(action) {
          if(data) {
            if(typeof data == "object") {
              var dataString = "";
              for(var name in data) {
                if(dataString.length>0) dataString += "&";
                if(typeof data[name] == "object") {
                	dataString += name + "="+ JSON.stringify( data[name] );
                } else {
                	dataString += name + "="+ data[name];
                }
              }
              data = dataString;
            }
          }
          var get = JSON.get(url,action,data);
          if(callBack) {
            get = get.onSuccess( callBack );
          }
          if(callOnError) {
            get = get.onError(callOnError);
          }
          get.go();
        } else {
          OpenForum.loadFile(url,callBack);
        }
      };
    };
    return new GET(url);
  },

  post: function(url) {
    var POST = function(url) {
      var self = this;
      var action;
      var data;
      var callBack;
      var callOnError;

      self.withAction = function(newAction) {
        action = newAction;
        return self;
      };

      self.withData = function(newData) {
        data = newData;
        return self;
      };

      self.onSuccess = function(newCallBack) {
        callBack = newCallBack;
        return self;
      };

      self.onError = function(newCallOnError) {
        callOnError = newCallOnError;
        return self;
      };

      self.toJson = function() {
        return {
          url: url,
          method: "post",
          action: action,
          data: data,
          requestedTime: new Date().getTime()
        };
      };

      self.go = function( withOfflineCache ) {

        if(navigator.onLine===false && withOfflineCache) {
          OFX.appendToOfflineCache( self );
          return true;
        }

        if(action) {
          if(data) {
            if(typeof data == "object") {
              var dataString = "";
              for(var name in data) {
                if(dataString.length>0) dataString += "&";
                if(typeof data[name] == "object") {
                	dataString += name + "="+ JSON.stringify( data[name] );
                } else {
                	dataString += name + "="+ data[name];
                }
              }
              data = dataString;
            }
          }
          var post = JSON.post(url,action,data);
          if(callBack) {
            post = post.onSuccess( callBack );
          }
          if(callOnError) {
            post = post.onError(callOnError);
          }
          post.go();
        } else {
          OpenForum.saveFile(url,data);
        }
      };
    };
    return new POST(url);
  }
};

/* End of: /OpenForum/Javascript/Core/open-forum-ofx.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Javascript/Core/open-forum-intraq.js*/
//==============================================================================================================//
/*
* Author: 
* Description: 
*/
if(typeof OpenForum == "undefined") {
  OpenForum = {};
}

OpenForum.IntraQ = function( queueName, types ) {
  var self = this;
  var tabId = "Tab:" + new Date().getTime() + ":" + Math.random();
  var lastChecked = 0;
  var listeners = [];
  if( typeof types == "undefined" ) {
    types = [];
  }

  self.registerAsType = function( type ) {
    types.push( type );
  };

  self.addListener = function(listener) {
    listeners.push( listener );
  };

  var checkForMessages = function() {
    var queue = JSON.parse( OpenForum.Storage.get("IntraQ."+queueName) );
    var now = new Date().getTime();
    var newQ = [];
    for(var i in queue) {
      var packet = queue[i];
      if(packet.ts>lastChecked && packet.id != tabId) {
        var typeMatch = false;
        if(packet.data.types) {
          for(var t in types) {
            packet.data.types.includes( types[t] );
            typeMatch = true;
            break;
          }
        } else {
          typeMatch = true;
        }
        if( typeMatch == true ) {
          for(var l in listeners) {
            listeners[l](packet.data);
          }
        }
      }
      if(now-packet.ts<5000) { //Messages that are older than 5 seconds are not included
        newQ.push(packet);
      }
    }
    lastChecked = now;

    var owner = JSON.parse( OpenForum.Storage.get("IntraQ."+queueName+".owner") );
    if(owner==null) {
      owner = {id: tabId, ts: now};
    }
    if(owner.id == tabId) {
      owner.ts = now;
      OpenForum.Storage.set("IntraQ."+queueName+".owner", JSON.stringify(owner) );
      OpenForum.Storage.set("IntraQ."+queueName, JSON.stringify(newQ) ); //Retire messages that are not new
    } else if(now-owner.ts>5000) {
      owner.id = tabId; // Take ownership if queue owner has gone
      owner.ts = now;
      OpenForum.Storage.set("IntraQ."+queueName+".owner", JSON.stringify(owner) );
    }
    setTimeout( checkForMessages, 500 );
  };

  self.getTabId = function() {
    return tabId;
  };

  self.send = function( data ) {
    var queue = JSON.parse( OpenForum.Storage.get("IntraQ."+queueName) );
    if(queue==null) queue = [];
    queue.push( {data: data, ts: new Date().getTime(), id: tabId} );
    OpenForum.Storage.set("IntraQ."+queueName, JSON.stringify(queue));
  };

  self.send( { action: "joined", tabId: tabId, types: types } );

  checkForMessages();
};

OpenForum.InQ = function() {
  var self = this;
  var inq = new OpenForum.IntraQ( "inq" );

  //TODO Needs to handle lots of different objects and values
  //Only ignore those that have just been set to stop a loop back condition
  var ignore = null;
  var listeners = [];

  inq.addListener( function( data) {
    if(data.action && data.action=="run") {
      OpenForum.evaluate( data.script );
    } else if(data.action && data.action=="set") {
      ignore = data.name;
      OpenForum.evaluate( data.name + " = " + JSON.stringify( data.value ) );
    } else if(data.action && data.action=="message") {
      inq.notifyListeners( data.message );
    }
  });

  inq.notifyListeners = function(message) {
    for( var l in listeners ) {
      var listener = listeners[l];
      if( listener.type == "*" || listener.type == message.type ) {
        listener.fn( message );
      }
    }
  };
  
  self.addMessageListener = function( listener, type ) {
    listeners.push( {fn: listener, type: type} );
  };
  
  self.send = function(message) {
    inq.send( { action: "message",tabId: inq.getTabId(),"message": message } );
  };
  
  self.run = function( script ) {
    inq.send( { action: "run",tabId: inq.getTabId(),"script": script } );
  };

  self.share = function( name) {
    OpenForum.getObject( name ).addListener(
      function( obj ) {
        if( ignore != obj.getId() ) {
          inq.send( { action: "set",tabId: inq.getTabId(),"name": obj.getId(), "value": obj.getValue() } );
        } else {
          ignore = null;
        }
      }
    );
  };
};

OpenForum.addInitialiser( function() {
  //inq default. Add ?inq=false to stop
  if( OpenForum.getParameter("inq")=="false" == false ) {

    OpenForum.inq = new OpenForum.InQ();
  }
});



/* End of: /OpenForum/Javascript/Core/open-forum-intraq.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Javascript/Core/open-forum-google-font.js*/
//==============================================================================================================//
/*
* Author: 
* Description: 
*/
OpenForum.loadGoogleFont = function(fontFamily,weight) {
  if(!weight) weight = 400;
  OpenForum.loadCSS( "https://fonts.googleapis.com/css2?family="+fontFamily+":wght@"+weight );
};
/* End of: /OpenForum/Javascript/Core/open-forum-google-font.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Javascript/Core/open-forum-debug.js*/
//==============================================================================================================//
/*
* Author: 
* Description: 
*/
OpenForum.debugON = false;

OpenForum.setDebugToConsole = function(state) {
  if( state === true ) {
    OpenForum.debug = function(type,message,exception) {
      if(!message) {
        message = type;
        type = "INFO";
      }
      console.log( new Date().toLocaleTimeString() + " " + type + " " + message );
      if(exception) {
        if(exception.stack) {
          console.log("Stack trace: " + exception.stack);
        } else {
          console.log("Exception: " + exception);
        }
      }
    };
    OpenForum.stop = function() { debugger; };
    OpenForum.debug("INFO","OpenForum Console Debugging now on.");
  } else {
    OpenForum.debug("INFO","OpenForum Console Debugging now off.");
    OpenForum.debug = function(type,message,exception) {};
    OpenForum.stop = function(){};
  }
  OpenForum.debugON = state;
};

OpenForum.stop = function(){};
OpenForum.debug = function(type,message,exception) {};


if( OpenForum.getParameter("debug")=="true" ) {
  OpenForum.setDebugToConsole(true);
}

/* End of: /OpenForum/Javascript/Core/open-forum-debug.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Javascript/Core/open-forum-user-reference.js*/
//==============================================================================================================//
OpenForum.getUserReference = function() {
  var userReference = OpenForum.Storage.get("user.reference");
  if(userReference==null) {
    userReference = "User:"+(""+Math.random()).replace(".","")+":"+new Date().getTime();
    OpenForum.Storage.set("user.reference",userReference);
  }
  return userReference;
};
/* End of: /OpenForum/Javascript/Core/open-forum-user-reference.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Javascript/Core/open-forum-bind.js*/
//==============================================================================================================//
OpenForum.bind = function( a, b) {
  if(typeof b == "function") {
    b( OpenForum.getObject( a ).getValue() );
    OpenForum.getObject( a ).addListener( function(value) {
      b( value.getValue() );
    } );
  } else {
    OpenForum.getObject( b ).setValue( OpenForum.getObject( a ).getValue() );
    OpenForum.getObject( a ).addListener( function(value) {
      OpenForum.getObject( b ).setValue( value.getValue() );
    } ); 
  }
};
/* End of: /OpenForum/Javascript/Core/open-forum-bind.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Javascript/Core/open-forum-testing.js*/
//==============================================================================================================//
/*
* Author: 
* Description: 
*/
if(typeof OpenForum == "undefined") {
  OpenForum = { testing: {} };
} else if(typeof OpenForum.testing == "undefined") {
  OpenForum.testing = {};
}

OpenForum.testing.showComments = function() {
  var filterNone = function() {
    return NodeFilter.FILTER_ACCEPT;
  };

  var iterator = document.createNodeIterator(document.body, NodeFilter.SHOW_COMMENT, filterNone);

  var currentNode;
  while ( currentNode = iterator.nextNode() ) {
    try{
      
      var e =  document.createElement("div");
      
      //if(currentNode.nextElementSibling.offsetParent!=null) {
      var x = currentNode.nextElementSibling.offsetTop;
      var y = currentNode.nextElementSibling.offsetLeft;
      	e.style.position = "absolute";
      	e.style.top = x;
      	e.style.left = y;
      	e.style.color = "black";
      	e.style.backgroundColor = "white";
      	e.style.border = "solid 1px black";
      	e.style.borderRadius = "8px";
      	e.style.padding = "2px";
      	e.style.zIndex = "9999";
      //}
      e.innerHTML = "comment";
      e.title = currentNode.nodeValue;

      currentNode.nextElementSibling.insertAdjacentElement('beforeBegin',e);

      console.log("Displaying comment " + currentNode.nodeValue);
    } catch (ex) {
      console.log("Error displaying comment " + ex);
    }
  }

};

OpenForum.testing.showIds = function() {
  var filterNone = function() {
    return NodeFilter.FILTER_ACCEPT;
  };

  var iterator = document.createNodeIterator(document.body, NodeFilter.SHOW_ALL, filterNone);

  var currentNode;
  while ( currentNode = iterator.nextNode() ) {
    try{
      if(typeof currentNode.id == "undefined" || currentNode.id == "") continue;
      
      var e =  document.createElement("div");
      
      //if(currentNode.nextElementSibling.offsetParent!=null) {
      var x = currentNode.offsetTop;
      var y = currentNode.offsetLeft;
      	e.style.position = "absolute";
      	e.style.top = x;
      	e.style.left = y;
      	e.style.color = "black";
      	e.style.backgroundColor = "cyan";
      	e.style.border = "solid 1px black";
      	e.style.borderRadius = "2px";
      	e.style.padding = "2px";
      	e.style.zIndex = "9999";
      //}
      e.innerHTML = "id";
      e.title = currentNode.id;

      currentNode.insertAdjacentElement('beforeBegin',e);

      console.log("Displaying id " + currentNode.id);
    } catch (ex) {
      console.log("Error displaying id " + ex + " for " +currentNode.id);
    }
  }

};

OpenForum.testing.showNames = function() {
  var filterNone = function() {
    return NodeFilter.FILTER_ACCEPT;
  };

  var iterator = document.createNodeIterator(document.body, NodeFilter.SHOW_ALL, filterNone);

  var currentNode;
  while ( currentNode = iterator.nextNode() ) {
    try{
      if(typeof currentNode.name == "undefined" || currentNode.name == "") continue;
      
      var e =  document.createElement("div");
      
      //if(currentNode.nextElementSibling.offsetParent!=null) {
      var x = currentNode.offsetTop;
      var y = currentNode.offsetLeft;
      	e.style.position = "absolute";
      	e.style.top = x;
      	e.style.left = y;
      	e.style.color = "white";
      	e.style.backgroundColor = "black";
      	e.style.border = "solid 1px white";
      	e.style.borderRadius = "2px";
      	e.style.padding = "2px";
      	e.style.zIndex = "9999";
      //}
      e.innerHTML = "name";
      e.title = currentNode.name;

      currentNode.insertAdjacentElement('beforeBegin',e);

      console.log("Displaying id " + currentNode.id);
    } catch (ex) {
      console.log("Error displaying id " + ex + " for " +currentNode.id);
    }
  }

};

OpenForum.testing.readForm = function() {
  var data = {};
  var is = document.getElementsByTagName("input");
  for( var i in is ) {
    if( is[i].id ) {
      if(is[i].type == "radio") {
        data[ is[i].id ] =  is[i].checked;
      } else {
        data[ is[i].id ] =  is[i].value;
      }
    } else if( is[i].name ) {
      if(is[i].type == "radio") {
        data[ is[i].name ] =  is[i].checked;
      } else {
        data[ is[i].name ] =  is[i].value;
      }
    }
  }

  is = document.getElementsByTagName("select");
  for( var i in is ) {
    if( is[i].id ) {
      data[ is[i].id ] =  is[i].value;
    } else if( is[i].name ) {
      data[ is[i].name ] =  is[i].value;
    }
  }

  return data;
};

OpenForum.testing.writeToForm = function(data) {
  for(var i in data) {
    try{
      var el = document.getElementById(i);
      if(typeof el == "undefined") {
        el = document.getElementsByName(i)[0];
      }
      if(el.type=="radio") {
        if(data[i]==true) {
          el.checked=true;
          console.log( i + ".checked = true" );
        } else {
          el.checked=false;
          console.log( i + ".checked = false" );
        }
      } else {
        el.value = data[i];
        console.log( i + ".value set to " + el.value );
      }

    } catch(e) {
      console.log("In "+i);
      console.log("Ex:" + e);
    }
  }
};

/* End of: /OpenForum/Javascript/Core/open-forum-testing.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Javascript/Core/open-forum-input-field.js*/
//==============================================================================================================//
if(!OpenForum) {
  OpenForum = {};
}

OpenForum.Input={};

OpenForum.Input.getText = function(elementId) {
  var input = document.getElementById( elementId );
  return input.value;
};

OpenForum.Input.getSelectedText = function(elementId) {
  var input = document.getElementById( elementId );
  return input.value.substring(input.selectionStart,input.selectionEnd);
};

OpenForum.Input.hasSelection = function(elementId) {
  var input = document.getElementById( elementId );
  return input.selectionStart != input.selectionEnd;
};

OpenForum.Input.wrapSelectedText = function ( elementId, startText, endText ) {
  var input = document.getElementById( elementId );
  var text = input.value.substring(input.selectionStart,input.selectionEnd);
  var start = input.value.substring(0,input.selectionStart);
  var end = input.value.substring(input.selectionEnd);
  input.value = start + startText + text + endText + end;
};

OpenForum.Input.wrapAllText = function ( elementId, startText, endText ) {
  var input = document.getElementById( elementId );
  var text = input.value;
  input.value = startText + text + endText;
};

OpenForum.Input.replaceSelectedText = function ( elementId, replaceWith ) {
  var input = document.getElementById( elementId );
  var start = input.value.substring(0,input.selectionStart);
  var end = input.value.substring(input.selectionEnd);
  input.value = start + replaceWith + end;
};

OpenForum.Input.appendAtCursor = function ( elementId, text ) {
  var input = document.getElementById( elementId );
  var start = input.value.substring(0,input.selectionEnd);
  var end = input.value.substring(input.selectionEnd);
  input.value = start + text + end;
};

OpenForum.Input.toDateField = function ( date ) {
  var value = date.getFullYear()+"-"+(""+(date.getMonth()+1)).padBefore("0",2)+"-"+(""+date.getDate()).padBefore("0",2);
  return value;
};

OpenForum.Input.toDateTimeField = function ( date ) {
  var value = date.getFullYear()+"-"+(""+(date.getMonth()+1)).padBefore("0",2)+"-"+(""+date.getDate()).padBefore("0",2);
  value += "T" + (""+date.getHours() ).padBefore("0",2) + ":" + (""+date.getMinutes() ).padBefore("0",2);
  return value;
};

OpenForum.Input.fromDateField = function ( value ) {
  var parts = value.split("-");
  var newDate = new Date(parts[0], parseInt(parts[1],10)-1, parts[2], 0, 0, 0, 0);
  return newDate;
};

OpenForum.Input.fromDateTimeField = function ( value ) {
  var parts = value.before("T").split("-");
  var newDate = new Date(parts[0], parseInt(parts[1],10)-1, parts[2], 0, 0, 0, 0);
  
  parts = value.after("T").split(":");
  newDate.setHours( parseInt( parts[0] ) );
  newDate.setMinutes( parseInt( parts[1] ) );
  
  return newDate;
};

/* End of: /OpenForum/Javascript/Core/open-forum-input-field.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Javascript/Core/open-forum-endless-scroll.js*/
//==============================================================================================================//
OpenForum.addEndlessScroll = function( getNewData, elementId ) {
  
  var count = 0;
  while(count<10) {
    var scrollSpaceBelowView = (document.body.scrollHeight - window.scrollY)-document.body.clientHeight;

    if( scrollSpaceBelowView < (document.body.clientHeight/2)) {
      var newData = getNewData();
      if( newData==null || newData=="" ) break;
      OpenForum.appendToElement(elementId, newData);
    } else {
      break;
    }
    count ++;
  }
  
  document.addEventListener("scroll", (event) => {

    //document.body.scrollHeight = the total height of the current document
    //window.scrollY = the top of the screen scrolling position
    //document.body.clientHeight = visible height

    var scrollSpaceBelowView = (document.body.scrollHeight - window.scrollY)-document.body.clientHeight;

    if( scrollSpaceBelowView < document.body.clientHeight) {
      var newData = getNewData();
      OpenForum.appendToElement(elementId, newData);
    }
  });
};
/* End of: /OpenForum/Javascript/Core/open-forum-endless-scroll.js*/

//==============================================================================================================//
