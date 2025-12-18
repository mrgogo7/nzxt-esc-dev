// Media URL background type definitions

import type { BaseBackgroundConfig } from '../base/background.base.types';

/**
 * Media URL background configuration.
 * FAZ-2: structure only, no behavior.
 */
export interface MediaUrlBackgroundConfig extends BaseBackgroundConfig {
  sourceType: 'media-url';
  /**
   * Original media URL (image, gif, mp4, etc.).
   * Not resolved or fetched in FAZ-2.
   */
  url?: string;
}

