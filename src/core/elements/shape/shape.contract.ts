// Shape element contract and validation
//
// FAZ-5.D1.A: SHAPE element contract implementation.
// SHAPE element contract follows the same pattern as background contracts.

import type { ShapeElementConfig, ShapeElementConfigComplete } from './shape.types';
import type { BaseElementTransform } from '../base/element.transform.types';
import { normalizeShapeElement } from './shape.defaults';

/**
 * SHAPE element render data.
 *
 * Render-ready data for SHAPE element rendering.
 * This is intentionally simple and browser-agnostic.
 */
export interface ShapeElementRenderData {
  /**
   * Width in pixels (box-driven sizing).
   */
  width: number;

  /**
   * Height in pixels (box-driven sizing).
   */
  height: number;

  /**
   * Border radius in pixels.
   */
  radius: number;

  /**
   * Fill color (hex string).
   */
  fillColor: string;

  /**
   * Border color (hex string).
   */
  borderColor: string;
}

/**
 * SHAPE element contract interface.
 *
 * Follows the same pattern as background contracts:
 * - validate: full validation (shape + semantics)
 * - normalize: fill defaults, clamp values, handle errors
 * - toRenderData: resolve to render-ready data
 */
export interface ShapeElementContract {
  /**
   * Validates a SHAPE element configuration.
   *
   * Returns true if valid, false otherwise.
   */
  validate(element: unknown): element is ShapeElementConfigComplete;

  /**
   * Normalizes a potentially partial SHAPE element into a full element.
   *
   * This function is pure and side-effect free.
   * Returns null if element is invalid.
   */
  normalize(element: Partial<ShapeElementConfigComplete> | undefined): ShapeElementConfigComplete | null;

  /**
   * Resolves a validated SHAPE element into render-ready data.
   *
   * This function is pure and side-effect free.
   */
  toRenderData(element: ShapeElementConfigComplete): ShapeElementRenderData;
}

/**
 * SHAPE element contract implementation.
 */
export const shapeElementContract: ShapeElementContract = {
  validate(element: unknown): element is ShapeElementConfigComplete {
    if (!element || typeof element !== 'object') {
      return false;
    }

    const e = element as Partial<ShapeElementConfigComplete>;

    if (e.elementType !== 'shape') {
      return false;
    }

    if (typeof e.id !== 'string' || e.id.length === 0) {
      return false;
    }

    if (typeof e.typeSeq !== 'number' || !Number.isFinite(e.typeSeq) || e.typeSeq < 0) {
      return false;
    }

    if (!e.transform || typeof e.transform !== 'object') {
      return false;
    }

    const t = e.transform as Partial<BaseElementTransform>;
    if (
      typeof t.x !== 'number' ||
      !Number.isFinite(t.x) ||
      typeof t.y !== 'number' ||
      !Number.isFinite(t.y) ||
      typeof t.rotateDeg !== 'number' ||
      !Number.isFinite(t.rotateDeg)
    ) {
      return false;
    }

    if (!e.config || typeof e.config !== 'object') {
      return false;
    }

    const c = e.config as Partial<ShapeElementConfig>;
    if (
      typeof c.width !== 'number' ||
      !Number.isFinite(c.width) ||
      c.width <= 0 ||
      typeof c.height !== 'number' ||
      !Number.isFinite(c.height) ||
      c.height <= 0 ||
      typeof c.radius !== 'number' ||
      !Number.isFinite(c.radius) ||
      c.radius < 0 ||
      typeof c.fillColor !== 'string' ||
      c.fillColor.length === 0 ||
      typeof c.borderColor !== 'string' ||
      c.borderColor.length === 0
    ) {
      return false;
    }

    return true;
  },

  normalize(element: Partial<ShapeElementConfigComplete> | undefined): ShapeElementConfigComplete | null {
    return normalizeShapeElement(element);
  },

  toRenderData(element: ShapeElementConfigComplete): ShapeElementRenderData {
    // SHAPE element render data is simple: just pass through config
    // Render layer applies width/height/radius/colors directly
    return {
      width: element.config.width,
      height: element.config.height,
      radius: element.config.radius,
      fillColor: element.config.fillColor,
      borderColor: element.config.borderColor,
    };
  },
};

