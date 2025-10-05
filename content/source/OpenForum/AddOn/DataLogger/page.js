/*
* Author: Nik Cross
*/
OpenForum.includeScript("/OpenForum/MessageQueue/MessageQueue.js");
OpenForum.includeScript("/OpenForum/AddOn/DataLogger/data-logger.js");
var messagesView = "Loading...";

OpenForum.init = function() {
  var messageQueue = new MessageQueue("/OpenForum/AddOn/DataLogger");
    messageQueue.processMessages = function(messages) {
    for(var i=0; i< messages.length; i++) {
          messagesView += "\n" + messages[i];
    }
  };
  messageQueue.startPolling(10000);
  messagesView = "Monitoring Message Queue @ "+new Date();
};

function sendTestDataLog() {
  var device = OpenForum.DataLogger.createDevice("DataLogger","OpenForum","Server");
  var post = new Post();
  post.addItem("value","test");
  OpenForum.DataLogger.logData( device,post,showSuccess );
}

function sendTestDataStore() {
  var device = OpenForum.DataLogger.createDevice("DataLogger","OpenForum","Server");
  var post = new Post();
  post.addItem("value","test");
  OpenForum.DataLogger.storeData( device,post,showSuccess );
}

function showSuccess() {
  alert("pass");
}