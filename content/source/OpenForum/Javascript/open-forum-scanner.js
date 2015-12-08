//---- OpenForum ----

var OpenForum = new function(){
  this.FIELD_DELIMETER_START = "{"+"{";
  this.FIELD_DELIMETER_END = "}"+"}";
  var self = this;
  var objects= [];
  var tables = [];
  var tabs = [];
  var nextId = 0;
  var hash;
  var hashCalls = [];
  var nodeProcessors = [];
  var initialisers = [];

  self.interval = null;
  
  self.getVersion = function() {
    return "&version;";
  };

  self.getBuildDate = function() {
    return "&date;";
  };

  self.initDependencies = DependencyService.createNewDependency();

  self.includeScript = function( scriptName ) {
    self.initDependencies.addDependency( scriptName );
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

  self.addInitialiser = function( fn ) {
    initialisers.push(fn);
  };
  self.addHashCall = function(hash,callFn) {
    hashCalls[hash] = callFn;
  };

  self.addTable = function(table) {
    tables[table.id]=table;
  };

  self.getTable = function(ofId) {
    return tables[ofId];
  };

  self.getNextId = function() {
    nextId++;
    return nextId;
  };

  self.getObject= function(id) {
    if(objects[id]===undefined) {
      objects[id] = new OpenForumObject(id);
    }
    return objects[id];
  };

  self.scan = function() {
    if(self.hash != window.location.hash) {
      self.hash = window.location.hash;
      self._onHash(self.hash);
    }
    for(var tableIndex in tables) {
      tables[tableIndex].refresh();
    }
    for(var objectIndex in objects) {
      object = objects[objectIndex];
      if(typeof(object)=="undefined") {
      } else {
        object.scan();
      }
    }
  };

  self.crawl = function (node) {
    self.crawlTables(node);
    self.crawlParts(node);
  };

  self.crawlParts = function (node,prefix) {
    if(node.attributes && node.attributes['of-exclude']) {
      return;
    }
    if(typeof(prefix)=="undefined") {
      prefix="";
    }

    for(var ni in nodeProcessors) {
      nodeProcessors[ni](node);
    }

    if(!(node.childNodes && node.childNodes.length>0)) {          
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

    for(var nodeIndex in node.childNodes) {
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
    for(var nodeIndex in node.childNodes) {
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
        "<span id='OpenForumId"+nextId+"'>OpenForumId"+nextId+"</span>"+
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
        "<span id='OpenForumId"+nextId+"'>OpenForumId"+nextId+"</span>"+
        data.substring(data.indexOf(OpenForum.FIELD_DELIMETER_END)+2);
      spans[spans.length] = {id: 'OpenForumId'+nextId,name: name};

      nextId++;
    }
    node.innerHTML = data;

    for(var spanIndex in spans) {
      var span = spans[spanIndex];
      var object = self.getObject( span.name );
      object.add( document.getElementById(span.id) );
      objects[objects.length]=object;
    }
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
    if(waitForReadyCount<15) {
      if(self.initDependencies.checkLoaded()===false) {
        setTimeout(OpenForum.waitForReady,200);
        waitForReadyCount++;
        return;
      }
      for(var fni in initialisers) {
        var initialiser = initialisers[fni];
        if(!initialiser.ready) {
          initialiser.ready = initialiser();
          setTimeout(OpenForum.waitForReady,200);
          waitForReadyCount++;
          return;
        }
      }
    } else {
      console.log("Error: OpenForum.waitForReady timed out.");
    }

    self.crawl(document.body);
    self.createData();
    self.hash = "";
    self.scan();
    self.init();

    self.startAutoScan(500,500);
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
      self.interval = setInterval(self.scan,500,500);
    }
  };
  
  self.onunload= function() {
    this.close();
  };

  self.getObjects = function() {
    return objects;
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
      if( eval("typeof("+object.getId()+")")==="undefined" ) {
        eval(object.getId()+"=\"\";");
        object.setValue("");
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

      if( eval("typeof("+id+")")=="undefined" ) {
        eval(id+"={};");
      }
    }
  };

  self.createObjectSignature = function(object,signature,depth) {
    signature = "";

    if(typeof(object)!="object") {
      signature+="("+typeof(object)+")"+object;
    }

    if( typeof(depth)=="undefined" ) {
      depth=0;
    }
    depth++;
    if(depth>10) {
      return;
    }

    for(var index in object) {
      var part = object[index];
      if(typeof(part)!="object") {
        signature+=index+"="+"("+typeof(part)+")"+part+",";
        continue;
      } else {
        signature+=index+"{";
        signature+=this.createObjectSignature(part,signature,depth);
        signature+="},";
      }
    }
    depth--;
    return signature;
  };

  self.childCount = function(object) {
    var count=0;

    for(var index in object) {
      count++;
    }
    return count;
  };

  self.loadScripts = function(scriptURLs,callback) {
    var scripts="&callback="+callback;
    var index=1;
    for(var scriptIndex in scriptURLs) {
      scripts+="&script"+index+"="+scriptURLs[scriptIndex];
      index++;
    }
    var fileref = document.createElement("script");
    fileref.setAttribute("src",self.getRoot()+"/OpenForum/Javascripts?action=getScripts"+scripts);
    fileref.setAttribute("type","text/javascript");
    document.getElementsByTagName("head")[0].appendChild(fileref);
  };

  self.loadScript = function(scriptURL) {
    var fileref = document.createElement("script");
    fileref.setAttribute("src",scriptURL);
    fileref.setAttribute("type","text/javascript");
    document.getElementsByTagName("head")[0].appendChild(fileref);
  };

  self.loadCSS = function(cssURL) {
    var fileref = document.createElement("link");
    fileref.setAttribute("rel", "stylesheet");
    fileref.setAttribute("type", "text/css");
    fileref.setAttribute("href", cssURL);
    document.getElementsByTagName("head")[0].appendChild(fileref);
  };

  self.loadFile = function(fileName) {
    if(fileName.indexOf("?")!==-1) {
      fileName += "&ts="+new Date().getTime();
    } else {
      fileName += "?ts="+new Date().getTime();
    }
    return Ajax.sendRequest( new AjaxRequest("GET",fileName,"",null,null,null,false)  );
  };

  self.saveFile = function(fileName,data) {
    var pageName = fileName.substring(0,fileName.lastIndexOf("/"));
    fileName = fileName.substring(fileName.lastIndexOf("/")+1);

    data = "pageName="+encodeURIComponent(pageName)+"&fileName="+encodeURIComponent(fileName)+"&data="+encodeURIComponent(data);

    return eval("(" + Ajax.sendRequest( new AjaxRequest("POST","/OpenForum/Actions/Save","returnType=json",data,null,null,false)) + ")");
  };

  self.fileExists = function(fileName) {
    var pageName = fileName.substring(0,fileName.lastIndexOf("/"));
    fileName = fileName.substring(fileName.lastIndexOf("/")+1);

    return JSON.parse( Ajax.sendRequest( new AjaxRequest("GET","/OpenForum/Actions/AttachmentExists","pageName="+pageName+"&fileName="+fileName,null,null,null,false)) );
  };

  self.uploadFile = function(id,pageName) {
    var fileName = document.getElementById(id).file.value;
    fileName = fileName.replace(/\\/g,"/");
    fileName = fileName.substring(fileName.lastIndexOf("/")+1);
    var result = this.loadFile("/OpenForum/Actions/AttachmentExists?pageName="+pageName+"&fileName="+fileName);
    if(result==="true" && confirm("Attachment "+fileName+" exists","Replace this attachment ?")===false ) {
      return;
    }
    document.getElementById(id).action="/OpenForum/Actions/Attach?page="+pageName;
    document.getElementById(id).statusQueue.value = statusQueueName;
    document.getElementById(id).submit();
  };

  self.uploadTextToJavascript = function(onLoadFunction) {
    var hiddenElement = document.createElement('input');
    hiddenElement.type = "file";
    hiddenElement.onchange = function(event) {
      var reader = new FileReader();

      reader.onload = function(event) {
        if(event.target.readyState != 2) return;
        if(event.target.error) {
          alert('Error while reading file');
          return;
        }
        onLoadFunction( event.target.result );
        console.log("Data loaded");
      };
      reader.readAsText(event.target.files[0]);
    };
    hiddenElement.click();
    console.log("Upload ready");
  };

  self.downloadTextFromJavascript = function( fileName,data ) {
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:attachment/text,' + encodeURI(data);
    hiddenElement.target = '_blank';
    hiddenElement.download = fileName;
    hiddenElement.click();
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

  self.setElement = function(id,content) {
    document.getElementById(id).innerHTML = content;
  };

  self. appendToElement = function(id,content) {
    document.getElementById(id).innerHTML += content;
  };

  self.showElement = function(id) {
    document.getElementById(id).style.display = "block";
  };

  self.hideElement = function(id) {
    document.getElementById(id).style.display = "none";
  };

  self.toggleElement = function(id) {
    if(document.getElementById(id).style.display==="block") {
      document.getElementById(id).style.display = "none";
    } else {
      document.getElementById(id).style.display = "block";
    }
  };

  self.getParameter = function( name ) {
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( window.location.href );
    if( results === null )
      return "";
    else
      return results[1];
  };

  self.getCookie = function(name) {
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
};