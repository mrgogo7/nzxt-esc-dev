// Validation helpers for overlay configurations
//
// FAZ-5.A1: Overlay domain infrastructure.
// This module provides shape validation for overlay structures.
//
// Validation is permissive enough to allow future schema extensions.
// Unknown element types are rejected (element contracts handle permissive skipping).

import type {
  OverlayConfig,
  OverlayElementType,
  OverlayElementBase,
} from './overlay.types';
import type { BaseElementTransform } from '../elements/base/element.transform.types';

/**
 * Validates base transform shape (numbers only).
 *
 * This is a SHAPE check used by storage layer; it does not
 * enforce semantic ranges (normalization handles clamping).
 *
 * Validates all three transform fields: x, y, rotateDeg.
 */
export function isValidBaseTransformShape(
  transform: unknown
): transform is BaseElementTransform {
  if (!transform || typeof transform !== 'object') {
    return false;
  }

  const t = transform as Partial<BaseElementTransform>;

  if (t.x !== undefined && typeof t.x !== 'number') {
    return false;
  }

  if (t.y !== undefined && typeof t.y !== 'number') {
    return false;
  }

  if (t.rotateDeg !== undefined && typeof t.rotateDeg !== 'number') {
    return false;
  }

  return true;
}

/**
 * Validates overlay element base shape.
 *
 * This is a SHAPE check; it does not validate element-specific configs.
 * Element contracts handle full validation including config.
 */
export function isValidOverlayElementBaseShape(
  element: unknown
): element is OverlayElementBase {
  if (!element || typeof element !== 'object') {
    return false;
  }

  const e = element as Partial<OverlayElementBase>;

  if (typeof e.id !== 'string' || e.id.length === 0) {
    return false;
  }

  if (typeof e.elementType !== 'string') {
    return false;
  }

  // Validate elementType is known
  const validTypes: OverlayElementType[] = ['text', 'metric', 'clock', 'date', 'shape'];
  if (!validTypes.includes(e.elementType as OverlayElementType)) {
    return false;
  }

  if (typeof e.typeSeq !== 'number' || !Number.isFinite(e.typeSeq) || e.typeSeq < 0) {
    return false;
  }

  if (e.transform !== undefined && !isValidBaseTransformShape(e.transform)) {
    return false;
  }

  // Config must exist (element contracts validate config structure)
  if (e.config === undefined) {
    return false;
  }

  return true;
}

/**
 * Validates overlay configuration SHAPE.
 *
 * Storage layer uses this to ensure the structure is well-formed.
 * Element-specific validation happens in element contracts.
 *
 * This validation is permissive enough to allow future schema extensions.
 */
export function isValidOverlayConfigShape(config: unknown): config is OverlayConfig {
  if (!config || typeof config !== 'object') {
    return false;
  }

  const c = config as Partial<OverlayConfig>;

  // enabled is optional (defaults to true)
  if (c.enabled !== undefined && typeof c.enabled !== 'boolean') {
    return false;
  }

  // elements must be an array (can be empty)
  if (!Array.isArray(c.elements)) {
    return false;
  }

  // Validate each element shape (element contracts do full validation)
  for (const element of c.elements) {
    if (!isValidOverlayElementBaseShape(element)) {
      return false;
    }
  }

  return true;
}
