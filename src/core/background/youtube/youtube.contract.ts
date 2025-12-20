// YouTube background contract

import type { BackgroundContract } from '../base/background.contract';
import type { YoutubeBackgroundConfig } from './youtube.types';

export type YoutubeBackgroundContract = BackgroundContract<YoutubeBackgroundConfig>;

const FALLBACK_COLOR_BACKGROUND = {
  kind: 'color' as const,
  color: '#000000',
};

/**
 * FAZ-2 stub contract for YouTube backgrounds.
 *
 * - validate: always returns false
 * - normalize: structural no-op (no placeholder generation)
 * - toRenderModel: always returns a safe black fallback background
 */
export const youtubeBackgroundContract: YoutubeBackgroundContract = {
  sourceType: 'youtube',

  validate(config: unknown): config is YoutubeBackgroundConfig {
    // FAZ-2 stub: youtube backgrounds are not yet supported as a base source.
    return false && !!config;
  },

  normalize(config: Partial<YoutubeBackgroundConfig>): YoutubeBackgroundConfig {
    return {
      ...(config as YoutubeBackgroundConfig),
      sourceType: 'youtube',
    };
  },

  toRenderModel(config: YoutubeBackgroundConfig): typeof FALLBACK_COLOR_BACKGROUND {
    void config;
    return FALLBACK_COLOR_BACKGROUND;
  },
};
