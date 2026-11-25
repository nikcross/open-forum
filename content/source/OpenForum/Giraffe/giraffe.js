//==============================================================================================================//
/* Version 2.9.3*/
/* Built on Fri Jan 23 2026 18:36:42 GMT-0000 (GMT) */
/* Built by OpenForum Javascript Builder.*/
/* Do not edit as changes may be overwritten */
//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/giraffe-header.js*/
//==============================================================================================================//
/**
 * @overview
 * Griaffe HTML5 canvas graphics library
 * A set of Javascript objects that can be used to build animated
 * interactive graphics using the HTML5 canvas.
 * @author Nik Cross
 * @version 2.9.3
 * @license MIT
 */
/* End of: /OpenForum/Giraffe/Core/giraffe-header.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/giraffe-core.js*/
//==============================================================================================================//
/**
 * Some helper methods used by Giraffe
 * @class
 */
Giraffe = {
  /**
		 * @private
		 */
  canvases : [],
  /**
		 * @private
		 */
  nextCanvasId : 0,		
  /**
		 * @private
		 */
  getCssValue : function(selector,attribute) {
    selector = selector.toLowerCase();
    for(var sheet=0;sheet<document.styleSheets.length;sheet++) {
      var stylesheet = document.styleSheets[sheet];
      var n = stylesheet.cssRules.length;
      for(var i=0; i<n; i++)
      {
        var selectors = stylesheet.cssRules[i].selectorText.toLowerCase().split(",");
        var m = selectors.length;
        for(var j=0; j<m; j++)
        {
          if(selectors[j].trim() == selector)
          {
            var value = stylesheet.cssRules[i].style.getPropertyValue(attribute);
            if(value!="")
            {
              return value;
            }
          }
        }
      }
    }
    return null;
  }
};

Giraffe.X=0;
Giraffe.Y=1;
Giraffe.DEG_TO_RAD = Math.PI/180;

Giraffe.VERSION = "2.9.3";
Giraffe.getVersion = function() { return Giraffe.VERSION; };

Giraffe.BUILD_DATE = "Fri Jan 23 2026 18:36:42 GMT-0000 (GMT)";
Giraffe.getBuildDate = function() { return Giraffe.BUILD_DATE; };

/* End of: /OpenForum/Giraffe/Core/giraffe-core.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/giraffe-canvas.js*/
//==============================================================================================================//
/**
 * Canvas is the Giraffe representation of a canvas element on
 * a page.
 * @description
 * It can have any number of GraphicsObject added to it,
 * each drawn at its required place.
 * An instance of Canvas can also be used to control animation and interaction
 * between the user and GraphicsObjects using the Giraffe Animation library and
 * the Giraffe Interactive library
 * @class
 * @param {String} canvasElementId dom canvas id
 */
