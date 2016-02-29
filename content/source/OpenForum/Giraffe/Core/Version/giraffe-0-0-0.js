//==============================================================================================================//
/* Version 0.0.0*/
/* Built on Wed Feb 10 2016 12:59:39 GMT-0000 (UTC) */
/* Built by /OpenForum/Javascript/Builder.*/
/* Do not edit as changes may be overwritten */
//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/giraffe-header.js*/
//==============================================================================================================//
/**
 * @overview
 * Griaffe HTML5 canvas graphics library
 * A set of Javascript objects that can be used to build animated
 * interactive graphics using the HTML5 canvas.
 * @author Nik Cross
 * @version 0.001 alpha
 * @license MIT
 */
/* End of: /OpenForum/Giraffe/Core/giraffe-header.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/giraffe-canvas.js*/
//==============================================================================================================//
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
/* End of: /OpenForum/Giraffe/Core/giraffe-canvas.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/giraffe-object.js*/
//==============================================================================================================//
/**
 * This is the prototype object for all graphics objects that can be placed on a canvas.
 * Extend this prototype to create your own GraphicsObject.
 * @class
 * 
 * @param {number} x the position the graphics object is to be drawn at on the x axis 
 * @param {number} y the position the graphics object is to be drawn at on the y axis 
 */
function GraphicsObject(x,y)
{
  this.canvasParent = null;
  this.canvas = null;
  this.x = x;
  this.y = y;
  this.rotation = 0;
  this.color = "black";
  this.fillColor = null;
  this.shadow = null;
  this.lineStyle = null;
  this.scaleX = 1;
  this.scaleY = 1;
  this.visible=true;
  this.mouseOver=false;

  /**#@+
   * @memberOf GraphicsObject
   */
  /**
   * @private
   */
  this._repaint = function()
  {
    this.canvasParent._store();
    if(this.canvas==undefined) {
    	this.canvas = this.canvasParent.canvasContext;
    }
    this.canvas.translate(this.x,this.y);
    if(this.scaleX!=1 || this.scaleY!=1)
    {
      this.canvas.scale(this.scaleX,this.scaleY);
    }
    if(this.rotation!=0)
    {
      this.canvas.rotate(this.rotation);
    }
    if(this.shadow!=null) {
    	this.canvas.shadowColor = this.shadow.color;
    	this.canvas.shadowBlur = this.shadow.blur;
    	this.canvas.shadowOffsetX = this.shadow.offsetX;
    	this.canvas.shadowOffsetY = this.shadow.offsetY;
  	}
    if(this.lineStyle!=null) {
    	this.canvas.lineWidth = this.lineStyle.thickness;
    	this.canvas.lineCap = this.lineStyle.endCap;
    }
    this.draw();
    this.canvasParent._restore();
  };

  /**
   * Uses the className to look up the values for color and background-color from
   * any css style sheet loaded in the current page.
   */
  this.setCSSClass = function(className) {
	  this.color = Giraffe.getCssValue(className,"color");
	  this.fillColor = Giraffe.getCssValue(className,"background-color");
	  return this;
  };
  
  /**
   * Sets the border outline color of the object.
   * @param {string} color a definition of the color. Can be in the form html color name eg. "blue", html hex color eg. '#00FF00' or red green blue alpha format eg. rgba(0,255,0,0.5)
   */
  this.setColor = function(color) {
    this.color=color;
    return this;
  };
  
  this.setShadow = function(shadow) {
	  this.shadow = shadow;
	  return this;
  };
  
  this.setLineStyle = function(lineStyle) {
	  this.lineStyle = lineStyle;
	  return this;
  };
  
  /**
   * Sets the fill color of the object.
   * @param {string} fillColor a definition of the color. Can be in the form html color name eg. "blue", html hex color eg. '#00FF00' or red green blue alpha format eg. rgba(0,255,0,0.5)
   */
  this.setFillColor = function(fillColor) {
    this.fillColor=fillColor;
    return this;
  };

  this.setRotation = function(rotation) {
	    this.rotation=rotation;
	    return this;
  };
  
  this.isInside = function(x,y){return false;};
  this.onClick = function(x,y){};
  this.onMouseOver = function(x,y){};
  this.onMouseOut = function(x,y){};
  this.onMousePressed = function(x,y){};
  this.onMouseReleased = function(x,y) {};
  this.animate = function(frame){};
  this.draw = function(){};
}
/**#@-*/
/* End of: /OpenForum/Giraffe/Core/giraffe-object.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/circle.js*/
//==============================================================================================================//
null
/* End of: /OpenForum/Giraffe/Core/circle.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/rectangle.js*/
//==============================================================================================================//
null
/* End of: /OpenForum/Giraffe/Core/rectangle.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/line.js*/
//==============================================================================================================//
null
/* End of: /OpenForum/Giraffe/Core/line.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/text.js*/
//==============================================================================================================//
null
/* End of: /OpenForum/Giraffe/Core/text.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/picture.js*/
//==============================================================================================================//
null
/* End of: /OpenForum/Giraffe/Core/picture.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/polygon.js*/
//==============================================================================================================//
null
/* End of: /OpenForum/Giraffe/Core/polygon.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/rounded-rectangle.js*/
//==============================================================================================================//
null
/* End of: /OpenForum/Giraffe/Core/rounded-rectangle.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/arc.js*/
//==============================================================================================================//
null
/* End of: /OpenForum/Giraffe/Core/arc.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/composite.js*/
//==============================================================================================================//
null
/* End of: /OpenForum/Giraffe/Core/composite.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/radial-color.js*/
//==============================================================================================================//
null
/* End of: /OpenForum/Giraffe/Core/radial-color.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/gradient-color.js*/
//==============================================================================================================//
null
/* End of: /OpenForum/Giraffe/Core/gradient-color.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/shadow.js*/
//==============================================================================================================//
null
/* End of: /OpenForum/Giraffe/Core/shadow.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/line-style.js*/
//==============================================================================================================//
null
/* End of: /OpenForum/Giraffe/Core/line-style.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/giraffe-core.js*/
//==============================================================================================================//
/**
 * Some helper methods used by Giraffe
 * @class
 */
