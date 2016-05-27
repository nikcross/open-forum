//==============================================================================================================//
/* Version 1.0.2*/
/* Built on Mon Mar 14 2016 15:02:19 GMT-0000 (UTC) */
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
/*
* Author: 
* Description: 
*/
/**
 * Defines a graphics Circle primative
 * @class
 * @augments GraphicsObject
 * @param x {number} the position that the ... is to be drawn on the x axis
 * @param y {number} the position that the ... is to be drawn on the y axis
 * @param radius (number) the radius of the circle to be drawn. Must be greater than 0
 */
function Circle(x,y,radius)
{
	  /**#@+
	   * @memberOf Circle
	   */
  this.x=x;
  this.y=y;
  this.radius=radius;
  /**
   * @private
   */
  this.draw = function()
  {
    this.canvas.beginPath();
    if(this.fillColor!=null)
    {
      this.canvas.fillStyle = this.fillColor;
    }
    this.canvas.strokeStyle = this.color;
    this.canvas.arc(0,0,this.radius,0,6.2,false);
    this.canvas.closePath();
    if(this.fillColor!=null)
    {
      this.canvas.fill();
    }
    this.canvas.stroke(); 
  };
  
  /**
   * Checks to see if a given point lies inside the circle.
   * @param posX {number} the x axis of the point to check
   * @param posY {number} the y axis of the point to check
   * @returns true if the point lies within the Circle
   */
  this.isInside = function(posX,posY) {
		//alert("testing "+posX+","+posY);
	var xl = this.x-posX;
	var yl = this.y-posY;
	if( Math.round( 
		Math.pow( (xl*xl)+(yl*yl),0.5)
	)<this.radius) {
		return true;
	} else {
		return false;
	}
  };
}
Circle.prototype = new GraphicsObject();
/* End of: /OpenForum/Giraffe/Core/circle.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/rectangle.js*/
//==============================================================================================================//
/*
* Author: 
* Description: 
*/
/**
 * Defines a graphics Rectangle primative
 * @class
 * @augments GraphicsObject
 * @param x {number} the position that the ... is to be drawn on the x axis
 * @param y {number} the position that the ... is to be drawn on the y axis
 * @param width (number) the width of the rectangle
 * @param height (number) the height of the rectangle
 */
function Rectangle(x,y,width,height)
{
	  /**#@+
	   * @memberOf Rectangle
	   */
  this.x=x;
  this.y=y;
  this.width=width;
  this.height=height;

  /**
   * Checks to see if a given point lies inside the rectangle.
   * @param posX {number} the x axis of the point to check
   * @param posY {number} the y axis of the point to check
   * @returns true if the point lies within the Rectangle
   */
  this.isInside = function(posX,posY) {
	if(
		posX-this.x>0 &&
		posX-this.x<this.width &&
		posY-this.y>0 &&
		posY-this.y<this.height
		){ return true; } else { return false; }
  };
  
  /**
   * @private
   */
  this.draw = function()
  {
    this.canvas.beginPath();
    if(this.fillColor!=null)
    {
      this.canvas.fillStyle = this.fillColor;
    }
    this.canvas.strokeStyle = this.color;
    this.canvas.rect(0,0,this.width,this.height);
    this.canvas.closePath();
    if(this.fillColor!=null)
    {
      this.canvas.fillRect(0,0,this.width,this.height);
    }
    this.canvas.stroke();
  };
}
Rectangle.prototype = new GraphicsObject();
/* End of: /OpenForum/Giraffe/Core/rectangle.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/line.js*/
//==============================================================================================================//
/*
* Author: 
* Description: 
*/
/**
 * Defines a graphics Line primative from one point to another
 * @class
 * @augments GraphicsObject
 * @param x {number} the position that the Line is to be drawn on the x axis
 * @param y {number} the position that the Line is to be drawn on the y axis
 * @param x2 {number} the position that the Line is to be drawn to on the x axis
 * @param y2 {number} the position that the Line is to be drawn to on the y axis
 */
