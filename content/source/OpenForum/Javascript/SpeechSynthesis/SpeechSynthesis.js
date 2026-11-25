if(!OpenForum) {
  OpenForum = {};
}
OpenForum.Speech = {};
OpenForum.Speech.voice = {
  on: true,
  name: "",
  spokenName: "Jane",
  pitch: 100,  // 0 to 200
  rate: 10, // 0 to 20
  volume: 50 // 0 to 100
};
OpenForum.Speech.voices = [];
OpenForum.Speech.onLoadSay = null;
if(OpenForum.addNodeProcessor) {
  OpenForum.addNodeProcessor(
    function(node) { 
      if(node.attributes && node.attributes['of-say'] && !(node.childNodes && node.childNodes.length>1)) {
        if(node.attributes['of-say'].value==="onload") {
          OpenForum.Speech.onLoadSay = node.innerHTML;
        }
      }
    }
  );
}

OpenForum.Speech.speaking = false;
OpenForum.Speech.queueLength = 0;
OpenForum.Speech.debug = false;

OpenForum.Speech.maxQueued = 10;

OpenForum.Speech.say = function(message,voice,queued ) {
  if(OpenForum.Speech.speaking) {
    if(!queued) OpenForum.Speech.queueLength++;
    if(OpenForum.Speech.queueLength>OpenForum.Speech.maxQueued) {
      window.speechSynthesis.cancel();
      OpenForum.Speech.speaking = false;
      OpenForum.Speech.queueLength = 0;
      console.log("SpeechSynthesis maximum queue length exceeded");
    }
    setTimeout( function(){ OpenForum.Speech.say(message,voice,true); },1000 );
    return;
  }
  OpenForum.Speech.queueLength--;

  var msg = new SpeechSynthesisUtterance(message);
  if(!voice) {
    voice = OpenForum.Speech.voice;
  }
  if(voice.on===false) {
    return;
  }
  msg.voice = OpenForum.Speech.getVoice(voice.name);
  msg.pitch = voice.pitch/100;
  msg.rate = voice.rate/10;
  msg.volume = voice.volume;

  OpenForum.Speech.speaking = true;
  OpenForum.Speech.startedSay(message);
  OpenForum.Speech.currentMessage = msg;
  msg.onend = function() {
    OpenForum.Speech.speaking = false;
    if(OpenForum.Speech.debug) console.log("Finished speaking");
    OpenForum.Speech.stoppedSay();
  };
  window.speechSynthesis.speak(msg);
  if(OpenForum.Speech.debug) console.log("Say: "+message);
};

OpenForum.Speech.startedSay = function() {};
OpenForum.Speech.stoppedSay = function() {};

OpenForum.Speech.showSettings = function(elementId) {
  document.getElementById(elementId).innerHTML = OpenForum.loadFile( "/OpenForum/Javascript/SpeechSynthesis/page.html.fragment" );
  OpenForum.crawl(document.getElementById(elementId));
};

OpenForum.Speech.test = function() {
  OpenForum.Speech.say("Hello my name is "+OpenForum.Speech.voice.spokenName+". I am using the synthesized voice called "+OpenForum.Speech.voice.name);
};

OpenForum.Speech.copySettings = function() {
  OpenForum.copyData( JSON.stringify(OpenForum.Speech.voice,null,4) );
  alert("This voice has copied to your clipboard");
};

OpenForum.Speech.saveSettings = function() {
  localStorage.setItem("OpenForum.Speech.voice", JSON.stringify(OpenForum.Speech.voice));
  OpenForum.Speech.say("Your speech synthesizer settings for this browser have been saved.");
};
OpenForum.Speech.voiceReady = false;

window.speechSynthesis.onvoiceschanged = function() {
  OpenForum.Speech.voiceReady = true;
  if(OpenForum.Speech.OtherVoice) {
    OpenForum.Speech.OtherVoice.voiceReady = true;
  }
};

OpenForum.Speech.getVoice = function(name) {
  var found = null;
  speechSynthesis.getVoices().forEach(function(voice) {
    if(voice.name===name) found = voice;
  });
  return found;
};

OpenForum.Speech.voiceReady = false;

OpenForum.Speech.isAvailable = function() {
  return (typeof speechSynthesis != "undefined"); 
};

OpenForum.Speech.init = function() {
  if(typeof speechSynthesis == "undefined" || speechSynthesis.getVoices().length==0) {
      throw "Speech Synthesis not available in this browser.";
  }
  
  if( localStorage.getItem("OpenForum.Speech.voice") ) {
    OpenForum.Speech.voice = JSON.parse( localStorage.getItem("OpenForum.Speech.voice") );
  }
  speechSynthesis.getVoices().forEach(function(voice) {
    OpenForum.Speech.voices.push(voice.name);
  });

  if(OpenForum.Speech.onLoadSay) {
    OpenForum.Speech.say(OpenForum.Speech.onLoadSay);
  }
};

OpenForum.addInitialiser(
  function() {
    if(OpenForum.Speech.voiceReady === false ) {
      return false;
    } else {
      try{
      	OpenForum.Speech.init();
      } catch(e) {
        alert( e );
        return true;
      }
      if(OpenForum.Speech.OtherVoice) {
        OpenForum.Speech.OtherVoice.init();
      }
      return true;
    }
  }
);