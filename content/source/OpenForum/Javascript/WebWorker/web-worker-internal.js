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
  if(event.data.include) {
    eval(event.data.include);
  }
  if(event.data.job) {
    var returnScript = "Return = function(value) { self.postMessage({jobId: \""+event.data.jobId+"\", result: value}) ;};\n ";
    
    var value = eval( returnScript+event.data.job );

    if(typeof(value)!=="undefined") {
      var result = {jobId: event.data.jobId, result: value};
      self.postMessage(result);
    }
  }
  if(event.data.getId) {
    getResult[event.data.getId].callBack( event.data.result );
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