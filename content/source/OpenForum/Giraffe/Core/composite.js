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
Giraffe.Composite = function(x,y,rotation) {
  var self = this;
  if(typeof rotation == "undefined") rotation = 0;
  self.rotation = rotation;
  self.x=x;
  self.y=y;
  self.parts = [];
  self.masked = false;
  self.type = "Composite";
  self.excludeFromSave=false;

  var superToJson = self.toJson;
  self.toJson = function() {
    var json = superToJson(self);
    json.parts = [];
    
    if(self.excludeFromSave == true) return json;
    
    for(var p=0;p<self.parts.length;p++) {
      json.parts.push( self.parts[p].toJson() );
    }
    return json;
  };

  var superFromJson = self.fromJson;
  self.fromJson = function(json,canvas) {
    superFromJson( json, canvas, self );
    if(json.parts) {
      for(var p=0;p<json.parts.length;p++) {
        self.add( canvas.fromJson(json.parts[p],canvas) );
      }
    }
  };

  var setParent = function( composite, canvasParent ) {
    if(!composite.parts) return;
    composite.canvasParent = canvasParent;
    
    for(var p in composite.parts) {
      composite.parts[p].canvasParent = canvasParent;
      if( composite.parts[p].parts ) {
        setParent( composite.parts[p], canvasParent );
      }
    }
  };
  
  self.add = function( part,id ) {
    if(part.canvasParent!=null) {
      return;
    }

    if(id) {
      self[id] = part;
      part.id = id;
    } else if(part.id) {
      self[id] = part.id;
    }

    if( self.canvasParent ) {
    	setParent( part, self.canvasParent );
    }
    
    part.parent = this;
    self.parts.push(part);
    return self;
  };
  
  self.remove = function( part ) {
    for(var i=0;i<self.parts.length;i++) {
      if(self.parts[i]==part) {
        part.canvasParent=null;
        part.parent = null;
        self.parts.splice(i,1);
      }
    }
  };

  self.deconstruct = function() {
    for(var i=0;i<self.parts.length;i++) {
      var part = self.parts[i];
      part.x += self.x;
      part.y += self.y;
      part.onMouseOver = self.onMouseOver;
      part.onMouseOut = self.onMouseOut;
      part.onMousePressed = self.onMousePressed;
      part.onMouseReleased = self.onMouseReleased;
      part.onClick = self.onClick;
      part.rotation += self.rotation;
      part.canvasParent=null;
      part.parent = null;
      self.canvasParent.add( part );
    }
    self.parts = [];
  };
  /**
   * @private
   */  
  self.draw = function() {
    var hasMask = false;
    for(var i=0;i<self.parts.length;i++) {
      if(self.parts[i].canvasParent==null) {
        self.parts[i].canvasParent=self.canvasParent;
        self.parts[i].canvas=self.canvas;
      }
      if(self.parts[i].visible==true) {
        self.parts[i]._repaint();

        if(i==0 && self.masked==true) {
          hasMask = true;
          self.canvasParent._store();
          self.canvas.clip();
        }
      }
    }
    if(hasMask) {
      self.canvasParent._restore();
    }
  };

  self.animate = function(frame) {
    for(var i=0;i<self.parts.length;i++) {    
      self.parts[i].animate(frame);
    }
  };
  
  self.isInside = function(posX,posY) {
    var rPos = self.getRelativePosition(posX,posY);
    posX = rPos.x;
    posY = rPos.y;

    for(var i=self.parts.length-1;i>=0;i--) {    
      if(self.parts[i].visible===true && self.parts[i].isInside(posX,posY)) {
        return true;
      }
    }
    return false;
  };

  self.onClick = function(posX,posY) {
    var relativePos = self.getRelativePosition(posX,posY);
    for(var i=0;i<self.parts.length;i++)
    {    
      if(self.parts[i].visible===true && self.parts[i].isInside(relativePos.x,relativePos.y)) {
        self.parts[i].onClick(relativePos.x,relativePos.y);
      }
    }
    return false;
  };
  self.onMouseOver = function(posX,posY) {
    var relativePos = self.getRelativePosition(posX,posY);
    for(var i=0;i<self.parts.length;i++) {
      if(self.parts[i].visible===true && self.parts[i].isInside(relativePos.x,relativePos.y)) { 
        self.parts[i].onMouseOver(relativePos.x,relativePos.y);
        self.parts[i].mouseOver=true;
      } else if(self.parts[i].mouseOver==true) {
        self.parts[i].mouseOver=false;
        self.parts[i].onMouseOut(relativePos.x,relativePos.y);
      }
    }
  };
  self.onMouseOut = function(posX,posY) {
    var relativePos = self.getRelativePosition(posX,posY);
    for(var i=0;i<self.parts.length;i++) {
      if(self.parts[i].mouseOver==true) {
        self.parts[i].mouseOver=false;
        self.parts[i].onMouseOut(relativePos.x,relativePos.y);
      }
    }
  };
  self.onMousePressed = function(posX,posY) {
    var relativePos = self.getRelativePosition(posX,posY);
    for(var i=0;i<self.parts.length;i++) {    
      if(self.parts[i].visible===true && self.parts[i].isInside(relativePos.x,relativePos.y)) {  
        self.parts[i].onMousePressed(relativePos.x,relativePos.y);
      }
    }
  };
  self.onMouseReleased = function(posX,posY) {
    var relativePos = self.getRelativePosition(posX,posY);
    for(var i=0;i<self.parts.length;i++) {    
      self.parts[i].onMouseReleased(relativePos.x,relativePos.y);
    }
  };
};
Giraffe.Composite.prototype = new Giraffe.GraphicsObject();

//Deprecated
Composite = Giraffe.Composite;
