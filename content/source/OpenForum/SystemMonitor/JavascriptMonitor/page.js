/*
* Author: 
*/
var threads = [];

OpenForum.init = function() {
  updateThreads();
};

function updateThreads() {
  JSON.get("/OpenForum/SystemMonitor/JavascriptMonitor","getThreads").onSuccess( setThreads ).go();
}

function setThreads(response) {
  threads = response.threads;
  
  setTimeout(updateThreads,5000);
}


function stopThread(threadId) {
  JSON.get("/OpenForum/SystemMonitor/JavascriptMonitor","stopThread","threadId="+threadId).onSuccess(updateThreads).go();
}