function Line(x,y,x2,y2)
{
	  /**#@+
	   * @memberOf Line
	   */
  this.x=x;
  this.y=y;
  this.x2=x2;
  this.y2=y2;

  /**
   * @private
   */
  this.draw = function()
  {
    this.canvas.strokeStyle = this.color;

    this.canvas.beginPath();
    this.canvas.moveTo(0,0); 
    this.canvas.lineTo(this.x2,this.y2);    
    //this.canvas.closePath();
    
    this.canvas.stroke(); 
  };
}
Line.prototype = new GraphicsObject();
/* End of: /OpenForum/Giraffe/Core/line.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/text.js*/
//==============================================================================================================//
/*
* Author: 
* Description: 
*/
/**
 * Defines a graphics primative
 * @class
 * @augments GraphicsObject
 * @param x {number} the position that the ... is to be drawn on the x axis
 * @param y {number} the position that the ... is to be drawn on the y axis
 */
function Text(x,y,text,textSize,font)
{
	  /**#@+
	   * @memberOf Text
	   */
  this.x=x;
  this.y=y;
  this.width=0;
  this.text=text;
  this.textSize=textSize;
  this.font = font;

  /**
   * @private
   */
  this.draw = function()
  {
    if(this.fillColor!=null)
    {
      this.canvas.fillStyle = this.fillColor;
    }
    this.canvas.strokeStyle = this.color;

    this.canvas.font = this.textSize+"px "+this.font;
    this.width = this.canvas.measureText(this.text).width;
    if(this.fillColor!=null)
    {
      this.canvas.fillText(this.text,0,0,400);
    }
    
    this.canvas.strokeText(this.text,0,0,400);
  };
  
  /**
   * Checks to see if a given point lies inside the bounds of the text.
   * @param posX {number} the x axis of the point to check
   * @param posY {number} the y axis of the point to check
   * @returns true if the point lies within the Text
   */
  this.isInside = function(posX,posY) {
	if(
		posX-this.x>(this.textSize/2) &&
		posX-this.x<this.textSize+(this.text.length*(this.textSize/2)) &&
		posY-this.y>-(this.textSize/2) &&
		posY-this.y<(this.textSize/2)
		){ return true; } else { return false; }
  };
}
Text.prototype = new GraphicsObject();
/* End of: /OpenForum/Giraffe/Core/text.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/picture.js*/
//==============================================================================================================//
/*
* Author: 
* Description: 
*/
/**
 * Defines a graphics Picture primative
 * @class
 * @augments GraphicsObject
 * @param x {number} the position that the picture is to be drawn on the x axis
 * @param y {number} the position that the picture is to be drawn on the y axis
 * @param src {string} the uri of the image to  be used. The image can be in gif, png or jpeg format.
 */
function Picture(x,y,src)
{
	  /**#@+
	   * @memberOf Picture
	   */
  this.x=x;
  this.y=y;
  this.img = new Image();
  this.img.src = src;
/**
 * @private
 */
  this.draw = function()
  {
    this.canvas.strokeStyle = this.color;
    this.canvas.drawImage(this.img,0,0);
  };
  
  /**
   * Checks to see if a given point lies inside the bounds of the picture.
   * @param posX {number} the x axis of the point to check
   * @param posY {number} the y axis of the point to check
   * @returns true if the point lies within the picture
   */
  this.isInside = function(posX,posY) {
	if(
		posX-this.x>0 &&
		posX-this.x<this.img.width &&
		posY-this.y>0 &&
		posY-this.y<this.img.height
		){ return true; } else { return false; }
  };
}
Picture.prototype = new GraphicsObject();
/* End of: /OpenForum/Giraffe/Core/picture.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/polygon.js*/
//==============================================================================================================//
/*
* Author: 
* Description: 
*/
/**
 * Defines a graphics primative
 * @class
 * @augments GraphicsObject
 * @param x {number} the position that the ... is to be drawn on the x axis
 * @param y {number} the position that the ... is to be drawn on the y axis
 */
