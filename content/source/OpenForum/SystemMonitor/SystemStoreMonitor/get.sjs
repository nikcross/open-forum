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
    var keys = openForum.findStoreKeys(".*");
    for(var i=0;i<keys.length;i++) {
      var value = null;
      try{
      	value = openForum.retrieveValue(keys[i]);
      } catch (e) {}
      if(value==null) {
        value = openForum.retrieveObject(keys[i]);
        if(value!=null) {
          data.push( {key: ""+keys[i], object: ""+value} );
        } else {
          data.push( {key: ""+keys[i], value: "null"} );
        }
      } else {
        data.push( {key: ""+keys[i], value: ""+openForum.retrieveValue(keys[i])} );
      }
    }

    result = {result: "ok", message: "Performed action "+action, data: data};
  }

} catch(e) {
  transaction.sendJSON( JSON.stringify({result: "error",message: "Error:"+e+" on line "+e.lineNumber+" of "+e.sourceName}));
  return;
}

transaction.sendJSON( JSON.stringify(result) );
