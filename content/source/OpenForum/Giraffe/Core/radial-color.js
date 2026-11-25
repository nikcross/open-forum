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
Giraffe.RadialColor = function(canvas,color1,color2,x,y,radius) {
	  /**#@+
	   * @memberOf RadialColor
	   */
  this.canvas = canvas.canvasContext;
  this.colorStop = [];
  this.colorStop[0] = [0,color1,0,0,radius];
  this.colorStop[1] = [1,color2,x,y,0];

  this.getColor = function() {
    gradient = this.canvas.createRadialGradient(
      this.colorStop[1][2],this.colorStop[1][3],this.colorStop[1][4],
      this.colorStop[0][2],this.colorStop[0][3],this.colorStop[0][4]
    );
    var i=0;
    for(i=0;i<this.colorStop.length;i++) {
      gradient.addColorStop(this.colorStop[i][0],this.colorStop[i][1]);
    }
    return gradient;
  };
  
  this.toJson = function() {
    return {color1: color1, color2: color2, x: x, y: y, radius: radius};
  };
  
  this.fromJson = function( json ) {
    var color1 = json.color1;
    var color2 = json.color2;
    var x = json.x;
    var y = json.y;
    var radius = json.radius;
    
    this.colorStop[0] = [0,color1,0,0,radius];
    this.colorStop[1] = [1,color2,x,y,0];
  };
};

//Deprecated
RadialColor = Giraffe.RadialColor;