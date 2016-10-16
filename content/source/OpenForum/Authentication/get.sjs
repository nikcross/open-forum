var action = transaction.getParameter("action");
if(action===null) {
    transaction.setResult(transaction.SHOW_PAGE);
    return;
}

try{
action = ""+action;
result = {result: "error", message: "Action "+action+" not recognised."};

if(action==="getHash") {
  var siteHash = ""+file.getAttachment("/OpenForum/Authentication","authentication.hash.b");
  result = {result: "ok", hash: siteHash};
}

} catch(e) {
  transaction.sendJSON( JSON.stringify({result: "error",message: "Error:"+e+" on line "+e.lineNumber+" of "+e.sourceName}));
  return;
}
  
transaction.sendJSON( JSON.stringify(result) );
