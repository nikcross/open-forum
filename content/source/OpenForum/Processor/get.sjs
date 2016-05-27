var action = transaction.getParameter("action");
if( action===null ) {
  transaction.setResult(transaction.SHOW_PAGE);
  return;
}

try{
  action = ""+action; // Cast to String
  result = {error: "action "+action+" not recognised"};
  var processor = js.getApi("/OpenForum/Processor");

  if(action === "runProcess") {
    var exec = "" + transaction.getParameter("exec");
    var queue = transaction.getParameter("queue");
    var async = false;
    if(queue!==null) {
      async = true;
      queue = ""+queue;
    }

    openForum.postMessageToQueue(queue,"Running Process "+exec);
    process = processor.createProcess(exec);
    if(async===true) {
      process.
      onMatch( ".*","(function(text) { openForum.postMessageToQueue(\""+queue+"\",text); })" ).
      onEnd("(function(code) { openForum.postMessageToQueue(\""+queue+"\",\"Process Stopped "+exec+" code:\"+code); })").
      run(false);

      result = JSON.stringify( {result: "ok"} );
    } else {
      var response = process.run(true);

      result = {result: "ok", response: ""+response};
    }
  } else {
    result = "action not recognised";
  }

  transaction.sendJSON( JSON.stringify(result) );

} catch(e) {
  transaction.sendJSON( JSON.stringify({result: "error",message: "Error:"+e+" on line "+e.lineNumber+" of "+e.sourceName}));
  return;
}
