/*
* Author: 
* Description: 
*/
function GradientColor(canvas,color1,color2,x1,y1,x2,y2) {
  /**#@+
	   * @memberOf RadialColor
	   */
  this.canvas = canvas.canvasContext;
  this.colorStop = [];
  this.colorStop[0] = [0,color1,x1,y1];
  this.colorStop[1] = [1,color2,x2,y2];

  this.getColor = function() {
    gradient = this.canvas.createLinearGradient(
      this.colorStop[1][2],this.colorStop[1][3],
      this.colorStop[0][2],this.colorStop[0][3]
    );
    var i=0;
    for(i=0;i<this.colorStop.length;i++)
    {
      gradient.addColorStop(this.colorStop[i][0],this.colorStop[i][1]);
    }
    return gradient;
  };

  this.toJson = function() {
    return {color1: color1, x1: x1, y1: y1, color2: color2, x2: x2, y2: y2};
  };

  this.fromJson = function( json ) {
    var color1 = json.color1;
    var color2 = json.color2;
    var x1 = json.x1;
    var y1 = json.y1;
    var x2 = json.x2;
    var y2 = json.y2;

    this.colorStop = [];
    this.colorStop[0] = [0,color1,x1,y1];
    this.colorStop[1] = [1,color2,x2,y2];
  };
}