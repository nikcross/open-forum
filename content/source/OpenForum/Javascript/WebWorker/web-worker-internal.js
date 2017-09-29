/*
* Author: 
* Description: 
*/

var getResult = [];

self.addEventListener(
  'message', 
  function(event) {
    processMessage(event);
    //self.postMessage( eval(e.data.job) );

  },
  false);

function processMessage(event) {
  if(event.data.close) {
    self.postMessage({close: close, result: "#Finished Close requested"});
    close();
  }
  if(event.data.include) {
    eval(event.data.include);
    self.postMessage({include: include, result: "#Finished include: "+event.data.include});
  }
  if(event.data.job) {
    var returnScript = "Return = function(value) { self.postMessage({jobId: \""+event.data.jobId+"\", result: value}) ;};\n ";

    var value = eval( returnScript+event.data.job );

    if(typeof(value)!=="undefined") {
      var result = {jobId: event.data.jobId, result: value};
      self.postMessage(result);
    }
    
    
    self.postMessage({result: "#Finished jobId: "+event.data.jobId});
  }
  if(event.data.getId) {
    getResult[event.data.getId].callBack( event.data.result );
    callBack("#Finished");    
    self.postMessage({getId: data.getId, result: "#Finished getId: "+event.data.getId});
  }
}

var nextTransactionId = 0;

function set(key,value) {
  var setId = "set."+(nextTransactionId++);
  var jsonValue = JSON.stringify(value);
  self.postMessage( {setId: setId, key:key, value: jsonValue} );
}

function get(key,callBack) {
  var getId = "get."+(nextTransactionId++);
  self.postMessage( {getId: getId, key:key} );

  getResult[getId] = {getId: getId, key:key, callBack: callBack};
}


function loadFile(fileName) {
  if(fileName.indexOf("?")!==-1) {
    fileName += "&ts="+new Date().getTime();
  } else {
    fileName += "?ts="+new Date().getTime();
  }
  return Ajax.sendRequest( new AjaxRequest("GET",fileName,"",null,null,null,false)  );
}

function saveFile(fileName,data) {
  var pageName = fileName.substring(0,fileName.lastIndexOf("/"));
  fileName = fileName.substring(fileName.lastIndexOf("/")+1);

  data = "pageName="+encodeURIComponent(pageName)+"&fileName="+encodeURIComponent(fileName)+"&data="+encodeURIComponent(data);

  return eval("(" + Ajax.sendRequest( new AjaxRequest("POST","/OpenForum/Actions/Save","returnType=json",data,null,null,false)) + ")");
}

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