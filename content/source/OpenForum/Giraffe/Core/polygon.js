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
      var lastPoint = this.points.length;
      if(!closed) lastPoint--;
         for(var i=1;i<lastPoint ;i++) {
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