var action = ""+transaction.getParameter("action");

if(action==="null") {
	transaction.setResult(transaction.SHOW_PAGE);
	return;
}

if(action==="push") {
  var queue = transaction.getParameter("queue");
  var message = transaction.getParameter("message");
  
  wiki.postMessageToQueue( queue,message );

  var timestamp = ""+wiki.getTimeStamp();
  
  transaction.sendJSON( JSON.stringify({result: "ok", timestamp: timestamp}) );
  
} else if(action==="pull") {
  var queue = transaction.getParameter("queue");
  var since = transaction.getParameter("since");
  
  var messages = wiki.getMessagesSince( queue,since );
  var messageData = [];
  for(var im in messages) {
    messageData.push(""+messages[im]);
  }
  
  var timestamp = ""+wiki.getTimeStamp();
 
  transaction.sendJSON( JSON.stringify({messages: messageData,timestamp: timestamp, result: "ok"}) );
  
} else if (action==="getTotalQueuedMessages") {
  var queueMonitor = js.getApi("/OpenForum/MessageQueue");
  
  var totalMessages = ""+queueMonitor.getTotalQueuedMessages();

  transaction.sendJSON( JSON.stringify({totalMessages: totalMessages }) );
  
} else {
  
  transaction.sendJSON( JSON.stringify( {result: "error", error: "action "+action+" not recognised"}) );
  
}
