// Base background type definitions

/**
 * Base background source type discriminator.
 * FAZ-0 only supports 'color', but structure allows future expansion.
 */
export type BackgroundSourceType = 'color' | 'media-url' | 'youtube' | 'pinterest' | 'local-media';

/**
 * Base background configuration interface.
 * Each source type extends this with specific properties.
 */
export interface BaseBackgroundConfig {
  sourceType: BackgroundSourceType;
}

/**
 * Resolved background model passed into the render layer.
 * FAZ-2 only supports a color/gradient base layer.
 */
export interface BackgroundRenderModel {
  kind: 'color';
  /**
   * CSS color string:
   * - rgba(...) for solid colors
   * - linear-gradient(...)/radial-gradient(...) for gradients
   */
  color: string;
}
