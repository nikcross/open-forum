function MessageQueue(queueName) {
  
  if( typeof(queueName)==="undefined" ) {
    queueName = JSON.parse( OpenForum.loadFile("/OpenForum/MessageQueue?action=createQueue") ).queue;
  }
  
  var queue = queueName;
  var timestamp = 0;
  var self = this;
  
  this.push = function(message) {
      JSON.get("/OpenForum/MessageQueue","push","queue="+queue+"&message="+message).onSuccess(self.processPushResult).onError(self.processError).go();
  };
  
  this.pull = function() {
      JSON.get("/OpenForum/MessageQueue","pull","queue="+queue+"&since="+timestamp).onSuccess(self.processPullResult).onError(self.processError).go();
  };
  
  this.processPushResult = function(response) {
    timestamp = response.timestamp;
  };
  
  this.processPullResult = function(response) {
    timestamp = response.timestamp;
    self.processMessages(response.messages);
  };
  
  this.processError = function(error) {
    console.log(error);
  };
  
  this.processMessages = function(messages) {
    for(var message in messages) {
          console.log(messages[message]);
    }
  };
  
  this.getQueueName = function() {
    return queueName;
  };
}