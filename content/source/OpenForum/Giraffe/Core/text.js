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