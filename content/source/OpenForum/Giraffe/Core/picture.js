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
Giraffe.Picture = function(x,y,src) {
  /**#@+
	   * @memberOf Picture
	   */
  var self = this;
  this.x=x;
  this.y=y;
  this.alpha = 1;
  this.type = "Picture";
  this.img = new Image();
  var workingCanvas = null;

  if(src) {
    this.img.src = src;
  } else {
    this.img.src = "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";
  }

  this.getWidth = function() {
    return this.img.naturalWidth;
  };

  this.getHeight = function() {
    return this.img.naturalHeight;
  };

  this.getPixel = function(x,y) {
    if(!workingCanvas) {
      workingCanvas = document.createElement('canvas');
    }

    workingCanvas.width = this.getWidth();
    workingCanvas.height = this.getHeight();
    var context = workingCanvas.getContext('2d');
    context.drawImage(this.img, 0, 0);
    var data = context.getImageData(x, y, 1, 1).data;

    return {red: data[0], green: data[1], blue: data[2], alpha: data[3]};
  };

  var self = this;
  var superToJson = self.toJson;
  this.toJson = function() {
    var json = superToJson(self);
    json.img = {src: self.img.src};
    return json;
  };

  var superFromJson = self.fromJson;
  this.fromJson = function(json) {
    superFromJson(json);
    if(json.img) {
      self.img.src = json.img.src;
    }
  };
  /**
 * @private
 */
  this.draw = function() {
    var gAlpha = 0;
    if(this.alpha!=1) {
      if(this.alpha==0) {
        return;
      }
      gAlpha = this.canvas.globalAlpha;
      this.canvas.globalAlpha = this.alpha;
    }
    this.canvas.strokeStyle = this.color;
    try{
      this.canvas.drawImage(this.img,0,0);
    } catch(e) {
    }
    if(this.alpha!=1) {
      this.canvas.globalAlpha = gAlpha;
    }
  };

  /**
   * Checks to see if a given point lies inside the bounds of the picture.
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
Giraffe.Picture.prototype = new Giraffe.GraphicsObject();

//Deprecated
Picture = Giraffe.Picture;