function Canvas(canvasElementId) {
  var self=this;
  self.id = "canvas"+Giraffe.nextCanvasId;
  Giraffe.nextCanvasId++;

  Giraffe.canvases[ self.id ] = self;

  self.graphicsObjects = [];
  self.canvasElement = document.getElementById(canvasElementId);

  self.width = self.canvasElement.width;
  self.height = self.canvasElement.height;
  self.canvasContext = self.canvasElement.getContext('2d', {alpha: true});

  self.canvasContext.clearRect(0,0,self.width,self.height); // clear canvas

  self.scaleX=1;
  self.scaleY=1;

  self.paintMode = false;

  /**#@+
   * @memberOf Canvas
   */

  /**
   * Sets the scale of all graphics on the canvas. May be used to zoom in and out.
   * @param {float} scaleX the multiplier scale for the x axis. Must be greater than 0.
   * @param {float} scaleY the multiplier scale for the y axis. Must be greater than 0.
   */
  self.setScale = function(scaleX,scaleY) {
    if(!scaleY) scaleY = scaleX;
    self.scaleX=scaleX;
    self.scaleY=scaleY;
    return self;
  };

  self.scaleSet=false;

  /**
   * Clears the canvas and repaints all graphics on the canvas.
   * If not using the animation library, this method is called to
   * render the GraphicsObjects onto the canvas.
   */
  self.repaint = function() {
    if(!self.paintMode) {
      self.canvasContext.clearRect(0,0,self.width,self.height); // clear canvas
    }

    if(self.scaleSet==false) {
      self.canvasContext.scale(self.scaleX,self.scaleY);
      self.scaleSet=true;
    }
    for(var i=0;i<self.graphicsObjects.length;i++)
    {
      if(self.graphicsObjects[i].visible==true) {
        self.graphicsObjects[i]._repaint();
      }
    }
  };

  /**
   * @private
   */
  self._store = function() {
    self.canvasContext.save();
  };

  /**
   * @private
   */
  self._restore = function() {
    self.canvasContext.restore();
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

  /**
   * Adds a GraphicsObject instance to the canvas to be drawn
   * @param {GraphicsObject} graphicsObject an instance of a GraphicsObject to add to the canvas.
   *
   */
  self.add = function( graphicsObject ) {
    self.graphicsObjects[self.graphicsObjects.length] = graphicsObject;
    graphicsObject.canvasParent = self;
    if(graphicsObject.parts) {
      setParent( graphicsObject, self );
    }
    graphicsObject.canvas = self.canvasContext;
    graphicsObject.draw(); // initialises composites
  };

  /**
   * Removes a GraphicsObject instance from the canvas.
   * @param {GraphicsObject} graphicsObject to be removed
   */
  self.remove = function( graphicsObject ) {
    for(var i=0;i<self.graphicsObjects.length;i++) {
      if(self.graphicsObjects[i]==graphicsObject) {
        graphicsObject.canvasParent=null;
        self.graphicsObjects.splice(i,1);
      }
    }
  };

  self.deserialize = function(json,target) {
    if(!target) target = self;
    for(var i=0;i<json.graphicsObjects.length;i++) {
      target.add( self.fromJson(json.graphicsObjects[i]) );
    }
  };

  self.serialize = function(source) {
    var json = {
      type: "Giraffe Serialized canvas",
      version: Giraffe.getVersion(),
      buildDate: Giraffe.getBuildDate(),
      graphicsObjects: []
    };
    if(source) {
      json.graphicsObjects.push( source.toJson() );
    } else {
      for(var i=0;i<self.graphicsObjects.length;i++) {
        json.graphicsObjects.push( self.graphicsObjects[i].toJson() );
      }
    }
    return json;
  };
  if(OpenForum) {
    self.save = function(pageName,fileName,source) {
      OpenForum.saveFile(pageName + "/" + fileName, JSON.stringify(self.serialize(source),null,4) );
    };

    self.load = function(pageName,fileName,target) {
      OpenForum.loadFile(pageName + "/" + fileName,
                         function(data) {
        self.deserialize(JSON.parse(data),target); 
      });
    };
  }

  self.fromJson = function(json) {
    if(!json.type) return;

    var graphicsObject = new Giraffe[json.type]();
    /*for(var part in json) {
      if(typeof json[part] === "string" || typeof json[part] === "number" || typeof json[part] === "boolean") {
        graphicsObject[part] = json[part];
      }
    }*/

    if(graphicsObject.fromJson) {
      graphicsObject.fromJson(json,this,graphicsObject);
    }

    return graphicsObject;
  };

  this.getPixel = function(x,y) {
    var data = self.canvasContext.getImageData(x, y, 1, 1).data;
    return {red: data[0], green: data[1], blue: data[2], alpha: data[3]};
  };

  /**
   * Stretches a canvas to fit a window while maintaining the design aspect ratio
   * @param screenDesignSize {Giraffe.Size} the width and height intended for the canvas
   */
  self.stretchToFitWindow = function() {
    var designWidth = self.canvasElement.width;
    var designHeight = self.canvasElement.height;

    var scaleChange = 1;
    var docWidth = window.innerWidth;
    var docHeight = window.innerHeight;

    if (docWidth != designWidth) {
      var scaleX = docWidth / designWidth;
      var scaleY = docHeight / designHeight;

      if (scaleX < scaleY) {
        scaleChange = scaleX;
      } else {
        scaleChange = scaleY;
      }

      self.setScale(scaleChange,scaleChange);
      self.canvasElement.width = designWidth*scaleChange;
      self.canvasElement.height = designHeight*scaleChange;
    }
  };
}
/**#@-*/
/* End of: /OpenForum/Giraffe/Core/giraffe-canvas.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/giraffe-object.js*/
//==============================================================================================================//
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
/* End of: /OpenForum/Giraffe/Core/giraffe-object.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/circle.js*/
//==============================================================================================================//
/*
* Author: 
* Description: 
*/
/**
 * Defines a graphics Circle primative
 * @class
 * @augments GraphicsObject
 * @param x {number} the position that the ... is to be drawn on the x axis
 * @param y {number} the position that the ... is to be drawn on the y axis
 * @param radius (number) the radius of the circle to be drawn. Must be greater than 0
 */
Giraffe.Circle = function(x,y,radius) {
	  /**#@+
	   * @memberOf Circle
	   */
  this.x=x;
  this.y=y;
  this.radius=radius;
  this.type="Circle";
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
    this.canvas.arc(0,0,this.radius,0,6.2,false);
    this.canvas.closePath();
    if(this.fillColor!=null)
    {
      this.canvas.fill();
    }
    this.canvas.stroke(); 
  };
  
  /**
   * Checks to see if a given point lies inside the circle.
   * @param posX {number} the x axis of the point to check
   * @param posY {number} the y axis of the point to check
   * @returns true if the point lies within the Circle
   */
  this.isInside = function(posX,posY) {
    var rPos = this.getRelativePosition(posX,posY);
    posX = rPos.x;
    posY = rPos.y;
    
	var xl = posX;
	var yl = posY;
	if( Math.round( 
		Math.pow( (xl*xl)+(yl*yl),0.5)
	)<this.radius) {
		return true;
	} else {
		return false;
	}
  };
};
Giraffe.Circle.prototype = new Giraffe.GraphicsObject();

//Deprecated
Circle = Giraffe.Circle;
/* End of: /OpenForum/Giraffe/Core/circle.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/rectangle.js*/
//==============================================================================================================//
/*
* Author: 
* Description: 
*/
/**
 * Defines a graphics Rectangle primative
 * @class
 * @augments GraphicsObject
 * @param x {number} the position that the ... is to be drawn on the x axis
 * @param y {number} the position that the ... is to be drawn on the y axis
 * @param width (number) the width of the rectangle
 * @param height (number) the height of the rectangle
 */
Giraffe.Rectangle = function(x,y,width,height)
{
  /**#@+
	   * @memberOf Rectangle
	   */
  var self = this;
  self.x=x;
  self.y=y;
  self.width=width;
  self.height=height;
  self.type="Rectangle";

  /**
   * Checks to see if a given point lies inside the rectangle.
   * @param posX {number} the x axis of the point to check
   * @param posY {number} the y axis of the point to check
   * @returns true if the point lies within the Rectangle
   */
  self.isInside = function(posX,posY) {
    var rPos = self.getRelativePosition(posX,posY);
    posX = rPos.x;
    posY = rPos.y;

    if(
      posX>0 &&
      posX<self.width &&
      posY>0 &&
      posY<self.height
    ){ return true; } else { return false; }
  };

  /**
   * @private
   */
  self.draw = function()
  {
    self.canvas.beginPath();
    if(self.fillColor!=null)
    {
      self.canvas.fillStyle = self.fillColor;
    }
    self.canvas.strokeStyle = self.color;
    self.canvas.rect(0,0,self.width,self.height);
    self.canvas.closePath();
    if(self.fillColor!=null)
    {
      self.canvas.fillRect(0,0,self.width,self.height);
    }
    self.canvas.stroke();
  };
};
Giraffe.Rectangle.prototype = new Giraffe.GraphicsObject();
//Deprecated
Rectangle = Giraffe.Rectangle;
/* End of: /OpenForum/Giraffe/Core/rectangle.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/line.js*/
//==============================================================================================================//
/*
* Author: 
* Description: 
*/
/**
 * Defines a graphics Line primative from one point to another
 * @class
 * @augments GraphicsObject
 * @param x {number} the position that the Line is to be drawn on the x axis
 * @param y {number} the position that the Line is to be drawn on the y axis
 * @param x2 {number} the position that the Line is to be drawn to on the x axis
 * @param y2 {number} the position that the Line is to be drawn to on the y axis
 */
