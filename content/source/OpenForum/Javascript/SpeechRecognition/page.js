/*
* Author: 
*/
OpenForum.includeScript("/OpenForum/Javascript/SpeechRecognition/SpeechRecognition.js");

var commandList = "Command List\n";
var commandView = "Command View\n";
var commands = [];
var recognition;
var speechRecognition;

OpenForum.init = function() {
  speechRecognition = new SpeechRecognition();

  speechRecognition.addCommand( "top", function(transcript) { say("TOP"); } );
  speechRecognition.addCommand( "bottom", function(transcript) { say("BOTTOM"); } );
  speechRecognition.addCommand( "left", function(transcript) { say("LEFT"); } );
  speechRecognition.addCommand( "right", function(transcript) { say("RIGHT"); } );
  speechRecognition.addCommand( "zoom", function(transcript) { say("ZOOM"); } );
  speechRecognition.addCommand( "back", function(transcript) { say("BACK "+transcript); } );

  speechRecognition.setStartCommand( "Hello Lexi",function() { say("Well hello"); } );
  speechRecognition.setStopCommand( "Goodbye Lexi", function() { say("Byee"); } );
  
  var commands = speechRecognition.getCommands();
  for(var i=0 ; i<commands.length ; i++) {
    commandList+="\n"+commands[i];
  }

  speechRecognition.setDebug(true);
  speechRecognition.start();

};

function say(message) {
  commandView+="\n"+message;
}
