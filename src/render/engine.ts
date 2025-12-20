// Rendering engine implementation

import type { RenderModel } from './model/render.types';
import type { ViewportDimensions } from './viewport';
import type { Preset } from '../core/preset/preset.types';
import type {
  BackgroundRenderModel,
  BackgroundSourceType,
} from '../core/background/base/background.base.types';
import type { MediaOverlayRenderModel } from '../core/background/media-overlay/media-overlay.types';
import { mediaOverlayContract } from '../core/background/media-overlay/media-overlay.contract';
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
  const backgroundContainer = preset?.background;

  if (!backgroundContainer || typeof backgroundContainer !== 'object') {
    return DEFAULT_RENDER_MODEL;
  }

  const baseConfig = (backgroundContainer as { base?: unknown }).base as
    | { sourceType?: BackgroundSourceType }
    | undefined;

  if (!baseConfig || typeof baseConfig !== 'object') {
    return DEFAULT_RENDER_MODEL;
  }

  const sourceType = baseConfig.sourceType as BackgroundSourceType | undefined;

  if (!sourceType) {
    return DEFAULT_RENDER_MODEL;
  }

  const contract = getBackgroundContract(sourceType);
  if (!contract) {
    return DEFAULT_RENDER_MODEL;
  }

  try {
    const normalizedBase = contract.normalize(baseConfig as any);
    if (!contract.validate(normalizedBase)) {
      return DEFAULT_RENDER_MODEL;
    }

    const baseRenderModel: BackgroundRenderModel = contract.toRenderModel(
      normalizedBase as any
    );

    let mediaOverlayRenderModel: MediaOverlayRenderModel | undefined;

    const overlayConfig = (backgroundContainer as { mediaOverlay?: unknown }).mediaOverlay;
    if (overlayConfig) {
      try {
        const normalizedOverlay = mediaOverlayContract.normalize(overlayConfig as any);
        if (mediaOverlayContract.validate(normalizedOverlay)) {
          mediaOverlayRenderModel = mediaOverlayContract.toRenderModel(normalizedOverlay);
        }
      } catch {
        // On any overlay failure, ignore overlay and render base only
        mediaOverlayRenderModel = undefined;
      }
    }

    return {
      background: baseRenderModel,
      mediaOverlay: mediaOverlayRenderModel,
    };
  } catch {
    return DEFAULT_RENDER_MODEL;
  }
}

/**
 * Computes render information for a media overlay on top of the base background.
 * Returns null when no overlay is present.
 *
 * FAZ-3A:
 * - Transform is carried through in the render model but not yet applied to CSS.
 * - Visual transform application (x, y, scale) will be implemented in FAZ-3B
 *   together with editor affordances, to avoid guessing coordinate semantics.
 */
export function renderMediaOverlay(
  model: RenderModel,
  _viewport: ViewportDimensions
): {
  primitive: 'image' | 'video';
  src: string;
} | null {
  const overlay = model.mediaOverlay;

  if (!overlay) {
    return null;
  }

  return {
    primitive: overlay.primitive,
    src: overlay.src,
  };
}