function Polygon(x,y)
{
	  /**#@+
	   * @memberOf Polygon
	   */
  this.x=x;
  this.y=y;
  this.smooth = false;
  this.closed = true;

  this.points = [];
  this.addPoint = function(px,py) {
    this.points[this.points.length]=[px,py];
    return this;
  };
  /**
   * @private
   */
  this.draw = function()
  {
    this.canvas.beginPath();
    if(this.fillColor!=null)
    {
      this.canvas.fillStyle = this.fillColor;
    }
    this.canvas.strokeStyle = this.color;
    this.canvas.moveTo(this.points[0][0],this.points[0][1]);
    
    if(this.smooth === false) {
      for(var i=1;i<this.points.length;i++) {
        this.canvas.lineTo(this.points[i][0],this.points[i][1]);
      }
      if(this.closed) {
        this.canvas.lineTo(this.points[0][0],this.points[0][1]);
      }
    } else {
         for(var i=1;i<this.points.length ;i++) {
           		var ia = i%this.points.length;
           		var ib = (i+1)%this.points.length;
                var xc = (this.points[ia][0] + this.points[ib][0]) / 2;
                var yc = (this.points[ia][1] + this.points[ib][1]) / 2;
                this.canvas.quadraticCurveTo(this.points[ia][0], this.points[ia][1], xc, yc);
         }
    }
    
    if(this.fillColor!=null)
    {
      this.canvas.fill();
    }
    this.canvas.stroke(); 
  };
}
Polygon.prototype = new GraphicsObject();
/* End of: /OpenForum/Giraffe/Core/polygon.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/rounded-rectangle.js*/
//==============================================================================================================//
/*
* Author: 
* Description: 
*/
/**
 * Defines a graphics RoundedRectangle primative
 * @class
 * @augments GraphicsObject
 * @param x {number} the position that the ... is to be drawn on the x axis
 * @param y {number} the position that the ... is to be drawn on the y axis
 * @param width (number) the width of the rectangle
 * @param height (number) the height of the rectangle
 * @param radius (number) the radius of the rectangle corners
 */
function RoundedRectangle(x,y,width,height,radius)
{
	  /**#@+
	   * @memberOf Rectangle
	   */
  this.x=x;
  this.y=y;
  this.width=width;
  this.height=height;
  this.radius=radius;

  /**
   * Checks to see if a given point lies inside the rectangle.
   * @param posX {number} the x axis of the point to check
   * @param posY {number} the y axis of the point to check
   * @returns true if the point lies within the Rectangle
   */
  this.isInside = function(posX,posY) {
	if(
		posX-this.x>0 &&
		posX-this.x<this.width &&
		posY-this.y>0 &&
		posY-this.y<this.height
		){ return true; } else { return false; }
  };
  
  /**
   * @private
   */
  this.draw = function()
  {
    this.canvas.beginPath();
    if(this.fillColor!==null)
    {
      this.canvas.fillStyle = this.fillColor;
    }
    this.canvas.strokeStyle = this.color;
    
  this.canvas.moveTo(this.radius, 0);
  this.canvas.arcTo(this.width, 0,   this.width, this.height, this.radius);
  this.canvas.arcTo(this.width, this.height, 0,   this.height, this.radius);
  this.canvas.arcTo(0,   this.height, 0,   0,   this.radius);
  this.canvas.arcTo(0,   0,   this.width, 0,   this.radius);
    
    if(this.fillColor!==null)
    {
      this.canvas.fill();
    }
    this.canvas.stroke(); 
  };
}
RoundedRectangle.prototype = new GraphicsObject();
/* End of: /OpenForum/Giraffe/Core/rounded-rectangle.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/arc.js*/
//==============================================================================================================//
/*
* Author: 
* Description: 
*/
/**
 * Defines a graphics primative
 * @class
 * @augments GraphicsObject
 * @param x {number} the position that the ... is to be drawn on the x axis
 * @param y {number} the position that the ... is to be drawn on the y axis
 */
