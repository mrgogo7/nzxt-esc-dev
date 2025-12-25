// Shape element type definitions
//
// FAZ-5.D1.A: SHAPE overlay element configuration.
// SHAPE uses box-driven sizing (width/height), not content-driven sizing.
// Width and height are persisted and can be resized via handles.

import type { BaseElementTransform } from '../base/element.transform.types';

/**
 * SHAPE element-specific configuration.
 *
 * SHAPE uses width/height for sizing (box-driven), not fontSize (content-driven).
 * Width and height are persisted and can be resized via edge handles.
 */
export interface ShapeElementConfig {
  /**
   * Width in pixels (box-driven sizing).
   * Resize handles affect width directly.
   */
  width: number;

  /**
   * Height in pixels (box-driven sizing).
   * Resize handles affect height directly.
   */
  height: number;

  /**
   * Border radius in pixels.
   * Controls corner rounding.
   */
  radius: number;

  /**
   * Fill color (hex string, e.g., "#FFFFFF").
   */
  fillColor: string;

  /**
   * Border color (hex string, e.g., "#000000").
   */
  borderColor: string;
}

/**
 * Complete SHAPE element configuration.
 *
 * Combines base transform (shared by all elements) with SHAPE-specific config.
 */
export interface ShapeElementConfigComplete {
  /**
   * Stable UUID, immutable after creation.
   */
  id: string;

  /**
   * Element type discriminator.
   */
  elementType: 'shape';

  /**
   * Per-type sequence number (monotonic, does not renumber on delete).
   * Used for UI label generation (e.g., "Shape 1", "Shape 3").
   */
  typeSeq: number;

  /**
   * Base transform (position, rotation).
   */
  transform: BaseElementTransform;

  /**
   * SHAPE-specific configuration.
   */
  config: ShapeElementConfig;
}

