Giraffe.setAnimated = function(canvas) {
  canvas.frame = 0;
  canvas.timer = null;
  canvas.frames = 0;
  canvas.looped = true;
  canvas.fps = 0;
  canvas.animationListeners = new Array();

  canvas.addAnimationListener = function(listener) {
  	this.animationListeners[this.animationListeners.length]=listener;
  };
  canvas.removeAnimationListener = function(listener) {
	for(this.loop=0;this.loop<this.animationListeners.length;this.loop++)
    {
		if(this.animationListeners[this.loop]==listener) {
			this.animationListeners.splice(this.loop,1);
		}
	}
  };

  canvas.startAnimation = function(fps,frames,looped)
  {
    this.frame = 0;
    this.frames = frames;
    this.looped = looped;
    this.fps = fps;
    this.timer = setTimeout("Giraffe.canvases[\""+this.id+"\"].animate();",1000/this.fps);
  };

  canvas.stopAnimation = function()
  {
    clearInterval( this.interval );
  };

  canvas.processing = false;
  
  canvas.animate = function()
  {
    if(this.processing===true) {
      console.log("running slow");
      return;
    }
    this.processing = true;
    try{
    
        for(this.loop=0;this.loop<this.animationListeners.length;this.loop++)
        {
          this.animationListeners[this.loop].processFrame(this.frame);
        }
        for(this.loop=0;this.loop<this.graphicsObjects.length;this.loop++)
        {
          this.graphicsObjects[this.loop].animate(this.frame);
        }
        this.repaint();
        this.frame++;
        if(this.frame>=this.frames)
        {
          if(this.looped==true)
          {
            this.frame=0;
          }
          else
          {
            this.stopAnimation();
          }
        }
      
    } catch(e) {
      console.log(e);
    }
    this.processing = false;
    
    this.timer = setTimeout("Giraffe.canvases[\""+this.id+"\"].animate();",1000/this.fps);
  };
};
