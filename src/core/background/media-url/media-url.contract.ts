// Media URL background contract

import type { BackgroundContract } from '../base/background.contract';
import type { MediaUrlBackgroundConfig } from './media-url.types';

export type MediaUrlBackgroundContract = BackgroundContract<MediaUrlBackgroundConfig>;

const FALLBACK_COLOR_BACKGROUND = {
  kind: 'color' as const,
  color: '#000000',
};

/**
 * FAZ-2 stub contract for media-url backgrounds.
 *
 * - validate: always returns false
 * - normalize: structural no-op (no placeholder generation)
 * - toRenderModel: always returns a safe black fallback background
 */
export const mediaUrlBackgroundContract: MediaUrlBackgroundContract = {
  sourceType: 'media-url',

  validate(config: unknown): config is MediaUrlBackgroundConfig {
    // FAZ-2 stub: media-url backgrounds are not yet supported as a base source.
    return false && !!config;
  },

  normalize(config: Partial<MediaUrlBackgroundConfig>): MediaUrlBackgroundConfig {
    return {
      ...(config as MediaUrlBackgroundConfig),
      sourceType: 'media-url',
    };
  },

  toRenderModel(config: MediaUrlBackgroundConfig): typeof FALLBACK_COLOR_BACKGROUND {
    void config;
    return FALLBACK_COLOR_BACKGROUND;
  },
};
