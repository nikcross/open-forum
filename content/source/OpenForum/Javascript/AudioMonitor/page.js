/*
* Author: 
*/
OpenForum.includeScript("/OpenForum/Javascript/AudioMonitor/AudioMonitor.js");
OpenForum.includeScript("/OpenForum/Javascript/AudioMonitor/AudioMonitorDisplay.js");
OpenForum.includeScript("/OpenForum/Giraffe/giraffe.js");

var volume;
var audioMonitor;
var audioMonitorDisplay;
var canvas;

OpenForum.init = function() {
      canvas = new Canvas("canvas");
    Giraffe.Interactive.setInteractive(canvas);
    Giraffe.setAnimated(canvas);
    canvas.startAnimation(20,100,true);
};

var setVolume = function(newVolume) { 
  volume = newVolume;
};

function stopAudioMonitor() {
  audioMonitorDisplay.getAudioMonitor().removeListener( setVolume );
  audioMonitorDisplay.setListening(false);
}

function startAudioMonitor() {
  audioMonitorDisplay.getAudioMonitor().addListener( setVolume );
  audioMonitorDisplay.setListening(true);
}

function initAudioMonitor() {
  if(audioMonitorDisplay) return;
  audioMonitorDisplay = new AudioMonitorDisplay();
  canvas.add( audioMonitorDisplay.getView() );
  
  OpenForum.showElement("monitor");
  OpenForum.hideElement("consent");
};

