//==============================================================================================================//
/* Version 1.2.37*/
/* Built on Wed Nov 08 2017 16:49:39 GMT-0000 (GMT) */
/* Built by /OpenForum/Javascript/Builder.*/
/* Do not edit as changes may be overwritten */
//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Javascript/Core/open-forum-dependency.js*/
//==============================================================================================================//
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
/* End of: /OpenForum/Javascript/Core/open-forum-dependency.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Javascript/Core/open-forum-scanner.js*/
//==============================================================================================================//
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
    return "1.2.37";
  };

  self.getBuildDate = function() {
    return "Wed Nov 08 2017 16:49:39 GMT-0000 (GMT)";
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

    for(var ni = 0; ni<nodeProcessors.length; ni++) {
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

  self.loadFile = function(fileName,callBack) {
    if(fileName.indexOf("?")!==-1) {
      fileName += "&ts="+new Date().getTime();
    } else {
      fileName += "?ts="+new Date().getTime();
    }
    if(callBack) {
      Ajax.sendRequest( new AjaxRequest("GET",fileName,"",null,callBack,null,true)  );
    } else {
      return Ajax.sendRequest( new AjaxRequest("GET",fileName,"",null,null,null,false)  );
    }
  };

  self.saveFile = function(fileName,data,callBack) {
    var pageName = fileName.substring(0,fileName.lastIndexOf("/"));
    fileName = fileName.substring(fileName.lastIndexOf("/")+1);

    data = "pageName="+encodeURIComponent(pageName)+"&fileName="+encodeURIComponent(fileName)+"&data="+encodeURIComponent(data);

    if(callBack) {
      Ajax.sendRequest( new AjaxRequest("POST","/OpenForum/Actions/Save","returnType=json",data,callBack,null,true));
    } else {
      return JSON.parse( Ajax.sendRequest( new AjaxRequest("POST","/OpenForum/Actions/Save","returnType=json",data,null,null,false)) );
    }
  };

  self.appendFile = function(fileName,data,callBack) {
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

  self.deleteFile = function(pageName,fileName,callBack) {

    var parameters = "action=deleteAttachmentNoBackup"+
        "&arg0="+pageName+
        "&arg1="+fileName;

    if(callBack) {
      return Ajax.sendRequest( new AjaxRequest("GET","/OpenForum/Javascript/OpenForumServer/File",parameters,null,callBack,null,true));
    } else {
      return JSON.parse( Ajax.sendRequest( new AjaxRequest("GET","/OpenForum/Javascript/OpenForumServer/File",parameters,null,null,null,false)) );
    }
  };

  self.copyFile = function(fileName,toFileName,callBack) {
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

  self.moveFile = function(fileName,toFileName,callBack) {
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
    //document.getElementById(id).statusQueue.value = statusQueueName;
    document.getElementById(id).submit();
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
    name = name.replace(/[\[]/g,"\\\[").replace(/[\]]/g,"\\\]");
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
/* End of: /OpenForum/Javascript/Core/open-forum-scanner.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Javascript/Core/open-forum-json.js*/
//==============================================================================================================//
//---- JSON ----

        if( typeof(JSON)=="undefined" ) {
       		JSON = new function() {};
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
              var object = eval("("+data+")");
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
          if(this.action && this.action != null && this.action != "") request = "action="+this.action;
          
          if(this.method=="GET") {
			if(this.parameters && this.parameters.length>0) {
				request+="&"+this.parameters;
            }
            Ajax.sendRequest( new AjaxRequest(this.method,this.page,request,"",this.onSuccess,this.onError,true) );
          } else {
			Ajax.sendRequest( new AjaxRequest(this.method,this.page,request,this.parameters,this.onSuccess,this.onError,true) );
          }
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
  var jsonModifier = function(json) {
    if(modifier) modifier(json);
  }
  
  var root = new TreeNode(name,attributes,null,jsonModifier);
  var elementId = elementId;

  this.setJSONModifier = function(newModifier) {
    modifier = newModifier;
  }
  
  this.render = function() {
    var element = document.getElementById(elementId);
    element.innerHTML = root.render(0);
    return this;
  };
  this.addChild = function(name,attributes) {
    return root.addChild(name,attributes);
  };
  this.addJSON = function(node) {
    return root.addJSON(node);
  };
  this.setJSON = function(node) {
    root = root.addJSON(node);
    return root;
  };
  this.render();

  this.expandAll = function() {
    root.applyToChildren( function(child){ child.expand(); } );
    root.expand();
    return this;
  };

  this.collapseAll = function() {
    root.applyToChildren( function(child){ child.collapse(); } );
    root.collapse();
    return this;
  };
  this.deleteChild = function(node) {
    node.parent.deleteChild(node);
    return this;
  };
  this.getRoot = function() {
    return root;
  };
  this.expandPath = function(path) {

    var nodePath = findPath(path);
    if(nodePath!==null) {
      nodePath.forEach( function(node) {node.expand(); } );
      return true;
    } else {
      return false;
    }
  };
  this.findNode = function(path) {
    return findPath(path);
  };
  this.init = function() {};
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
  var fn = eval("("+config.fn+")");
  var icon = config.icon;
  var toolTip = config.toolTip;
  
  var id = "ActionId"+NextActionId;
  NextActionId++;
  Actions[id]=this;

  icon = "/OpenForum/Images/icons/png/" + icon + ".png";

  this.call = function(node) {
    fn(node);
  };
  this.render = function(target)
  {
    data="&nbsp;<a href='#' onClick='Actions[\""+id+"\"].call("+target+");return false;'>"+
      "<i style='background: url(\""+icon+"\") no-repeat scroll; min-width: 16px; min-height: 16px;	display: inline-block;' title='"+toolTip+"'></i></a>";
    return data;
  };
}

function TreeNode(name,attributes,parent,jsonModifier) {
  var that = this;
  var id = "TreeNode"+NextTreeNodeIndex;
  NextTreeNodeIndex++;
  TreeNodes[id] = this;
  var children = [];
  var expanded = false;
  var SPACE = "&nbsp;&nbsp;&nbsp;&nbsp;";
  var localDepth = 0;
  var lazyLoad = null;

  this.getId = function() {
    return id;
  };

  this.setLazyLoad = function(lazyLoadFn) {
    lazyLoad = lazyLoadFn;
    return this;
  };

  this.getParent = function() {
    return parent;
  }
  
  this.addChild = function(name,attributes) {
    var newChild = new TreeNode(name,attributes,this,jsonModifier);
    children[children.length] = newChild;
    newChild.parent = that;
    return newChild;
  };

  this.addJSON = function(node) {
    if(jsonModifier!=null) jsonModifier(node);
    var child = this.addChild( node.name,node.attributes );
    if(node.leaves) {
      for(var i in node.leaves) {
        child.addJSON( node.leaves[i] );
      }
    }
    child.parent = that;
    return child;
  };
  
  this.importJSON = function(url,action,parameters) {
    JSON.get(url,action,parameters).onSuccess(
      function(response) {
        for(var i in response.leaves) {
          that.addJSON( response.leaves[i] );
        }
        paint();
      }
    ).go();
  }
  
  this.deleteChild = function(node) {
    for(var index in children) {
      if(children[index].getId()===node.getId()) {
        children.splice(index,1);
        return this;
      }
    }
    return this;
  };

  this.expand = function() {
    if(lazyLoad!==null) {
      lazyLoad(that);
      lazyLoad = null;
      return this;
    }
    expanded=true;
    paint();
    return this;
  };
  this.collapse = function() {
    expanded=false;
    paint();
    return this;
  };
  this.toggle = function() {
    expanded=!expand;
    paint();
    return this;
  };
  var paint = function() {
    document.getElementById(id).innerHTML = that.render(localDepth);
  };

  this.render = function(depth) {
    if(!depth) {
      depth=0;
    }
    localDepth = depth;
    var data = "";
    data+="<span id='"+id+"'>";
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
      if(attributes.icon) {
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
  this.getName = function() {
    return name;
  };
  this.setName = function(newName) {
    name = newName;
  };
  this.getAttribute = function(name) {
    return attributes[name];
  };
  this.applyToChildren = function( fn ) {
    children.forEach( fn(child) );
  };
  this.getChildren = function() {
    return children;
  };
}

OpenForum.createFileTree = function(id,root) {
  var tree = new Tree(id,"Loading...","");
  JSON.get("/OpenForum/Javascript/Tree","getPageTree","pageName="+root).onSuccess(
    function(result) {
      tree.setJSON(result);
      tree.render();
      tree.getRoot().expand();
      tree.init();
    }
  ).go();

  return tree;
};
/* End of: /OpenForum/Javascript/Core/open-forum-tree.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Javascript/Core/open-forum-js-extensions.js*/
//==============================================================================================================//
//---- String extra methods ----
String.prototype.startsWith = function(start) {
  return (this.indexOf(start)===0);
};

String.prototype.between = function(start,end) {
  return this.substring(this.indexOf(start)+start.length,this.indexOf(end));
};

String.prototype.before = function (end) {
  return this.substring(0,this.indexOf(end));
};

String.prototype.after = function (start) {
  return this.substring(this.indexOf(start.length));
};

String.prototype.replaceAll = function(find,replace) {
  return this.replace( new RegExp(find,"g"), replace);
};

String.prototype.padBefore = function(padding,targetLength) {
  var result = this;
  while(this.length<targetLength) {
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

Date.prototype.isAfter = function(date) {
  return (this.getTime()>date.getTime());
};

Date.prototype.isBefore = function(date) {
  return (this.getTime()<date.getTime());
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
  var id = objectId;
  var value = "";
  this.targets=[];
  this.listeners=[];

  this.getId = function() {
    return id;
  };

  this.add = function(target) {
    this.targets[this.targets.length]=target;
  };

  this.setValue = function(newValue,exclude) {
    if(newValue===value) {
      return;
    }
    value = newValue;
    for(var targetIndex in this.targets) {
      var target = this.targets[targetIndex];
      if(target==null) {
        continue;
      }
      if(exclude && exclude===target) {
        continue;
      }
      if(typeof(target.type)!="undefined" && target.type=="checkbox") {
        target.checked = value;
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

  this.getValue = function() {
    return value;
  };

  this.scan = function() {
    for(var targetIndex in this.targets) {
      try {
        var target = this.targets[targetIndex];
        if(target===null) {
          continue;
        }

        if(typeof(target.type)!="undefined" && target.type=="checkbox") {
          if(target.checked!==value) {

            this.setValue(target.checked,target);
            eval(this.getId()+"=value;");
            this.notifyListeners();
            return;
          }
        } else if(typeof(target.value)!="undefined") {
          if(target.value!=value) {
            this.setValue(target.value,target);
            eval(this.getId()+"=value;");
            this.notifyListeners();
            return;
          }
        }
      } catch(e) {
        //Maybe needs debug mode
      }
    }
    try{
      var testId = this.getId();
      if( eval("typeof("+testId+")")!="undefined") {
        if( value!=eval(testId)) {
          this.setValue(eval(testId));
          this.notifyListeners();
        }
      } else {
        eval(testId+"=value;");
      }
    } catch(e) {
      //Maybe needs debug mode
    }

  };

  this.addListener = function(listener) {
    this.listeners.push(listener);
  };

  this.notifyListeners = function() {
    for(var listenerIndex in this.listeners) {
      listener = this.listeners[listenerIndex];
      listener( this );
    }
  };

  this.getId = function() {
    return id;
  };

  this.getTargets = function() {
    return this.targets;
  };
}	

onload = function() {
  OpenForum.onload();
};

onunload = function() {
  OpenForum.onunload();
};

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

  var tableTop = tableNode.innerHTML;
  tableNode.id = id;

  self.setTableNode = function(newTableNode) {
    tableNode = newTableNode;
  };

  self.refresh = function() {

    try {
      if(tableNode.attributes && tableNode.attributes['of-id'] && typeof tableNode.value != "undefined" ) {
        //Not sure what the empty string was there for, but it stops select working
        //if( this.tableNode.value!=this.value && this.value!="") {
        if( tableNode.value!=value) {
          value = tableNode.value;
          eval(tableNode.id+"=\""+value+"\";");
        } else {
          var newValue = eval(tableNode.id);
          if( tableNode.value!=newValue ) {
            tableNode.value=newValue;
            value = tableNode.value;
          }
        }
      }
    } catch(e) {
      //Maybe needs debug mode
    }

    //check if changed
    var objectSignature = OpenForum.createObjectSignature( targetObject.getValue() );
    if(objectSignature==targetObjectSignature) {
      return;
    }
    targetObjectSignature=objectSignature;

    var tableData = tableTop;
    var collection = targetObject.getValue();
    for( var elementIndex in collection ) {
      try {
        var item = collection[elementIndex];
        item.index = elementIndex;
        eval("var "+element+"=item;");

        var data = ""+rowHTML;
        while(data.indexOf(OpenForum.FIELD_DELIMETER_START)!=-1) {
          name = data.substring(data.indexOf(OpenForum.FIELD_DELIMETER_START)+2,data.indexOf(OpenForum.FIELD_DELIMETER_END));

          data = data.substring(0,data.indexOf(OpenForum.FIELD_DELIMETER_START))+
            eval(name)+
            data.substring(data.indexOf(OpenForum.FIELD_DELIMETER_END)+2);


          if( tableNode.type=="select-one") {
            if(eval(id + "===" + name)===true ) {
              data = data.replace("selected=\"\"","selected");
            } else {
              data = data.replace("selected=\"\"","");
            }
          }
        }
        tableData += data;

      } catch(e) {
        //Maybe needs debug mode
      }
    }
    tableNode.innerHTML=tableData;
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
  hiddenElement.href = 'data:attachment/text,' + encodeURI(data);
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
/* End of: /OpenForum/Javascript/Core/open-forum-browser.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Javascript/Core/open-forum-action.js*/
//==============================================================================================================//
OpenForum.action = {};
OpenForum.action.copyPage = function(pageName,newPageName) {
  OpenForum.loadFile("/OpenForum/Actions/Copy?newPageName="+newPageName+"&pageName="+pageName);
};

OpenForum.action.movePage = function(pageName,newPageName) {
  OpenForum.loadFile("/OpenForum/Actions/Copy?newPageName="+newPageName+"&pageName="+pageName);
};

OpenForum.action.zipPage = function(pageName) {
  window.location = "/OpenForum/Actions/Zip?action=zip&pageName="+pageName;
};

OpenForum.action.deletePage = function(pageName) {
  OpenForum.loadFile(window.location = "/OpenForum/Actions/Delete?pageName="+pageName);
};

/* End of: /OpenForum/Javascript/Core/open-forum-action.js*/

//==============================================================================================================//
