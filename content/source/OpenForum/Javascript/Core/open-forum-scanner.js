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
    return "&version;";
  };

  self.getBuildDate = function() {
    return "&date;";
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

