/*
* Author: Nik Cross
* Description: Functionality to add voice command to a web page.
* Can be used to bind functions to words and phrases
* Optional start and stop phrases can be added
*/

if(!OpenForum) {
  OpenForum = {};
}

function SpeechRecognition() {
  var self = this;
  var debug = false;
  var commands = [];

  var startCommand;
  var startFunction;
  var stopCommand;
  var stopFunction;

  var waitingCommand = true;
  var suspendCommand = false;
  var listen = false;
  var recognition;

  self.setDebug = function(state) {
    debug = state;
    if(debug) console.log("debug on");
  };

  self.isWaitingForCommand = function() {
    return waitingCommand;
  };

  self.setWaitingForCommand = function(state) {
    waitingCommand = state;
  };
  
  self.setSuspendCommand = function(state) {
    suspendCommand = state;
  };

  self.start = function() {
    listen = true;
    getSpeech();
  };

  self.stop = function() {
    if(waitingCommand && stopFunction) {
      stopFunction("");
    }
    listen = false;

    if( recognition ) recognition.abort();
  };

  self.setStartCommand = function(command,action) {
    startCommand = command.toLowerCase();
    startFunction = action;
    waitingCommand = false;
  };

  self.setStopCommand = function(command,action) {
    stopCommand = command.toLowerCase();
    stopFunction = action;
  };

  self.addCommand = function(command,action) {
    commands.push( {command: command.toLowerCase(), action: action} );
  };

  self.getCommands = function() {
    var commandList = [];

    if(startCommand) {
      commandList.push( startCommand+" (Start Command) " );
    }
    for(var i=0; i<commands.length;i++) {
      commandList.push( commands[i].command ); 
    }
    if(stopCommand) {
      commandList.push( stopCommand+" (Stop Command) " );
    }
    return commandList;
  };

  self.getStartCommand = function() {
    waitingCommand = false;
    return startCommand;
  };

  self.getStopCommand = function() {
    return stopCommand;
  };

  var getSpeech = function() {
    if( recognition ) recognition.abort();

    if(debug) console.log("New speech request");

    recognition = new webkitSpeechRecognition();
    recognition.lang = "en-GB";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = function(event) { processSpeech(event); };
    recognition.onnomatch = function() { console.log("On No Match"); };
    recognition.onend = function() { restartSpeech(); };
    recognition.start();

    if(debug) console.log("Waiting for speech");
  };

  self.processTranscript = function(transcript) {
    return false;
  };

  var onUnrecognised = function(transcript) {
    console.log("Did not recognise \""+transcript+"\" ");
  };

  var restartSpeech = function() {
    if(debug) console.log("Stopped");
    if(listen) {
      getSpeech();
    }
  };

  var processSpeech = function(speechEvent) {

    if( speechEvent.currentTarget !== recognition ) return;

    if(speechEvent.results[0][0].isFinal===false) return;

    var transcript = speechEvent.results[0][0].transcript.trim();
    var foundMatch = false;
    if(debug) console.log("Transcript: "+transcript);

    var transcriptLC = transcript.toLowerCase();

    if(suspendCommand && startCommand && transcriptLC.indexOf(startCommand)!=-1) {
      suspendCommand = false;
    }
    
    if(!waitingCommand && startCommand && transcriptLC.indexOf(startCommand)!=-1) {
      waitingCommand = true;
      if(startFunction) {
        startFunction(transcript);
      }
    } else if(waitingCommand && stopCommand && transcriptLC.indexOf(stopCommand)!=-1) {
      waitingCommand = false;
      if(stopFunction) {
        stopFunction(transcript);
      }
    }

    if(waitingCommand) {

      if(!suspendCommand) {
      for(var i=0; i<commands.length;i++) {
        if(commands[i].command.indexOf(" ")==-1) continue;
        if(transcriptLC.indexOf(commands[i].command)!=-1) {
          if(debug) console.log("Matched "+commands[i].command);
          commands[i].action(transcript);
          foundMatch=true;
        }
      }

      var words = transcriptLC.split(" ");
        for(var w in words) {
          var word = words[w];
          for(var i=0; i<commands.length;i++) {
            if(commands[i].command===word) {
              if(debug) console.log("Matched "+commands[i].command);
              commands[i].action(transcript);
              foundMatch=true;
            }
          }
        }
      }
      
      if(foundMatch===false) {
        if(self.processTranscript(transcript)===false) {
          onUnrecognised(transcript);
        }
      }
    }

    recognition.abort();
  };
}