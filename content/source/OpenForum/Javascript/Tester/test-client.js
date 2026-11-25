OpenForum.loadScript("/OpenForum/MessageQueue/MessageQueue.js");

var queue = null;
var timer = null;
var message = null;
var testPageName = "";
var testFileName = "";

OpenForum.init = function() {
  testPageName = pageName;
  testFileName = "";
  
  var queueName = "/OpenForum/Javascript/Tester";
  queue = new MessageQueue(queueName);

  queue.processMessages = function(messages) {
    for(var message in messages) {
		document.getElementById( "queueData" ).innerHTML += messages[message].substring(messages[message].indexOf(":")+1) + "\n\n";
    }
  };

  timer = setInterval( queue.pull , 1000 );
};

function runTest() {
  document.getElementById( "queueData" ).innerHTML = "Starting\n\n";
  JSON.get("/OpenForum/Javascript/Tester","runTest","").go();
}