Giraffe.Line = function(x,y,x2,y2) {
  /**#@+
	   * @memberOf Line
	   */
  this.x=x;
  this.y=y;
  this.x2=x2;
  this.y2=y2;
  this.type="Line";

  this.isInside = function(posX,posY) {
    var rPos = this.getRelativePosition(posX,posY);
    posX = rPos.x;
    posY = rPos.y;

    var distance = Giraffe.pointToLineDistance( posX, posY, this.x, this.y, this.x+this.x2, this.y+this.y2 );

    return distance < 2;
  };

  /**
   * @private
   */
  this.draw = function()
  {
    this.canvas.strokeStyle = this.color;

    this.canvas.beginPath();
    this.canvas.moveTo(0,0); 
    this.canvas.lineTo(this.x2,this.y2);    
    //this.canvas.closePath();

    this.canvas.stroke(); 
  };
};
Giraffe.Line.prototype = new Giraffe.GraphicsObject();

//Deprecated
Line = Giraffe.Line;

Giraffe.pointToLineDistance = function(px, py, x1, y1, x2, y2) {
  // Calculate the numerator
  const numerator = Math.abs((y2 - y1) * px - (x2 - x1) * py + x2 * y1 - y2 * x1);

  // Calculate the denominator
  const denominator = Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));

  // Calculate and return the distance
  const distance = numerator / denominator;
  return distance;
};

