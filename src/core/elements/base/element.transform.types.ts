// Base element transform types
//
// Base transform properties shared by all overlay elements.
// Element-specific sizing (fontSize for TEXT, width/height for SHAPE) is defined
// separately in each element's config.

/**
 * Base transform for overlay elements.
 *
 * Coordinates are normalized and interpreted in a viewport-relative way
 * by the render layer (no browser APIs here).
 *
 * - x: horizontal offset (normalized -3..3, converted to pixels by render layer)
 * - y: vertical offset (normalized -3..3, converted to pixels by render layer)
 * - rotateDeg: rotation in degrees (clamp -180..180)
 *
 * Note: Element-specific sizing (fontSize, width, height, etc.) is NOT part of
 * base transform. Each element type defines its own sizing model.
 */
export interface BaseElementTransform {
  x: number;
  y: number;
  rotateDeg: number;
}
