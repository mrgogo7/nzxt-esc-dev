// Default shape element configurations
//
// FAZ-5.D1.A: SHAPE element defaults and normalization.
// SHAPE uses box-driven sizing (width/height), not content-driven sizing.

import type { ShapeElementConfig, ShapeElementConfigComplete } from './shape.types';
import { normalizeBaseTransform } from '../../overlay/overlay.defaults';

/**
 * Default SHAPE element configuration.
 */
export const DEFAULT_SHAPE_ELEMENT_CONFIG: ShapeElementConfig = {
  width: 100,
  height: 100,
  radius: 8,
  fillColor: '#FFFFFF',
  borderColor: '#000000',
};

/**
 * Default SHAPE element (complete with base transform).
 */
export const DEFAULT_SHAPE_ELEMENT: ShapeElementConfigComplete = {
  id: '', // Will be generated on creation
  elementType: 'shape',
  typeSeq: 1, // Will be assigned on creation
  transform: {
    x: 0,
    y: 0,
    rotateDeg: 0,
  },
  config: DEFAULT_SHAPE_ELEMENT_CONFIG,
};

/**
 * Normalizes a SHAPE element configuration.
 *
 * Normalization rules:
 * - Fill missing fields with defaults
 * - Clamp width/height to valid range (1..1000)
 * - Clamp radius to valid range (0..100)
 *
 * This function is pure and side-effect free.
 */
export function normalizeShapeElementConfig(
  config: Partial<ShapeElementConfig> | undefined
): ShapeElementConfig {
  if (!config || typeof config !== 'object') {
    return { ...DEFAULT_SHAPE_ELEMENT_CONFIG };
  }

  const width =
    typeof config.width === 'number' && Number.isFinite(config.width) && config.width > 0
      ? Math.max(1, Math.min(1000, config.width))
      : DEFAULT_SHAPE_ELEMENT_CONFIG.width;

  const height =
    typeof config.height === 'number' && Number.isFinite(config.height) && config.height > 0
      ? Math.max(1, Math.min(1000, config.height))
      : DEFAULT_SHAPE_ELEMENT_CONFIG.height;

  const radius =
    typeof config.radius === 'number' && Number.isFinite(config.radius) && config.radius >= 0
      ? Math.max(0, Math.min(100, config.radius))
      : DEFAULT_SHAPE_ELEMENT_CONFIG.radius;

  const fillColor =
    typeof config.fillColor === 'string' && config.fillColor.length > 0
      ? config.fillColor
      : DEFAULT_SHAPE_ELEMENT_CONFIG.fillColor;

  const borderColor =
    typeof config.borderColor === 'string' && config.borderColor.length > 0
      ? config.borderColor
      : DEFAULT_SHAPE_ELEMENT_CONFIG.borderColor;

  return { width, height, radius, fillColor, borderColor };
}

/**
 * Normalizes a complete SHAPE element (including base transform).
 *
 * This function is pure and side-effect free.
 * Returns null if element is invalid (e.g., missing ID).
 */
export function normalizeShapeElement(
  element: Partial<ShapeElementConfigComplete> | undefined
): ShapeElementConfigComplete | null {
  if (!element || typeof element !== 'object') {
    return null;
  }

  // ID, elementType, typeSeq must be present for a valid element
  if (typeof element.id !== 'string' || element.id.length === 0) {
    return null;
  }

  if (element.elementType !== 'shape') {
    return null;
  }

  if (typeof element.typeSeq !== 'number' || !Number.isFinite(element.typeSeq) || element.typeSeq < 0) {
    return null;
  }

  const normalizedTransform = normalizeBaseTransform(element.transform);
  const normalizedConfig = normalizeShapeElementConfig(element.config);

  return {
    id: element.id,
    elementType: 'shape',
    typeSeq: element.typeSeq,
    transform: normalizedTransform,
    config: normalizedConfig,
  };
}

