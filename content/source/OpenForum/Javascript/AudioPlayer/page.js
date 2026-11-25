/*
* Author: Nik Cross
*/
OpenForum.includeScript("/OpenForum/Javascript/AudioPlayer/audio-player.js");

var podcast;
var progressBar;
var pc = "";
var pcText = "";

OpenForum.init = function() {
  podcast = new AudioPlayer( document.getElementById("podcast") );
  progressBar = document.getElementById("progressBar");

  podcast.updateProgressView = function(progress) {
    pc = progress.percentage + "%";
    progressBar.style.width = pc;

    pcText = "<span class='label success' style='width: 50px;'>" + pc +
      "</span>&nbsp;<span class='label' style='width: 50px;'>" + progress.currentTime +
      "</span>&nbsp;<span class='label' style='width: 50px;'>" + progress.duration +
      "</span>&nbsp;<span class='label' style='width: 50px;'>" + progress.remaining;
  };

  podcast.updateStateView = function(state) {
    if(state == AudioPlayer.PLAYING) {
      document.getElementById("playPause").innerHTML = "Pause";
    } else {
      document.getElementById("playPause").innerHTML = "Play";
    }
  };
};

function gotoAudio(progress,event) {
  var box = progress.getBoundingClientRect();
  var pc = event.offsetX/box.width;
  podcast.gotoPercentage( pc );
}


