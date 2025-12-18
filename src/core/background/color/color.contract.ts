// Color background contract and validation

import type { ColorBackgroundConfig } from './color.types';
import { validateColorBackground, normalizeColor } from './color.validate';

/**
 * Color background contract interface.
 * Defines the contract for color background operations.
 */
export interface ColorBackgroundContract {
  validate(config: unknown): config is ColorBackgroundConfig;
  normalize(config: Partial<ColorBackgroundConfig>): ColorBackgroundConfig;
}

/**
 * Color background contract implementation.
 */
export const colorBackgroundContract: ColorBackgroundContract = {
  validate: validateColorBackground,
  normalize: (config) => {
    return {
      sourceType: 'color',
      color: normalizeColor(config.color || '#000000'),
    };
  },
};

