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