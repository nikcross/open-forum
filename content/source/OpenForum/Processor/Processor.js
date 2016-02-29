/*
* Author: 
* Description: 
*/
if( typeof(MessageQueue)==="undefined" ) {
  OpenForum.loadScript("/OpenForum/MessageQueue/MessageQueue.js");
}

var Processor = function() {

  var self = this;
  var queue = new MessageQueue();
  var queueName = queue.getQueueName();

  self.processLine = function(line) {
    console.log(line);
  };

  queue.processMessages = function(messages) {
    for(var message in messages) {
      self.processLine(  messages[message].substring(messages[message].indexOf(":")+1) );
    }
  };

  queue.processError = function(error) {
    for(var message in messages) {
      self.processLine(  "Error: "+messages[message] );
    }
  };

  self.exec = function(command) {
    JSON.get("/OpenForum/Processor","runProcess","queue="+queueName+"&exec="+command).onSuccess(queue.processMessages).onError(queue.processError).go();
  };

  queue.startPolling(1000);
};