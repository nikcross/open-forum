/*
* Author: 
*/
OpenForum.loadScript("/OpenForum/Javascript/Sound/SoundPlayer.js");

OpenForum.init = function() {
};

function play( url ) {
  OpenForum.SoundPlayer.addSound(url,"sound");
  OpenForum.SoundPlayer.playSound('sound');
}