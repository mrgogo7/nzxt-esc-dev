// Rendering engine implementation

import type { RenderModel } from './model/render.types';
import type { ViewportDimensions } from './viewport';
import type { Preset } from '../core/preset/preset.types';
import type {
  BackgroundRenderModel,
  BackgroundSourceType,
} from '../core/background/base/background.base.types';
import type { MediaOverlayRenderModel } from '../core/background/media-overlay/media-overlay.types';
import type { OverlayRenderModel, OverlayElementRenderModel, TextElementRenderData, ShapeElementRenderData } from '../core/overlay/overlay.types';
import { mediaOverlayContract } from '../core/background/media-overlay/media-overlay.contract';
import { overlayContract } from '../core/overlay/overlay.contract';
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

    // FAZ-5.A3: Overlay pass-through (NO-OP)
    // Overlay is resolved from preset but not rendered.
    // Overlay is set to undefined if:
    // - preset.overlay is undefined (normal case for existing presets)
    // - preset.overlay.enabled is false
    // - overlay normalization/validation fails
    //
    // No render logic is executed for overlay in FAZ-5.A3.
    // Overlay rendering will be implemented in FAZ-5.B.
    let overlayRenderModel: OverlayRenderModel | undefined;

    const presetOverlay = preset?.overlay;
    if (presetOverlay  && presetOverlay.enabled) {
      try {
        // Normalize overlay (defensive, may fail)
        const normalizedOverlay = overlayContract.normalize(presetOverlay);
        
        // Validate normalized overlay (defensive, may fail)
        if (overlayContract.validate(normalizedOverlay)) {
          // Resolve to render model (NO-OP in FAZ-5.A3, returns placeholder)
          overlayRenderModel = overlayContract.toRenderModel(normalizedOverlay);
        }
        // If validation fails, overlayRenderModel remains undefined (permissive)
      } catch {
        // On any overlay failure, ignore overlay (permissive, do not crash)
        overlayRenderModel = undefined;
      }
    }
    // If overlay is undefined or disabled, overlayRenderModel remains undefined

    return {
      background: baseRenderModel,
      mediaOverlay: mediaOverlayRenderModel,
      overlay: overlayRenderModel,
    };
  } catch {
    return DEFAULT_RENDER_MODEL;
  }
}

/**
 * Computes render information for a media overlay on top of the base background.
 * Returns null when no overlay is present.
 *
 * Architecture:
 * - Media world preserves intrinsic aspect ratio when available.
 * - Transform is applied to the media world, not the media element.
 * - Viewport acts as a mask (overflow hidden).
 */
export function renderMediaOverlay(
  model: RenderModel,
  viewport: ViewportDimensions
): {
  primitive: 'image' | 'video';
  source: 'local' | 'url' | 'youtube';
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

  // World dimensions with autoscale baked in
  // If intrinsic is available, apply autoscale to world size
  // worldSize = intrinsicSize * autoScale
  let worldWidth: number;
  let worldHeight: number;
  const hasIntrinsic = intrinsic !== undefined;

  if (intrinsic) {
    worldWidth = intrinsic.width * transform.autoScale;
    worldHeight = intrinsic.height * transform.autoScale;
  } else {
    // Fallback: use viewport dimensions when intrinsic unavailable
    worldWidth = viewport.width;
    worldHeight = viewport.height;
  }

  // Transform chain architecture:
  // World is centered via CSS positioning (left: 50%, top: 50% + negative margins)
  // Transform applies ONLY:
  // - user scale
  // - rotation
  // - viewport-relative offset
  //
  // No centering translate in transform chain.
  // Autoscale is baked into world dimensions.

  // Offset in viewport pixels (normalized -2..+2 range, not scaled)
  const tx = transform.offsetX * (viewport.width / 2);
  const ty = transform.offsetY * (viewport.height / 2);

  // Transform order (CSS applies right-to-left):
  // scale(userScale) → user scale only (autoscale already in world size)
  // rotate(deg) → rotate around viewport center
  // translate(tx, ty) → apply offset in viewport space (not scaled)
  //
  // This order guarantees:
  // - Scale does not affect offset magnitude
  // - Rotate pivots at viewport center (via CSS positioning, not transform)
  // - Offset remains screen-relative
  // - Effective visual scale = autoScale (in world) * userScale (in transform)
  const userScale = transform.scale;
  const worldTransform = `translate(${tx}px, ${ty}px) rotate(${transform.rotateDeg}deg) scale(${userScale})`;

  return {
    primitive: overlay.primitive,
    source: overlay.source,
    src: overlay.src,
    worldWidth,
    worldHeight,
    worldTransform,
    hasIntrinsic,
  };
}

