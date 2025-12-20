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

  validate(config: unknown): config is PinterestBackgroundConfig {
    // FAZ-2 stub: pinterest backgrounds are not yet supported as a base source.
    return false && !!config;
  },

  normalize(config: Partial<PinterestBackgroundConfig>): PinterestBackgroundConfig {
    return {
      ...(config as PinterestBackgroundConfig),
      sourceType: 'pinterest',
    };
  },

  toRenderModel(config: PinterestBackgroundConfig): typeof FALLBACK_COLOR_BACKGROUND {
    void config;
    return FALLBACK_COLOR_BACKGROUND;
  },
};
