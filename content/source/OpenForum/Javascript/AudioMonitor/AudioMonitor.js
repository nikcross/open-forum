/*
* Author: 
* Description: 
* Sources:
* https://ourcodeworld.com/articles/read/413/how-to-create-a-volume-meter-measure-the-sound-level-in-the-browser-with-javascript
* https://github.com/cwilso/volume-meter/blob/master/volume-meter.js
*/

function AudioMonitor() {
  var self = this;
  var meter;
  var listeners = [];
  var buffer;

  self.addListener = function(listener) {
    listeners.push(listener);
  };
  
  self.removeListener = function(listener) {
    for(var i in listeners) {
      if(listeners[i] == listener ) {
        listeners.splice( i,1 );
      }
    }
  };

  self.getBuffer = function() {
    return buffer;
  };
  
  var createAudioMeter = function(audioContext,clipLevel,averaging,clipLag) {
    var processor = audioContext.createScriptProcessor(512);
    processor.onaudioprocess = volumeAudioProcess;
    processor.clipping = false;
    processor.lastClip = 0;
    processor.volume = 0;
    processor.clipLevel = clipLevel || 0.98;
    processor.averaging = averaging || 0.95;
    processor.clipLag = clipLag || 750;

    // this will have no effect, since we don't copy the input to the output,
    // but works around a current Chrome bug.
    processor.connect(audioContext.destination);

    processor.checkClipping =
      function(){
      if (!this.clipping)
        return false;
      if ((this.lastClip + this.clipLag) < window.performance.now())
        this.clipping = false;
      return this.clipping;
    };

    processor.shutdown =
      function(){
      this.disconnect();
      this.onaudioprocess = null;
    };

    return processor;
  };

  var volumeAudioProcess = function( event ) {
    buffer = event.inputBuffer.getChannelData(0);
    var bufLength = buffer.length;
    var sum = 0;
    var x;

    // Do a root-mean-square on the samples: sum up the squares...
    for (var i=0; i<bufLength; i++) {
      x = buffer[i];
      if (Math.abs(x)>=this.clipLevel) {
        this.clipping = true;
        this.lastClip = window.performance.now();
      }
      sum += x * x;
    }

    // ... then take the square root of the sum.
    var rms =  Math.sqrt(sum / bufLength);

    // Now smooth this out with the averaging factor applied
    // to the previous sample - take the max here because we
    // want "fast attack, slow release."
    this.volume = Math.max(rms, this.volume*this.averaging);
  };

  // monkeypatch Web Audio
  window.AudioContext = window.AudioContext || window.webkitAudioContext;

  // grab an audio context
  var audioContext = new AudioContext();

  var checkVolume = function() {
    for(var i in listeners) {
      listeners[i](meter.volume);
    }
  };

  var onMicrophoneGranted = function(stream) {
    // Create an AudioNode from the stream.
    var mediaStreamSource = audioContext.createMediaStreamSource(stream);

    // Create a new volume meter and connect it.
    meter = createAudioMeter(audioContext);
    mediaStreamSource.connect(meter);

    // kick off the visual updating
    setInterval( checkVolume,100 );
  };

  var onMicrophoneDenied = function() {
    throw "Microphone access denied";
  };

  navigator.getUserMedia = 
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

  navigator.getUserMedia(
    {
      "audio": {
        "mandatory": {
          "googEchoCancellation": "false",
          "googAutoGainControl": "false",
          "googNoiseSuppression": "false",
          "googHighpassFilter": "false"
        },
        "optional": []
      },
    }, onMicrophoneGranted, onMicrophoneDenied);
}