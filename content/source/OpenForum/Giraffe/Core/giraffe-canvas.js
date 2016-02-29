/**
 * Canvas is the Giraffe representation of a canvas element on
 * a page.
 * @description
 * It can have any number of GraphicsObject added to it,
 * each drawn at its required place.
 * An instance of Canvas can also be used to control animation and interaction
 * between the user and GraphicsObjects using the Giraffe Animation library and
 * the Giraffe Interactive library
 * @class
 * @param {String} canvasElementId dom canvas id
 */
function Canvas(canvasElementId)
{
  var self=this;
  this.id = "canvas"+Giraffe.nextCanvasId;
  Giraffe.nextCanvasId++;
  
  Giraffe.canvases[ this.id ] = this;

  this.graphicsObjects = [];
  this.canvasElement = document.getElementById(canvasElementId);

/*  if(BrowserDetect.browser=="MSIE" || BrowserDetect.browser=="Explorer") 
  {
     this.canvasElement = window.G_vmlCanvasManager.initElement(this.canvasElement); 
  }*/

  this.width = this.canvasElement.width;
  this.height = this.canvasElement.height;
  this.canvasContext = this.canvasElement.getContext('2d');

  this.canvasContext.clearRect(0,0,this.width,this.height); // clear canvas
  
  this.scaleX=1;
  this.scaleY=1;
  
  /**#@+
   * @memberOf Canvas
   */
  
  /**
   * Sets the scale of all graphics on the canvas. May be used to zoom in and out.
   * @param {float} scaleX the multiplier scale for the x axis. Must be greater than 0.
   * @param {float} scaleY the multiplier scale for the y axis. Must be greater than 0.
   */
  this.scale = function(scaleX,scaleY) {
      this.scaleX=scaleX;
      this.scaleY=scaleY;
  };
  
  this.scaleSet=false;
  
  /**
   * Clears the canvas and repaints all graphics on the canvas.
   * If not using the animation library, this method is called to
   * render the GraphicsObjects onto the canvas.
   */
  this.repaint = function()
  {
    this.canvasContext.clearRect(0,0,this.width,this.height); // clear canvas

    if(this.scaleSet==false) {
    	this.canvasContext.scale(this.scaleX,this.scaleY);
    	this.scaleSet=true;
    }
    for(this.loop=0;this.loop<this.graphicsObjects.length;this.loop++)
    {
    	if(this.graphicsObjects[this.loop].visible==true) {
    		this.graphicsObjects[this.loop]._repaint();
    	}
    }
  };

  /**
   * @private
   */
  this._store = function() {
    this.canvasContext.save();
  };

  /**
   * @private
   */
  this._restore = function() {
    this.canvasContext.restore();
  };

  /**
   * Adds a GraphicsObject instance to the canvas to be drawn
   * @param {GraphicsObject} graphicsObject an instance of a GraphicsObject to add to the canvas.
   *
   */
  this.add = function( graphicsObject )
  {
    this.graphicsObjects[this.graphicsObjects.length] = graphicsObject;
    graphicsObject.canvasParent = this;
    graphicsObject.canvas = this.canvasContext;
    graphicsObject.draw(); // initialises composites
  };
  
  /**
   * Removes a GraphicsObject instance from the canvas.
   * @param {GraphicsObject} graphicsObject to be removed
   */
  this.remove = function( graphicsObject ) {
	for(this.loop=0;this.loop<this.graphicsObjects.length;this.loop++)
    {
		if(this.graphicsObjects[this.loop]==graphicsObject) {
			graphicsObject.canvasParent=null;
			this.graphicsObjects.splice(this.loop,1);
		}
	}
  };
  
  /**
   * Stretches a canvas to fit a window while maintaining the design aspect ratio
   * @param screenDesignSize {Giraffe.Size} the width and height intended for the canvas
   */
  this.stretchToFitWindow = function() {
	 	var designWidth = this.canvasElement.width;
	 	var designHeight = this.canvasElement.height;
	 	
	 	var scaleChange = 1;
	   	var docWidth = window.innerWidth;
	   	var docHeight = window.innerHeight;

	   	if (docWidth != designWidth) {
	   		var scaleX = docWidth / designWidth;
	   		var scaleY = docHeight / designHeight;
	   		
	   		if (scaleX < scaleY) {
	   			scaleChange = scaleX;
	   		} else {
	   			scaleChange = scaleY;
	   		}
	   		
	   		this.scale(scaleChange,scaleChange);
	   	  	this.canvasElement.width = designWidth*scaleChange;
	   	  	this.canvasElement.height = designHeight*scaleChange;
	   	}
	   };
}
/**#@-*/