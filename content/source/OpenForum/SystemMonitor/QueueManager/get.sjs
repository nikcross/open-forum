var action = transaction.getParameter("action");
if(action===null) {
    transaction.setResult(transaction.SHOW_PAGE);
    return;
}

try{
action = ""+action;
result = {result: "error", message: "Action "+action+" not recognised."};

var queueManager = js.getApi("/OpenForum/SystemMonitor/QueueManager");
  
if(action==="getTotalQueuedMessages") {
  var total = ""+queueManager.getTotalQueuedMessages();
  
  result = {result: "ok", totalQueuedMessages: total};
} else if(action==="getQueues") {
  
  var total = ""+queueManager.getTotalQueuedMessages();
  var names = queueManager.getQueueNames();
  var queues = [];
  
  for(var i=0;i<names.length;i++) {
    var messages = queueManager.getMessagesInQueue(names[i]);
    
    queues.push( {name: ""+names[i], messages: messages} );
  }
  
  result = {result: "ok", totalQueuedMessages: total, queues: queues};
} else if(action==="clearQueue") {
  var queueName = ""+transaction.getParameter("queue");
  
  queueManager.getQueue(queueName).setEmpty();
  
  result = {result: "ok", queue: queueName, message: "Cleared "+queueName};
}

} catch(e) {
  transaction.sendJSON( JSON.stringify({result: "error",message: "Error:"+e+" on line "+e.lineNumber+" of "+e.sourceName}));
  return;
}
  
transaction.sendJSON( JSON.stringify(result) );
