/*
* Author: 
*/

var totalQueuedMessages = "Loading";
var queues = [];

OpenForum.init = function() {
  setInterval(updateState,1000,1000);
};

function updateState() {
  JSON.get("/OpenForum/SystemMonitor/QueueManager","getQueues").onSuccess( displayQueues ).go();
}

function displayQueues(response) {
  totalQueuedMessages = response.totalQueuedMessages;
  queues = response.queues;
}