function Arc(x,y,startAngle,sweepAngle,radius)
{
	  /**#@+
	   * @memberOf Arc
	   */
  this.x=x;
  this.y=y;
  this.closed=true;
  this.startAngle=startAngle;
  this.sweepAngle=sweepAngle;
  this.radius=radius;
  /**
   * @private
   */
  this.draw = function()
  {
    this.canvas.beginPath();
    if(this.fillColor!=null)
    {
      this.canvas.fillStyle = this.fillColor;
    }
    var startAngleRad = this.startAngle*2*Math.PI/360;
    var sweepAngleRad = ((this.startAngle+this.sweepAngle)%360)*2*Math.PI/360;

    this.canvas.strokeStyle = this.color;
    if(this.closed==true) {
    	this.canvas.moveTo(0,0);
	    this.canvas.lineTo(
    		Math.cos(startAngleRad)*radius,
      		Math.sin(startAngleRad)*radius
    	);
    }
    this.canvas.arc(0,0,this.radius,startAngleRad,sweepAngleRad,false);
    if(this.closed==true) {
    	this.canvas.lineTo( 0,0 );
    }
    this.canvas.closePath();
    if(this.fillColor!=null)
    {
      this.canvas.fill();
    }
    this.canvas.stroke();
  };

  this.setColor = function(color) {
    this.color = color;
    return this;
  };
  this.setFillColor = function(fillColor) {
    this.fillColor= fillColor;
    return this;
  };
  
  this.isInside = function(posX,posY) {
	var xl = this.x-posX;
	var yl = this.y-posY;
	var d = Math.pow( (xl*xl)+(yl*yl),0.5);
	if( d<this.radius ) {
		if(xl==0 && yl==0) return true;
		var a = Math.atan(yl/xl);
		if(xl>0) a=Math.PI+a;
		if(a<0) a=(Math.PI*2)+a;
		a = (a*180)/(Math.PI);
		if(a>=this.startAngle &&
		a<=this.startAngle+this.sweepAngle) {
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
  };
  this.setClosed = function() {
  	this.closed=true;
  	return this;
  };
  this.setOpen = function() {
  	this.closed=false;
  	return this;
  };
}
Arc.prototype = new GraphicsObject();
/* End of: /OpenForum/Giraffe/Core/arc.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/composite.js*/
//==============================================================================================================//
/*
* Author: 
* Description: 
*/
/**
 * Defines a graphics primative
 * @class
 * @augments GraphicsObject
 * @param x {number} the position that the ... is to be drawn on the x axis
 * @param y {number} the position that the ... is to be drawn on the y axis
 */
function Composite(x,y,rotation)
{
  /**#@+
	   * @memberOf Composite
	   */
  this.x=x;
  this.y=y;
  this.rotation=rotation;
  this.parts = [];
  this.masked = false;

  this.add = function( part )
  {
    if(part.canvasParent!=null)
    {
      return;
    }
    part.canvasParent = this.canvasParent;
    this.parts[this.parts.length] = part;
    return this;
  };

  this.remove = function( part ) {
    for(this.loop=0;this.loop<this.parts.length;this.loop++)
    {
      if(this.parts[this.loop]==part) {
        part.canvasParent=null;
        this.parts.splice(this.loop,1);
      }
    }
  };

  this.deconstruct = function() {
    for(this.loop=0;this.loop<this.parts.length;this.loop++)
    {
      var part = this.parts[this.loop];
      part.x += this.x;
      part.y += this.y;
      part.onMouseOver = this.onMouseOver;
      part.onMouseOut = this.onMouseOut;
      part.onMousePressed = this.onMousePressed;
      part.onMouseReleased = this.onMouseReleased;
      part.onClick = this.onClick;
      part.rotation += this.rotation;
      part.canvasParent=null;
      this.canvasParent.add( part );
    }
    this.parts = new Array();
  };
  /**
   * @private
   */  
  this.draw = function()
  {
    var hasMask = false;
    for(this.loop=0;this.loop<this.parts.length;this.loop++)
    {
      if(this.parts[this.loop].canvasParent==null)
      {
        this.parts[this.loop].canvasParent=this.canvasParent;
        this.parts[this.loop].canvas=this.canvas;
      }
      if(this.parts[this.loop].visible==true) {
        this.parts[this.loop]._repaint();

        if(this.loop==0 && this.masked==true) {
          hasMask = true;
          this.canvasParent._store();
          this.canvas.clip();
        }
      }
    }
    if(hasMask) {
    	this.canvasParent._restore();
    }
  };

  this.animate = function(frame) {
    for(this.loop=0;this.loop<this.parts.length;this.loop++)
    {    
      this.parts[this.loop].animate(frame);
    }
  };

  this.isInside = function(posX,posY) {
    for(this.loop=0;this.loop<this.parts.length;this.loop++)
    {    
      if(this.parts[this.loop].visible===true && this.parts[this.loop].isInside(posX-this.x,posY-this.y)) {
        return true;
      }
    }
    return false;
  };

  this.onClick = function(posX,posY) {
    for(this.loop=0;this.loop<this.parts.length;this.loop++)
    {    
      if(this.parts[this.loop].visible===true && this.parts[this.loop].isInside(posX-this.x,posY-this.y)) {
        this.parts[this.loop].onClick(posX-this.x,posY-this.y);
      }
    }
    return false;
  };
  this.onMouseOver = function(posX,posY) {
    for(this.loop=0;this.loop<this.parts.length;this.loop++)
    {
      if(this.parts[this.loop].visible===true && this.parts[this.loop].isInside(posX-this.x,posY-this.y)) {    
        this.parts[this.loop].onMouseOver(posX-this.x,posY-this.y);
        this.parts[this.loop].mouseOver=true;
      } else if(this.parts[this.loop].mouseOver==true) {
        this.parts[this.loop].mouseOver=false;
        this.parts[this.loop].onMouseOut(posX-this.x,posY-this.y);
      }
    }
  };
  this.onMouseOut = function(posX,posY) {
    for(this.loop=0;this.loop<this.parts.length;this.loop++)
    {
      if(this.parts[this.loop].mouseOver==true) {
        this.parts[this.loop].mouseOver=false;
        this.parts[this.loop].onMouseOut(posX-this.x,posY-this.y);
      }
    }
  };
  this.onMousePressed = function(posX,posY) {
    for(this.loop=0;this.loop<this.parts.length;this.loop++)
    {    
      if(this.parts[this.loop].visible===true && this.parts[this.loop].isInside(posX-this.x,posY-this.y)) {  
        this.parts[this.loop].onMousePressed(posX-this.x,posY-this.y);
      }
    }
  };
  this.onMouseReleased = function(posX,posY) {
    for(this.loop=0;this.loop<this.parts.length;this.loop++)
    {    
      this.parts[this.loop].onMouseReleased(posX-this.x,posY-this.y);
    }
  };
}
Composite.prototype = new GraphicsObject();
/* End of: /OpenForum/Giraffe/Core/composite.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/radial-color.js*/
//==============================================================================================================//
/*
* Author: 
* Description: 
*/
/**
 * Defines a graphics primative
 * @description
 * <iframe src="/web/giraffe/examples/giraffe-examples-home-page.html" width="500" height="500"></iframe>
 * @class
 * @augments GraphicsObject
 * @param x {number} the position that the ... is to be drawn on the x axis
 * @param y {number} the position that the ... is to be drawn on the y axis
 */
function RadialColor(canvas,color1,color2,x,y,radius) {
	  /**#@+
	   * @memberOf RadialColor
	   */
  this.canvas = canvas.canvasContext;
  this.colorStop = new Array();
  this.colorStop[0] = [0,color1,0,0,radius];
  this.colorStop[1] = [1,color2,x,y,0];

  this.getColor = function() {
    gradient = this.canvas.createRadialGradient(
      this.colorStop[1][2],this.colorStop[1][3],this.colorStop[1][4],
      this.colorStop[0][2],this.colorStop[0][3],this.colorStop[0][4]
    );
    var i=0;
    for(i=0;i<this.colorStop.length;i++)
    {
      gradient.addColorStop(this.colorStop[i][0],this.colorStop[i][1]);
    }
    return gradient;
  };
}
/* End of: /OpenForum/Giraffe/Core/radial-color.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/gradient-color.js*/
//==============================================================================================================//
/*
* Author: 
* Description: 
*/
function GradientColor(canvas,color1,color2,x1,y1,x2,y2) {
	  /**#@+
	   * @memberOf RadialColor
	   */
this.canvas = canvas.canvasContext;
this.colorStop = new Array();
this.colorStop[0] = [0,color1,x1,y1];
this.colorStop[1] = [1,color2,x2,y2];

this.getColor = function() {
  gradient = this.canvas.createLinearGradient(
    this.colorStop[1][2],this.colorStop[1][3],
    this.colorStop[0][2],this.colorStop[0][3]
  );
  var i=0;
  for(i=0;i<this.colorStop.length;i++)
  {
    gradient.addColorStop(this.colorStop[i][0],this.colorStop[i][1]);
  }
  return gradient;
};
}
/* End of: /OpenForum/Giraffe/Core/gradient-color.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/shadow.js*/
//==============================================================================================================//
/*
* Author: 
* Description: 
*/
function Shadow() {
    this.color = '#999';
    this.blur = 20;
    this.offsetX = 15;
    this.offsetY = 15;
}
/* End of: /OpenForum/Giraffe/Core/shadow.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/line-style.js*/
//==============================================================================================================//
/*
* Author: 
* Description: 
*/
function LineStyle() {
	this.thickness=1.5;
	this.endCap = 'round';
	this.setThickness = function(thickness) {
		this.thickness = thickness;
		return this;
	};
	this.setEndCap = function(endCap) {
		this.endCap = endCap;
		return this;
	};
}
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
/*
* Author: 
* Description: 
*/
Giraffe.Transition = function(target,frames) {
	this.frames = frames;
	this.target = target;
	this.canvas = null;
	this.currentFrame=0;
	this.play = false;
	
	this.start = function() {
		this.register();
		this.currentFrame=0;
		this.play=true;
	};
	this.process = function(frame){};
	
	this.processFrame = function() {
		if(this.play==false) { return; };
		this.currentFrame++;
		if(this.currentFrame==this.frames+1) {
			this.unregister();
			this.doNext();
		}
		if(this.currentFrame>this.frames) {
			return false;
		}
		
		this.process(this.currentFrame);
	};
	
	this.doNext = function(){};
	this.register = function(){
		this.canvas.addAnimationListener(this);
	};
	this.unregister = function(){
		this.canvas.removeAnimationListener(this);
	};
};
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
/*
* Author: 
* Description: 
*/
Giraffe.Interactive = {
		shiftKeyDown : false,
		controlKeyDown : false,
		init : function() {
			document.onkeydown = Giraffe.Interactive.keyDownHandler;
			document.onkeyup = Giraffe.Interactive.keyUpHandler;
			shiftKeyDown = false;
			controlKeyDown = false;
		},
		keyDownHandler : function(e) {
		    var pressedKey;
		    if (document.all) { e = window.event;
		        pressedKey = e.keyCode; }
		    if (e.which) {
		        pressedKey = e.which;
		    }
			if(pressedKey===16) {
				Giraffe.Interactive.shiftKeyDown=true;
			} else if(pressedKey===17) {
				Giraffe.Interactive.controlKeyDown=true;
			}
		},
		keyUpHandler : function(e) {
		    var pressedKey;
		    if (document.all) { e = window.event;
		        pressedKey = e.keyCode; }
		    if (e.which) {
		        pressedKey = e.which;
		    }
			if(pressedKey===16) {
				Giraffe.Interactive.shiftKeyDown=false;
			} else if(pressedKey===17) {
				Giraffe.Interactive.controlKeyDown=false;
			}
		},
		isDragging : function() {
			if( self.dragging && self.dragging.length>0 ) {
				return true;
			} else {
				return false;
			}
		},
		setInteractive : function(canvas) {
  			var canvas = canvas;
  
		  canvas.convertEvent = function(event,element) { 
			  position = getPosition(element);
			  x=event.x-position[Giraffe.X];
			  y=event.y-position[Giraffe.Y];
			  return {
				x : x, y : y  
			  };
		  };
  
		  canvas.onClick = function(event) {
		    event = canvas.convertEvent(event,canvas.canvasElement);
				
			for(this.loop=0;this.loop<canvas.graphicsObjects.length;this.loop++)
		    {
			  if(canvas.graphicsObjects[this.loop].visible===true && canvas.graphicsObjects[this.loop].isInside(event.x,event.y)) {
				canvas.graphicsObjects[this.loop].onClick(event.x,event.y);
			  }
			 }
		  };
		 canvas.onMouseDown = function(event) {
		event = canvas.convertEvent(event,canvas.canvasElement);
			
	    if(canvas.dragAndDrop==true) {
			canvas.dragStart=[event.x,event.y];
            canvas.lastDx = 0;
            canvas.lastDy = 0;
          
			canvas.dragging=new Array();
		}
		for(var dragTarget in canvas.draggable) {
			dragTarget=canvas.draggable[dragTarget];
	
			if(dragTarget.isInside(event.x,event.y)) {
				var included = false;
				for(var check in canvas.dragging) {
					check = canvas.dragging[check];
					if(check==dragTarget) {
						included=true;
						break;
					}
				}
				if(included==true) {
					continue;
				}
				dragTarget.dragging=true;
				canvas.dragging[canvas.dragging.length]=dragTarget;
				dragTarget.dragStart=[dragTarget.x,dragTarget.y];
				if(Giraffe.Interactive.shiftKeyDown==false) break;
			}
		}
		
		for(this.loop=0;this.loop<canvas.graphicsObjects.length;this.loop++)
	    {
		  if(canvas.graphicsObjects[this.loop].visible===true && canvas.graphicsObjects[this.loop].isInside(event.x,event.y)) {
			canvas.graphicsObjects[this.loop].onMousePressed(event.x,event.y);
		  }
		 }
	  };
	  canvas.setDragging = function(dragTarget) {
	  
 // alert("Here: "+dragTarget.x+","+dragTarget.y);
  
	  	dragTarget.dragging=true;
		canvas.dragging[canvas.dragging.length]=dragTarget;
		dragTarget.dragStart=[dragTarget.x,dragTarget.y];
	  };
	  canvas.onMouseUp = function(event) {
		event = canvas.convertEvent(event,canvas.canvasElement);
			
		if(canvas.dragAndDrop==true && canvas.dragging.length>0) {
			for(this.loop=0;this.loop<canvas.graphicsObjects.length;this.loop++)
			{
				if(canvas.graphicsObjects[this.loop].dragging) {
					canvas.graphicsObjects[this.loop].dragging=false;
				}
				if(canvas.graphicsObjects[this.loop].isInside(event.x,event.y)) {
					if(canvas.graphicsObjects[this.loop].onCatch) {
						for(var dropped in canvas.dragging) {
							dropped = canvas.dragging[dropped];
							if(canvas.graphicsObjects[this.loop]==dropped) {
								continue;
							}
							canvas.graphicsObjects[this.loop].onCatch(dropped,event.x,event.y);
						}
					}
				}
			}
	  		canvas.dragging=new Array();
		}
		for(this.loop=0;this.loop<canvas.graphicsObjects.length;this.loop++)
	    {
			canvas.graphicsObjects[this.loop].onMouseReleased(event.x,event.y);
		}
	  }
	  canvas.onMouseMoved = function(event) {
		event = canvas.convertEvent(event,canvas.canvasElement);
		
	    if(canvas.dragAndDrop==true) {
			var dragDX = event.x-canvas.dragStart[0];
			var dragDY = event.y-canvas.dragStart[1];
          
			for(var dragTarget in canvas.dragging) {
				dragTarget = canvas.dragging[dragTarget];
				dragTarget.x = dragTarget.x+(dragDX-canvas.lastDx);
				dragTarget.y = dragTarget.y+(dragDY-canvas.lastDy);
			}
          
            canvas.lastDx = dragDX;
            canvas.lastDy = dragDY;
		}
		for(this.loop=0;this.loop<canvas.graphicsObjects.length;this.loop++)
	    {
		  if(canvas.graphicsObjects[this.loop].isInside(event.x,event.y)) {
			canvas.graphicsObjects[this.loop].mouseOver=true;
			canvas.graphicsObjects[this.loop].onMouseOver(event.x,event.y);
		  } else if(canvas.graphicsObjects[this.loop].mouseOver==true) {
			canvas.graphicsObjects[this.loop].mouseOver=false;
			canvas.graphicsObjects[this.loop].onMouseOut(event.x,event.y);
		  }
		}
	  }
	  
	  canvas.makeDraggable = function(object) {
		this.dragAndDrop = true;
		this.draggable[this.draggable.length]=object;
	  }
	  canvas.removeDraggable = function(object) {
		//this.dragAndDrop = false;
		var foundIndex = -1;
		for(var index in this.draggable) {
			if(this.draggable[index]==object) {
				foundIndex = index;
				break;
			}
		}
		if(foundIndex!=-1) {
			this.draggable.splice(foundIndex,1);
		}
	  }
	  
	  canvas.dragStart = [0,0];
	  canvas.dragging = new Array();
	  canvas.draggable = new Array();
	  canvas.dragAndDrop = false; 
	  
		canvas.canvasElement.onmousemove = canvas.onMouseMoved;
		canvas.canvasElement.onmouseup = canvas.onMouseUp;
		canvas.canvasElement.onmousedown = canvas.onMouseDown;
		canvas.canvasElement.onclick = canvas.onClick;
	}
}
Giraffe.Interactive.init();

/* behaviours */
function setReveal(target,reveal) {
	target.onMouseOver = function(x,y) {
		reveal.visible=true;
	}
	target.onMouseOut = function(x,y) {
		reveal.visible=false;
	}
	reveal.visible=false;
}

function getPosition(obj) {
	this.curleft = this.curtop = 0;
	if (obj.offsetParent) {
		this.curleft = obj.offsetLeft
		this.curtop = obj.offsetTop
		while (obj = obj.offsetParent) {
			this.curleft += obj.offsetLeft
			this.curtop += obj.offsetTop
		}
	}
	return [this.curleft,this.curtop];
}
/* End of: /OpenForum/Giraffe/Core/giraffe-interactive.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/giraffe-tablet.js*/
//==============================================================================================================//
Giraffe.Tablet = {
		enableTouch : function(canvas) {
			var canvas = canvas;
			canvas.canvasElement.addEventListener("touchstart",
		       function(event) {
		         event.preventDefault();
		         canvas.onMouseDown( {x:event.targetTouches[0].pageX,y:event.targetTouches[0].pageY } );
		       }, false
		    );
			canvas.canvasElement.addEventListener("touchmove",
		       function(event) {
		         event.preventDefault();
		         canvas.onMouseMoved( {x:event.targetTouches[0].pageX,y:event.targetTouches[0].pageY } );
		       }, false
		    );
		  
			canvas.canvasElement.addEventListener("touchend",
		       function(event) {
		         event.preventDefault();
		         canvas.onMouseUp( {x:0,y:0} );
		       }, false
		    );
		}
};

var tiltMouseX=0;
var tiltMouseY=0;
var tiltMouseDown=false;
Giraffe.Tablet.convertRotationToMouse = function(canvas) {
	Giraffe.Tablet.noramlizeOrientationEvents();
	deviceOrientationHandler = function(tiltLR, tiltFB, dir, motUD) {
//		var canvas = canvas;
		
		console.log( "event: tiltLR="+tiltLR+", tiltFB="+tiltFB+", dir="+dir+", motUD="+motUD );
		
		var mouseClick = false;
		if(tiltLR!=0 && tiltLR!=null) {
			if(tiltMouseDown==false) {
				mouseClick=true;
			}
			tiltMouseX+=tiltLR;
		}
		if(tiltFB!=0 && tiltFB!=null) {
			if(tiltMouseDown==false) {
				mouseClick=true;
			}
			tiltMouseY+=tiltFB;
		}
		if(mouseClick==true) {
			tiltMouseDown=true;
			canvas.onMouseDown( {x:tiltMouseX,y:tiltMouseY } );
		} else if(tiltLR==0 && tiltFB==0) {
			tiltMouseDown=false;
			canvas.onMouseUp( {x:tiltMouseX,y:tiltMouseY } );
		}
        canvas.onMouseMoved( {x:tiltMouseX,y:tiltMouseY } );
	};
};

//http://www.html5rocks.com/en/tutorials/device/orientation/
Giraffe.Tablet.noramlizeOrientationEvents = function() {
	if (window.DeviceOrientationEvent) {
	  // Listen for the deviceorientation event and handle the raw data
	  window.addEventListener('deviceorientation', function(eventData) {
	    // gamma is the left-to-right tilt in degrees, where right is positive
	    var tiltLR = eventData.gamma;

	    // beta is the front-to-back tilt in degrees, where front is positive
	    var tiltFB = eventData.beta;

	    // alpha is the compass direction the device is facing in degrees
	    var dir = eventData.alpha;

	    // deviceorientation does not provide this data
	    var motUD = null;

	    // call our orientation event handler
	    deviceOrientationHandler(tiltLR, tiltFB, dir, motUD);
	  }, false);
	} else if (window.OrientationEvent) {
	  window.addEventListener('MozOrientation', function(eventData) {
	    // x is the left-to-right tilt from -1 to +1, so we need to convert to degrees
	    var tiltLR = eventData.x * 90;

	    // y is the front-to-back tilt from -1 to +1, so we need to convert to degrees
	    // We also need to invert the value so tilting the device towards us (forward) 
	    // results in a positive value. 
	    var tiltFB = eventData.y * -90;

	    // MozOrientation does not provide this data
	    var dir = null;

	    // z is the vertical acceleration of the device
	    var motUD = eventData.z;
	    
	    // call our orientation event handler
	    deviceOrientationHandler(tiltLR, tiltFB, dir, motUD);
	  }, false);
	} else {
	  console.log( "Not supported on your device or browser." );
	}
}
/* End of: /OpenForum/Giraffe/Core/giraffe-tablet.js*/

//==============================================================================================================//
