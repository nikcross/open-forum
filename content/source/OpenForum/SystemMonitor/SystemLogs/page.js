OpenForum.loadScript("/OpenForum/MessageQueue/MessageQueue.js");

var errorQueue;
var infoQueue;
var debugQueue;
var warningQueue;
var testQueue;
var timer;

OpenForum.init = function() {
  
  errorQueue = new MessageQueue("/OpenForum/System.error");
  augmentQueue(errorQueue);
  
  infoQueue = new MessageQueue("/OpenForum/System.info");
  augmentQueue(infoQueue);
  
  debugQueue = new MessageQueue("/OpenForum/System.debug");
  augmentQueue(debugQueue);
  
  warningQueue = new MessageQueue("/OpenForum/System.warning");
  augmentQueue(warningQueue);
  
  testQueue = new MessageQueue("/OpenForum/System.test");
  augmentQueue(testQueue);
  
  timer = setInterval( function() {
    errorQueue.pull();
    infoQueue.pull();
    debugQueue.pull();
    warningQueue.pull();
    testQueue.pull();
  }, 5000, 200 );
};

function augmentQueue(queue) {
  queue.messages = [];
  queue.messages.push({text: "Started at " + new Date()});
  queue.messageCount = "Loading...";
  queue.processMessages = function(newMessages) {
    
      if(this.messageCount==="Loading...") {
        this.messageCount=0;
      }
    
    for(var i in newMessages) {
      
      this.messages.push({text: newMessages[i]});
      
      this.messageCount++;
      
      while(this.messages.length>20) {
        this.messages.shift();
      }
    }
  };
}