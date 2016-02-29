function MessageQueue(queueName) {
  
  if( typeof(queueName)==="undefined" ) {
    queueName = JSON.parse( OpenForum.loadFile("/OpenForum/MessageQueue?action=createQueue") ).queue;
  }
  
  var queue = queueName;
  var timestamp = 0;
  var self = this;
  var waiting = false;
  
  var jsonProcessor = null;
  
  var pollTime = 5000;
  var polling = null;
  
  self.isWaiting = function() {
    return waiting;
  };
  
  self.startPolling = function(newPollTime) {
    if(newPollTime) {
      pollTime = newPollTime;
    }
    
    if(polling!==null) {
      clearInterval(polling);
    }
    polling = setInterval(self.pull,pollTime);
    self.pull();
  };
  
  self.push = function(message) {
      JSON.get("/OpenForum/MessageQueue","push","queue="+queue+"&message="+message).onSuccess(self.processPushResult).onError(self.processError).go();
  };
  
  self.pull = function() {
    if(waiting) return;
    
    waiting = true;
    try {
      JSON.get("/OpenForum/MessageQueue","pull","queue="+queue+"&since="+timestamp).onSuccess(self.processPullResult).onError(self.processError).go();
    } catch(e) {
      console.log(e);
      waiting = false;
    }
  };
  
  self.processPushResult = function(response) {
    timestamp = response.timestamp;
  };
  
  self.processPullResult = function(response) {
    waiting = false;
    timestamp = response.timestamp;
    self.processMessages(response.messages);
  };
  
  self.processError = function(error) {
    console.log(error);
  };
  
  self.processMessages = function(messages) {
    for(var i=0; i< messages.length; i++) {
          console.log(messages[i]);
    }
  };
  
  self.setAsJSONQueue = function( newJsonProcessor ) {
    jsonProcessor = newJsonProcessor;
    self.processMessages = processJSONMessages;
    self.push = pushJSON;
  };
  
  var pushJSON = function(json) {
      JSON.get("/OpenForum/MessageQueue","push","queue="+queue+"&message="+JSON.stringify(json)).onSuccess(self.processPushResult).onError(self.processError).go();
  };
  
  var processJSONMessages = function(messages) {
    for(var i=0; i< messages.length; i++) {
      var message = messages[i];
      var user = message.substring(0,message.indexOf(":"));
      var jsonMessage = message.substring(message.indexOf(":")+1);
      try{
        jsonMessage = JSON.parse( jsonMessage );
        jsonMessage.user = user;
        jsonProcessor( jsonMessage );
      } catch(e) {
        jsonMessage = {error: ""+e, user: user, message: message};
      }
      jsonProcessor(jsonMessage);
    }
  };
  
  self.getQueueName = function() {
    return queueName;
  };
}