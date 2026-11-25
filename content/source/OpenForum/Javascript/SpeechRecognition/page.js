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
  if(OpenForum.SpeechRecognition.isAvailable()==false) {
    alert("Speech recognition is not available in this browser at present.","Speech recognition is not available");
    return;
  }
  
  speechRecognition = new OpenForum.SpeechRecognition();

  speechRecognition.addCommand( "top", function(transcript) { say("TOP"); } );
  speechRecognition.addCommand( "bottom", function(transcript) { say("BOTTOM"); } );
  speechRecognition.addCommand( "left", function(transcript) { say("LEFT"); } );
  speechRecognition.addCommand( "right", function(transcript) { say("RIGHT"); } );
  speechRecognition.addCommand( "zoom", function(transcript) { say("ZOOM"); } );
  speechRecognition.addCommand( "back", function(transcript) { say("BACK "); } );
  speechRecognition.addCommand( "my name is {{name}}", function(transcript) { say("Hello "+transcript.values.name); } );

  speechRecognition.setStartCommand( "Hello Bob",function() { say("Well hello"); } );
  speechRecognition.setStopCommand( "Goodbye Bob", function() { say("Byee"); } );
  
  var commands = speechRecognition.getCommands();
  for(var i=0 ; i<commands.length ; i++) {
    commandList+="<br/>"+commands[i];
  }

  speechRecognition.setDebug(true);
  speechRecognition.start();

};

function say(message) {
  commandView+="<br/>"+message;
}
