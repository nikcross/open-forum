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
Giraffe.Rectangle = function(x,y,width,height)
{
  /**#@+
	   * @memberOf Rectangle
	   */
  var self = this;
  self.x=x;
  self.y=y;
  self.width=width;
  self.height=height;
  self.type="Rectangle";

  /**
   * Checks to see if a given point lies inside the rectangle.
   * @param posX {number} the x axis of the point to check
   * @param posY {number} the y axis of the point to check
   * @returns true if the point lies within the Rectangle
   */
  self.isInside = function(posX,posY) {
    var rPos = self.getRelativePosition(posX,posY);
    posX = rPos.x;
    posY = rPos.y;

    if(
      posX>0 &&
      posX<self.width &&
      posY>0 &&
      posY<self.height
    ){ return true; } else { return false; }
  };

  /**
   * @private
   */
  self.draw = function()
  {
    self.canvas.beginPath();
    if(self.fillColor!=null)
    {
      self.canvas.fillStyle = self.fillColor;
    }
    self.canvas.strokeStyle = self.color;
    self.canvas.rect(0,0,self.width,self.height);
    self.canvas.closePath();
    if(self.fillColor!=null)
    {
      self.canvas.fillRect(0,0,self.width,self.height);
    }
    self.canvas.stroke();
  };
};
Giraffe.Rectangle.prototype = new Giraffe.GraphicsObject();
//Deprecated
Rectangle = Giraffe.Rectangle;