var action = transaction.getParameter("action");
if(action===null) {
    transaction.setResult(transaction.SHOW_PAGE);
    return;
}

try{
action = ""+action;
result = {result: "error", message: "Action "+action+" not recognised."};

if(action==="runTrigger") {
  var pageName = "" + transaction.getParameter("pageName");
  var fileName = "" + transaction.getParameter("triggerFile");
  var error;
  
  var script = "" + file.getAttachment(pageName,fileName);
  var startTime = new Date().getTime();
  try{
    eval(script);
  } catch(e) {
    error = e;
  }
  var endTime = new Date().getTime();
  var timeTaken = endTime-startTime;
  
	result = {result: "ok", message: "Performed action "+action, pageName: pageName, fileName: fileName, timeTaken: timeTaken,error: error};
}
  
} catch(e) {
  transaction.sendJSON( JSON.stringify({result: "error",message: "Error:"+e+" on line "+e.lineNumber+" of "+e.sourceName}));
  return;
}
  
transaction.sendJSON( JSON.stringify(result) );