Giraffe = {
		/**
		 * @private
		 */
		canvases : [],
		/**
		 * @private
		 */
		nextCanvasId : 0,		
		/**
		 * @private
		 */
		getCssValue : function(selector,attribute) {
			selector = selector.toLowerCase();
		   for(var sheet=0;sheet<document.styleSheets.length;sheet++) {
			   var stylesheet = document.styleSheets[sheet];
			   var n = stylesheet.cssRules.length;
			   for(var i=0; i<n; i++)
			   {
			      var selectors = stylesheet.cssRules[i].selectorText.toLowerCase().split(",");
			      var m = selectors.length;
			      for(var j=0; j<m; j++)
			      {
			         if(selectors[j].trim() == selector)
			         {
			            var value = stylesheet.cssRules[i].style.getPropertyValue(attribute);
			            if(value!="")
			            {
			               return value;
			            }
			         }
			      }
			   }
		   }
		   return null;
		}
};

Giraffe.X=0;
Giraffe.Y=1;
Giraffe.DEG_TO_RAD = Math.PI/180;
/* End of: /OpenForum/Giraffe/Core/giraffe-core.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/giraffe-animation.js*/
//==============================================================================================================//
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

/* End of: /OpenForum/Giraffe/Core/giraffe-animation.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/giraffe-transition.js*/
//==============================================================================================================//
null
/* End of: /OpenForum/Giraffe/Core/giraffe-transition.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/giraffe-transition-flip.js*/
//==============================================================================================================//
/**
 * Creates an animation sequence that squashes the x axis of a GraphicsObject
 * @class
 * @param target {GraphicsObject} the GraphicsObject to apply the animation to
 * @param frames integer the number of frames the animation should last for
 */
Giraffe.FlipOutX = function(target,frames) {
	this.frames = frames;
	this.target = target;
	this.canvas = target.canvasParent;
	this.register();
	this.currentFrame=0;

	/**
	 * @private
	 */
	this.process = function(frame) {
		this.target.scaleX = 1-((1*frame)/this.frames);
	};
};
Giraffe.FlipOutX.prototype = new Giraffe.Transition();

Giraffe.FlipInX = function(target,frames) {
	this.frames = frames;
	this.target = target;
	this.canvas = target.canvasParent;
	this.register();
	this.currentFrame=0;

	this.process = function(frame) {
		this.target.scaleX = (1*frame)/this.frames;
	};
};
Giraffe.FlipInX.prototype = new Giraffe.Transition();