/**
 * Computes render information for overlay elements on top of the background.
 * Returns null when no overlay is present or disabled.
 *
 * FAZ-5.B1: TEXT overlay rendering.
 *
 * Architecture:
 * - Overlay elements are absolutely positioned
 * - Transform is applied via CSS (position, rotation)
 * - Bounding box is render-computed (not persisted)
 * - TEXT uses fontSize (content-driven sizing), not width/height
 *
 * Preview and Kraken use identical render math (parity guarantee).
 */
export function renderOverlay(
  model: RenderModel,
  viewport: ViewportDimensions
): OverlayElementRenderModel[] | null {
  const overlay = model.overlay;

  if (!overlay || !overlay.enabled || overlay.elements.length === 0) {
    return null;
  }

  // Return elements as-is (transform and renderData already resolved)
  // Render math (normalized → pixels) happens in renderOverlayElement()
  return overlay.elements;
}

/**
 * Computes CSS styles for a TEXT overlay element.
 *
 * FAZ-5.B1: TEXT element rendering.
 *
 * Render math:
 * - x/y: normalized -3..3 → pixel offsets (viewport-relative)
 * - rotateDeg: degrees → CSS rotate
 * - fontSize: pixels (direct)
 * - color: hex string (direct)
 *
 * Positioning:
 * - Element is absolutely positioned at viewport center + offset
 * - Transform origin is element center
 * - Rotation pivots at element center
 *
 * This function is pure and deterministic (same input → same output).
 * Preview and Kraken use identical math (parity guarantee).
 */
export function renderOverlayElement(
  element: OverlayElementRenderModel,
  viewport: ViewportDimensions
): CSSStyleProperties | null {
  // Convert normalized x/y offsets to pixel offsets
  // x/y range: -3..3, converted to pixels: offset * (viewport / 2)
  // For 640x640 viewport: -3 = -960px, +3 = +960px
  const pixelX = element.transform.x * (viewport.width / 2);
  const pixelY = element.transform.y * (viewport.height / 2);

  // Position element at viewport center + offset
  // Transform origin is center (for rotation pivot)
  const positionStyle: CSSStyleProperties = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: `translate(${pixelX}px, ${pixelY}px) rotate(${element.transform.rotateDeg}deg)`,
    transformOrigin: 'center center',
  };

  if (element.elementType === 'text') {
    const renderData = element.renderData as TextElementRenderData;
    if (!renderData || typeof renderData !== 'object') {
      return null;
    }

    // TEXT-specific styles
    // fontSize is applied directly (content-driven sizing)
    // color is applied directly
    // fontFamily is applied directly (defaults to 'nzxt-extrabold' if missing)
    // fontWeight is set to 800 (extrabold) to match @font-face definition
    // fontStyle is set to normal (only style available)
    // Bounding box is render-computed (not persisted)
    const textStyle: CSSStyleProperties = {
      fontSize: `${renderData.fontSize}px`,
      color: renderData.color,
      fontFamily: renderData.fontFamily || 'nzxt-extrabold',
      fontWeight: 800, // extrabold weight (matches @font-face definition)
      fontStyle: 'normal', // only style available
      whiteSpace: 'nowrap', // Single-line only (no wrapping in FAZ-5.B1)
      userSelect: 'none',
      pointerEvents: 'none', // No interaction in FAZ-5.D1.A
    };

    // Outline (stroke) rendering
    // Only apply outline if outlineWidth > 0 and outlineColor is set
    if (renderData.outlineWidth && renderData.outlineWidth > 0 && renderData.outlineColor) {
      textStyle.WebkitTextStroke = `${renderData.outlineWidth}px ${renderData.outlineColor}`;
      textStyle.WebkitTextStrokeWidth = `${renderData.outlineWidth}px`;
      textStyle.WebkitTextStrokeColor = renderData.outlineColor;
    }

    return {
      ...positionStyle,
      ...textStyle,
    };
  } else if (element.elementType === 'shape') {
    const renderData = element.renderData as ShapeElementRenderData;
    if (!renderData || typeof renderData !== 'object') {
      return null;
    }

    // FAZ-5.D1.A: SHAPE-specific styles
    // width/height are applied directly (box-driven sizing)
    // radius, fillColor, borderColor are applied directly
    const shapeStyle: CSSStyleProperties = {
      width: `${renderData.width}px`,
      height: `${renderData.height}px`,
      borderRadius: `${renderData.radius}px`,
      backgroundColor: renderData.fillColor,
      border: `1px solid ${renderData.borderColor}`,
      boxSizing: 'border-box',
      userSelect: 'none',
      pointerEvents: 'none', // No interaction in FAZ-5.D1.A
    };

    return {
      ...positionStyle,
      ...shapeStyle,
    };
  }

  // Unknown element type
  return null;
}
