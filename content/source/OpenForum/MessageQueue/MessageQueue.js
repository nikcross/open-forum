function MessageQueue(queueName) {

  if( typeof(queueName)==="undefined" ) {
    queueName = JSON.parse( OpenForum.loadFile("/OpenForum/MessageQueue?action=createQueue") ).queue;
  }

  var queue = queueName;
  var timestamp = 0;
  var self = this;
  var waiting = false;
  var waitingResponse = false;

  var jsonProcessor = null;

  var adaptivePollingConfig;
  var pollTime = 5000;
  var polling = false;
  var pollingInterval = null;

  self.isWaiting = function() {
    return waiting;
  };

  self.clearTimestamp = function() {
    timestamp = new Date().getTime();
  };

  self.setAdaptivePolling = function(newAdaptivePollingConfig) {
    if(newAdaptivePollingConfig) {
      adaptivePollingConfig = newAdaptivePollingConfig;
    } else {
      adaptivePollingConfig = {
        minPollingTime: 2000,
        maxPollingTime: 20000,
        reductionTime: 500
      };
    }
    self.startPolling(adaptivePollingConfig.minPollingTime);
  };

  self.stopPolling = function() {
    polling = false;
    if(pollingInterval!==null) {
      clearInterval(pollingInterval);
    }
  };

  self.startPolling = function(newPollTime) {
    polling = true;

    if(newPollTime) {
      pollTime = newPollTime;
    }

    if(pollingInterval!==null) {
      clearInterval(pollingInterval);
    }
    pollingInterval = setInterval( self.pull, pollTime);
    self.pull();
  };

  self.isWaitingResponse = function() {
    return waitingResponse;
  };

  self.push = function(message) {
    waitingResponse = true;
    OFX.get("/OpenForum/MessageQueue")
      .withAction("push")
      .withData({ queue:queue, message: message})
      .onSuccess(
      function(response) {
        self.processPushResult(response);
        waitingResponse = false;
      }
    ).onError(self.processError).go();
    if(adaptivePollingConfig && adaptivePollingConfig!==null) {
      pollTime = adaptivePollingConfig.minPollingTime;
      self.startPolling();
    }
  };

  self.pull = function() {
    if(waiting) return;

    waiting = true;
    try {
      OFX.get("/OpenForum/MessageQueue")
        .withAction("pull")
        .withData( {queue: queue, since: timestamp})
        .onSuccess(preprocessPullResult)
        .onError(self.processError)
        .go();
    } catch(e) {
      console.log(e);
      waiting = false;
    }
  };

  var preprocessPullResult = function(response) {
    if(!response || !response.messages || typeof response.messages.length == "undefined") {
      console.log("Pull result error.");
      if(adaptivePollingConfig && adaptivePollingConfig!==null) {
        pollTime = adaptivePollingConfig.maxPollingTime;
        self.startPolling();
      }
      waiting = false;
      return ;
    }

    var hasMessages = response.messages.length > 0;

    if(adaptivePollingConfig && adaptivePollingConfig!==null) {
      if(hasMessages) {
        pollTime = adaptivePollingConfig.minPollingTime;
        self.startPolling();
      } else {
        pollTime += adaptivePollingConfig.reductionTime;
        if(pollTime>adaptivePollingConfig.maxPollingTime) {
          pollTime = adaptivePollingConfig.maxPollingTime;
        }
        self.startPolling();
      }
    }

    self.processPullResult(response);
  };

  self.processPushResult = function(response) {
    //timestamp = response.timestamp;
  };

  self.processPullResult = function(response) {
    waiting = false;
    timestamp = response.timestamp;
    self.processMessages(response.messages);

    waiting = false;
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
    OFX.get("/OpenForum/MessageQueue")
      .withAction("push")
      .withData({queue: queue, message: JSON.stringify(json)})
      .onSuccess(self.processPushResult)
      .onError(self.processError)
      .go();
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
    }
  };

  self.setQueueName = function(newQueueName) {
    queueName = newQueueName;
    queue = newQueueName;
  };

  self.getQueueName = function() {
    return queueName;
  };

  self.getPollTime = function() {
    return pollTime;
  };
}