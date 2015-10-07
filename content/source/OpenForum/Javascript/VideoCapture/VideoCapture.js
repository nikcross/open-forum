if(!OpenForum) {
  OpenForum = {};
}
OpenForum.VideoCapture = function(videoCanvasId) {
  this.cameras = [];
  this.microphones = [];
  this.camera = OpenForum.VideoCapture.defaultCamera;
  var self = this;
  var localMediaStream =null;
  var frame;
  var paused = false;
  var width = 640;
  var height = 480;
  
  OpenForum.videoCapture = this;
  
  // <video autoplay id="videoIn" width="640" height="480"  style="display: none;"></video>
  this.video = document.createElement("video");
  this.video.setAttribute("autoplay","true");
  this.video.setAttribute("width",width);
  this.video.setAttribute("height",height);
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
          if(!self.camera || self.camera==="") {
          	self.camera = sourceInfo.label;
          }
        } else {
          console.log('Some other kind of source: ', sourceInfo);
        }
      }
    });
  };
  
  this.getFrame = function() {
    return frame;
  };
  
  this.pause = function() {
    paused = true;
  };
  
  this.resume = function() {
    paused = false;
  };
  
  this.snapshot = function() {
    if (localMediaStream) {
      if(!paused) {
        self.ctx.drawImage(self.video, 0, 0);
        frame = self.ctx.getImageData(0, 0, width, height);
      }
      
      if(self.processFrame) {
        var frameData = frame.data;
        var imageData = new ImageData(width,height,frameData);
        self.processFrame(imageData);
        self.ctx.putImageData(frame,0,0);
      }
      self.overlayFrame();
    }
  };
  
  this.onError = function() {
    alert("Error Found");
  };
  
  this.getCameraId = function (cameraName) {
    for(var camerai in self.cameras) {
      if(self.cameras[camerai].label === cameraName) {
        return self.cameras[camerai].id;
      }
    }
    return null;
  };
  
  this.updateSource = function() {
    localStorage.setItem("OpenForum.VideoCapture.camera", self.camera);
   navigator.getUserMedia(
     { video: {
      optional: [{sourceId: self.getCameraId(self.camera)}]
     } },
     function(stream) {
        self.video.src = window.URL.createObjectURL(stream);
        localMediaStream = stream;
     },
     self.onError
   );
  };
  
//  this.processFrame = function(imageData) { return imageData; };
  this.overlayFrame = function() {};
  
  this.updateSources();
  this.updateSource();
  
  setInterval( function() { self.snapshot(); } ,25);
};

var ImageData = function(iwidth,iheight,idata) {
  var width = iwidth;
  var height = iheight;
  var data = idata;

  this.getPixel = function(x,y) {
    var cursor = ((y*width)+x)*4;
    return [data[cursor],data[cursor+1],data[cursor+2],data[cursor+3]];
  };
};

OpenForum.VideoCapture.showSettings = function(elementId) {
  document.getElementById(elementId).innerHTML = OpenForum.loadFile( "/OpenForum/Javascript/VideoCapture/page.html.fragment" );
  OpenForum.crawl(document.getElementById(elementId));
};

OpenForum.addInitialiser(
  function() {
    OpenForum.VideoCapture.defaultCamera = "";
    if( localStorage.getItem("OpenForum.VideoCapture.camera") ) {
      OpenForum.VideoCapture.defaultCamera = localStorage.getItem("OpenForum.VideoCapture.camera" );
    }
  }
);