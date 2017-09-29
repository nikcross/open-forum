var action = transaction.getParameter("action");
if(action===null) {
  transaction.setResult(transaction.SHOW_PAGE);
  return;
}

try{
  action = ""+action;
  result = {result: "error", message: "Action "+action+" not recognised."};

  var processor = js.getApi("/OpenForum/Processor");

  if(action==="getThreads") {
    var processes = processor.getRunningProcesses();
    var threads = [];
    for(var i=0;i<processes.size();i++) {
      threads.push( ""+processes.get(i) );
    }

    result = {result: "ok", message: "Performed action "+action, threads: threads};
  } else if(action==="stopThread") {
    var threadId = ""+transaction.getParameter("threadId");

    var process = processor.getProcess(threadId);
    var stopped = false;
    var message = "Performed action "+action;
    if(process!==null) {
      stopped = process.stop();
    } else {
      message = "Thread "+threadId+" not found";
    }

    result = {result: "ok", message: message, threadId: threadId, stopped: stopped};
  }

} catch(e) {
  transaction.sendJSON( JSON.stringify({result: "error",message: "Error:"+e+" on line "+e.lineNumber+" of "+e.sourceName}));
  return;
}

transaction.sendJSON( JSON.stringify(result) );
