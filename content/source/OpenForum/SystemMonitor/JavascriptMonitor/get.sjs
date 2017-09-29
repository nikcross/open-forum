var action = transaction.getParameter("action");
if(action===null) {
    transaction.setResult(transaction.SHOW_PAGE);
    return;
}

try{
action = ""+action;
result = {result: "error", message: "Action "+action+" not recognised."};

if(action==="getThreads") {
  var threadIds = js.getRunningThreads();
  var list = [];
  for(var i=0;i<threadIds.size();i++) {
    list.push( ""+threadIds.get(i) );
  }
  
	result = {result: "ok", message: "Performed action "+action, threads: list};
} else if(action==="stopThread") {
	var threadId = ""+transaction.getParameter("threadId");    
  var stopped = js.stopThread(threadId);  
  
	result = {result: "ok", message: "Performed action "+action, threadId: threadId, stopped: stopped};
}
  
} catch(e) {
  transaction.sendJSON( JSON.stringify({result: "error",message: "Error:"+e+" on line "+e.lineNumber+" of "+e.sourceName}));
  return;
}
  
transaction.sendJSON( JSON.stringify(result) );
