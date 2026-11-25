/*
* Author: 
* Description: 
*/

var VirtualAssistant = function(config) {
  var self = this;

  if(typeof config == "string") { // if the config is a string, assume it is a config file to load
    config = OpenForum.loadJSON(config);
  }

  var VERSION = "0.1.0";
  self.getVersion = function() { return VERSION; };

  var defaultConfig = {
    debug: false,
    name: "Bob",
    sleepOnSilence: 10000,
    wakeOnNoise: 0.02,
    //sleepOnUnrecognised: 10,
    notUnderstand: "",
    startOnLoad: true,
    voice: {
      lang: "en-GB",
      name: "Google UK English Male",
      pitch: "100",
      rate: "10",
      volume: "50",
      no: true
    },
    speech: []
  };

  var listenStateWatchers = []; // listeners for changes in listen state
  var lastListenState = false; // used to track changes in listen state
  var watching = []; // watcher functions that trigger speech on events
  var watchingInterval; // Interval instance that polls watcher functions
  var speechRecognition; // Speech recognition api if available
  var listening = false; // listening state used to stop double instances of listening threads
  var endSpeechWatchers = []; // functions watching for when speech synthesis ends
  var speechListeners = []; // functions watching for when speech synthesis starts
  var speechPacks = []; // speech pack files loaded to stop duplication

  self.setDebug = function(state) {
    config.debug = state;
    speechRecognition.setDebug( config.debug);
    OpenForum.Speech.debug = config.debug;

    if(config.debug) console.log("debug on");
  };

  var log = function(message) {
    console.log(message);
    self.log(message);
  };
  
  self.log = function(message) {
  };

  //Copy over config
  for(var i in config) {
    if( typeof(defaultConfig[i])!=="undefined" ) {
      defaultConfig[i] = config[i];
    }
  }
  config = defaultConfig;

  self.addCommand = function(command,reply,replyTemplate,insert) {
    
    //Convert js: reply to function
    if(typeof reply == "string" && reply.indexOf("js:")==0) {
      reply = OpenForum.evaluate(reply.substring(3));
    }

    //Convert js: command to function and add to watch list
    if(typeof command == "string" && command.indexOf("js:")==0) {
      command = OpenForum.evaluate(command.substring(3));
      watching.push( {watch: command, reply: reply, replyTemplate: replyTemplate} );
      return;
    }

    if(typeof(reply)=="string") {
      //Register command with fixed reply
      speechRecognition.addCommand(command, 
      	function(match) { 
        	OpenForum.Speech.say(reply,config.voice); 
      	},insert
      );
    }if(typeof(reply)=="object") {
      //Register command with first reply and alternatives
      var isFirst = true;
      speechRecognition.addCommand(command, 
      	function(match) { 
        	if(reply.first && isFirst) { 
        		OpenForum.Speech.say(reply.first,config.voice); 
            } else {
              var list = reply.subsequent;
              if(!list) {
                list = reply;
              }
              var index = Math.floor(list.length * Math.random());
        		OpenForum.Speech.say(list[index],config.voice); 
            }
        	isFirst = false;
      	},insert
      );
    } else if(typeof(reply)=="function") {
      if(replyTemplate) {
        //Register function reply as command with replyTemplate
        speechRecognition.addCommand(command, function(match) {
          return reply(match,replyTemplate);
        },insert);
      } else {
        //Register function reply as command with fixed reply
        speechRecognition.addCommand(command, reply, insert);
      }
    }
  };

  self.hear = function(text) {
    speechRecognition.processSpeech(text);
  };

  var processEndSpeechWatchers = function() {
    if( OpenForum.Speech.queueLength!=0) return;

    for(var w in endSpeechWatchers) {
      endSpeechWatchers[w]();
    }
    endSpeechWatchers = [];
  };

  self.say = function(text,params,callBack) {
    if(text.indexOf("*")!=-1) {
      for(var i in params) {
        text = text.replace("*",params[i]);
      }
    }
    OpenForum.Speech.say(text,config.voice);
    if(callBack) {
      endSpeechWatchers.push(callBack);
    }
  };

  self.addListenStateWatcher = function(listenStateCall) {
    listenStateWatchers.push(listenStateCall);
  };
  
  self.addSpeechListener = function(listenerCall) {
    speechListeners.push(listenerCall);
  };

  var said = function(message) {
    for(var i in speechListeners) {
      try{
        speechListeners[i](message);
      } catch(e) {
        console.log(e);
      }
    }
  };

  self.addStateListeners = function() {
  };
  
  self.addCommandAlias = function(command,means) {
    speechRecognition.addCommandAlias( command.toLowerCase(), means.toLowerCase() );
  };

  var watch = function() {
    for(var i in watching) {
      if(watching[i].watch()==true) {
        if(typeof watching[i].reply == "string") {
          self.say(watching[i].reply);
        } else {
          watching[i].reply({},watching[i].replyTemplate);
        }
      }
    }
    if(self.isListening()!=lastListenState) {
      lastListenState = self.isListening();
      for(var i in listenStateWatchers) {
        listenStateWatchers[i](lastListenState);
      }
    }
  };

  var processSpeech = function(transcript) {
    log(transcript);
    return transcript;
  };

  self.loadSpeechPack = function(speechPackFile) {
    if(speechPacks[speechPackFile]) return;
    speechPacks[speechPackFile] = true;
    
    OpenForum.loadJSON(speechPackFile, function(speechPack) {
      if(speechPack.script) {
        DependencyService.createNewDependency()
        .addDependency(speechPack.script)
        .setOnLoadTrigger( function() { 
          self.addSpeechPack(speechPack.speech,true);
        } ).loadDependencies();
      } else {
      	self.addSpeechPack(speechPack.speech,true);
      }
    });
  };

  self.isListening = function() {
    if(speechRecognition) {
      return speechRecognition.isListening();
    }
    return false;
  };

  self.getAudioMonitor = function() {
    if(speechRecognition) {
      return speechRecognition.getAudioMonitor();
    }
  };
  
  self.startListening = function() {
    if(listening) return;
    speechRecognition.start();
    speechRecognition.setWaitingForCommand(true);
    var currentStartedSay = OpenForum.Speech.startedSay;
    OpenForum.Speech.startedSay = function(message) {
      currentStartedSay(message);
      said(message);
    };
    listening = true;
  };

  self.stopListening = function() {
    if(!listening) return;
    speechRecognition.stop();
    listening = false;
  };

  var expandAliases = function(aliases) {
    var newAliases = [];
    for(var a in aliases) {
      var text = aliases[a].toLowerCase();

      var utterance = { versions: [""], variables: [] };

      var parts = text.split(/\[|]|\s/g);
      for(var p in parts) { 
        var part = parts[p];

        var words = part.split(/\|/g);

        for(var w in words) {
          var word = words[w];

          if(word.length==0) continue;

          //Should be used to check al versions have the required variables
          if(word.length>=4 && word.substring(0,2)=="{"+"{" && word.substring(word.length-2)=="}"+"}") {
            utterance.variables.push(word.substring(2,word.length-2));
          }
        }

        var newVersions = [];
        for(var k = 0; k<words.length; k++) {
          for(var j = 0; j<utterance.versions.length; j++) {
            var newVersion = utterance.versions[j];

            if(words[k].length>0) {
              if(utterance.versions[j].length>0) newVersion += " ";
              newVersion += words[k];
            }
            newVersions.push( newVersion );
          }
        }
        utterance.versions = newVersions;
      }
      for(var v in utterance.versions) {
        newAliases.push(utterance.versions[v]);
      }
    }

    for(var n=0;n<newAliases.length;n++) {
      aliases[n] = newAliases[n];
    }
  };

  self.addSpeechPack = function(speechPack,insert) {
    for(var i=0;i<speechPack.length;i++) {
      var entry = speechPack[i];
      if(entry.speechPack) {
        self.loadSpeechPack(entry.speechPack);
        continue;
      } else if(entry.startCommand) {
        if(speechRecognition) speechRecognition.setStartCommand(entry.startCommand, function(reply) { return function() {self.say(reply);}; }(entry.reply));
        continue;
      }if(entry.stopCommand) {
        if(speechRecognition) speechRecognition.setStopCommand(entry.stopCommand, function(reply) { return function() {self.say(reply);}; }(entry.reply));
        continue;
      }
      self.addCommand(entry.command,entry.reply,entry.replyTemplate,insert);
      if(entry.aliases) {
        expandAliases(entry.aliases);
        for(var j=0;j<entry.aliases.length;j++) {
          self.addCommandAlias(entry.command,entry.aliases[j],insert);
        }
      }
    }
  };

  var playSound = function(sound,callBack) {
    if(OpenForum.SoundPlayer) {
      OpenForum.SoundPlayer.playSound(sound,callBack);
    }
  };
  self.playSound = playSound;

  var addSound = function(url,name) {
    if(OpenForum.SoundPlayer) {
      OpenForum.SoundPlayer.addSound(url,name);
    } else {
      setTimeout( function() { addSound(url,name); },500 );
    }
  };
  self.addSound = addSound;

  var init = function() {
    if(OpenForum.SpeechRecognition.isAvailable()==false) {
      alert("Speech recognition is not available.","Virtual Assistant");
    }

    addSound("/OpenForum/Javascript/Sound/ping.mp3","ping");

    speechRecognition = new OpenForum.SpeechRecognition();
    speechRecognition.preProcessTranscript = processSpeech;

    speechRecognition.onUnrecognised = function(transcript) { 
      playSound("ping", function() {
        if(config.notUnderstand) OpenForum.Speech.say(config.notUnderstand,config.voice);
      });
    };
    speechRecognition.setDebug( config.debug);

    if(config.sleepOnSilence) speechRecognition.setSleepOnSilence(config.sleepOnSilence);
    if(config.wakeOnNoise) speechRecognition.setWakeOnNoise(config.wakeOnNoise);
    if(config.sleepOnUnrecognised) speechRecognition.setSleepOnUnrecognised(config.sleepOnUnrecognised);

    OpenForum.Speech.debug = config.debug;
    OpenForum.Speech.stoppedSay = processEndSpeechWatchers;

    if(config.speech) {
      self.addSpeechPack(config.speech);
    }

    watchingInterval = setInterval( watch, 500 );

    if(config.startOnLoad) {
      self.startListening();
      self.hear("Hello");
    }
  };

  DependencyService.createNewDependency()
    .addDependency("/OpenForum/Javascript/SpeechRecognition/SpeechRecognition.js")
    .addDependency("/OpenForum/Javascript/SpeechSynthesis/SpeechSynthesis.js")
    .addDependency("/OpenForum/Javascript/Sound/SoundPlayer.js")
    .setOnLoadTrigger( init ).loadDependencies();
};

