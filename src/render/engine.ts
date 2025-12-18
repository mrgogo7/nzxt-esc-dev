// Rendering engine implementation

import type { RenderModel } from './model/render.types';
import type { ViewportDimensions } from './viewport';
import type { Preset } from '../core/preset/preset.types';
import type {
  BackgroundRenderModel,
  BackgroundSourceType,
} from '../core/background/base/background.base.types';
import { getBackgroundContract } from '../core/background/registry';

/**
 * CSS style properties for rendering.
 */
export interface CSSStyleProperties {
  [key: string]: string | number | undefined;
}

const DEFAULT_BACKGROUND: BackgroundRenderModel = {
  kind: 'color',
  color: '#000000',
};

const DEFAULT_RENDER_MODEL: RenderModel = {
  background: DEFAULT_BACKGROUND,
};

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
 * Converts a preset to a render model using the background contract registry.
 * This function is source-agnostic and delegates to background contracts.
 */
export function presetToRenderModel(preset: Preset): RenderModel {
  const background = preset?.background;

  if (!background || typeof background !== 'object') {
    return DEFAULT_RENDER_MODEL;
  }

  const sourceType = (background as { sourceType?: string }).sourceType as
    | BackgroundSourceType
    | undefined;

  if (!sourceType) {
    return DEFAULT_RENDER_MODEL;
  }

  const contract = getBackgroundContract(sourceType);
  if (!contract) {
    return DEFAULT_RENDER_MODEL;
  }

  try {
    const normalized = contract.normalize(background as any);
    if (!contract.validate(normalized)) {
      return DEFAULT_RENDER_MODEL;
    }

    const resolved: BackgroundRenderModel = contract.toRenderModel(normalized as any);

    return {
      background: resolved,
    };
  } catch {
    return DEFAULT_RENDER_MODEL;
  }
}
