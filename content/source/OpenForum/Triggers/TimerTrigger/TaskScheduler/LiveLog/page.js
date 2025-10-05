/*
* Author: Admin 
*/
OpenForum.includeScript("/OpenForum/MessageQueue/MessageQueue.js");

OpenForum.init = function() {
  var messageQueue = new MessageQueue("/OpenForum/Triggers/TimerTrigger/TaskScheduler");
  messageQueue.processMessages = function(messages) {
    for(var i=0; i< messages.length; i++) {
      if( messages[i].indexOf("System:Processing")==0 ) {
        document.getElementById("log").innerHTML += "<br/>";
      }
      document.getElementById("log").innerHTML +=  messages[i] + "<br/>";
    }
  };
  messageQueue.startPolling(10000);
  document.getElementById("log").innerHTML = "Monitoring Task Scheduler Message Queue @ "+new Date()+"<br/>";
};
