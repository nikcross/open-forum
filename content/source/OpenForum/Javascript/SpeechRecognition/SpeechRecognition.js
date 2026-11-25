/*
  * Author: Nik Cross
  * Description: Functionality to add voice command to a web page.
  * Can be used to bind functions to words and phrases
  * Optional start and stop phrases can be added
  */

if(!OpenForum) {
  OpenForum = {};
}

OpenForum.SpeechRecognition = function() {
  var self = this;
  var debug = false; // Debug to console
  var commands = []; // Array of commands to match

  var startCommand; // Command to start processing transcripts
  var startFunction; // Function to call when starting to process transcripts
  var stopCommand; // Command to stop processing transcripts
  var stopFunction; // Function to call when transcript processing stops

  var waitingCommand = true; // Waiting for command to be said
  var suspendCommand = false; // Don't process commands (set externally by code)
  var listen = false; // Listen for speech
  var recognition; // Speech recognition service

  var heardSpeech = false; // Speech has been heard (transcript not empty)
  var emptyPeriods = 0; // Number of consecutive times transcript has been empty
  var unrecognisedCount = 0; // Number of times transcript has not been recognised

  var sleepTimer; // Timer for recognition to sleep (stop)
  var sleepOnSilenceTime; // Length of silence to send to sleep
  var wakeOnNoise; // Volume of sound to wake
  var sleepOnUnrecognsedCount; // Number of unrecognised transcripts to send to sleep

  var waitingResult = false; //Stop multiple listen threads
  var speaking = false; //Keep track of speaking

  var audioMonitor; // Audio monitor used to listen for sound to wake recognition
  
  var isAvailable = function() {
    if(typeof SpeechRecognition != "undefined") {
      return true;
    } else if(typeof webkitSpeechRecognition != "undefined") {
      return true;
    } else {
      return false;
    }
  };

  self.getAudioMonitor = function() {
    return audioMonitor;
  };
  
  self.isListening = function() {
    return listen;
  };
  
  self.setSleepOnSilence = function(time) {
    sleepOnSilenceTime = time;
  };

  self.setWakeOnNoise = function(volume) {
    wakeOnNoise = volume;
  };

  self.setSleepOnUnrecognised = function(count) {
    sleepOnUnrecognsedCount = count;
  };

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
    if(listen==true) return;
    listen = true;
    var oldListenState = listen;
    if(typeof(OpenForum.Speech)!="undefined") {
      OpenForum.Speech.stoppedSay = function() {
        speaking = false;
        if(oldListenState==true) {
          listen = true;
          if(debug) console.log("Listening");
        }
        if(listen==true && isAvailable()) {
          if(isAvailable()) {
            clearTimeout(sleepTimer);
            if(sleepOnSilenceTime) {
              sleepTimer = setTimeout( function(){
                if(debug) console.log("Stopped at silence timeout (3)");
                self.stop(true); 
              }, sleepOnSilenceTime);
            }
            getSpeech();
          }
        }
      };
      var _startedSay = OpenForum.Speech.startedSay;
      OpenForum.Speech.startedSay = function(message) {
        speaking = true;
        oldListenState = listen;
        _startedSay(message);
        listen = false;
        if(debug) console.log("Not listening");
        if(recognition) recognition.abort();
      };
    }

    if(isAvailable()) {
      clearTimeout(sleepTimer);
      if(sleepOnSilenceTime) {
        sleepTimer = setTimeout( function(){
          if(debug) console.log("Stopped at silence timeout (4)");
          self.stop(true); 
        }, sleepOnSilenceTime);
      }
      getSpeech();
    }
  };

  self.stop = function(silent) {
    if(listen==false) return;
    if(waitingCommand && stopFunction && !silent) {
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

  self.clearCommands = function() {
    commands = [];
  };

  self.addCommand = function(command,action,insert) {
    if(insert) {
    	commands.splice( 0,0,{command: command.toLowerCase(), action: action} );
    } else {
    	commands.push( {command: command.toLowerCase(), action: action} );
    }
    if(debug) console.log("Added command "+command);
  };

  self.addCommandAlias = function(command,alias,insert) {
    for(var i in commands) {
      if(commands[i].command == command) {
        if(debug) console.log("Added command alias "+alias+" for command "+command);
        if(insert) {
        	commands.splice( 0,0,{command: alias, action: commands[i].action} );
        } else {
        	commands.push( {command: alias, action: commands[i].action} );
        }
      }
    }
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
    if(waitingResult) return;
    if( recognition ) recognition.abort();
    if(listen==false) return;

    heardSpeech = false;
    if(debug) console.log("New speech request");

    if(typeof SpeechRecognition != "undefined") {
      recognition = new SpeechRecognition();
    } else if(typeof webkitSpeechRecognition != "undefined") {
      recognition = new webkitSpeechRecognition();
    } else {
      throw "Speech Recognition not available in this browser.";
    }
    try{
      recognition.lang = "en-GB";
      recognition.continuous = false;
      recognition.interimResults = false;
    } catch(e) {
      console.log(e);
    }
    waitingResult = true;
    recognition.onresult = function(event) { processSpeech(event); };
    recognition.onnomatch = function() { if(debug) console.log("No Match"); };
    recognition.onend = function() {
      waitingResult = false;
      restartSpeech();
    };
    recognition.start();

    if(debug) console.log("Waiting for speech");
  };

  self.processTranscript = function(transcript) {
    return false;
  };

  self.preProcessTranscript = function(transcript) {
    return transcript;
  };

  self.onUnrecognised = function(transcript) {
    if(debug) console.log("Did not recognise \""+transcript+"\" ");
  };

  var restartSpeech = function() {
    if(debug) console.log("Stopped");
    if(heardSpeech==false) {
      emptyPeriods++;
    } else {
      emptyPeriods = 0;
      clearTimeout(sleepTimer);
      if(sleepOnSilenceTime) {
        sleepTimer = setTimeout( function(){
          if(debug) console.log("Stopped at silence timeout (2)");
          self.stop(true); 
        }, sleepOnSilenceTime);
      }
    }

    if(listen && isAvailable()) {
      getSpeech();
    }
  };

  self.processSpeech = function(text) {
    var transcript = self.preProcessTranscript(text);
    processTranscript(transcript);
  };

  var processSpeech = function(speechEvent) {

    if( speechEvent.currentTarget !== recognition ) return;

    if(speechEvent.results[0][0].isFinal===false) return;

    var transcript = speechEvent.results[0][0].transcript.trim();
    transcript = self.preProcessTranscript(transcript);
    if(!transcript) {
      if(recognition) recognition.abort();
      emptyPeriods++;
      return;
    } else {
      emptyPeriods = 0;
      clearTimeout(sleepTimer);
      if(sleepOnSilenceTime) {
        sleepTimer = setTimeout( function(){
          if(debug) console.log("Stopped at silence timeout (1)");
          self.stop(true); 
        }, sleepOnSilenceTime);
      }
    }

    processTranscript(transcript);
  };

  var match = function(text,pattern) {
    var parts = text.toLowerCase().split(/ /g);
    var testParts = pattern.split(/ /g);
    var p = 0;
    var t = 0;
    var paramIndex = 0;
    var values = {};
    var key = null;
    for(t = 0; t < testParts.length && p < parts.length; t++) {
      if ((testParts[t].length>4 && testParts[t].substring(0, 2) == "{{") || testParts[t]=="*") {
        //read until matches next testPart
        if(testParts[t]=="*") {
          key = paramIndex;
          paramIndex++;
        } else {
          key = testParts[t].substring(2, testParts[t].length - 2);
        }
        t++;
        var nextPart = "";
        if(t<testParts.length) nextPart = testParts[t];
        var value = "";
        while (p < parts.length && parts[p] != nextPart) {
          if(value.length>0) value += " ";
          value += parts[p];
          p++;
        }
        values[key] = value;
      } else {
        if (testParts[t] != parts[p]) {
          break; //No match
        }
      }
      p++;
    }
    if (t >= testParts.length && p >= parts.length) {
      //console.log( "t:"+t+" p:"+p );
      return {text: text, values: values, match: pattern};
    } else {
      //console.log("nada");
      return null;
    }
  };

  var processTranscript = function (transcript) {
    transcript = transcript.trim();
    var parts = transcript.toLowerCase().split(/[^a-z0-9 ]/g);
    if(parts.length>1) {
      for(var i in parts) {
        if(parts[i].length==0) continue;
        processTranscript(parts[i]);
      }
      return;
    }
    
    var foundMatch = false;
    heardSpeech = true;
    if(debug) console.log("Transcript: "+transcript);

    if(suspendCommand && startCommand && match(transcript,startCommand) ) {
      suspendCommand = false;
    }

    if(!waitingCommand && startCommand && match(transcript,startCommand)) {
      //Start command has been said
      // start waiting for speech
      waitingCommand = true;
      if(startFunction) {
        startFunction(match(transcript,startCommand));
        if(recognition) recognition.abort();
        return;
      }
    } else if(waitingCommand && stopCommand && match(transcript,stopCommand)) {
      //Stop command has been said
      // stop waiting for speech (except start command)
      waitingCommand = false;
      if(stopFunction) {
        stopFunction(match(transcript,stopCommand));
        if(recognition) recognition.abort();
        return;
      }
    }

    if(waitingCommand) {

      if(!suspendCommand) {

        for(var i=0; i<commands.length;i++) {
          var matchResult = match(transcript,commands[i].command);
          if(matchResult) {
            var result = commands[i].action( matchResult );
            if(result!==false) {
                foundMatch = true;
            	break;
            }
          }
        }
      }

      if(foundMatch===false) {
        if(self.processTranscript(transcript)===false) {
          
          if(transcript.indexOf(" and ")>1) {
            var parts = transcript.split(" and ");
            for(p in parts) {
            	processTranscript( parts[p] );
            }
            return;
          }
          
          unrecognisedCount++;
          self.onUnrecognised(transcript);

          if(sleepOnUnrecognsedCount && unrecognisedCount>=sleepOnUnrecognsedCount) {
            if(debug) console.log("Stopped at unrecognisedCount");
            unrecognisedCount = 0;
            self.stop(true);
          }
        } else {
          unrecognisedCount=0;
        }
      } else {
      }
    }

    if(recognition) recognition.abort();
  };

  var volume = 0;
  var setVolume = function(newVolume) {
    volume = newVolume;
    if(wakeOnNoise && volume>=wakeOnNoise && listen==false && speaking==false) {
      if(debug) console.log("Started on sound");
      clearTimeout(sleepTimer);
      self.start();
    }
  };

  self.getVolume = function() {
    return volume;
  };

  DependencyService.createNewDependency()
    .addDependency("/OpenForum/Javascript/AudioMonitor/AudioMonitor.js")
    .setOnLoadTrigger( 
    function() {
      audioMonitor = new AudioMonitor();
      audioMonitor.addListener( setVolume );
    }
  ).loadDependencies();
};

OpenForum.SpeechRecognition.isAvailable = function() {
  if(typeof SpeechRecognition != "undefined") {
    return true;
  } else if(typeof webkitSpeechRecognition != "undefined") {
    return true;
  } else {
    return false;
  }
};