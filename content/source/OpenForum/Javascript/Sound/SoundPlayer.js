if(!OpenForum) {
  OpenForum = {};
}
if(!OpenForum.SoundPlayer) {
  OpenForum.SoundPlayer = new function() {
    var sounds = [];
    
    this.addSound = function(source,id) {
      var sound = document.createElement('audio');
      sound.src = source;
      sounds[id] = {source: source,sound: sound};
    };

    this.playSound = function(id,onEndCallBack) {
      if(onEndCallBack) sounds[id].sound.onended = onEndCallBack;
      sounds[id].sound.loop=false;
      sounds[id].sound.play();
    };

    this.loopSound = function(id) {
      sounds[id].sound.loop=true;
      sounds[id].sound.play();
    };
    
    this.stopSound = function(id) {
      sounds[id].sound.loop=false;
      sounds[id].sound.pause();
    };
  };
}