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
    for(this.loop=0;this.loop<this.parts.length;this.loop++)
    {
      if(this.parts[this.loop].canvasParent==null)
      {
        this.parts[this.loop].canvasParent=this.canvasParent;
        this.parts[this.loop].canvas=this.canvas;
      }
      if(this.parts[this.loop].visible==true) {
    	  this.parts[this.loop]._repaint();
      }
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