transaction.getPostData();

var queue = transaction.getPostParameter("queue");
var message = transaction.getPostParameter("message");

wiki.postMessageToQueue( queue,message );

var timestamp = ""+wiki.getTimeStamp();

transaction.sendJSON( JSON.stringify( {result: "ok", timestamp: timestamp} ) );