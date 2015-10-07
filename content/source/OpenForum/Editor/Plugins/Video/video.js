var Video = function(videoCanvasId) {
  this.cameras = [];
  this.microphones = [];
  this.camera = "";
  var self = this;
  var localMediaStream =null;
  
  // <video autoplay id="videoIn" width="640" height="480"  style="display: none;"></video>
  this.video = document.createElement("video");
  this.video.setAttribute("autoplay","true");
  this.video.setAttribute("width","640");
  this.video.setAttribute("height","480");
  this.video.setAttribute("style","display: none;");
  document.getElementsByTagName("head")[0].appendChild(this.video);
  
  //this.video = document.getElementById("videoIn");
  this.ctx = document.getElementById(videoCanvasId).getContext('2d');
  
    navigator.getUserMedia  = navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia;
  
  this.updateSources = function() {
    MediaStreamTrack.getSources(function(sourceInfos) {
      var audioSource = null;
      var videoSource = null;

      for (var i = 0; i != sourceInfos.length; ++i) {
        var sourceInfo = sourceInfos[i];
        if (sourceInfo.kind === 'audio') {
          console.log(sourceInfo.id, sourceInfo.label || 'microphone');
          self.microphones[self.microphones.length] = { id: sourceInfo.id, label: sourceInfo.label || 'microphone '+(self.microphones.length+1)};
        } else if (sourceInfo.kind === 'video') {
          console.log(sourceInfo.id, sourceInfo.label || 'camera');
          self.cameras[self.cameras.length] = { id: sourceInfo.id, label: sourceInfo.label || 'camera '+(self.cameras.length+1)};
          self.camera = sourceInfo.id;
        } else {
          console.log('Some other kind of source: ', sourceInfo);
        }
      }
    });
  };
  
  this.snapshot = function() {
    if (localMediaStream) {
      self.ctx.drawImage(self.video, 0, 0);
      var frame = self.ctx.getImageData(0, 0, 640, 480);
      var frameData = frame.data;
      var imageData = new ImageData(640,480,frameData);
      self.processFrame(imageData);
      self.ctx.putImageData(frame,0,0);
    }
  };
  
  this.onError = function() {
    alert("Error Found");
  };
  
  this.updateSource = function() {
   navigator.getUserMedia(
     { video: {
      optional: [{sourceId: self.camera}]
     } },
     function(stream) {
        self.video.src = window.URL.createObjectURL(stream);
        localMediaStream = stream;
     },
     self.onError
   );
  };
  
  this.processFrame = function(imageData) { return imageData; };
  
  this.updateSources();
  this.updateSource();
  
  setInterval( function() { self.snapshot(); } ,25);
};

var ImageData = function(iwidth,iheight,idata) {
  var width = iwidth;
  var height = iheight;
  var data = idata;

  this.getWidth = function() {
    return width;
  };
  
  this.getHeight = function() {
    return height;
  };
  
  this.getPixel = function(x,y) {
    var cursor = ((y*width)+x)*4;
    //return [data[cursor],data[cursor+1],data[cursor+2],data[cursor+3]];
    
    return {red: data[cursor],green: data[cursor+1],blue: data[cursor+2],alpha: data[cursor+3]};
  };
  
  this.setPixel = function(x,y,pixel) {
    var cursor = ((y*width)+x)*4;
    data[cursor]=pixel.red;
    data[cursor+1]=pixel.green;
    data[cursor+2]=pixel.blue;
    data[cursor+3]=pixel.alpha;
  };
  
  this.getData = function() {
    return data;
  };
};
