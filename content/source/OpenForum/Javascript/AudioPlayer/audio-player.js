/*
* Author: Nik Cross
* Description: A Javascript Audio Player using HTML5
* Includes:
*   Play / Pause control
*   Current position in audio playback
*   Skip to position in playback
*   Percentage through playback
*   Total audio file length
*
* Implement the method updateStateView to work with your html view implementation.
*
*/
const AudioPlayer = function(podcast) {
  const STOPPED = "Stopped";
  const PAUSED = "Paused";
  const PLAYING = "Playing";
  
  var self = this;
  var state = STOPPED;

  self.updateProgressView = function(percent) {};

  var updateProgress = function() {
    var percentage = Math.round( (podcast.currentTime*100)/podcast.duration );
    var currentTime = Math.round(podcast.currentTime*10)/10;
    var duration = Math.round(podcast.duration*10)/10;
    var remaining = Math.round((podcast.duration-podcast.currentTime)*10)/10;
    
    var progress = {currentTime: currentTime, duration: duration, remaining: remaining, percentage: percentage};
    
    self.updateProgressView(progress);
  };
  
  self.updateStateView = function(state) {};
  
  var updateState = function() {
    if(podcast.paused==true) {
      state = PAUSED;
    } else {
      state = PLAYING;
    }
    
    updateStateView(state);
  };
  
  var updater = setInterval( updateProgress,10 );
  
  self.playToggle = function() {
    if(podcast.paused) {
      self.play();
    } else {
      self.pause();
    }
  };

  self.play = function() {
    podcast.play();
    self.updateStateView();
  };

  self.pause = function() {
    podcast.pause();
    self.updateStateView();
  };

  self.skip = function(time) {
    podcast.currentTime = podcast.currentTime + parseInt(time);
    updateProgress();
  };

  self.gotoPercentage = function(newPercentage) {
    var newTime = Math.floor(podcast.duration * newPercentage);
    podcast.currentTime = newTime;
    updateProgress();
  };

};