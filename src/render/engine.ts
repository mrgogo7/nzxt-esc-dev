// Rendering engine implementation

import type { RenderModel } from './model/render.types';
import type { ViewportDimensions } from './viewport';

/**
 * CSS style properties for rendering.
 */
export interface CSSStyleProperties {
  [key: string]: string | number | undefined;
}

/**
 * Renders the background circle with the given color or gradient.
 * Returns a CSS style object for the background.
 */
export function renderBackground(
  model: RenderModel,
  viewport: ViewportDimensions
): CSSStyleProperties {
  if (model.background.kind !== 'color') {
    return {
      backgroundColor: '#000000',
      width: `${viewport.width}px`,
      height: `${viewport.height}px`,
      borderRadius: viewport.isCircular ? '50%' : '0',
    };
  }

  const color = model.background.color || '#000000';
  const baseStyle: CSSStyleProperties = {
    width: `${viewport.width}px`,
    height: `${viewport.height}px`,
    borderRadius: viewport.isCircular ? '50%' : '0',
  };

  // Minimal gradient detection: if color starts with gradient syntax, use background property
  // Otherwise use backgroundColor for solid colors
  if (color.startsWith('linear-gradient(') || color.startsWith('radial-gradient(')) {
    return {
      ...baseStyle,
      background: color,
    };
  }

  return {
    ...baseStyle,
    backgroundColor: color,
  };
}

/**
 * Converts a preset to a render model.
 */
export function presetToRenderModel(preset: { background: { sourceType: string; color: string } }): RenderModel {
  if (preset.background.sourceType === 'color') {
    return {
      background: {
        kind: 'color',
        color: preset.background.color,
      },
    };
  }

  return {
    background: {
      kind: 'color',
      color: '#000000',
    },
  };
}
