// Color background type definitions

import type { BaseBackgroundConfig } from '../base/background.base.types';

/**
 * Color background configuration.
 * Supports solid colors (rgba format) and gradients (linear-gradient/radial-gradient).
 */
export interface ColorBackgroundConfig extends BaseBackgroundConfig {
  sourceType: 'color';
  color: string; // rgba(...) for solid colors, or linear-gradient(...)/radial-gradient(...) for gradients
}

