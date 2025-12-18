// YouTube background type definitions

import type { BaseBackgroundConfig } from '../base/background.base.types';

/**
 * YouTube background configuration.
 * FAZ-2: structure only, no behavior.
 */
export interface YoutubeBackgroundConfig extends BaseBackgroundConfig {
  sourceType: 'youtube';
  /**
   * YouTube video identifier or raw URL.
   * Not resolved or fetched in FAZ-2.
   */
  videoIdOrUrl?: string;
}

