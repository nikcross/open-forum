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
Giraffe.Line = function(x,y,x2,y2) {
  /**#@+
	   * @memberOf Line
	   */
  this.x=x;
  this.y=y;
  this.x2=x2;
  this.y2=y2;
  this.type="Line";

  this.isInside = function(posX,posY) {
    var rPos = this.getRelativePosition(posX,posY);
    posX = rPos.x;
    posY = rPos.y;

    var distance = Giraffe.pointToLineDistance( posX, posY, this.x, this.y, this.x+this.x2, this.y+this.y2 );

    return distance < 2;
  };

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
};
Giraffe.Line.prototype = new Giraffe.GraphicsObject();

//Deprecated
Line = Giraffe.Line;

Giraffe.pointToLineDistance = function(px, py, x1, y1, x2, y2) {
  // Calculate the numerator
  const numerator = Math.abs((y2 - y1) * px - (x2 - x1) * py + x2 * y1 - y2 * x1);

  // Calculate the denominator
  const denominator = Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));

  // Calculate and return the distance
  const distance = numerator / denominator;
  return distance;
};
