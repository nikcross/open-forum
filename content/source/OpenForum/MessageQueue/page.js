OpenForum.loadScript("/OpenForum/MessageQueue/MessageQueue.js");

var queue = null;
var timer = null;

function startWatchingQueue() {
  
  queue = new MessageQueue(queueName);

  document.getElementById( "queueData" ).innerHTML = "Queue: " + queueName + "<br/>";

  queue.processMessages = function(messages) {
    for(var message in messages) {
		document.getElementById( "queueData" ).innerHTML += messages[message] + "<br/>";
    }
  };

  timer = setInterval( queue.pull , 1000 );

}