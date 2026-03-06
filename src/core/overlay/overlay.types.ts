// Type definitions for overlay configuration
//
// FAZ-5.A1: Overlay domain infrastructure.
// This module defines canonical overlay types. No rendering or UI logic here.
//
// Overlay state lives in Preset.overlay (single canonical state).
// Overlay elements follow element contract pattern (validate, normalize, toRenderModel).

import type { BaseElementTransform } from '../elements/base/element.transform.types';
import type { TextElementRenderData } from '../elements/text/text.contract';
import type { ShapeElementRenderData } from '../elements/shape/shape.contract';

export type { TextElementRenderData, ShapeElementRenderData };

/**
 * Overlay element type discriminator.
 *
 * Each element type has its own contract and configuration structure.
 * Unknown element types are skipped during normalization (permissive).
 */
export type OverlayElementType = 'text' | 'metric' | 'clock' | 'date' | 'shape';

/**
 * Base overlay element structure.
 *
 * All overlay elements share this base structure.
 * Element-specific configuration is in the `config` field.
 */
export interface OverlayElementBase {
  /**
   * Stable UUID, immutable after creation.
   */
  id: string;

  /**
   * Element type discriminator.
   */
  elementType: OverlayElementType;

  /**
   * Per-type sequence number (monotonic, does not renumber on delete).
   * Used for UI label generation (e.g., "Text 1", "Metric 3").
   */
  typeSeq: number;

  /**
   * Base transform (position, rotation).
   * Shared by all element types.
   */
  transform: BaseElementTransform;

  /**
   * Element-specific configuration.
   * Type depends on elementType.
   */
  config: unknown;
}

/**
 * Overlay element union type.
 *
 * Each element type extends OverlayElementBase with its specific config type.
 * TEXT and SHAPE are defined; other types will be added in future phases.
 */
export type OverlayElement = TextElementConfigComplete | ShapeElementConfigComplete;

/**
 * Overlay configuration.
 *
 * Overlay state is nested inside Preset (single canonical state).
 * Overlay is optional (backward compatible with existing presets).
 */
export interface OverlayConfig {
  /**
   * Whether overlay is enabled.
   * When disabled, overlay elements are not rendered.
   */
  enabled: boolean;

  /**
   * Array of overlay elements.
   * Order determines z-order (top = frontmost).
   * Empty array is valid (overlay enabled but no elements).
   */
  elements: OverlayElement[];
}

/**
 * Render-ready overlay model consumed by the render layer.
 *
 * This is intentionally simple and browser-agnostic.
 * Render layer does not know about element-specific configs.
 */
export interface OverlayRenderModel {
  /**
   * Whether overlay is enabled.
   */
  enabled: boolean;

  /**
   * Render-ready element models.
   * Element-specific configs are resolved to render data.
   */
  elements: OverlayElementRenderModel[];
}

/**
 * TEXT element render data (render-ready).
 * Re-exported from text.contract for convenience.
 */
export type { TextElementRenderData } from '../elements/text/text.contract';

/**
 * SHAPE element render data (render-ready).
 * Re-exported from shape.contract for convenience.
 */
export type { ShapeElementRenderData } from '../elements/shape/shape.contract';

/**
 * Render-ready element model.
 *
 * Element-specific configs are resolved to simple render data.
 * Render layer does not need to know about element types.
 */
export interface OverlayElementRenderModel {
  /**
   * Element ID (for render tracking, not used in rendering).
   */
  id: string;

  /**
   * Element type (for render routing).
   */
  elementType: OverlayElementType;

  /**
   * Base transform (normalized, clamped).
   */
  transform: BaseElementTransform;

  /**
   * Render-ready element data.
   * Structure depends on elementType.
   * For TEXT: TextElementRenderData
   * For SHAPE: ShapeElementRenderData
   */
  renderData: TextElementRenderData | ShapeElementRenderData | null;
}
