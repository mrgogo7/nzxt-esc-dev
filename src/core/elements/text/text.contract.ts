// Text element contract and validation
//
// FAZ-5.B1: TEXT element contract implementation.
// TEXT element contract follows the same pattern as background contracts.

import type { TextElementConfig, TextElementConfigComplete } from './text.types';
import type { BaseElementTransform } from '../base/element.transform.types';
import { normalizeTextElement } from './text.defaults';

/**
 * TEXT element render data.
 *
 * Render-ready data for TEXT element rendering.
 * This is intentionally simple and browser-agnostic.
 */
export interface TextElementRenderData {
  /**
   * Text content (plain text, no formatting).
   */
  content: string;

  /**
   * Text color (hex string).
   */
  color: string;

  /**
   * Font size in pixels.
   */
  fontSize: number;

  /**
   * Font family name (optional).
   */
  fontFamily?: string;

  /**
   * Outline width in pixels (optional).
   */
  outlineWidth?: number;

  /**
   * Outline color (hex string, optional).
   */
  outlineColor?: string;
}

/**
 * TEXT element contract interface.
 *
 * Follows the same pattern as background contracts:
 * - validate: full validation (shape + semantics)
 * - normalize: fill defaults, clamp values, handle errors
 * - toRenderData: resolve to render-ready data
 */
export interface TextElementContract {
  /**
   * Validates a TEXT element configuration.
   *
   * Returns true if valid, false otherwise.
   */
  validate(element: unknown): element is TextElementConfigComplete;

  /**
   * Normalizes a potentially partial TEXT element into a full element.
   *
   * This function is pure and side-effect free.
   * Returns null if element is invalid.
   */
  normalize(element: Partial<TextElementConfigComplete> | undefined): TextElementConfigComplete | null;

  /**
   * Resolves a validated TEXT element into render-ready data.
   *
   * This function is pure and side-effect free.
   */
  toRenderData(element: TextElementConfigComplete): TextElementRenderData;
}

/**
 * TEXT element contract implementation.
 */
export const textElementContract: TextElementContract = {
  validate(element: unknown): element is TextElementConfigComplete {
    if (!element || typeof element !== 'object') {
      return false;
    }

    const e = element as Partial<TextElementConfigComplete>;

    if (e.elementType !== 'text') {
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

    const c = e.config as Partial<TextElementConfig>;
    if (
      typeof c.content !== 'string' ||
      typeof c.color !== 'string' ||
      c.color.length === 0 ||
      typeof c.fontSize !== 'number' ||
      !Number.isFinite(c.fontSize) ||
      c.fontSize <= 0
    ) {
      return false;
    }

    // Optional fields: permissive validation (if present, must be valid type)
    if (c.fontFamily !== undefined && typeof c.fontFamily !== 'string') {
      return false;
    }
    if (c.outlineWidth !== undefined && (typeof c.outlineWidth !== 'number' || !Number.isFinite(c.outlineWidth) || c.outlineWidth < 0)) {
      return false;
    }
    if (c.outlineColor !== undefined && (typeof c.outlineColor !== 'string' || c.outlineColor.length === 0)) {
      return false;
    }

    return true;
  },

  normalize(element: Partial<TextElementConfigComplete> | undefined): TextElementConfigComplete | null {
    return normalizeTextElement(element);
  },

  toRenderData(element: TextElementConfigComplete): TextElementRenderData {
    // TEXT element render data: pass through config fields
    // Render layer applies fontSize, color, fontFamily, and outline directly
    return {
      content: element.config.content,
      color: element.config.color,
      fontSize: element.config.fontSize,
      fontFamily: element.config.fontFamily,
      outlineWidth: element.config.outlineWidth,
      outlineColor: element.config.outlineColor,
    };
  },
};
