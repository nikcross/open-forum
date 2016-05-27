OpenForum.loadScript("/OpenForum/MessageQueue/MessageQueue.js");

var queue = null;
var timer = null;
var queueName = null;

OpenForum.init = function() {
  queueName = OpenForum.getParameter("queue");
  if(queueName) {
    startWatchingQueue();
    document.getElementById( "queueName" ).value = queueName;
  }
};

function startWatchingQueue() {
  
  if(queue) {
    queue.stopPolling();
  }
  
  queue = new MessageQueue(queueName);

  document.getElementById( "queueData" ).innerHTML = "Queue: " + queueName + "<br/>";

  queue.processMessages = function(messages) {
    for(var message in messages) {
		document.getElementById( "queueData" ).innerHTML += messages[message] + "<br/>";
    }
  };

  queue.startPolling();

}

function clear() {
  document.getElementById( "queueData" ).innerHTML="";
}