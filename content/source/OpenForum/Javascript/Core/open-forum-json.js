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

