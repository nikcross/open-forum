if(!OpenForum) {
  OpenForum = {};
}
OpenForum.Speech = {};
OpenForum.Speech.voice = {
  on: true,
  name: "",
  spokenName: "Jane",
  pitch: 100,  // 0 to 200
  rate: 1, // 0 to 20
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

OpenForum.Speech.say = function(message,voice) {
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
  
    window.speechSynthesis.speak(msg);
};

OpenForum.Speech.showSettings = function(elementId) {
  document.getElementById(elementId).innerHTML = OpenForum.loadFile( "/OpenForum/Javascript/SpeechSynthesis/page.html.fragment" );
  OpenForum.crawl(document.getElementById(elementId));
};

OpenForum.Speech.test = function() {
  OpenForum.Speech.say("Hello my name is "+OpenForum.Speech.voice.spokenName+". I am using the synthesized voice called "+OpenForum.Speech.voice.name);
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
  
  
  //alert("Looking for "+name+" found "+found);
  //alert("voice:"+JSON.stringify(OpenForum.Speech.voice));
  
  if(found===null) found = speechSynthesis.getVoices()[0];
  return found;
};

OpenForum.Speech.voiceReady = false;
OpenForum.Speech.init = function() {
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
      OpenForum.Speech.init();
      if(OpenForum.Speech.OtherVoice) {
        OpenForum.Speech.OtherVoice.init();
      }
      return true;
    }
  }
);