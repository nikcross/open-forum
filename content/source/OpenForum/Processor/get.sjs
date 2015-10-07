var action = transaction.getParameter("action");
if( action===null ) {
	transaction.setResult(transaction.SHOW_PAGE);
  return;
}

  action = ""+action; // Cast to String
  result = {error: "action "+action+" not recognised"};
  var processor = js.getApi("/OpenForum/Processor");
  
  if(action === "runProcess") {
  var exec = "" + transaction.getParameter("exec");
  var queue = "" +  transaction.getParameter("queue");
    
    process = processor.createProcess(exec);
    process.onMatch( "\n","function(text) { postMessageToQueue(\""+queue+"\",text); }" ).run();
    
    result = JSON.stringify( {result: "ok"} );
  } else {
  	result = "action not recognised";
  }

  transaction.sendPage( result );