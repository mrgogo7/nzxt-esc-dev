// Overlay contract and validation interfaces
//
// FAZ-5.A1: Overlay domain infrastructure.
// This module provides overlay contract implementation.
//
// Overlay contract delegates to element contracts for element-specific logic.
// Overlay infrastructure is element-agnostic.

import type {
  OverlayConfig,
  OverlayRenderModel,
  OverlayElementRenderModel,
} from './overlay.types';
import type { BaseElementTransform } from '../elements/base/element.transform.types';
import type { TextElementConfigComplete } from '../elements/text/text.types';
import type { ShapeElementConfigComplete } from '../elements/shape/shape.types';
import { normalizeOverlayConfig } from './overlay.defaults';
import { isValidOverlayConfigShape, isValidBaseTransformShape } from './overlay.validate';
import { textElementContract } from '../elements/text/text.contract';
import { shapeElementContract } from '../elements/shape/shape.contract';

/**
 * Overlay contract interface.
 *
 * Follows the same pattern as background contracts:
 * - validate: full validation (shape + semantics)
 * - normalize: fill defaults, clamp values, handle errors
 * - toRenderModel: resolve to render-ready model
 */
export interface OverlayContract {
  /**
   * Validates an overlay configuration.
   *
   * This is a full validation used by the render pipeline.
   * Returns true if valid, false otherwise.
   */
  validate(config: unknown): config is OverlayConfig;

  /**
   * Normalizes a potentially partial overlay configuration into a full config.
   *
   * This function is pure and side-effect free.
   * Unknown element types are skipped with warning (permissive).
   */
  normalize(config: Partial<OverlayConfig> | undefined): OverlayConfig;

  /**
   * Resolves a validated overlay configuration into a render-ready model.
   *
   * Element-specific configs are resolved via element contracts.
   * Any failure to resolve should be handled by callers (e.g., ignored element).
   *
   * Note: In FAZ-5.A1, this returns a minimal model (no actual rendering).
   * Full render model resolution will be implemented in FAZ-5.B.
   */
  toRenderModel(config: OverlayConfig): OverlayRenderModel;
}

/**
 * Overlay contract implementation.
 *
 * FAZ-5.A1: Infrastructure only. No rendering logic.
 * This contract validates and normalizes overlay structure.
 * Element-specific resolution is deferred to element contracts (FAZ-5.B).
 */
export const overlayContract: OverlayContract = {
  validate(config: unknown): config is OverlayConfig {
    if (!isValidOverlayConfigShape(config)) {
      return false;
    }

    // Additional semantic validation
    const c = config as OverlayConfig;

    // Validate all elements (element contracts do full validation)
    // For FAZ-5.A1, we only validate shape; element contracts handle config validation
    for (const element of c.elements) {
      // Basic validation: element must have required fields
      if (
        typeof element.id !== 'string' ||
        element.id.length === 0 ||
        typeof element.elementType !== 'string' ||
        typeof element.typeSeq !== 'number' ||
        !Number.isFinite(element.typeSeq) ||
        element.typeSeq < 0
      ) {
        return false;
      }

      // Transform validation (shape only, normalization handles clamping)
      if (element.transform && !isValidBaseTransformShape(element.transform)) {
        return false;
      }
    }

    return true;
  },

  normalize(config: Partial<OverlayConfig> | undefined): OverlayConfig {
    return normalizeOverlayConfig(config);
  },

  toRenderModel(config: OverlayConfig): OverlayRenderModel {
    // FAZ-5.D1.A: Resolve elements to render-ready models via element contracts.
    // TEXT and SHAPE elements are resolved using their respective contracts.
    // Unknown element types are skipped (permissive).

    const elements: OverlayElementRenderModel[] = [];

    for (const element of config.elements) {
      const el = element as any;
      if (el.elementType === 'text') {
        try {
          // Normalize TEXT element (defensive, may fail)
          const normalizedElement = textElementContract.normalize(element as TextElementConfigComplete);

          if (!normalizedElement) {
            // Normalization failed: skip element (permissive)
            console.warn(`Failed to normalize TEXT element ${element.id}, skipping`);
            continue;
          }

          // Validate normalized element (defensive, may fail)
          if (!textElementContract.validate(normalizedElement)) {
            // Validation failed: skip element (permissive)
            console.warn(`Normalized TEXT element ${element.id} is invalid, skipping`);
            continue;
          }

          // Resolve to render data
          const renderData = textElementContract.toRenderData(normalizedElement);

          elements.push({
            id: normalizedElement.id,
            elementType: 'text',
            transform: normalizedElement.transform,
            renderData,
          });
        } catch (error) {
          // Element resolution failed: skip element (permissive, do not crash)
          console.warn(`Failed to resolve TEXT element ${element.id}:`, error);
          continue;
        }
      } else if (el.elementType === 'shape') {
        try {
          // Normalize SHAPE element (defensive, may fail)
          const normalizedElement = shapeElementContract.normalize(element as ShapeElementConfigComplete);

          if (!normalizedElement) {
            // Normalization failed: skip element (permissive)
            console.warn(`Failed to normalize SHAPE element ${element.id}, skipping`);
            continue;
          }

          // Validate normalized element (defensive, may fail)
          if (!shapeElementContract.validate(normalizedElement)) {
            // Validation failed: skip element (permissive)
            console.warn(`Normalized SHAPE element ${element.id} is invalid, skipping`);
            continue;
          }

          // Resolve to render data
          const renderData = shapeElementContract.toRenderData(normalizedElement);

          elements.push({
            id: normalizedElement.id,
            elementType: 'shape',
            transform: normalizedElement.transform,
            renderData,
          });
        } catch (error) {
          // Element resolution failed: skip element (permissive, do not crash)
          console.warn(`Failed to resolve SHAPE element ${element.id}:`, error);
          continue;
        }
      } else {
        // Unknown element type: skip (permissive)
        console.warn(`Unknown overlay element type: ${el.elementType}, skipping`);
      }
    }

    return {
      enabled: config.enabled,
      elements,
    };
  },
};
