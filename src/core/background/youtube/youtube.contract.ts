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

  validate(): config is YoutubeBackgroundConfig {
    return false;
  },

  normalize(config: Partial<YoutubeBackgroundConfig>): YoutubeBackgroundConfig {
    return {
      ...(config as YoutubeBackgroundConfig),
      sourceType: 'youtube',
    };
  },

  toRenderModel(): typeof FALLBACK_COLOR_BACKGROUND {
    return FALLBACK_COLOR_BACKGROUND;
  },
};
