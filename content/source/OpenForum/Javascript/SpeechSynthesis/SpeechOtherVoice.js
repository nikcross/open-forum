if(!OpenForum) {
  OpenForum = {};
}
if(!OpenForum.Speech) {
  OpenForum.Speech = {};
}
OpenForum.Speech.OtherVoice = {};
OpenForum.Speech.OtherVoice.voice = {
  name: "",
  spokenName: "Jane",
  pitch: 100,  // 0 to 200
  rate: 2, // 0 to 10
  volume: 50 // 0 to 100
};
OpenForum.Speech.OtherVoice.voices = [];
OpenForum.Speech.OtherVoice.onLoadSay = null;
  if(OpenForum.addNodeProcessor) {
  OpenForum.addNodeProcessor(
    function(node) { 
      if(node.attributes && node.attributes['of-say'] && !(node.childNodes && node.childNodes.length>1)) {
        if(node.attributes['of-say'].value==="onload") {
          OpenForum.Speech.OtherVoice.onLoadSay = node.innerHTML;
        }
      }
    }
  );
}

OpenForum.Speech.OtherVoice.say = function(message,voice) {
	var msg = new SpeechSynthesisUtterance(message);
  if(!voice) {
		voice = OpenForum.Speech.OtherVoice.voice;
  }
  msg.voice = OpenForum.Speech.OtherVoice.getVoice(voice.name);
  msg.pitch = voice.pitch/100;
  msg.rate = voice.rate;
  msg.volume = voice.volume/100;
  voice.lang = msg.voice.lang;
    window.speechSynthesis.speak(msg);
};

OpenForum.Speech.OtherVoice.showSettings = function(elementId) {
  document.getElementById(elementId).innerHTML = OpenForum.loadFile( "/OpenForum/Javascript/SpeechSynthesis/page.html.fragment" );
  OpenForum.crawl(document.getElementById(elementId));
};

OpenForum.Speech.OtherVoice.test = function() {
  OpenForum.Speech.OtherVoice.say("Hello my name is "+OpenForum.Speech.OtherVoice.voice.spokenName+". I am using the synthesized voice called "+OpenForum.Speech.OtherVoice.voice.name);
};

OpenForum.Speech.OtherVoice.saveSettings = function() {
  localStorage.setItem("OpenForum.Speech.OtherVoice.voice", JSON.stringify(OpenForum.Speech.OtherVoice.voice));
  OpenForum.Speech.OtherVoice.say("Your Speech synthesizer settings for the other voice on this browser have been saved.");
};
OpenForum.Speech.OtherVoice.voiceReady = false;

OpenForum.Speech.OtherVoice.getVoice = function(name) {
  var found = null;
  speechSynthesis.getVoices().forEach(function(voice) {
    if(voice.name===name) found = voice;
  });
  if(found===null) found = speechSynthesis.getVoices()[0];
  return found;
};

OpenForum.Speech.OtherVoice.voiceReady = false;
OpenForum.Speech.OtherVoice.init = function() {
  if( localStorage.getItem("OpenForum.Speech.OtherVoice.voice") ) {
    OpenForum.Speech.OtherVoice.voice = JSON.parse( localStorage.getItem("OpenForum.Speech.OtherVoice.voice") );
  }
  speechSynthesis.getVoices().forEach(function(voice) {
      OpenForum.Speech.OtherVoice.voices.push(voice.name);
   });
  
  if(OpenForum.Speech.OtherVoice.onLoadSay) {
    OpenForum.Speech.OtherVoice.say(OpenForum.Speech.OtherVoice.onLoadSay);
  }
};