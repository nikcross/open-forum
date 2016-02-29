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