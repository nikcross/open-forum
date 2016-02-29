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