/*
* Author: 
* Description: 
*/
OpenForum.loadScript("/OpenForum/Giraffe/whammy.js");

Giraffe.Recorder = new function() {
  var self = this;

  self.record = function(canvas,frames,fileName) {
    var frameCount = 0;
    if(!frames) frames = 100;
    if(!fileName) fileName = "recording.webp";
    var encoder = new Whammy.Video(15);
    var animateFunction = canvas.anmiate;
    if(!animateFunction) {
      Giraffe.setAnimated(canvas);
      animateFunction = canvas.animate;
      canvas.startAnimation(15,100,true);
    }

    if(!canvas.oldAnimate) {
      canvas.oldAnimate = animateFunction;
    }

    canvas.animate = function(frame) {
      frameCount ++;

      canvas.oldAnimate(frame);

      encoder.add(canvas.canvasElement);
      
      console.log("Captured frame "+frameCount);

      if(frameCount >= frames) {
        var output = encoder.compile();
        console.log("Saving to "+fileName);
        var hiddenElement = document.createElement('a');
        var url = webkitURL.createObjectURL(output);
        hiddenElement.href = url;
        hiddenElement.target = '_blank';
        //hiddenElement.style.display = "none";
        hiddenElement.download = fileName;
        hiddenElement.innerHTML = "Download";
        document.body.appendChild(hiddenElement);
        //hiddenElement.click();
        
        canvas.animate = canvas.oldAnimate;
        delete canvas.oldAnimate;
      }
    };
  };

};