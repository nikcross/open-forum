/*
* Author: 
* Description: 
*/
/**
 * Defines a 
 */
Giraffe.PixelCanvas = function(x,y,width,height) {
	  /**#@+
	   * @memberOf PixelCanvas
	   */
  this.x=x;
  this.y=y;
  this.width=width;
  this.height=height;
  var imageData = new ImageData(width,height);
  
  this.setPixel = function(x,y,r,g,b,a) {
    var cursor = (x+(y*width))*4;
    
    if(!g) { // Assume color object
      var color = r;
      r = color.red;
      g = color.green;
      b = color.blue;
      a = color.alpha;
    }
    
    imageData.data[cursor] = r;
    imageData.data[cursor+1] = g;
    imageData.data[cursor+2] = b;
    imageData.data[cursor+3] = a;
  };
  
  this.getPixel = function(x,y) {
    var cursor = (x+(y*width))*4;
    return {red: imageData.data[cursor], green: imageData.data[cursor+1], blue: imageData.data[cursor+2], alpha: imageData.data[cursor+3]};
  };
/**
 * @private
 */
  this.draw = function() {
    this.canvas.putImageData(imageData,x,y);
  };
  
  /**
   * Checks to see if a given point lies inside the bounds of the .
   * @param posX {number} the x axis of the point to check
   * @param posY {number} the y axis of the point to check
   * @returns true if the point lies within the picture
   */
  this.isInside = function(posX,posY) {
    var rPos = this.getRelativePosition(posX,posY);
    posX = rPos.x;
    posY = rPos.y;
    
    if(
      posX>0 &&
      posX<(this.img.width*this.scaleX) &&
      posY>0 &&
      posY<(this.img.height*this.scaleY)
    ){ return true; } else { return false; }
  };
};
Giraffe.PixelCanvas.prototype = new Giraffe.GraphicsObject();

//Deprecated
PixelCanvas = Giraffe.PixelCanvas;