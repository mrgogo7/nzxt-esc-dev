// Default overlay values and configurations
//
// FAZ-5.A1: Overlay domain infrastructure.
// This module provides safe defaults and normalization helpers.
//
// Normalization must be pure and deterministic.
// Unknown element types are skipped with warning (permissive).

import type { BaseElementTransform } from '../elements/base/element.transform.types';
import type { OverlayConfig, OverlayElement } from './overlay.types';
import { round } from '../utils/math';

/**
 * Default base transform for overlay elements.
 *
 * - x: 0 (centered horizontally)
 * - y: 0 (centered vertically)
 * - rotateDeg: 0 (no rotation)
 */
export const DEFAULT_BASE_TRANSFORM: BaseElementTransform = {
  x: 0,
  y: 0,
  rotateDeg: 0,
};

/**
 * Default overlay configuration.
 *
 * - enabled: true (overlay is enabled by default)
 * - elements: [] (empty array, no elements)
 */
export const DEFAULT_OVERLAY_CONFIG: OverlayConfig = {
  enabled: true,
  elements: [],
};

/**
 * Normalizes a potentially partial base transform into a full transform,
 * filling missing fields with defaults.
 *
 * Normalization rules:
 * - Fill missing fields with defaults
 * - Replace NaN / Infinity with defaults
 * - Clamp:
 *   - x / y → [-3, 3] (wider range than background media overlay)
 *   - rotateDeg → [-180, 180]
 *
 * This function is pure and side-effect free.
 */
export function normalizeBaseTransform(
  transform: Partial<BaseElementTransform> | undefined
): BaseElementTransform {
  if (!transform || typeof transform !== 'object') {
    return { ...DEFAULT_BASE_TRANSFORM };
  }

  const x =
    typeof transform.x === 'number' && Number.isFinite(transform.x)
      ? round(Math.max(-3, Math.min(3, transform.x)), 2)
      : DEFAULT_BASE_TRANSFORM.x;

  const y =
    typeof transform.y === 'number' && Number.isFinite(transform.y)
      ? round(Math.max(-3, Math.min(3, transform.y)), 2)
      : DEFAULT_BASE_TRANSFORM.y;

  const rotateDeg =
    typeof transform.rotateDeg === 'number' && Number.isFinite(transform.rotateDeg)
      ? round(Math.max(-180, Math.min(180, transform.rotateDeg)), 2)
      : DEFAULT_BASE_TRANSFORM.rotateDeg;

  return { x, y, rotateDeg };
}

/**
 * Normalizes overlay configuration.
 *
 * Normalization rules:
 * - Fill missing fields with defaults
 * - Normalize all elements (skip unknown types with warning)
 * - Filter out invalid elements (permissive, do not crash)
 *
 * This function is pure and side-effect free.
 *
 * Note: Element-specific normalization is delegated to element contracts.
 * This function only normalizes the overlay structure itself.
 */
export function normalizeOverlayConfig(
  config: Partial<OverlayConfig> | undefined
): OverlayConfig {
  if (!config || typeof config !== 'object') {
    return { ...DEFAULT_OVERLAY_CONFIG };
  }

  const enabled =
    typeof config.enabled === 'boolean' ? config.enabled : DEFAULT_OVERLAY_CONFIG.enabled;

  // Normalize elements array
  let elements: OverlayElement[] = [];
  if (Array.isArray(config.elements)) {
    // Filter and normalize elements
    // Unknown element types are skipped (permissive)
    // Element-specific normalization happens in element contracts
    elements = config.elements.filter((element): element is OverlayElement => {
      // Basic shape validation (element contracts do full validation)
      if (!element || typeof element !== 'object') {
        return false;
      }

      // TEXT and SHAPE elements are supported
      // Other types will be added in future phases
      if ((element as any).elementType === 'text' || (element as any).elementType === 'shape') {
        return true;
      }

      // Unknown element type: skip with warning (permissive)
      if (typeof (element as any).elementType === 'string') {
        console.warn(
          `Unknown overlay element type: ${(element as any).elementType}, skipping`
        );
      }

      return false;
    });
  }

  return {
    enabled,
    elements,
  };
}
