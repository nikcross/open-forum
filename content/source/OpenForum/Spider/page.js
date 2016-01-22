OpenForum.loadScript("/OpenForum/MessageQueue/MessageQueue.js");

var queue = null;
var timer = null;
var message = null;

OpenForum.init = function() {
  
  var queueName = "/OpenForum/Spider";
  queue = new MessageQueue(queueName);

  queue.processMessages = function(messages) {
    for(var message in messages) {
		document.getElementById( "queueData" ).innerHTML += messages[message].substring(messages[message].indexOf(":")+1) + "\n";
    }
  };

  timer = setInterval( queue.pull , 1000 );
};

function runSpider() {
  document.getElementById( "queueData" ).innerHTML = "Starting\n\n";
  JSON.get("/OpenForum/Spider","crawl","").go();
}

function stopSpider() {
  document.getElementById( "queueData" ).innerHTML = "Requesting stop\n\n";
  JSON.get("/OpenForum/Spider","stop","").go();
}

function clearLog() {
  document.getElementById( "queueData" ).innerHTML = "Cleared\n\n";
}