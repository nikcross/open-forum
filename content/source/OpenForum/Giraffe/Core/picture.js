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