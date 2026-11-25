
/*
* Author: 
*/
OpenForum.includeScript("/OpenForum/Javascript/VirtualAssistant/virtual-assistant.js");
OpenForum.includeScript("/OpenForum/Javascript/VirtualAssistant/sound-monitor.js");
var assistant;
var speechPack;

OpenForum.init = function() {
  var param = OpenForum.getParameter("speechPack");
  if(param!="") {
    speechPack = param;
  }
};

function loadAssistant() {
  if(assistant) return;
  assistant = new VirtualAssistant(speechPack);

  assistant.addSpeechListener( display );
  assistant.log = displayHeard;
  soundMonitor = new SoundMonitor(assistant,"canvas");
  if(speechPack) {
  } else {
    loadTestAssistant();
  }
}

function loadTestAssistant() {
  assistant = new VirtualAssistant("/OpenForum/Javascript/VirtualAssistant/config.json");

  assistant.addSpeechListener( display );
  assistant.log = displayHeard;
  assistant.loadSpeechPack("/OpenForum/Javascript/VirtualAssistant/disk-space.json");
  assistant.loadSpeechPack("/OpenForum/Javascript/VirtualAssistant/time.json");
  soundMonitor = new SoundMonitor(assistant,"canvas");
};

function doCheck(match,replyTemplate) {
  console.log("Checking "+JSON.stringify(match));
  return false;
}

function doCatch(match,replyTemplate) {
  console.log("Catch "+JSON.stringify(match));
  return false;
}

function multiply(match,replyTemplate) {
  var result = parseFloat(match.values[0]) * parseFloat(match.values[1]);
  match.values[2] = result ;
  assistant.say( replyTemplate,match.values );
}

function display(message) {
  var conversation = document.getElementById("conversation");
  conversation.innerHTML += "<p class='panel callout radius' style='width: 80%; float: right;'>"+message+"</p>";
  conversation.scrollTop = conversation.scrollHeight;
}

function displayHeard(message) {
  conversation.innerHTML += "<p class='panel radius' style='width: 80%; float: left;'>"+message+"</p>";
  conversation.scrollTop = conversation.scrollHeight;
  document.getElementById("message").value = "";
}

function sendTypedMessage(keyCode) {
  if(keyCode!==13) return;
  var message = document.getElementById("message").value;
  assistant.hear(message);
}
