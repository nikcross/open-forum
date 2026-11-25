/**
 * Modern ES6 entry point for Giraffe.js
 * Provides clean imports for modern development
 */

// Core classes
export { GraphicsObject } from './graphics-object.modern.js';
export { Canvas } from './canvas.modern.js';

// Shapes
export { Circle } from './circle.modern.js';
// export { Rectangle } from './rectangle.modern.js';  // To be converted
// export { Line } from './line.modern.js';           // To be converted
// ... other shapes

// Utilities
// export { Shadow } from './shadow.modern.js';       // To be converted
// export { LineStyle } from './line-style.modern.js'; // To be converted

// Animation (when converted)
// export { Animation } from './animation.modern.js';

// Convenience exports
export const Giraffe = {
    VERSION: "2.9.0",
    X: 0,
    Y: 1,
    DEG_TO_RAD: Math.PI / 180
};

// Default export for simple imports
import { Circle } from './circle.modern.js';
import { Canvas } from './canvas.modern.js';

export default {
    Circle,
    Canvas,
    // Rectangle,
    // Line,
    // ... other shapes
    Giraffe
};
