var action = transaction.getParameter("action");
if(action===null) {
    transaction.setResult(transaction.SHOW_PAGE);
    return;
}

try{
action = ""+action;
result = {result: "error", message: "Action "+action+" not recognised."};

if(action==="getData") {
  var data = [];
  var keys = js.findStoreKeys(".*");
  for(var i=0;i<keys.length;i++) {
    data.push( {key: ""+keys[i], value: ""+js.retrieveValue(keys[i])} );
  }
  
  result = {result: "ok", message: "Performed action "+action, data: data};
}

} catch(e) {
  transaction.sendJSON( JSON.stringify({result: "error",message: "Error:"+e+" on line "+e.lineNumber+" of "+e.sourceName}));
  return;
}
  
transaction.sendJSON( JSON.stringify(result) );
