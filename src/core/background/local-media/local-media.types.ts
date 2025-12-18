// Local media background type definitions

import type { BaseBackgroundConfig } from '../base/background.base.types';

/**
 * Local media background configuration.
 * FAZ-2: structure only, no behavior.
 */
export interface LocalMediaBackgroundConfig extends BaseBackgroundConfig {
  sourceType: 'local-media';
  /**
   * Identifier for media stored locally (IndexedDB, etc.).
   * Not resolved or fetched in FAZ-2.
   */
  mediaId?: string;
}

