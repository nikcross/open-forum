if(!OpenForum) {
  OpenForum = {};
}
OpenForum.VideoCapture = function(videoCanvasId,options) {
  var self = this;
  
  self.cameras = [];
  self.microphones = [];
  
//alert( "2. OpenForum.VideoCapture.defaultCamera="+OpenForum.VideoCapture.defaultCamera );
  self.camera = OpenForum.VideoCapture.defaultCamera;
  self.cameraId = "";
  var localMediaStream =null;
  var frame;
  var paused = false;
  self.width = 640;
  self.height = 480;
  
  if(options) {
    if(options.width && options.height) {
      self.width = options.width;
      self.height = options.height;
    }
  }
  
  OpenForum.videoCapture = self;
  
  // <video autoplay id="videoIn" width="640" height="480"  style="display: none;"></video>
  var video = document.createElement("video");
  video.setAttribute("autoplay","true");
  video.setAttribute("width",self.width);
  video.setAttribute("height",self.height);
  video.setAttribute("style","display: none;");
  document.getElementsByTagName("head")[0].appendChild(video);
  
  //video = document.getElementById("videoIn");
  var ctx = document.getElementById(videoCanvasId).getContext('2d');
  
    navigator.getUserMedia  = navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia;
  
  self.updateSources = function(callback) {
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
      if(callback) callback();
    }
                               );
  };
  
  self.getFrame = function() {
    return frame;
  };
  
  self.pause = function() {
    paused = true;
  };
  
  self.resume = function() {
    paused = false;
  };
  
  self.snapshot = function() {
    if (localMediaStream) {
      if(!paused) {
        ctx.drawImage(video, 0, 0);
        frame = ctx.getImageData(0, 0, self.width, self.height);
      }
      
      if(self.processFrame) {
        var frameData = frame.data;
        var imageData = new ImageData(self.width,self.height,frameData);
        self.processFrame(imageData);
        ctx.putImageData(frame,0,0);
      }
      self.overlayFrame();
    }
  };
  
  self.onError = function() {
    alert("Error Found");
  };
  
  self.getCameraId = function (cameraName) {
    for(var camerai in self.cameras) {
      if(self.cameras[camerai].label === cameraName) {
        return self.cameras[camerai].id;
      }
    }
    return null;
  };
  
  self.updateSource = function() {
    localStorage.setItem("OpenForum.VideoCapture.camera", self.camera);
    self.cameraId = self.getCameraId(self.camera);
//alert(self.cameraId);
   navigator.getUserMedia(
     { 
       video: { optional: [{sourceId: self.cameraId }, {width: self.width}, {height: self.height}] }
     },
     function(stream) {
       window.stream = stream;
        video.src = window.URL.createObjectURL(stream);
       video.play();
        localMediaStream = stream;
     },
     self.onError
   );
  };
  
//  this.processFrame = function(imageData) { return imageData; };
  self.overlayFrame = function() {};
  
  self.updateSources( this.updateSource );
  
  setInterval( function() { self.snapshot(); } ,25);
};

var ImageData = function(iwidth,iheight,idata) {
  var self = this;
  var width = iwidth;
  var height = iheight;
  var data = idata;

  self.getPixel = function(x,y) {
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
      //alert( "OpenForum.VideoCapture.defaultCamera="+OpenForum.VideoCapture.defaultCamera );
    }
  }
);