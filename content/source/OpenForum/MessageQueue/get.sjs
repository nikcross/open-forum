var action = ""+transaction.getParameter("action");

if(action==="null") {
  transaction.setResult(transaction.SHOW_PAGE);
  return;
}

try{
  if(action==="createQueue") {
    var id = ""+openForum.createQueue();

    transaction.sendJSON( JSON.stringify({result: "ok", queue: id}) );

  } else if(action==="push") {
    var queue = transaction.getParameter("queue");
    var message = transaction.getParameter("message");

    openForum.postMessageToQueue( queue,message );

    var timestamp = ""+openForum.getTimeStamp();

    transaction.sendJSON( JSON.stringify({result: "ok", timestamp: timestamp}) );

  } else if(action==="pull") {
    var queue = transaction.getParameter("queue");
    var since = transaction.getParameter("since");

    var messages = openForum.getMessagesSince( queue,since );
    var messageData = [];
    if(messages!=null) {
      for(var im in messages) {
        messageData.push(""+messages[im]);
      }
    }

    var timestamp = ""+openForum.getTimeStamp();

    transaction.sendJSON( JSON.stringify({messages: messageData,timestamp: timestamp, result: "ok"}) );

  } else if (action==="getTotalQueuedMessages") {
    var queueMonitor = js.getApi("/OpenForum/MessageQueue");

    var totalMessages = ""+queueMonitor.getTotalQueuedMessages();

    transaction.sendJSON( JSON.stringify({totalMessages: totalMessages }) );

  } else {

    transaction.sendJSON( JSON.stringify( {result: "error", error: "action "+action+" not recognised"}) );

  }

} catch(e) {
  transaction.sendJSON( JSON.stringify({result: "error",message: "Error:"+e+" on line "+e.lineNumber+" of "+e.sourceName}));
  return;
}