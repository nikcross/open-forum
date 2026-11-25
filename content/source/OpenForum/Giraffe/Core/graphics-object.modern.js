/**
 * Modern ES6 GraphicsObject base class
 * Base class for all graphics objects that can be placed on a canvas
 */

/**
 * Base class for all graphics objects
 * @class
 */
export class GraphicsObject {
  constructor(x = 0, y = 0) {
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
    this.visible = true;
    this.mouseOver = false;
    this.type = "GraphicsObject";
    this.draggable = false;
    this.excludeFromSave = false;
  }

  /**
   * Internal repaint method
   * @private
   */
  _repaint() {
    this.canvasParent._store();
    
    if (this.canvas == undefined) {
      this.canvas = this.canvasParent.canvasContext;
      if (this.draggable) {
        this.canvasParent.makeDraggable(this);
      }
    }
    
    this.canvas.translate(this.x, this.y);
    
    if (this.scaleX != 1 || this.scaleY != 1) {
      this.canvas.scale(this.scaleX, this.scaleY);
    }
    
    if (this.rotation != 0) {
      this.canvas.rotate(this.rotation);
    }
    
    if (this.shadow != null) {
      this.canvas.shadowColor = this.shadow.color;
      this.canvas.shadowBlur = this.shadow.blur;
      this.canvas.shadowOffsetX = this.shadow.offsetX;
      this.canvas.shadowOffsetY = this.shadow.offsetY;
    }
    
    if (this.lineStyle != null) {
      this.canvas.lineWidth = this.lineStyle.thickness;
      this.canvas.lineCap = this.lineStyle.endCap;
    }

    this.draw();
    this.canvasParent._restore();
  }

  /**
   * Sets the scale of the object
   * @param {number} scaleX 
   * @param {number} scaleY 
   * @returns {GraphicsObject}
   */
  setScale(scaleX, scaleY) {
    if (!scaleY) scaleY = scaleX;
    this.scaleX = scaleX;
    this.scaleY = scaleY;
    return this;
  }

  /**
   * Uses the className to look up the values for color and background-color from
   * any css style sheet loaded in the current page.
   * @param {string} className 
   * @returns {GraphicsObject}
   */
  setCSSClass(className) {
    // Would need to import Giraffe.getCssValue or reimplement
    if (typeof Giraffe !== 'undefined') {
      this.color = Giraffe.getCssValue(className, "color");
      this.fillColor = Giraffe.getCssValue(className, "background-color");
    }
    return this;
  }

  /**
   * Sets the border outline color of the object.
   * @param {string} color 
   * @returns {GraphicsObject}
   */
  setColor(color) {
    this.color = color;
    return this;
  }

  /**
   * Sets the shadow of the object
   * @param {object} shadow 
   * @returns {GraphicsObject}
   */
  setShadow(shadow) {
    this.shadow = shadow;
    return this;
  }

  /**
   * Sets the line style of the object
   * @param {object} lineStyle 
   * @returns {GraphicsObject}
   */
  setLineStyle(lineStyle) {
    this.lineStyle = lineStyle;
    return this;
  }

  /**
   * Sets the fill color of the object.
   * @param {string} fillColor 
   * @returns {GraphicsObject}
   */
  setFillColor(fillColor) {
    this.fillColor = fillColor;
    return this;
  }

  /**
   * Sets the rotation of the object
   * @param {number} rotation 
   * @returns {GraphicsObject}
   */
  setRotation(rotation) {
    this.rotation = rotation;
    return this;
  }

  /**
   * Gets the relative position accounting for transformations
   * @param {number} posX 
   * @param {number} posY 
   * @returns {object}
   */
  getRelativePosition(posX, posY) {
    let relativePosX = (posX - this.x) / this.scaleX;
    let relativePosY = (posY - this.y) / this.scaleY;

    if (this.rotation != 0) {
      const cos = Math.cos(-this.rotation);
      const sin = Math.sin(-this.rotation);
      const x = (relativePosX * cos) - (relativePosY * sin);
      const y = (relativePosY * cos) + (relativePosX * sin);
      
      relativePosX = x;
      relativePosY = y;
    }

    return { x: relativePosX, y: relativePosY };
  }

  /**
   * Serializes the object to JSON
   * @returns {object}
   */
  toJson() {
    if (this.excludeFromSave === true) return;
    
    const json = { type: this.type };
    const reference = this.constructor.getReferenceType ? 
      this.constructor.getReferenceType(this.type) : 
      new this.constructor();
    
    for (const [key, value] of Object.entries(this)) {
      if (typeof value === "undefined" || value === null) {
        continue;
      } else if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        if (reference[key] != value) {
          json[key] = value;
        }
      } else if (key !== "parent" && value.toJson && value.type) {
        json[key] = value.toJson();
      }
    }
    return json;
  }

  /**
   * Deserializes from JSON
   * @param {object} json 
   * @param {object} canvas 
   */
  fromJson(json, canvas) {
    for (const [key, value] of Object.entries(json)) {
      if (value == null) {
        continue;
      } else if (value.type) {
        // Handle nested objects
        if (typeof Giraffe !== 'undefined' && Giraffe[value.type]) {
          this[key] = new Giraffe[value.type]();
          this[key].fromJson(value, canvas);
        }
      } else if (typeof this[key] === 'function') {
        // Handle functions (though this is risky)
        this[key] = eval("f = " + value);
      } else if (this[key] == null || (!this._isObject(this[key]) && !Array.isArray(this[key]))) {
        this[key] = value;
      }
    }
    return this;
  }

  /**
   * Helper method to check if value is object
   * @param {*} value 
   * @returns {boolean}
   * @private
   */
  _isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  // Abstract methods - to be implemented by subclasses
  isInside(x, y) { return false; }
  onClick(x, y) { }
  onMouseOver(x, y) { }
  onMouseOut(x, y) { }
  onMousePressed(x, y) { }
  onMouseReleased(x, y) { }
  animate(frame) { }
  draw() { }
}

// For backward compatibility
if (typeof window !== 'undefined') {
  window.Giraffe = window.Giraffe || {};
  window.Giraffe.GraphicsObject = GraphicsObject;
  window.GraphicsObject = GraphicsObject; // Deprecated
}

export default GraphicsObject;
