// Pinterest background type definitions

import type { BaseBackgroundConfig } from '../base/background.base.types';

/**
 * Pinterest background configuration.
 * FAZ-2: structure only, no behavior.
 */
export interface PinterestBackgroundConfig extends BaseBackgroundConfig {
  sourceType: 'pinterest';
  /**
   * Original Pinterest URL.
   * Not resolved or fetched in FAZ-2.
   */
  url?: string;
}

