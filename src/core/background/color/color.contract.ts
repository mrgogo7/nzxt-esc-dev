// Color background contract implementation

import type { ColorBackgroundConfig } from './color.types';
import type { BackgroundContract } from '../base/background.contract';

export type ColorBackgroundContract = BackgroundContract<ColorBackgroundConfig>;

const DEFAULT_COLOR = '#000000';

/**
 * Color background contract implementation.
 * FAZ-2 runtime pipeline accepts any non-empty string as color and
 * falls back to black only when missing.
 */
export const colorBackgroundContract: ColorBackgroundContract = {
  sourceType: 'color',

  validate(config: unknown): config is ColorBackgroundConfig {
    if (!config || typeof config !== 'object') {
      return false;
    }

    const c = config as Partial<ColorBackgroundConfig>;

    if (c.sourceType !== 'color') {
      return false;
    }

    return typeof c.color === 'string' && c.color.length > 0;
  },

  normalize(config: Partial<ColorBackgroundConfig>): ColorBackgroundConfig {
    const color =
      typeof config.color === 'string' && config.color.length > 0
        ? config.color
        : DEFAULT_COLOR;

    return {
      sourceType: 'color',
      color,
    };
  },

  toRenderModel(config: ColorBackgroundConfig) {
    const color =
      typeof config.color === 'string' && config.color.length > 0
        ? config.color
        : DEFAULT_COLOR;

    return {
      kind: 'color',
      color,
    };
  },
};

