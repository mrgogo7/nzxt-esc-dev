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
 * FAZ-4.1:
 * - Media world preserves intrinsic aspect ratio when available.
 * - Transform is applied to the media world, not the media element.
 * - Viewport acts as a mask (overflow hidden).
 */
export function renderMediaOverlay(
  model: RenderModel,
  viewport: ViewportDimensions
): {
  primitive: 'image' | 'video';
  src: string;
  worldWidth: number;
  worldHeight: number;
  worldTransform: string;
  hasIntrinsic: boolean;
} | null {
  const overlay = model.mediaOverlay;

  if (!overlay) {
    return null;
  }

  const { transform, intrinsic } = overlay;

  // FAZ-4.2.1: World dimensions with autoscale baked in
  // If intrinsic is available, apply autoscale to world size
  // This produces short-edge-fit initial placement based on precomputed autoscale
  let worldWidth: number;
  let worldHeight: number;
  const hasIntrinsic = intrinsic !== undefined;

  if (intrinsic) {
    // Autoscale is baked into world dimensions
    // worldSize = intrinsicSize * autoScale
    worldWidth = intrinsic.width * transform.autoScale;
    worldHeight = intrinsic.height * transform.autoScale;
  } else {
    // Fallback: use viewport dimensions when intrinsic unavailable
    worldWidth = viewport.width;
    worldHeight = viewport.height;
  }

  // FAZ-4.2.3: Center-anchored world transform
  // World is centered via CSS positioning (left: 50%, top: 50%, margin), NOT transform
  // Transform string contains ONLY: translate(tx, ty) rotate(deg) scale(userScale)
  // Applied right-to-left: scale → rotate → translate
  // This guarantees center-locked operations and no drift

  // Offset in viewport pixels (not scaled)
  const tx = transform.offsetX * (viewport.width / 2);
  const ty = transform.offsetY * (viewport.height / 2);

  // Transform order (CSS applies right-to-left):
  // scale(userScale) → center-locked zoom (user scale only, autoscale already in world size)
  // rotate(deg) → rotate around viewport center
  // translate(tx, ty) → apply offset in viewport space (not scaled)
  //
  // This order guarantees:
  // - Scale does not affect offset magnitude
  // - Rotate pivots at viewport center (via CSS positioning, not transform)
  // - Offset remains screen-relative
  // - Effective visual scale = autoScale (in world) * userScale (in transform)
  const userScale = transform.scale; // transform.scale is user scale only (autoscale baked into world)
  const worldTransform = `translate(${tx}px, ${ty}px) rotate(${transform.rotateDeg}deg) scale(${userScale})`;

  return {
    primitive: overlay.primitive,
    src: overlay.src,
    worldWidth,
    worldHeight,
    worldTransform,
    hasIntrinsic,
  };
}
