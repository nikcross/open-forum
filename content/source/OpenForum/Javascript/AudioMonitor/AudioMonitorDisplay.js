/*
* Author: 
* Description: 
*/
var AudioMonitorDisplay = function() {
  var self = this;
  var audioMonitor;
  var view;
  var recordingShape;
  var soundShape;
  var listening = false;
  
  self.getView = function() {
    return view;
  };
  
  self.setListening = function(state) {
    listening =state;
  };
  
  self.getListening = function() {
    return listening;
  };

  self.getAudioMonitor = function() {
    return audioMonitor;
  };
  
  var init = function() {
    if(audioMonitor) return;
    audioMonitor = new AudioMonitor();

    view = new Composite(0,0);
    
    recordingShape = new Polygon(0,100).setFillColor("green");
    recordingShape.addPoint(0,0);
    for(var i=0; i<512; i++) {
      recordingShape.addPoint(i,0);
    }
    recordingShape.addPoint(0,0);

    soundShape = new Polygon(0,200).setFillColor("blue");
    soundShape.addPoint(0,0);
    for(var i=0; i<512; i++) {
      soundShape.addPoint(i,0);
    }
    soundShape.addPoint(0,0);

    view.add(recordingShape);
    view.add(soundShape);
    
    var trackIndex = 0;
    soundShape.animate = function() {
      if(listening==false) return;
      var buffer = audioMonitor.getBuffer();

      if(buffer) {
        var max = 0;
        for(var i=0; i<512; i++) {
          var value = Math.floor(buffer[i]*100);
          soundShape.points[i] = [i,value];
          if(value>max) {
            max = value;
          }
        }

        if(trackIndex==512) {
          for(var t=0; t<512; t++) {
            recordingShape.points[t] = [t,0];
          }
          trackIndex=0;
        }
        recordingShape.points[trackIndex] = [trackIndex,-(max/2)];
        trackIndex++;
      }
    };
  };

  init();
};