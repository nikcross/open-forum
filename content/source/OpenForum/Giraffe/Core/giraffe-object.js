/**
 * This is the prototype object for all graphics objects that can be placed on a canvas.
 * Extend this prototype to create your own GraphicsObject.
 * @class
 * 
 * @param {number} x the position the graphics object is to be drawn at on the x axis 
 * @param {number} y the position the graphics object is to be drawn at on the y axis 
 */
Giraffe.GraphicsObject = function(x,y) {
  this.canvasParent = null;
  this.canvas = null;
  this.x = x;
  this.y = y;
  this.id = null;
  this.rotation = 0;
  this.color = "black";
  this.fillColor = null;
  this.shadow = null;
  this.lineStyle = null;
  this.scaleX = 1;
  this.scaleY = 1;
  this.visible=true;
  this.mouseOver=false;
  this.type="GraphicsObject";
  this.draggable=false;
  this.excludeFromSave=false;

  var getReferenceType = function(type) {
    if(!Giraffe.ReferenceTypes) {
      Giraffe.ReferenceTypes = {};
    }
    if(!Giraffe.ReferenceTypes[type]) {
      Giraffe.ReferenceTypes[type] = new Giraffe[type]();
    }
    return Giraffe.ReferenceTypes[type];
  };

  this.toJson = function(self) {
    if(this.excludeFromSave == true) return; 
      
    if(!self) self = this;
    
    var json = {type: self.type};
    var reference = getReferenceType(self.type);
    for(var part in self) {
      if(typeof self[part] === "undefined" || self[part]===null) {
        continue;
      } else if(typeof self[part] === "string" || typeof self[part] === "number" || typeof self[part] === "boolean") {
        if(reference[part]!=self[part]) {
          json[part] = self[part];
        }
      } else if( part!="parent" && self[part].toJson && self[part].type) {
        json[part] = self[part].toJson();
      }
    }
    return json;
  };


  this.fromJson = function(json, canvas ,self) {
    if(!self) self = this;
    
    for(var part in json) {
      if(json[part] == null) {
        continue;
      } else if(json[part].type) {
        self[part] = new Giraffe[json[part].type]();
        self[part].fromJson( json[part], canvas, self[part] );
      } else if( isFunction( self[part] ) ) {
         self[part] = eval( "f = "+json[part] );
      } else if( self[part]==null || (!isObject( self[part] ) && !isArray( self[part] )) ) {
        self[part] = json[part];
      }
    }
      
    return self;
  };

  /**#@+
   * @memberOf GraphicsObject
   */
  /**
   * @private
   */
  this._repaint = function()
  {
    this.canvasParent._store();
    if(this.canvas==undefined) {
      this.canvas = this.canvasParent.canvasContext;
      if(this.draggable) {
        this.canvasParent.makeDraggable( this );
      }
    }
    this.canvas.translate(this.x,this.y);
    if(this.scaleX!=1 || this.scaleY!=1)
    {
      this.canvas.scale(this.scaleX,this.scaleY);
    }
    if(this.rotation!=0)
    {
      this.canvas.rotate(this.rotation);
    }
    if(this.shadow!=null) {
      this.canvas.shadowColor = this.shadow.color;
      this.canvas.shadowBlur = this.shadow.blur;
      this.canvas.shadowOffsetX = this.shadow.offsetX;
      this.canvas.shadowOffsetY = this.shadow.offsetY;
    }
    if(this.lineStyle!=null) {
      this.canvas.lineWidth = this.lineStyle.thickness;
      this.canvas.lineCap = this.lineStyle.endCap;
    }

    this.draw();

    this.canvasParent._restore();
  };

  this.setScale = function(scaleX,scaleY) {
    if(!scaleY) scaleY = scaleX;
    this.scaleX=scaleX;
    this.scaleY=scaleY;
    return this;
  };

  /**
   * Uses the className to look up the values for color and background-color from
   * any css style sheet loaded in the current page.
   */
  this.setCSSClass = function(className) {
    this.color = Giraffe.getCssValue(className,"color");
    this.fillColor = Giraffe.getCssValue(className,"background-color");
    return this;
  };

  /**
   * Sets the border outline color of the object.
   * @param {string} color a definition of the color. Can be in the form html color name eg. "blue", html hex color eg. '#00FF00' or red green blue alpha format eg. rgba(0,255,0,0.5)
   */
  this.setColor = function(color) {
    this.color=color;
    return this;
  };

  this.setShadow = function(shadow) {
    this.shadow = shadow;
    return this;
  };

  this.setLineStyle = function(lineStyle) {
    this.lineStyle = lineStyle;
    return this;
  };

  /**
   * Sets the fill color of the object.
   * @param {string} fillColor a definition of the color. Can be in the form html color name eg. "blue", html hex color eg. '#00FF00' or red green blue alpha format eg. rgba(0,255,0,0.5)
   */
  this.setFillColor = function(fillColor) {
    this.fillColor=fillColor;
    return this;
  };

  this.setRotation = function(rotation) {
    this.rotation=rotation;
    return this;
  };
  
  this.getRelativePosition = function(posX,posY) {

    var relativePosX = (posX-this.x) / this.scaleX;
    var relativePosY = (posY-this.y) / this.scaleY;

    if(this.rotation!=0) {
      //var l = Math.pow( (relativePosX*relativePosX)+(relativePosY*relativePosY),0.5 );
      var cos = Math.cos(-this.rotation);
      var sin = Math.sin(-this.rotation);
      var x = (relativePosX*cos) - (relativePosY*sin);
      var y = (relativePosY*cos) + (relativePosX*sin);
      
      relativePosX = x;
      relativePosY = y;
    }

    return {x: relativePosX, y: relativePosY};
  };

  this.isInside = function(x,y){return false;};
  this.onClick = function(x,y){};
  this.onMouseOver = function(x,y){};
  this.onMouseOut = function(x,y){};
  this.onMousePressed = function(x,y){};
  this.onMouseReleased = function(x,y) {};
  this.animate = function(frame){};
  this.draw = function(){};
};
//Deprecated
GraphicsObject = Giraffe.GraphicsObject;
/**#@-*/