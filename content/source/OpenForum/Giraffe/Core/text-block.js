/*
* Author:
* Description:
*/
/**
 * Multi-line text block supporting alignment and custom line height.
 * @class
 * @augments GraphicsObject
 * @param {number} x anchor position on the x axis
 * @param {number} y anchor position on the y axis
 * @param {string|string[]} text multi-line content (array or newline separated string)
 * @param {number} textSize font size in pixels (defaults to 16)
 * @param {string} font canvas font family (defaults to Arial)
 * @param {string} alignment text alignment: left, center, or right (defaults to left)
 */
Giraffe.TextBlock = function(x,y,text,textSize,font,alignment) {
  /**#@+
   * @memberOf TextBlock
   */
  var self = this;

  var ALLOWED_ALIGNMENT = {"left": true, "center": true, "right": true};

  var normaliseText = function(value) {
    if(value === undefined || value === null) {
      return "";
    }
    if(Array.isArray && Array.isArray(value)) {
      return value.join("\n");
    }
    return (""+value).replace(/\r\n/g,"\n");
  };

  self.x = x;
  self.y = y;
  self.type = "TextBlock";
  self.textSize = textSize || 16;
  self.font = font || "Arial";
  self.weight = "normal";
  self.alignment = ALLOWED_ALIGNMENT[alignment] ? alignment : "left";
  self.lineHeight = Math.round(self.textSize * 1.2);
  self.width = 0;
  self.height = 0;
  self.text = "";
  self.lines = [];
  self.wrapWidth = null;
  self.padding = 0;

  self.setText = function(value) {
    self.text = normaliseText(value);
    if(self.text.length === 0) {
      self.lines = [];
    } else {
      self.lines = self.text.split("\n");
    }
    return self;
  };

  self.setAlignment = function(value) {
    value = (""+value).toLowerCase();
    if(ALLOWED_ALIGNMENT[value]) {
      self.alignment = value;
    }
    return self;
  };

  self.setLineHeight = function(height) {
    if(typeof height === "number" && height > 0) {
      self.lineHeight = height;
    }
    return self;
  };

  self.setFontWeight = function(weight) {
    self.weight = weight;
    return self;
  };

  self.setWrapWidth = function(width) {
    if(typeof width === "number" && width >= 0) {
      self.wrapWidth = width;
    }
    return self;
  };

  self.getLineCount = function() {
    return self.lines.length;
  };

  self.setText(text);

  var superToJson = self.toJson;
  self.toJson = function() {
    var json = superToJson(self);
    json.text = self.text;
    json.textSize = self.textSize;
    json.font = self.font;
    json.alignment = self.alignment;
    if(self.lineHeight !== Math.round(self.textSize * 1.2)) {
      json.lineHeight = self.lineHeight;
    }
    if(self.weight !== "normal") {
      json.weight = self.weight;
    }
    return json;
  };

  var superFromJson = self.fromJson;
  self.fromJson = function(json, canvas) {
    superFromJson(json, canvas, self);
    if(typeof json.text !== "undefined") {
      self.setText(json.text);
    }
    if(typeof json.textSize === "number") {
      self.textSize = json.textSize;
    }
    if(typeof json.font === "string") {
      self.font = json.font;
    }
    if(typeof json.alignment === "string") {
      self.setAlignment(json.alignment);
    }
    if(typeof json.lineHeight === "number") {
      self.lineHeight = json.lineHeight;
    } else {
      self.lineHeight = Math.round(self.textSize * 1.2);
    }
    if(typeof json.weight === "string") {
      self.weight = json.weight;
    }
    return self;
  };

  /**
   * @private
   */
  self.draw = function() {
    var lines = self.lines;
    self.canvas.font = self.weight + " " + self.textSize + "px " + self.font;
    self.canvas.textBaseline = "top";

    var maxMeasuredWidth = 0;
    var count = lines.length;
    if(self.fillColor !== null && typeof self.fillColor !== "undefined") {
      self.canvas.fillStyle = self.fillColor;
    }
    self.canvas.strokeStyle = self.color;

    for(var i=0;i<count;i++) {
      var measure = self.canvas.measureText(lines[i]).width;
      if(measure > maxMeasuredWidth) {
        maxMeasuredWidth = measure;
      }
    }

    var alignWidth = self.wrapWidth !== null ? Math.max(self.wrapWidth, maxMeasuredWidth) : maxMeasuredWidth;
    var drawX = 0;
    if(self.alignment === "center") {
      drawX = alignWidth / 2;
      self.canvas.textAlign = "center";
    } else if(self.alignment === "right") {
      drawX = alignWidth;
      self.canvas.textAlign = "right";
    } else {
      drawX = 0;
      self.canvas.textAlign = "left";
    }

    for(var lineIndex=0; lineIndex<count; lineIndex++) {
      var lineY = lineIndex * self.lineHeight;
      if(self.fillColor !== null && typeof self.fillColor !== "undefined") {
        self.canvas.fillText(lines[lineIndex], drawX, lineY);
      }
      self.canvas.strokeText(lines[lineIndex], drawX, lineY);
    }

    self.width = alignWidth;
    if(count === 0) {
      self.height = 0;
    } else if(count === 1) {
      self.height = self.textSize;
    } else {
      self.height = ((count-1)*self.lineHeight) + self.textSize;
    }
  };

  /**
   * Hit-test allowing for alignment offset.
   */
  self.isInside = function(posX,posY) {
    if(self.width === 0 || self.height === 0) {
      return false;
    }

    var rPos = self.getRelativePosition(posX,posY);
    posX = rPos.x;
    posY = rPos.y;

    var minX = 0;
    var maxX = self.width;

    if(self.alignment === "center") {
      minX = -self.width/2;
      maxX = self.width/2;
    } else if(self.alignment === "right") {
      minX = -self.width;
      maxX = 0;
    }

    return posX >= minX && posX <= maxX && posY >= 0 && posY <= self.height;
  };
  /**#@-*/
};
Giraffe.TextBlock.prototype = new Giraffe.GraphicsObject();

//Deprecated alias
TextBlock = Giraffe.TextBlock;
