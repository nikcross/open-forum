/*
* Author: 
* Description: 
*/
OpenForum.loadScript("/OpenForum/Giraffe/giraffe.js");

var SoundMonitor = function(assistant,canvasId) {
  var retries = 0;
  
  var init = function() {
    if(typeof Canvas == "undefined") {
      if(retries<10) {
        retries++;
        console.log("No Giraffe Canvas. Retrying "+retries);
        setTimeout(init,1000);
        return;
      }
      console.log("No Sound Monitor as no Giraffe Canvas");
      return;
    }
    
    if(!assistant) {
      if(retries<10) {
        retries++;
        console.log("No Assistant. Retrying "+retries);
        setTimeout(init,1000);
        return;
      }
      console.log("No Sound Monitor as no assistant");
      return;
    }
    var audioMonitor = assistant.getAudioMonitor();
    if(!audioMonitor) {
      if(retries<10) {
        retries++;
        console.log("No Audio Monitor. Retrying "+retries);
        setTimeout(init,1000);
        return;
      }
      console.log("No Sound Monitor as no audioMonitor");
      return;
    }
    console.log("Sound Monitor starting");
    
    var canvas = new Canvas(canvasId);
    Giraffe.Interactive.setInteractive(canvas);
    Giraffe.setAnimated(canvas);
    canvas.startAnimation(20,100,true);

    var convertPoint = function(x,y) {
      var rad = Math.PI*x/25;
      var cx = Math.floor(Math.sin(rad)*y);
      var cy = Math.floor(Math.cos(rad)*y);
      
      return [cx,cy];
    };
    
    var soundShape = new Polygon(20,20).setFillColor("blue").setColor("cyan");
    for(var i=0; i<50; i++) {
      soundShape.addPoint(convertPoint(i,5));
    }

    soundShape.animate = function() {
      var buffer = audioMonitor.getBuffer();
      if(assistant.isListening()) {
        soundShape.setFillColor("lightgreen");
      } else {
        soundShape.setFillColor("red");
      }

      if(buffer) {
        for(var i=0; i<50; i++) {
          var value = Math.floor(buffer[i*10]*10);
          soundShape.points[i] = convertPoint(i,value+10);
        }
      }

    };

    canvas.add(soundShape);
  };
  init();
};