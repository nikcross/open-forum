/**
 * Compatibility bridge for Circle
 * Allows both old constructor function and new ES6 class usage
 */

import { Circle as ModernCircle } from './circle.modern.js';

// Export the modern class as default
export { ModernCircle as Circle };
export default ModernCircle;

// Create constructor function that works like the original
// but internally uses the ES6 class
export function CircleCompat(x, y, radius) {
  // If called with 'new', return a proper instance
  if (new.target) {
    return new ModernCircle(x, y, radius);
  }
  // If called without 'new', still work (like original)
  return new ModernCircle(x, y, radius);
}

// Copy static methods and properties for full compatibility
Object.setPrototypeOf(CircleCompat.prototype, ModernCircle.prototype);
Object.setPrototypeOf(CircleCompat, ModernCircle);

// For environments that need the old-style global assignment
if (typeof window !== 'undefined') {
  window.Giraffe = window.Giraffe || {};
  window.Giraffe.Circle = CircleCompat;
  window.Circle = CircleCompat; // Deprecated but maintained
}
