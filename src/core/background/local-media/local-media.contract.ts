// Local media background contract

import type { BackgroundContract } from '../base/background.contract';
import type { LocalMediaBackgroundConfig } from './local-media.types';

export type LocalMediaBackgroundContract = BackgroundContract<LocalMediaBackgroundConfig>;

const FALLBACK_COLOR_BACKGROUND = {
  kind: 'color' as const,
  color: '#000000',
};

/**
 * FAZ-2 stub contract for local-media backgrounds.
 *
 * - validate: always returns false
 * - normalize: structural no-op (no placeholder generation)
 * - toRenderModel: always returns a safe black fallback background
 */
export const localMediaBackgroundContract: LocalMediaBackgroundContract = {
  sourceType: 'local-media',

  validate(): config is LocalMediaBackgroundConfig {
    return false;
  },

  normalize(config: Partial<LocalMediaBackgroundConfig>): LocalMediaBackgroundConfig {
    return {
      ...(config as LocalMediaBackgroundConfig),
      sourceType: 'local-media',
    };
  },

  toRenderModel(): typeof FALLBACK_COLOR_BACKGROUND {
    return FALLBACK_COLOR_BACKGROUND;
  },
};
