var action = ""+transaction.getParameter("action");

if(action==="null") {
	transaction.setResult(transaction.SHOW_PAGE);
	return;
}

if(action==="push") {
  var queue = transaction.getParameter("queue");
  var message = transaction.getParameter("message");
  
  wiki.postMessageToQueue( queue,message );
  transaction.sendPage('{"result": "ok", "timestamp":'+wiki.getTimeStamp()+'}');
  
} else if(action==="pull") {
  var queue = transaction.getParameter("queue");
  var since = transaction.getParameter("since");
  
  var messages = wiki.getMessagesSince( queue,since );
  var messageData = "";
  for(var im in messages) {
    if(messageData.length>0) {
      messageData+=",";
    }
    messageData+='"'+messages[im]+'"';
  }
  
  transaction.sendPage('{"messages": ['+messageData+'],"timestamp":'+wiki.getTimeStamp()+',"result": "ok"}');
} else if (action==="getTotalQueuedMessages") {
  var queueMonitor = js.getApi("/OpenForum/MessageQueue");
  transaction.sendPage('{totalMessages: '+queueMonitor.getTotalQueuedMessages()+'}');
} else {
  transaction.sendPage('{"result": "error", "error": "action '+action+' not recognised"}');
}
