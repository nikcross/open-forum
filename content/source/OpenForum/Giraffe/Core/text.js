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
Giraffe.Text = function(x,y,text,textSize,font) {
	  /**#@+
	   * @memberOf Text
	   */
  var self = this;
  
  self.x=x;
  self.y=y;
  self.width=0;
  self.text=text;
  self.textSize=textSize;
  self.font = font;
  self.type = "Text";
  self.weight = "normal";

  self.setFontWeight = function(weight) {
    self.weight = weight;
    return this;
  };
  
  /**
   * @private
   */
  self.draw = function() {
    if(self.fillColor!=null)
    {
      self.canvas.fillStyle = self.fillColor;
    }
    self.canvas.strokeStyle = self.color;

    self.canvas.font = self.weight + " " + self.textSize+"px "+self.font;
    self.width = self.canvas.measureText(self.text).width;
    if(self.fillColor!=null)
    {
      self.canvas.fillText(self.text,0,0);
    }
    
    self.canvas.strokeText(self.text,0,0);
  };
  
  /**
   * Checks to see if a given point lies inside the bounds of the text.
   * @param posX {number} the x axis of the point to check
   * @param posY {number} the y axis of the point to check
   * @returns true if the point lies within the Text
   */
  self.isInside = function(posX,posY) {
    var rPos = self.getRelativePosition(posX,posY);
    posX = rPos.x;
    posY = rPos.y;
    
	/*if(
		posX>(self.textSize/2) &&
		posX<self.textSize+(self.text.length*(self.textSize/2)) &&
		posY>-(self.textSize/2) &&
		posY<(self.textSize/2)
		){ return true; } else { return false; }
    */
    
    if(
		posX>0 &&
		posX<self.textSize+(self.text.length*(self.textSize/2)) &&
		posY>-(self.textSize) &&
		posY<(self.textSize)
	){ return true; } else { return false; }
  };
};
Giraffe.Text.prototype = new Giraffe.GraphicsObject();

//Deprecated
Text = Giraffe.Text;