Giraffe.FlipOutY = function(target,frames) {
	this.frames = frames;
	this.target = target;
	this.canvas = target.canvasParent;
	this.register();
	this.currentFrame=0;

	this.process = function(frame){
		this.target.scaleY = 1-((1*frame)/this.frames);
	};
};
Giraffe.FlipOutY.prototype = new Giraffe.Transition();

Giraffe.FlipInY = function(target,frames) {
	this.frames = frames;
	this.target = target;
	this.canvas = target.canvasParent;
	this.register();
	this.currentFrame=0;

	this.process = function(frame) {
		this.target.scaleY = (1*frame)/this.frames;
	};
};
Giraffe.FlipInY.prototype = new Giraffe.Transition();
/* End of: /OpenForum/Giraffe/Core/giraffe-transition-flip.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/giraffe-transition-move.js*/
//==============================================================================================================//
Giraffe.MoveSequence = function(target,frames,matrix) {
	this.frames = frames;
	this.target = target;
	this.matrix = matrix;
	this.canvas = target.canvasParent;
	this.register();
	this.currentFrame=0;

	this.process = function(frame) {
		if(this.matrix) {
			this.target.x+=this.matrix[Giraffe.X];
			this.target.y+=this.matrix[Giraffe.Y];
		} else {
			this.target.x+=this.target.vx;
			this.target.y+=this.target.vy;
		}
	};
};
Giraffe.MoveSequence.prototype = new Giraffe.Transition();
/* End of: /OpenForum/Giraffe/Core/giraffe-transition-move.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/giraffe-transition-rotate.js*/
//==============================================================================================================//
Giraffe.RotationSequence = function(target,frames,steps) {
	this.frames = frames;
	this.target = target;
	this.steps = steps;
	this.canvas = target.canvasParent;
	this.register();
	this.currentFrame=0;

	this.process = function(frame) {
		this.target.setRotation( this.target.rotation+(Giraffe.DEG_TO_RAD*this.steps) );
	};
};
Giraffe.RotationSequence.prototype = new Giraffe.Transition();
/* End of: /OpenForum/Giraffe/Core/giraffe-transition-rotate.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/giraffe-transition-explode.js*/
//==============================================================================================================//
Giraffe.ExplodeSequence = function(target,frames) {
	this.frames = frames;
	this.target = target;
	this.canvas = target.canvasParent;
	this.register();
	this.currentFrame=0;

	this.process = function(frame) {
		if(!this.parts) {
			this.parts = getExplodingParts(target);
		}
		
		var hasMinVelocity = false;
		for(i=0;i<this.parts.length;i++) {
			this.parts[i].x+=this.parts[i].vx;
			this.parts[i].y+=this.parts[i].vy;
			this.parts[i].vx*=0.9;
			this.parts[i].vy*=0.9;
			if(this.parts[i].vx>0.5 || this.parts[i].vx<-0.5 ||
				this.parts[i].vy>0.5 || this.parts[i].vy<-0.5) {
				hasMinVelocity=true;
			}
		}
		if(hasMinVelocity==false) {
			this.currentFrame = this.frames;
		}
	};
	
	var getExplodingParts = function(composite,parts) {
		if(!parts) {
			var parts = [];
		}
		for(var i=0;i<composite.parts.length;i++) {
			if(composite.parts[i].parts) { //is sub composite
				getExplodingParts(composite.parts[i],parts);
			}
			composite.parts[i].vx=composite.parts[i].x+((Math.random()*10)-5);
			composite.parts[i].vy=composite.parts[i].y+((Math.random()*10)-5);
			parts[parts.length]=composite.parts[i];
		}
		return parts;
	};
};
Giraffe.ExplodeSequence.prototype = new Giraffe.Transition();
/* End of: /OpenForum/Giraffe/Core/giraffe-transition-explode.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/giraffe-interactive.js*/
//==============================================================================================================//
null
/* End of: /OpenForum/Giraffe/Core/giraffe-interactive.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/giraffe-tablet.js*/
//==============================================================================================================//
null
/* End of: /OpenForum/Giraffe/Core/giraffe-tablet.js*/

//==============================================================================================================//
