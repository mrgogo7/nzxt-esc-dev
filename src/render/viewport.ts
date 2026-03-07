// Viewport management and calculations

import { getLcdAttributes } from '../platform/nzxtApi';

/**
 * Viewport dimensions.
 */
export interface ViewportDimensions {
  width: number;
  height: number;
  isCircular: boolean;
}

/**
 * Default viewport dimensions (650x650 circular LCD).
 */
export const DEFAULT_VIEWPORT: ViewportDimensions = {
  width: 650,
  height: 650,
  isCircular: true,
};

/**
 * Gets viewport dimensions from NZXT API platform layer.
 * Returns default dimensions if API is unavailable.
 */
export function getViewportDimensions(): ViewportDimensions {
  const attrs = getLcdAttributes({
    width: DEFAULT_VIEWPORT.width,
    height: DEFAULT_VIEWPORT.height,
    shape: 'circle',
  });

  return {
    width: attrs.width,
    height: attrs.height,
    isCircular: attrs.shape === 'circle' || attrs.shape === 'round',
  };
}
