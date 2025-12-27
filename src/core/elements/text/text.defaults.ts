// Default text element configurations
//
// FAZ-5.B1: TEXT element defaults and normalization.
// TEXT uses content-driven sizing (fontSize), not box-driven sizing (width/height).

import type { TextElementConfig, TextElementConfigComplete } from './text.types';
import type { BaseElementTransform } from '../base/element.transform.types';
import { normalizeBaseTransform } from '../../overlay/overlay.defaults';

/**
 * Default TEXT element configuration.
 */
export const DEFAULT_TEXT_ELEMENT_CONFIG: TextElementConfig = {
  content: 'Text',
  color: '#FFFFFF',
  fontSize: 24,
  fontFamily: 'nzxt-extrabold',
  // outlineWidth and outlineColor are optional (no defaults)
};

/**
 * Default TEXT element (complete with base transform).
 */
export const DEFAULT_TEXT_ELEMENT: TextElementConfigComplete = {
  id: '',
  elementType: 'text',
  typeSeq: 1,
  transform: {
    x: 0,
    y: 0,
    rotateDeg: 0,
  },
  config: DEFAULT_TEXT_ELEMENT_CONFIG,
};

/**
 * Normalizes a TEXT element configuration.
 *
 * Normalization rules:
 * - Fill missing required fields with defaults
 * - Clamp fontSize to valid range (1..200)
 * - Validate and clamp optional fields (fontFamily, outlineWidth, outlineColor)
 * - outlineColor default is NOT set at normalize level (set at UI/updater level when first opened)
 *
 * This function is pure and side-effect free.
 */
export function normalizeTextElementConfig(
  config: Partial<TextElementConfig> | undefined
): TextElementConfig {
  if (!config || typeof config !== 'object') {
    return { ...DEFAULT_TEXT_ELEMENT_CONFIG };
  }

  const content =
    typeof config.content === 'string' ? config.content : DEFAULT_TEXT_ELEMENT_CONFIG.content;

  const color =
    typeof config.color === 'string' && config.color.length > 0
      ? config.color
      : DEFAULT_TEXT_ELEMENT_CONFIG.color;

  const fontSize =
    typeof config.fontSize === 'number' && Number.isFinite(config.fontSize) && config.fontSize > 0
      ? Math.max(1, Math.min(200, config.fontSize))
      : DEFAULT_TEXT_ELEMENT_CONFIG.fontSize;

  // fontFamily: default 'nzxt-extrabold' if missing/invalid
  const fontFamily =
    typeof config.fontFamily === 'string' && config.fontFamily.length > 0
      ? config.fontFamily
      : DEFAULT_TEXT_ELEMENT_CONFIG.fontFamily;

  // outlineWidth: validate + clamp only, no default (undefined if missing/invalid)
  const outlineWidth =
    typeof config.outlineWidth === 'number' && Number.isFinite(config.outlineWidth) && config.outlineWidth >= 0
      ? Math.max(0, Math.min(20, config.outlineWidth))
      : undefined;

  // outlineColor: validate only, no default (undefined if missing/invalid)
  // Default (#000000) is set at UI/updater level when outline is first opened, not here
  const outlineColor =
    typeof config.outlineColor === 'string' && config.outlineColor.length > 0
      ? config.outlineColor
      : undefined;

  return { content, color, fontSize, fontFamily, outlineWidth, outlineColor };
}

/**
 * Normalizes a complete TEXT element (including base transform).
 *
 * This function is pure and side-effect free.
 */
export function normalizeTextElement(
  element: Partial<TextElementConfigComplete> | undefined
): TextElementConfigComplete | null {
  if (!element || typeof element !== 'object') {
    return null;
  }

  if (typeof element.id !== 'string' || element.id.length === 0) {
    return null;
  }

  if (element.elementType !== 'text') {
    return null;
  }

  if (typeof element.typeSeq !== 'number' || !Number.isFinite(element.typeSeq) || element.typeSeq < 0) {
    return null;
  }

  const normalizedTransform = normalizeBaseTransform(element.transform);
  const normalizedConfig = normalizeTextElementConfig(element.config);

  return {
    id: element.id,
    elementType: 'text',
    typeSeq: element.typeSeq,
    transform: normalizedTransform,
    config: normalizedConfig,
  };
}
