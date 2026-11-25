/**
 * Modern ES6 version of Circle
 * Maintains full compatibility with original API
 */

import { GraphicsObject } from './graphics-object.modern.js';

/**
 * Defines a graphics Circle primitive
 * @class
 * @extends GraphicsObject
 * @param {number} x - the position that the circle is to be drawn on the x axis
 * @param {number} y - the position that the circle is to be drawn on the y axis  
 * @param {number} radius - the radius of the circle to be drawn. Must be greater than 0
 */
export class Circle extends GraphicsObject {
  constructor(x = 0, y = 0, radius = 10) {
    super(x, y);
    this.radius = radius;
    this.type = "Circle";
  }

  /**
   * @private
   * Draws the circle on the canvas
   */
  draw() {
    this.canvas.beginPath();
    
    if (this.fillColor != null) {
      this.canvas.fillStyle = this.fillColor;
    }
    
    this.canvas.strokeStyle = this.color;
    this.canvas.arc(0, 0, this.radius, 0, Math.PI * 2, false);
    this.canvas.closePath();
    
    if (this.fillColor != null) {
      this.canvas.fill();
    }
    
    this.canvas.stroke();
  }

  /**
   * Checks to see if a given point lies inside the circle.
   * @param {number} posX - the x axis of the point to check
   * @param {number} posY - the y axis of the point to check
   * @returns {boolean} true if the point lies within the Circle
   */
  isInside(posX, posY) {
    const rPos = this.getRelativePosition(posX, posY);
    const xl = rPos.x;
    const yl = rPos.y;
    
    const distance = Math.sqrt((xl * xl) + (yl * yl));
    return distance < this.radius;
  }

  /**
   * Creates a circle with fluent interface
   * @param {number} x 
   * @param {number} y 
   * @param {number} radius 
   * @returns {Circle}
   */
  static create(x, y, radius) {
    return new Circle(x, y, radius);
  }

  /**
   * Sets the radius with fluent interface
   * @param {number} radius 
   * @returns {Circle}
   */
  setRadius(radius) {
    this.radius = radius;
    return this;
  }

  /**
   * Gets the area of the circle
   * @returns {number}
   */
  getArea() {
    return Math.PI * this.radius * this.radius;
  }

  /**
   * Gets the circumference of the circle
   * @returns {number}
   */
  getCircumference() {
    return 2 * Math.PI * this.radius;
  }
}

// For backward compatibility in concatenated builds
if (typeof window !== 'undefined') {
  window.Giraffe = window.Giraffe || {};
  window.Giraffe.Circle = Circle;
  
  // Deprecated global - for existing code compatibility
  window.Circle = Circle;
}

export default Circle;
