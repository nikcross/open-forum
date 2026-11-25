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