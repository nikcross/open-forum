if(!OpenForum) {
  OpenForum = {};
}
OpenForum.SoundPlayer = new function() {
  var sounds = [];

  this.addSound = function(source,id) {
    sound = document.createElement('audio');
    sound.src = source;
    sounds[id] = [source,sound];
  };

  this.playSound = function(id) {
    sounds[id][1].loop=false;
    sounds[id][1].play();
  };

  this.loopSound = function(id) {
    sounds[id][1].loop=true;
    sounds[id][1].play();
  };
};