/* End of: /OpenForum/Giraffe/Core/line.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/text.js*/
//==============================================================================================================//
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
/* End of: /OpenForum/Giraffe/Core/text.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/picture.js*/
//==============================================================================================================//
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
/* End of: /OpenForum/Giraffe/Core/picture.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/polygon.js*/
//==============================================================================================================//
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
Giraffe.Polygon = function(x,y) {
	  /**#@+
	   * @memberOf Polygon
	   */
  this.x=x;
  this.y=y;
  this.smooth = false;
  this.closed = true;
  this.type="Polygon";

  this.points = [];
  this.addPoint = function(px,py) {
    this.points[this.points.length]=[px,py];
    return this;
  };
  
  var self = this;
  var superToJson = self.toJson;
  this.toJson = function() {
    var json = superToJson(self);
    json.points = self.points;
    return json;
  };
  
  
  var superFromJson = self.fromJson;
  self.fromJson = function(json,canvas) {
    superFromJson( json, canvas, self );
    if(json.points) {
      for(var p=0;p<json.points.length;p++) {
        self.points.push( json.points[p] );
      }
    }
  };
  
  /**
   * @private
   */
  this.draw = function() {
    this.canvas.beginPath();
    if(this.fillColor!=null) {
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
};
Giraffe.Polygon.prototype = new Giraffe.GraphicsObject();

//Deprecated
Polygon = Giraffe.Polygon;
/* End of: /OpenForum/Giraffe/Core/polygon.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/regular-polygon.js*/
//==============================================================================================================//
/*
* Author: 
* Description: 
*/

//ToDo
/* End of: /OpenForum/Giraffe/Core/regular-polygon.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/star.js*/
//==============================================================================================================//
/*
* Author: 
* Description: 
*/

//ToDo
/* End of: /OpenForum/Giraffe/Core/star.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/curved-line.js*/
//==============================================================================================================//
/*
* Author: 
* Description: 
*/

//ToDo
/* End of: /OpenForum/Giraffe/Core/curved-line.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/rounded-rectangle.js*/
//==============================================================================================================//
/*
* Author: 
* Description: 
*/
/**
 * Defines a graphics RoundedRectangle primative
 * @class
 * @augments GraphicsObject
 * @param x {number} the position that the ... is to be drawn on the x axis
 * @param y {number} the position that the ... is to be drawn on the y axis
 * @param width (number) the width of the rectangle
 * @param height (number) the height of the rectangle
 * @param radius (number) the radius of the rectangle corners
 */
Giraffe.RoundedRectangle = function(x,y,width,height,radius)
{
	  /**#@+
	   * @memberOf Rectangle
	   */
  this.x=x;
  this.y=y;
  this.width=width;
  this.height=height;
  this.radius=radius;
  this.type="RoundedRectangle";

  /**
   * Checks to see if a given point lies inside the rectangle.
   * @param posX {number} the x axis of the point to check
   * @param posY {number} the y axis of the point to check
   * @returns true if the point lies within the Rectangle
   */
  this.isInside = function(posX,posY) {
    var rPos = this.getRelativePosition(posX,posY);
    posX = rPos.x;
    posY = rPos.y;

    if(
      posX>0 &&
      posX<this.width &&
      posY>0 &&
      posY<this.height
    ){ return true; } else { return false; }
  };
  
  /**
   * @private
   */
  this.draw = function() {
    this.canvas.beginPath();
    if(this.fillColor!==null) {
      this.canvas.fillStyle = this.fillColor;
    }
    this.canvas.strokeStyle = this.color;
    
  this.canvas.moveTo(this.radius, 0);
  this.canvas.arcTo(this.width, 0,   this.width, this.height, this.radius);
  this.canvas.arcTo(this.width, this.height, 0,   this.height, this.radius);
  this.canvas.arcTo(0,   this.height, 0,   0,   this.radius);
  this.canvas.arcTo(0,   0,   this.width, 0,   this.radius);
    
    if(this.fillColor!==null) {
      this.canvas.fill();
    }
    this.canvas.stroke(); 
  };
};

Giraffe.RoundedRectangle.prototype = new Giraffe.GraphicsObject();

//Deprecated
RoundedRectangle = Giraffe.RoundedRectangle;

/* End of: /OpenForum/Giraffe/Core/rounded-rectangle.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/arc.js*/
//==============================================================================================================//
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
Giraffe.Arc = function(x,y,startAngle,sweepAngle,radius) {
  /**#@+
	   * @memberOf Arc
	   */
  this.x=x;
  this.y=y;
  this.closed=true;
  this.startAngle=startAngle;
  this.sweepAngle=sweepAngle;
  this.radius=radius;
  this.type="Arc";
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
    var rPos = this.getRelativePosition(posX,posY);
    posX = rPos.x;
    posY = rPos.y;

    var xl = posX;
    var yl = posY;
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
};
Giraffe.Arc.prototype = new Giraffe.GraphicsObject();

//Deprecated
Arc = Giraffe.Arc;
/* End of: /OpenForum/Giraffe/Core/arc.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/pixel-canvas.js*/
//==============================================================================================================//
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
/* End of: /OpenForum/Giraffe/Core/pixel-canvas.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/composite.js*/
//==============================================================================================================//
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

/* End of: /OpenForum/Giraffe/Core/composite.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/radial-color.js*/
//==============================================================================================================//
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
/* End of: /OpenForum/Giraffe/Core/radial-color.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/gradient-color.js*/
//==============================================================================================================//
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
/* End of: /OpenForum/Giraffe/Core/gradient-color.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/shadow.js*/
//==============================================================================================================//
/*
* Author: 
* Description: 
*/
Giraffe.Shadow = function() {
    this.color = '#999';
    this.blur = 20;
    this.offsetX = 15;
    this.offsetY = 15;
  
  this.toJson = function() {
    return {color: this.color, blur: this.blur, offsetX: this.offsetX, offsetY: this.offsetY};
  };
  
  this.fromJson = function( json ) {
    this.color = json.color;
    this.blur = json.blur;
    this.offsetX = json.offsetX;
    this.offsetY = json.offsetY;
  };
};

//Deprecated
Shadow = Giraffe.Shadow;
/* End of: /OpenForum/Giraffe/Core/shadow.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/line-style.js*/
//==============================================================================================================//
/*
* Author: 
* Description: 
*/
Giraffe.LineStyle = function() {
	this.thickness=1.5;
	this.endCap = 'round';
    this.type = "LineStyle";
	this.setThickness = function(thickness) {
		this.thickness = thickness;
		return this;
	};
	this.setEndCap = function(endCap) {
		this.endCap = endCap;
		return this;
	};
  
  this.toJson = function() {
    return {thickness: this.thickness, endCap: this.endCap, type: this.type};
  };
  
  this.fromJson = function( json ) {
    this.thickness = json.thickness;
    this.endCap = json.endCap;
    this.type = json.type;
  };
};

//Deprecated
LineStyle = Giraffe.LineStyle;
/* End of: /OpenForum/Giraffe/Core/line-style.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/giraffe-animation.js*/
//==============================================================================================================//
Giraffe.setAnimated = function(canvas) {
  canvas.frame = 0;
  canvas.timer = null;
  canvas.frames = 0;
  canvas.looped = true;
  canvas.fps = 0;
  canvas.animationListeners = new Array();
  canvas.animated = false;

  canvas.addAnimationListener = function(listener) {
  	this.animationListeners[this.animationListeners.length]=listener;
  };
  canvas.removeAnimationListener = function(listener) {
	for(this.loop=0;this.loop<this.animationListeners.length;this.loop++)
    {
		if(this.animationListeners[this.loop]==listener) {
			this.animationListeners.splice(this.loop,1);
		}
	}
  };

  canvas.startAnimation = function(fps,frames,looped)
  {
    this.animated = true;
    this.frame = 0;
    this.frames = frames;
    this.looped = looped;
    this.fps = fps;
    this.timer = setTimeout("Giraffe.canvases[\""+this.id+"\"].animate();",1000/this.fps);
  };

  canvas.stopAnimation = function()
  {
    this.animated = false;
  };

  canvas.processing = false;
  
  canvas.animate = function()
  {
    if(this.animated == false) return;
    
    if(this.processing===true) {
      console.log("running slow");
      return;
    }
    this.processing = true;
    try{
    
        for(this.loop=0;this.loop<this.animationListeners.length;this.loop++)
        {
          this.animationListeners[this.loop].processFrame(this.frame);
        }
        for(this.loop=0;this.loop<this.graphicsObjects.length;this.loop++)
        {
          this.graphicsObjects[this.loop].animate(this.frame);
        }
        this.repaint();
        this.frame++;
        if(this.frame>=this.frames)
        {
          if(this.looped==true)
          {
            this.frame=0;
          }
          else
          {
            this.stopAnimation();
          }
        }
      
    } catch(e) {
      console.log(e);
    }
    this.processing = false;
    
    this.timer = setTimeout("Giraffe.canvases[\""+this.id+"\"].animate();",1000/this.fps);
  };
};

/* End of: /OpenForum/Giraffe/Core/giraffe-animation.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/giraffe-transition.js*/
//==============================================================================================================//
/*
* Author: 
* Description: 
*/
Giraffe.Transition = function(target,frames) {
	this.frames = frames;
	this.target = target;
	this.canvas = null;
	this.currentFrame=0;
	this.play = false;
	
	this.start = function() {
		this.register();
		this.currentFrame=0;
		this.play=true;
	};
	this.process = function(frame){};
	
	this.processFrame = function() {
		if(this.play==false) { return; };
		this.currentFrame++;
		if(this.currentFrame==this.frames+1) {
			this.unregister();
			this.doNext();
		}
		if(this.currentFrame>this.frames) {
			return false;
		}
		
		this.process(this.currentFrame);
	};
	
	this.doNext = function(){};
	this.register = function(){
		this.canvas.addAnimationListener(this);
	};
	this.unregister = function(){
		this.canvas.removeAnimationListener(this);
	};
};
/* End of: /OpenForum/Giraffe/Core/giraffe-transition.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/giraffe-transition-flip.js*/
//==============================================================================================================//
/**
 * Creates an animation sequence that squashes the x axis of a GraphicsObject
 * @class
 * @param target {GraphicsObject} the GraphicsObject to apply the animation to
 * @param frames integer the number of frames the animation should last for
 */
Giraffe.FlipOutX = function(target,frames) {
	this.frames = frames;
	this.target = target;
	this.canvas = target.canvasParent;
	this.register();
	this.currentFrame=0;

	/**
	 * @private
	 */
	this.process = function(frame) {
		this.target.scaleX = 1-((1*frame)/this.frames);
	};
};
Giraffe.FlipOutX.prototype = new Giraffe.Transition();

Giraffe.FlipInX = function(target,frames) {
	this.frames = frames;
	this.target = target;
	this.canvas = target.canvasParent;
	this.register();
	this.currentFrame=0;

	this.process = function(frame) {
		this.target.scaleX = (1*frame)/this.frames;
	};
};
Giraffe.FlipInX.prototype = new Giraffe.Transition();

Giraffe.FlipOutY = function(target,frames) {
	this.frames = frames;
	this.target = target;
	this.canvas = target.canvasParent;
	this.register();
	this.currentFrame=0;

	this.process = function(frame){
		this.target.scaleY = 1-((1*frame)/this.frames);
	};
};
Giraffe.FlipOutY.prototype = new Giraffe.Transition();

Giraffe.FlipInY = function(target,frames) {
	this.frames = frames;
	this.target = target;
	this.canvas = target.canvasParent;
	this.register();
	this.currentFrame=0;

	this.process = function(frame) {
		this.target.scaleY = (1*frame)/this.frames;
	};
};
Giraffe.FlipInY.prototype = new Giraffe.Transition();
/* End of: /OpenForum/Giraffe/Core/giraffe-transition-flip.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/giraffe-transition-move.js*/
//==============================================================================================================//
Giraffe.MoveSequence = function(target,frames,matrix) {
	this.frames = frames;
	this.target = target;
	this.matrix = matrix;
	this.canvas = target.canvasParent;
	this.register();
	this.currentFrame=0;

	this.process = function(frame) {
		if(this.matrix) {
			this.target.x+=this.matrix[Giraffe.X];
			this.target.y+=this.matrix[Giraffe.Y];
		} else {
			this.target.x+=this.target.vx;
			this.target.y+=this.target.vy;
		}
	};
};
Giraffe.MoveSequence.prototype = new Giraffe.Transition();
/* End of: /OpenForum/Giraffe/Core/giraffe-transition-move.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/giraffe-transition-rotate.js*/
//==============================================================================================================//
Giraffe.RotationSequence = function(target,frames,steps) {
	this.frames = frames;
	this.target = target;
	this.steps = steps;
	this.canvas = target.canvasParent;
	this.register();
	this.currentFrame=0;

	this.process = function(frame) {
		this.target.setRotation( this.target.rotation+(Giraffe.DEG_TO_RAD*this.steps) );
	};
};
Giraffe.RotationSequence.prototype = new Giraffe.Transition();
/* End of: /OpenForum/Giraffe/Core/giraffe-transition-rotate.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/giraffe-transition-explode.js*/
//==============================================================================================================//
Giraffe.ExplodeSequence = function(target,frames) {
	this.frames = frames;
	this.target = target;
	this.canvas = target.canvasParent;
	this.register();
	this.currentFrame=0;

	this.process = function(frame) {
		if(!this.parts) {
			this.parts = getExplodingParts(target);
		}
		
		var hasMinVelocity = false;
		for(i=0;i<this.parts.length;i++) {
			this.parts[i].x+=this.parts[i].vx;
			this.parts[i].y+=this.parts[i].vy;
			this.parts[i].vx*=0.9;
			this.parts[i].vy*=0.9;
			if(this.parts[i].vx>0.5 || this.parts[i].vx<-0.5 ||
				this.parts[i].vy>0.5 || this.parts[i].vy<-0.5) {
				hasMinVelocity=true;
			}
		}
		if(hasMinVelocity==false) {
			this.currentFrame = this.frames;
		}
	};
	
	var getExplodingParts = function(composite,parts) {
		if(!parts) {
			var parts = [];
		}
		for(var i=0;i<composite.parts.length;i++) {
			if(composite.parts[i].parts) { //is sub composite
				getExplodingParts(composite.parts[i],parts);
			}
			composite.parts[i].vx=composite.parts[i].x+((Math.random()*10)-5);
			composite.parts[i].vy=composite.parts[i].y+((Math.random()*10)-5);
			parts[parts.length]=composite.parts[i];
		}
		return parts;
	};
};
Giraffe.ExplodeSequence.prototype = new Giraffe.Transition();
/* End of: /OpenForum/Giraffe/Core/giraffe-transition-explode.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/giraffe-interactive.js*/
//==============================================================================================================//
/*
* Author: 
* Description: 
*/
Giraffe.Interactive = {
  shiftKeyDown : false,
  controlKeyDown : false,
  keyDown : null,
  keyDownListeners : [],
  keyUpListeners : [],
  init : function() {
    document.onkeydown = Giraffe.Interactive.keyDownHandler;
    document.onkeyup = Giraffe.Interactive.keyUpHandler;
    shiftKeyDown = false;
    controlKeyDown = false;
  },
  keyDownHandler : function(e) {
    var pressedKey;
    if (document.all) { e = window.event;
                       pressedKey = e.keyCode; }
    if (e.which) {
      pressedKey = e.which;
    }
    if(pressedKey===16) {
      Giraffe.Interactive.shiftKeyDown=true;
    } else if(pressedKey===17) {
      Giraffe.Interactive.controlKeyDown=true;
    }
    Giraffe.Interactive.keyDown = pressedKey;
    
    for(var l in Giraffe.Interactive.keyDownListeners) {
      Giraffe.Interactive.keyDownListeners[l](pressedKey);
    }
  },
  keyUpHandler : function(e) {
    var pressedKey;
    if (document.all) { e = window.event;
                       pressedKey = e.keyCode; }
    if (e.which) {
      pressedKey = e.which;
    }
    if(pressedKey===16) {
      Giraffe.Interactive.shiftKeyDown=false;
    } else if(pressedKey===17) {
      Giraffe.Interactive.controlKeyDown=false;
    }
    for(var l in Giraffe.Interactive.keyUpListeners) {
      Giraffe.Interactive.keyUpListeners[l](pressedKey);
    }
    
    Giraffe.Interactive.keyDown = null;
  },
  isDragging : function() {
    if( self.dragging && self.dragging.length>0 ) {
      return true;
    } else {
      return false;
    }
  },
  setInteractive : function(canvas) {
    var canvas = canvas;

    canvas.convertEvent = function(event,element) { 
      position = getPosition(element);
      x=event.x-position[Giraffe.X]+window.scrollX;
      y=event.y-position[Giraffe.Y]+window.scrollY;

      x = x / canvas.scaleX;
      y = y / canvas.scaleY;

      return {
        x : x, y : y  
      };
    };

    canvas.onClick = function(event) {
      event = canvas.convertEvent(event,canvas.canvasElement);

      for(var loop=canvas.graphicsObjects.length-1;loop>=0;loop--)
      {
        if(canvas.graphicsObjects[loop].visible===true && canvas.graphicsObjects[loop].isInside(event.x,event.y)) {
          canvas.graphicsObjects[loop].onClick(event.x,event.y);
        }
      }
    };
    canvas.onMouseDown = function(event) {
      event = canvas.convertEvent(event,canvas.canvasElement);

      if(canvas.dragAndDrop==true) {
        canvas.dragStart=[event.x,event.y];
        canvas.lastDx = 0;
        canvas.lastDy = 0;

        canvas.dragging=new Array();
      }
      for(var d = canvas.draggable.length-1; d>=0 ; d--) {
        dragTarget=canvas.draggable[d];

        var root = dragTarget;
        var stack = [];
        while( root.parent ) {
          root = root.parent;
          stack.push(root);
        }

        var x = event.x;
        var y = event.y;

        for( var i = stack.length-1; i>=0; i--  ) {
          var p = stack[i].getRelativePosition( x,y );	
          x = p.x;
          y = p.y;	
        }

        if(dragTarget.isInside( x, y )) {
          var included = false;
          for(var check in canvas.dragging) {
            check = canvas.dragging[check];
            if(check==dragTarget) {
              included=true;
              break;
            }
          }
          if(included==true) {
            continue;
          }
          dragTarget.dragging=true;
          canvas.dragging[canvas.dragging.length]=dragTarget;
          dragTarget.dragStart=[dragTarget.x,dragTarget.y];
          if(Giraffe.Interactive.shiftKeyDown==false) break;
        }
      }

      for(this.loop=0;this.loop<canvas.graphicsObjects.length;this.loop++)
      {
        if(canvas.graphicsObjects[this.loop].visible===true && canvas.graphicsObjects[this.loop].isInside(event.x,event.y)) {
          canvas.graphicsObjects[this.loop].onMousePressed(event.x,event.y);
        }
      }

      canvas.onMousePressed(event.x,event.y);
    };

    canvas.onMousePressed = function(x,y) {};
    canvas.onMouseReleased = function(x,y) {};

    canvas.setDragging = function(dragTarget) {

      // alert("Here: "+dragTarget.x+","+dragTarget.y);

      dragTarget.dragging=true;
      canvas.dragging[canvas.dragging.length]=dragTarget;
      dragTarget.dragStart=[dragTarget.x,dragTarget.y];
    };
    canvas.onMouseUp = function(event) {
      event = canvas.convertEvent(event,canvas.canvasElement);

      if(canvas.dragAndDrop==true && canvas.dragging.length>0) {
        for(this.loop=0;this.loop<canvas.graphicsObjects.length;this.loop++) {
          if(canvas.graphicsObjects[this.loop].dragging) {
            canvas.graphicsObjects[this.loop].dragging=false;
          }
          if(canvas.graphicsObjects[this.loop].isInside(event.x,event.y)) {
            if(canvas.graphicsObjects[this.loop].onCatch) {
              for(var dropped in canvas.dragging) {
                dropped = canvas.dragging[dropped];
                if(canvas.graphicsObjects[this.loop]==dropped) {
                  continue;
                }
                canvas.graphicsObjects[this.loop].onCatch(dropped,event.x,event.y);
              }
            }
          }
        }
        canvas.dragging=new Array();
      }
      for(this.loop=0;this.loop<canvas.graphicsObjects.length;this.loop++)
      {
        canvas.graphicsObjects[this.loop].onMouseReleased(event.x,event.y);
      }

      canvas.onMouseReleased(event.x,event.y);
    };
    canvas.onMouseMoved = function(event) {
      event = canvas.convertEvent(event,canvas.canvasElement);

      if(canvas.dragAndDrop==true) {
        var dragDX = event.x-canvas.dragStart[0];
        var dragDY = event.y-canvas.dragStart[1];

        for(var dragTarget in canvas.dragging) {

          dragTarget = canvas.dragging[dragTarget];
          
          var scaleX = 1;
          var scaleY = 1;
          var parent = dragTarget.parent;
          while( parent ) {
            scaleX = scaleX * parent.scaleX;
            scaleY = scaleY * parent.scaleY;
            parent = parent.parent;
          }

          dragTarget.x = dragTarget.x+((dragDX-canvas.lastDx)/scaleY);
          dragTarget.y = dragTarget.y+((dragDY-canvas.lastDy)/scaleX);
        }

        canvas.lastDx = dragDX;
        canvas.lastDy = dragDY;
      }
      for(this.loop=0;this.loop<canvas.graphicsObjects.length;this.loop++)
      {
        if(canvas.graphicsObjects[this.loop].isInside(event.x,event.y)) {
          canvas.graphicsObjects[this.loop].mouseOver=true;
          canvas.graphicsObjects[this.loop].onMouseOver(event.x,event.y);
        } else if(canvas.graphicsObjects[this.loop].mouseOver==true) {
          canvas.graphicsObjects[this.loop].mouseOver=false;
          canvas.graphicsObjects[this.loop].onMouseOut(event.x,event.y);
        }
      }

      canvas.onMouseOver(event.x,event.y);
    };

    canvas.onMouseOver = function(x,y){};

    canvas.makeDraggable = function(object) {
      this.dragAndDrop = true;
      this.draggable[this.draggable.length]=object;
      object.draggable = true;
    };
    canvas.removeDraggable = function(object) {
      //this.dragAndDrop = false;
      var foundIndex = -1;
      for(var index in this.draggable) {
        if(this.draggable[index]==object) {
          foundIndex = index;
          break;
        }
      }
      if(foundIndex!=-1) {
        object.draggable = false;
        this.draggable.splice(foundIndex,1);
      }
    };

    canvas.dragStart = [0,0];
    canvas.dragging = new Array();
    canvas.draggable = new Array();
    canvas.dragAndDrop = false; 

    canvas.canvasElement.onmousemove = canvas.onMouseMoved;
    canvas.canvasElement.onmouseup = canvas.onMouseUp;
    canvas.canvasElement.onmousedown = canvas.onMouseDown;
    canvas.canvasElement.onclick = canvas.onClick;
  }
};
Giraffe.Interactive.init();

/* behaviours */
function setReveal(target,reveal) {
  target.onMouseOver = function(x,y) {
    reveal.visible=true;
  };
  target.onMouseOut = function(x,y) {
    reveal.visible=false;
  };
  reveal.visible=false;
}

function getPosition(obj) {
  this.curleft = this.curtop = 0;
  if (obj.offsetParent) {
    this.curleft = obj.offsetLeft;
    this.curtop = obj.offsetTop;
    obj = obj.offsetParent;
    while (obj) {
      this.curleft += obj.offsetLeft;
      this.curtop += obj.offsetTop;
      obj = obj.offsetParent;
    }
  }
  return [this.curleft,this.curtop];
}
/* End of: /OpenForum/Giraffe/Core/giraffe-interactive.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/giraffe-tablet.js*/
//==============================================================================================================//
Giraffe.Tablet = {
  enableTouch : function(canvas) {
    var canvas = canvas;
    var pinchState = {
      active: false,
      lastDistance: 0
    };
    var tapState = {
      active: false,
      touchId: null,
      startX: 0,
      startY: 0,
      moved: false
    };
    var TAP_MOVE_THRESHOLD = 12;

    var getTouchDistance = function(t1, t2) {
      var dx = t1.pageX - t2.pageX;
      var dy = t1.pageY - t2.pageY;
      return Math.sqrt((dx * dx) + (dy * dy));
    };

    var getTouchMidpoint = function(t1, t2) {
      return {
        x: (t1.pageX + t2.pageX) / 2,
        y: (t1.pageY + t2.pageY) / 2
      };
    };

    var handlePinchZoom = function(touches) {
      if(touches.length < 2) return;
      var t1 = touches[0];
      var t2 = touches[1];
      var distance = getTouchDistance(t1, t2);
      if(pinchState.lastDistance <= 0 || distance <= 0) {
        pinchState.lastDistance = distance;
        return;
      }
      var ratio = distance / pinchState.lastDistance;
      pinchState.lastDistance = distance;
      var midpoint = getTouchMidpoint(t1, t2);

      if(canvas.canvasElement && typeof canvas.canvasElement.onwheel === "function") {
        var deltaY = (1 - ratio) / 0.001;
        canvas.canvasElement.onwheel({
          preventDefault: function(){},
          deltaY: deltaY,
          x: midpoint.x,
          y: midpoint.y
        });
      }
    };

    var resetTapState = function() {
      tapState.active = false;
      tapState.touchId = null;
      tapState.moved = false;
    };

    canvas.canvasElement.addEventListener("touchstart",
                                          function(event) {
                                            event.preventDefault();
                                            if(event.targetTouches.length >= 2) {
                                              pinchState.active = true;
                                              pinchState.lastDistance = getTouchDistance(event.targetTouches[0], event.targetTouches[1]);
                                              resetTapState();
                                              return;
                                            }
                                            pinchState.active = false;
                                            pinchState.lastDistance = 0;
                                            if(event.targetTouches.length) {
                                              var touch = event.targetTouches[0];
                                              tapState.active = true;
                                              tapState.touchId = touch.identifier;
                                              tapState.startX = touch.pageX;
                                              tapState.startY = touch.pageY;
                                              tapState.moved = false;
                                              canvas.onMouseDown( {x:touch.pageX,y:touch.pageY } );
                                            }
                                          }, false
                                         );
    canvas.canvasElement.addEventListener("touchmove",
                                          function(event) {
                                            event.preventDefault();
                                            if(pinchState.active && event.targetTouches.length >= 2) {
                                              handlePinchZoom(event.targetTouches);
                                              return;
                                            }
                                            if(event.targetTouches.length) {
                                              var touch = event.targetTouches[0];
                                              if(tapState.active) {
                                                var dx = touch.pageX - tapState.startX;
                                                var dy = touch.pageY - tapState.startY;
                                                if(Math.sqrt((dx * dx) + (dy * dy)) > TAP_MOVE_THRESHOLD) {
                                                  tapState.moved = true;
                                                }
                                              }
                                              canvas.onMouseMoved( {x:touch.pageX,y:touch.pageY } );
                                            }
                                          }, false
                                         );

    canvas.canvasElement.addEventListener("touchend",
                                          function(event) {
                                            event.preventDefault();
                                            if(pinchState.active && event.targetTouches.length < 2) {
                                              pinchState.active = false;
                                              pinchState.lastDistance = 0;
                                              resetTapState();
                                              return;
                                            }
                                            if(tapState.active && event.changedTouches && event.changedTouches.length) {
                                              var touch = event.changedTouches[0];
                                              canvas.onMouseUp( {x:touch.pageX,y:touch.pageY} );
                                              if(!tapState.moved && typeof canvas.onClick === "function") {
                                                canvas.onClick( {x:touch.pageX,y:touch.pageY} );
                                              }
                                              resetTapState();
                                              return;
                                            }
                                            canvas.onMouseUp( {x:0,y:0} );
                                          }, false
                                         );
  }
};

var tiltMouseX=0;
var tiltMouseY=0;
var tiltMouseDown=false;
Giraffe.Tablet.convertRotationToMouse = function(canvas) {
  Giraffe.Tablet.noramlizeOrientationEvents();
  deviceOrientationHandler = function(tiltLR, tiltFB, dir, motUD) {
    //		var canvas = canvas;

    console.log( "event: tiltLR="+tiltLR+", tiltFB="+tiltFB+", dir="+dir+", motUD="+motUD );

    var mouseClick = false;
    if(tiltLR!=0 && tiltLR!=null) {
      if(tiltMouseDown==false) {
        mouseClick=true;
      }
      tiltMouseX+=tiltLR;
    }
    if(tiltFB!=0 && tiltFB!=null) {
      if(tiltMouseDown==false) {
        mouseClick=true;
      }
      tiltMouseY+=tiltFB;
    }
    if(mouseClick==true) {
      tiltMouseDown=true;
      canvas.onMouseDown( {x:tiltMouseX,y:tiltMouseY } );
    } else if(tiltLR==0 && tiltFB==0) {
      tiltMouseDown=false;
      canvas.onMouseUp( {x:tiltMouseX,y:tiltMouseY } );
    }
    canvas.onMouseMoved( {x:tiltMouseX,y:tiltMouseY } );
  };
};

//http://www.html5rocks.com/en/tutorials/device/orientation/
Giraffe.Tablet.noramlizeOrientationEvents = function() {
  if (window.DeviceOrientationEvent) {
    // Listen for the deviceorientation event and handle the raw data
    window.addEventListener('deviceorientation', function(eventData) {
      // gamma is the left-to-right tilt in degrees, where right is positive
      var tiltLR = eventData.gamma;

      // beta is the front-to-back tilt in degrees, where front is positive
      var tiltFB = eventData.beta;

      // alpha is the compass direction the device is facing in degrees
      var dir = eventData.alpha;

      // deviceorientation does not provide this data
      var motUD = null;

      // call our orientation event handler
      deviceOrientationHandler(tiltLR, tiltFB, dir, motUD);
    }, false);
  } else if (window.OrientationEvent) {
    window.addEventListener('MozOrientation', function(eventData) {
      // x is the left-to-right tilt from -1 to +1, so we need to convert to degrees
      var tiltLR = eventData.x * 90;

      // y is the front-to-back tilt from -1 to +1, so we need to convert to degrees
      // We also need to invert the value so tilting the device towards us (forward) 
      // results in a positive value. 
      var tiltFB = eventData.y * -90;

      // MozOrientation does not provide this data
      var dir = null;

      // z is the vertical acceleration of the device
      var motUD = eventData.z;

      // call our orientation event handler
      deviceOrientationHandler(tiltLR, tiltFB, dir, motUD);
    }, false);
  } else {
    console.log( "Not supported on your device or browser." );
  }
}

/* End of: /OpenForum/Giraffe/Core/giraffe-tablet.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/giraffe-quick-start.js*/
//==============================================================================================================//

Giraffe.quickStart = function( canvasId, fullscreen ) {

  var canvas = document.getElementById(canvasId);
  
  if( fullscreen ) {
    try {
      if (canvas.requestFullscreen) {
        canvas.requestFullscreen();
      } else if (canvas.webkitRequestFullscreen) {
        canvas.webkitRequestFullscreen();
      } else if (canvas.mozRequestFullScreen) {
        canvas.mozRequestFullScreen();
      } else if (canvas.msRequestFullscreen) {
        canvas.msRequestFullscreen();
      } 
    } catch(e) {
    }

    document.body.style.overflow="hidden";
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;

    window.scrollTo(0,1);
  }

  var giraffeCanvas = new Canvas( canvasId ); // Register html canvas element
  Giraffe.Interactive.setInteractive(giraffeCanvas); // If mouse interaction required
  Giraffe.setAnimated(giraffeCanvas); // If animation required
  giraffeCanvas.startAnimation(20,100,true); // frames per second, frame count in loop, looped 
  
  giraffeCanvas.width = canvas.width;
  giraffeCanvas.height = canvas.height;
  
  return giraffeCanvas;
};
/* End of: /OpenForum/Giraffe/Core/giraffe-quick-start.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/select-box.js*/
//==============================================================================================================//
Giraffe.addSelectBox = function(canvas) {
  var selectBox = new RoundedRectangle(0,0,10,10,5).setColor("red").setFillColor("rgba(255,0,0,0.5)");
  canvas.selectBox = selectBox;
  canvas.onMousePressed = function(x,y) {
    if(canvas.dragging.length==0) {
      selectBox.x = x;
      selectBox.y = y;
      selectBox.width = 0;
      selectBox.height = 0;
      selectBox.visible = true;
    }
  };

  canvas.selectBox.callBack = function() {};

  canvas.onMouseOver = function(x,y) {
    if(selectBox.visible) {
      if(canvas.dragging.length==0) {
        selectBox.width = x-selectBox.x;
        selectBox.height = y-selectBox.y;
      } else {
        selectBox.visible = false;
      }
    }
  };

  canvas.onMouseReleased = function() {
    if(selectBox.visible) {
      selectBox.visible = false;
      selectBox.callBack( selectBox );
    }
  };

  selectBox.visible = false;
  canvas.add( selectBox );
};
/* End of: /OpenForum/Giraffe/Core/select-box.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/snap-to-grid.js*/
//==============================================================================================================//
Giraffe.addSnapToGrid = function(canvas) {
  var grid = new Composite(0,0);
  for(var x=0;x<canvas.width;x+=20) {
    grid.add(new Line(x,0,0,canvas.height));
  }

  for(var y=0;y<canvas.height;y+=20) {
    grid.add(new Line(0,y,canvas.width,0));
  }
  canvas.add(grid);
  canvas.grid = grid;

  grid.animate = function() {
    for(var gi in canvas.graphicsObjects) {
      var g = canvas.graphicsObjects[gi];
      if(g===this) continue;

      g.x = Math.round(g.x/20)*20;
      g.y = Math.round(g.y/20)*20;
    }
  };
};
/* End of: /OpenForum/Giraffe/Core/snap-to-grid.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/right-click.js*/
//==============================================================================================================//
Giraffe.addRightClick = function(canvas) {
  canvas.addEventListener('contextmenu', function(ev) {
    ev.preventDefault();
    //alert('success!');
    return false;
  }, false);
};
/* End of: /OpenForum/Giraffe/Core/right-click.js*/

//==============================================================================================================//
//==============================================================================================================//
/* Source: /OpenForum/Giraffe/Core/text-block.js*/
//==============================================================================================================//
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

/* End of: /OpenForum/Giraffe/Core/text-block.js*/

//==============================================================================================================//
