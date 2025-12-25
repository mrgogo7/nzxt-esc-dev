// Overlay list UI helpers
//
// FAZ-5.C2: Helper functions for overlay list operations (reorder, delete).
// These functions handle immutable updates to preset.overlay.elements array.

import type { Preset } from '../../../core/preset/preset.types';
import type { OverlayConfig, OverlayElement } from '../../../core/overlay/overlay.types';

/**
 * Reorders overlay elements by moving an element from one index to another.
 *
 * FAZ-5.C2: Z-order is determined by array order.
 * Moving an element up/down changes its position in the array.
 *
 * Rules:
 * - typeSeq does NOT change
 * - id does NOT change
 * - Only array order changes
 *
 * @param preset - Current preset
 * @param fromIndex - Current index of element to move
 * @param toIndex - Target index (after move)
 * @returns Updated preset with reordered elements, or null if indices invalid
 */
export function reorderOverlayElement(
  preset: Preset,
  fromIndex: number,
  toIndex: number
): Preset | null {
  if (!preset.overlay || !preset.overlay.enabled) {
    return null;
  }

  const elements = preset.overlay.elements;
  if (fromIndex < 0 || fromIndex >= elements.length) {
    return null;
  }
  if (toIndex < 0 || toIndex >= elements.length) {
    return null;
  }
  if (fromIndex === toIndex) {
    return preset; // No change needed
  }

  // Create new array with reordered elements (immutable)
  const newElements: OverlayElement[] = [...elements];
  const [movedElement] = newElements.splice(fromIndex, 1);
  newElements.splice(toIndex, 0, movedElement);

  // Create new overlay (immutable)
  const updatedOverlay: OverlayConfig = {
    ...preset.overlay,
    elements: newElements,
  };

  // Return updated preset (immutable)
  return {
    ...preset,
    overlay: updatedOverlay,
  };
}

/**
 * Moves an overlay element up in z-order (towards front).
 *
 * FAZ-5.C2: Moving up means increasing array index (towards end of array).
 * End of array = frontmost render.
 *
 * @param preset - Current preset
 * @param elementIndex - Index of element to move up
 * @returns Updated preset with element moved up, or null if invalid
 */
export function moveOverlayElementUp(
  preset: Preset,
  elementIndex: number
): Preset | null {
  if (elementIndex < 0 || !preset.overlay || !preset.overlay.enabled) {
    return null;
  }

  const elements = preset.overlay.elements;
  if (elementIndex >= elements.length - 1) {
    // Already at top (end of array = frontmost)
    return preset;
  }

  // Move up = increase index (towards end of array)
  return reorderOverlayElement(preset, elementIndex, elementIndex + 1);
}

/**
 * Moves an overlay element down in z-order (towards back).
 *
 * FAZ-5.C2: Moving down means decreasing array index (towards start of array).
 * Start of array = backmost render.
 *
 * @param preset - Current preset
 * @param elementIndex - Index of element to move down
 * @returns Updated preset with element moved down, or null if invalid
 */
export function moveOverlayElementDown(
  preset: Preset,
  elementIndex: number
): Preset | null {
  if (elementIndex < 1 || !preset.overlay || !preset.overlay.enabled) {
    return null;
  }

  const elements = preset.overlay.elements;
  if (elementIndex >= elements.length) {
    return null;
  }

  // Move down = decrease index (towards start of array)
  return reorderOverlayElement(preset, elementIndex, elementIndex - 1);
}

/**
 * Deletes an overlay element by index.
 *
 * FAZ-5.C2: Deletion removes element from array.
 * typeSeq is NOT renumbered (monotonic policy).
 *
 * @param preset - Current preset
 * @param elementIndex - Index of element to delete
 * @returns Updated preset with element removed, or null if invalid
 */
export function deleteOverlayElement(
  preset: Preset,
  elementIndex: number
): Preset | null {
  if (!preset.overlay || !preset.overlay.enabled) {
    return null;
  }

  const elements = preset.overlay.elements;
  if (elementIndex < 0 || elementIndex >= elements.length) {
    return null;
  }

  // Create new array without deleted element (immutable)
  const newElements: OverlayElement[] = [
    ...elements.slice(0, elementIndex),
    ...elements.slice(elementIndex + 1),
  ];

  // Create new overlay (immutable)
  const updatedOverlay: OverlayConfig = {
    ...preset.overlay,
    elements: newElements,
  };

  // Return updated preset (immutable)
  return {
    ...preset,
    overlay: updatedOverlay,
  };
}

/**
 * Gets the display label for an overlay element.
 *
 * FAZ-5.C2: Label format is ${elementType} ${typeSeq}.
 * Label is UI-only and not persisted.
 *
 * @param element - Overlay element
 * @returns Display label (e.g., "Text 1", "Text 3")
 */
export function getOverlayElementLabel(element: OverlayElement): string {
  const typeLabel = element.elementType.charAt(0).toUpperCase() + element.elementType.slice(1);
  return `${typeLabel} ${element.typeSeq}`;
}

