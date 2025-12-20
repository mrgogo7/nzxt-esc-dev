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

  validate(config: unknown): config is LocalMediaBackgroundConfig {
    // FAZ-2 stub: local-media backgrounds are not yet supported as a base source.
    // Parameter is referenced to satisfy noUnusedParameters while always returning false.
    return false && !!config;
  },

  normalize(config: Partial<LocalMediaBackgroundConfig>): LocalMediaBackgroundConfig {
    return {
      ...(config as LocalMediaBackgroundConfig),
      sourceType: 'local-media',
    };
  },

  toRenderModel(config: LocalMediaBackgroundConfig): typeof FALLBACK_COLOR_BACKGROUND {
    void config;
    return FALLBACK_COLOR_BACKGROUND;
  },
};
