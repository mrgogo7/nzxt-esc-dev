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
