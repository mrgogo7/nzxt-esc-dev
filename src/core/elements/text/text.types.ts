// Text element type definitions
//
// TEXT overlay element configuration.
// TEXT uses content-driven sizing (fontSize), not box-driven sizing (width/height).
// Bounding box is render-computed, not persisted.

import type { BaseElementTransform } from '../base/element.transform.types';

/**
 * TEXT element-specific configuration.
 *
 * TEXT uses fontSize for sizing (content-driven), not width/height (box-driven).
 * Bounding box dimensions are computed at render time from content + fontSize.
 */
export interface TextElementConfig {
  /**
   * Text content (plain text, no formatting).
   */
  content: string;

  /**
   * Text color (hex string, e.g., "#FFFFFF").
   */
  color: string;

  /**
   * Font size in pixels (content-driven sizing).
   * Resize handles affect fontSize, not width/height.
   */
  fontSize: number;
}

/**
 * Complete TEXT element configuration.
 *
 * Combines base transform (shared by all elements) with TEXT-specific config.
 */
export interface TextElementConfigComplete {
  /**
   * Stable UUID, immutable after creation.
   */
  id: string;

  /**
   * Element type discriminator.
   */
  elementType: 'text';

  /**
   * Per-type sequence number (monotonic, does not renumber on delete).
   * Used for UI label generation (e.g., "Text 1", "Text 3").
   */
  typeSeq: number;

  /**
   * Base transform (position, rotation).
   */
  transform: BaseElementTransform;

  /**
   * TEXT-specific configuration.
   */
  config: TextElementConfig;
}
