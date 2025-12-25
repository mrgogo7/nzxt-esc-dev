// Overlay update helpers
//
// FAZ-5.B2: Immutable overlay update utilities.
// All updates replace entire objects (no partial mutations).
// Overlay state lives ONLY in Preset.overlay.

import type { Preset } from '../../../core/preset/preset.types';
import type { OverlayConfig, OverlayElement } from '../../../core/overlay/overlay.types';
import type { TextElementConfigComplete } from '../../../core/elements/text/text.types';
import { normalizeBaseTransform } from '../../../core/overlay/overlay.defaults';
import { normalizeTextElementConfig } from '../../../core/elements/text/text.defaults';

/**
 * Updates a TEXT element's transform (position, rotation).
 *
 * FAZ-5.B2: Immutable update pattern.
 * - Replaces entire element object
 * - Replaces entire overlay object
 * - Replaces entire preset object
 *
 * @param preset - Current preset
 * @param elementId - Element ID to update
 * @param deltaX - Normalized X delta (will be clamped)
 * @param deltaY - Normalized Y delta (will be clamped)
 * @param deltaRotateDeg - Rotation delta in degrees (will be clamped)
 * @returns Updated preset or null if element not found
 */
export function updateOverlayElementTransform(
  preset: Preset,
  elementId: string,
  deltaX: number,
  deltaY: number,
  deltaRotateDeg: number = 0
): Preset | null {
  if (!preset.overlay || !preset.overlay.enabled) {
    return null;
  }

  const elementIndex = preset.overlay.elements.findIndex((el) => el.id === elementId);
  if (elementIndex === -1) {
    return null;
  }

  const element = preset.overlay.elements[elementIndex];
  if (element.elementType !== 'text') {
    return null;
  }

  const textElement = element as TextElementConfigComplete;

  // Calculate new transform (immutable)
  const newTransform = {
    x: textElement.transform.x + deltaX,
    y: textElement.transform.y + deltaY,
    rotateDeg: textElement.transform.rotateDeg + deltaRotateDeg,
  };

  // Normalize transform (clamps to valid ranges)
  const normalizedTransform = normalizeBaseTransform(newTransform);

  // Create new element (immutable)
  const updatedElement: TextElementConfigComplete = {
    ...textElement,
    transform: normalizedTransform,
  };

  // Create new elements array (immutable)
  const updatedElements: OverlayElement[] = [
    ...preset.overlay.elements.slice(0, elementIndex),
    updatedElement,
    ...preset.overlay.elements.slice(elementIndex + 1),
  ];

  // Create new overlay (immutable)
  const updatedOverlay: OverlayConfig = {
    ...preset.overlay,
    elements: updatedElements,
  };

  // Create new preset (immutable)
  return {
    ...preset,
    overlay: updatedOverlay,
  };
}

/**
 * Updates a TEXT element's fontSize.
 *
 * FAZ-5.B2: fontSize is the only persisted sizing value.
 * Bounding box is render-computed, not persisted.
 *
 * @param preset - Current preset
 * @param elementId - Element ID to update
 * @param fontSizeDelta - Font size delta (will be clamped)
 * @returns Updated preset or null if element not found
 */
export function updateOverlayElementFontSize(
  preset: Preset,
  elementId: string,
  fontSizeDelta: number
): Preset | null {
  if (!preset.overlay || !preset.overlay.enabled) {
    return null;
  }

  const elementIndex = preset.overlay.elements.findIndex((el) => el.id === elementId);
  if (elementIndex === -1) {
    return null;
  }

  const element = preset.overlay.elements[elementIndex];
  if (element.elementType !== 'text') {
    return null;
  }

  const textElement = element as TextElementConfigComplete;

  // Calculate new fontSize (immutable)
  const newFontSize = textElement.config.fontSize + fontSizeDelta;

  // Normalize fontSize (clamps to valid range 1-200)
  const normalizedConfig = normalizeTextElementConfig({
    ...textElement.config,
    fontSize: newFontSize,
  });

  // Create new element (immutable)
  const updatedElement: TextElementConfigComplete = {
    ...textElement,
    config: normalizedConfig,
  };

  // Create new elements array (immutable)
  const updatedElements: OverlayElement[] = [
    ...preset.overlay.elements.slice(0, elementIndex),
    updatedElement,
    ...preset.overlay.elements.slice(elementIndex + 1),
  ];

  // Create new overlay (immutable)
  const updatedOverlay: OverlayConfig = {
    ...preset.overlay,
    elements: updatedElements,
  };

  // Create new preset (immutable)
  return {
    ...preset,
    overlay: updatedOverlay,
  };
}

