// Pinterest background contract

import type { BackgroundContract } from '../base/background.contract';
import type { PinterestBackgroundConfig } from './pinterest.types';

export type PinterestBackgroundContract = BackgroundContract<PinterestBackgroundConfig>;

const FALLBACK_COLOR_BACKGROUND = {
  kind: 'color' as const,
  color: '#000000',
};

/**
 * FAZ-2 stub contract for Pinterest backgrounds.
 *
 * - validate: always returns false
 * - normalize: structural no-op (no placeholder generation)
 * - toRenderModel: always returns a safe black fallback background
 */
export const pinterestBackgroundContract: PinterestBackgroundContract = {
  sourceType: 'pinterest',

  validate(): config is PinterestBackgroundConfig {
    return false;
  },

  normalize(config: Partial<PinterestBackgroundConfig>): PinterestBackgroundConfig {
    return {
      ...(config as PinterestBackgroundConfig),
      sourceType: 'pinterest',
    };
  },

  toRenderModel(): typeof FALLBACK_COLOR_BACKGROUND {
    return FALLBACK_COLOR_BACKGROUND;
  },
};
