
Giraffe.quickStart = function( canvasId, fullscreen ) {

  var canvas = document.getElementById(canvasId);
  
  if( fullscreen ) {
    try {
      if (canvas.requestFullscreen) {
        canvas.requestFullscreen();
      } else if (canvas.webkitRequestFullscreen) {
        canvas.webkitRequestFullscreen();
      } else if (canvas.mozRequestFullScreen) {
        canvas.mozRequestFullScreen();
      } else if (canvas.msRequestFullscreen) {
        canvas.msRequestFullscreen();
      } 
    } catch(e) {
    }

    document.body.style.overflow="hidden";
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;

    window.scrollTo(0,1);
  }

  var giraffeCanvas = new Canvas( canvasId ); // Register html canvas element
  Giraffe.Interactive.setInteractive(giraffeCanvas); // If mouse interaction required
  Giraffe.setAnimated(giraffeCanvas); // If animation required
  giraffeCanvas.startAnimation(20,100,true); // frames per second, frame count in loop, looped 
  
  giraffeCanvas.width = canvas.width;
  giraffeCanvas.height = canvas.height;
  
  return giraffeCanvas;
};