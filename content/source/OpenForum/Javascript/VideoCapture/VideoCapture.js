if(!OpenForum) {
  OpenForum = {};
}
OpenForum.VideoCapture = function(videoCanvasId,options) {
  var self = this;

  self.cameras = [];
  self.microphones = [];

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

  var video = document.createElement("video");
  video.setAttribute("autoplay","true");
  video.setAttribute("width",self.width);
  video.setAttribute("height",self.height);
  video.setAttribute("style","display: none;");
  document.getElementsByTagName("head")[0].appendChild(video);

  var ctx = document.getElementById(videoCanvasId).getContext('2d');

  navigator.getUserMedia  = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

  self.updateSources = function(callback) {
    navigator.mediaDevices.enumerateDevices().then(function(sourceInfos) {
      var audioSource = null;
      var videoSource = null;
      self.cameras = [];

      for (var i = 0; i != sourceInfos.length; ++i) {
        var sourceInfo = sourceInfos[i];
        if (sourceInfo.kind === 'audio' || sourceInfo.kind === 'audioinput') {
          console.log(sourceInfo.id, sourceInfo.label || 'microphone');
          self.microphones[self.microphones.length] = { id: sourceInfo.id, label: sourceInfo.label || 'microphone '+(self.microphones.length+1)};
        } else if (sourceInfo.kind === 'video' || sourceInfo.kind === 'videoinput') {
          console.log(sourceInfo.id, sourceInfo.label || 'camera');
          self.cameras.push({ id: sourceInfo.id, label: sourceInfo.label || 'camera '+(self.cameras.length+1)} );
          if(!self.camera || self.camera==="") {
            self.camera = sourceInfo.label;
          }
        } else {
          console.log('Some other kind of source: ', sourceInfo);
        }
      }
      
      if(document.getElementById("videoSettings")) {
        document.getElementById("videoSettings").style.display = "block";
        document.getElementById("videoSettingsLoading").style.display = "none";
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

  self.saveSettings = function() { 
    localStorage.setItem("OpenForum.VideoCapture.camera", self.camera);
  }

  self.updateSource = function() {
    self.cameraId = self.getCameraId(self.camera);
    
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

  self.overlayFrame = function() {};

  self.updateSources( this.updateSource );

  setInterval( function() { self.snapshot(); } ,25);
  
  OpenForum.videoCapture = self;
};

var ImageData = function(iwidth,iheight,idata) {
  var self = this;
  var width = iwidth;
  var height = iheight;
  var data = idata;

  self.getData = function() {
    return data;
  }

  self.getPixel = function(x,y) {
    var cursor = ((y*width)+x)*4;
    return {red: data[cursor], green: data[cursor+1], blue: data[cursor+2], alpha: data[cursor+3]};
  };

  self.setPixel = function(x,y,pixel) {
    var cursor = ((y*width)+x)*4;
    data[cursor] = pixel.red;
    data[cursor+1] = pixel.green;
    data[cursor+2] = pixel.blue;
    data[cursor+3] = pixel.alpha;
  };

  self.getWidth = function() {
    return width;
  };

  self.getHeight = function() {
    return height;
  };
};

OpenForum.VideoCapture.createWorkingImage = function(width,height) {
  var data = [];
  for(var i=0; i<width*height*4 ; i++) data[i] = 0;
  return new ImageData( width,height,data );
}

OpenForum.VideoCapture.cloneImage = function(image) {
  var data = [];
  var iData = image.getData();
  for(var i=0; i<image.getWidth()*image.getHeight()*4 ; i++) data[i] = iData[i];
  return new ImageData( image.getWidth(),image.getHeight(),data );
}

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