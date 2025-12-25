// Overlay UI helpers
//
// FAZ-5.C1: Helper functions for overlay UI operations.
// These functions handle immutable updates to preset.overlay.

import type { Preset } from '../../../core/preset/preset.types';
import type { OverlayConfig } from '../../../core/overlay/overlay.types';
import type { TextElementConfigComplete } from '../../../core/elements/text/text.types';
import type { ShapeElementConfigComplete } from '../../../core/elements/shape/shape.types';
import { DEFAULT_OVERLAY_CONFIG } from '../../../core/overlay/overlay.defaults';
import { DEFAULT_TEXT_ELEMENT_CONFIG } from '../../../core/elements/text/text.defaults';
import { DEFAULT_SHAPE_ELEMENT_CONFIG } from '../../../core/elements/shape/shape.defaults';
import { DEFAULT_BASE_TRANSFORM } from '../../../core/overlay/overlay.defaults';

/**
 * Generates a stable UUID for overlay elements.
 * Uses crypto.randomUUID if available, otherwise falls back to a simple UUID v4 implementation.
 */
function generateOverlayElementId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback UUID v4 implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Calculates the next typeSeq for a given element type.
 *
 * FAZ-5.C1: typeSeq is monotonic per type and does not renumber on delete.
 * This function finds the highest existing typeSeq for the given type and returns the next value.
 *
 * @param overlay - Current overlay config
 * @param elementType - Element type ('text', 'shape', etc.)
 * @returns Next typeSeq for the element type
 */
function calculateNextTypeSeq(overlay: OverlayConfig | undefined, elementType: 'text' | 'shape'): number {
  if (!overlay || !overlay.elements || overlay.elements.length === 0) {
    return 1;
  }

  const elementsOfType = overlay.elements.filter((el) => el.elementType === elementType);
  if (elementsOfType.length === 0) {
    return 1;
  }

  const maxTypeSeq = Math.max(...elementsOfType.map((el) => el.typeSeq));
  return maxTypeSeq + 1;
}

/**
 * Toggles overlay enabled state.
 *
 * FAZ-5.C1: Toggling OFF does NOT delete elements, only hides rendering.
 * Toggling ON restores previous overlay state.
 *
 * @param preset - Current preset
 * @returns Updated preset with toggled overlay enabled state
 */
export function toggleOverlayEnabled(preset: Preset): Preset {
  const currentOverlay = preset.overlay;

  if (!currentOverlay) {
    // No overlay exists: create with enabled = true
    return {
      ...preset,
      overlay: {
        ...DEFAULT_OVERLAY_CONFIG,
        enabled: true,
      },
    };
  }

  // Toggle enabled state (preserve elements)
  return {
    ...preset,
    overlay: {
      ...currentOverlay,
      enabled: !currentOverlay.enabled,
    },
  };
}

/**
 * Adds a new TEXT overlay element to the preset.
 *
 * FAZ-5.C1: Creates a TEXT element with defaults:
 * - content: "Text"
 * - fontSize: 24
 * - color: white (#FFFFFF)
 * - transform: x=0, y=0, rotateDeg=0
 *
 * Respects max 20 elements hard limit.
 *
 * @param preset - Current preset
 * @returns Updated preset with new TEXT element, or null if limit reached
 */
export function addTextOverlayElement(preset: Preset): Preset | null {
  const currentOverlay = preset.overlay;

  // Initialize overlay if it doesn't exist
  let overlay: OverlayConfig;
  if (!currentOverlay) {
    overlay = {
      ...DEFAULT_OVERLAY_CONFIG,
      enabled: true,
    };
  } else {
    overlay = currentOverlay;
  }

  // Check 20-element limit
  if (overlay.elements.length >= 20) {
    return null; // Limit reached
  }

  // Generate ID and typeSeq
  const id = generateOverlayElementId();
  const typeSeq = calculateNextTypeSeq(overlay, 'text');

  // Create new TEXT element with defaults
  const newElement: TextElementConfigComplete = {
    id,
    elementType: 'text',
    typeSeq,
    transform: { ...DEFAULT_BASE_TRANSFORM },
    config: { ...DEFAULT_TEXT_ELEMENT_CONFIG },
  };

  // Add element to overlay (immutable)
  const updatedOverlay: OverlayConfig = {
    ...overlay,
    elements: [...overlay.elements, newElement],
  };

  // Return updated preset (immutable)
  return {
    ...preset,
    overlay: updatedOverlay,
  };
}

/**
 * Adds a new SHAPE overlay element to the preset.
 *
 * FAZ-5.D1.A1: Creates a SHAPE element with defaults:
 * - width: 100
 * - height: 100
 * - radius: 8
 * - fillColor: '#ffffff'
 * - borderColor: '#000000'
 * - transform: x=0, y=0, rotateDeg=0
 *
 * Respects max 20 elements hard limit.
 *
 * @param preset - Current preset
 * @returns Updated preset with new SHAPE element, or null if limit reached
 */
export function addShapeOverlayElement(preset: Preset): Preset | null {
  const currentOverlay = preset.overlay;

  // Initialize overlay if it doesn't exist
  let overlay: OverlayConfig;
  if (!currentOverlay) {
    overlay = {
      ...DEFAULT_OVERLAY_CONFIG,
      enabled: true,
    };
  } else {
    overlay = currentOverlay;
  }

  // Check 20-element limit
  if (overlay.elements.length >= 20) {
    return null; // Limit reached
  }

  // Generate ID and typeSeq
  const id = generateOverlayElementId();
  const typeSeq = calculateNextTypeSeq(overlay, 'shape');

  // Create new SHAPE element with defaults
  const newElement: ShapeElementConfigComplete = {
    id,
    elementType: 'shape',
    typeSeq,
    transform: { ...DEFAULT_BASE_TRANSFORM },
    config: { ...DEFAULT_SHAPE_ELEMENT_CONFIG },
  };

  // Add element to overlay (immutable)
  const updatedOverlay: OverlayConfig = {
    ...overlay,
    elements: [...overlay.elements, newElement],
  };

  // Return updated preset (immutable)
  return {
    ...preset,
    overlay: updatedOverlay,
  };
}

