// Preset state manipulation helpers (storage layer, no UI)
// Pure functions for mutating ActivePresetState while enforcing invariants.

import type { ActivePresetState, Preset } from '../../core/preset/preset.types';
import { createDefaultPreset, generatePresetId } from '../../core/preset/preset.defaults';

/**
 * Adds a preset to the state.
 * Appends preset to the end of order.
 * Does not change activePresetId.
 */
export function addPreset(
  state: ActivePresetState,
  preset: Preset
): ActivePresetState {
  const presets = { ...state.presets };
  presets[preset.id] = preset;

  const order = [...state.order];
  if (!order.includes(preset.id)) {
    order.push(preset.id);
  }

  return {
    ...state,
    presets,
    order,
  };
}

/**
 * Deletes a preset from the state.
 * Returns null if preset is default (cannot be deleted).
 * If deleted preset was active, switches to first preset in order.
 */
export function deletePreset(
  state: ActivePresetState,
  presetId: string
): ActivePresetState | null {
  const preset = state.presets[presetId];
  if (!preset) {
    return state; // Preset doesn't exist, no-op
  }

  // Cannot delete default preset
  if (preset.isDefault === true) {
    return null;
  }

  const presets = { ...state.presets };
  delete presets[presetId];

  const order = state.order.filter((id) => id !== presetId);

  // If deleted preset was active, switch to first preset in order
  let activePresetId = state.activePresetId;
  if (activePresetId === presetId) {
    activePresetId = order.length > 0 ? order[0] : '';
  }

  // Ensure at least one preset exists
  if (Object.keys(presets).length === 0) {
    return null; // Cannot delete last preset
  }

  return {
    activePresetId,
    presets,
    order,
  };
}

/**
 * Duplicates a preset with a new ID.
 * Name format: "{originalName} (2)", "{originalName} (3)", etc.
 * Appends duplicated preset to the end of order.
 */
export function duplicatePreset(
  state: ActivePresetState,
  presetId: string
): { state: ActivePresetState; duplicated: Preset } | null {
  const sourcePreset = state.presets[presetId];
  if (!sourcePreset) {
    return null;
  }

  // Generate unique name
  const baseName = sourcePreset.name;
  const existingNames = Object.values(state.presets).map((p) => p.name);
  let newName = `${baseName} (2)`;
  let counter = 2;

  while (existingNames.includes(newName)) {
    counter++;
    newName = `${baseName} (${counter})`;
  }

  // Create duplicated preset with new ID and name
  const duplicated: Preset = {
    ...sourcePreset,
    id: generatePresetId(),
    name: newName,
    // isDefault is explicitly NOT copied (duplicate is never default)
  };

  const newState = addPreset(state, duplicated);

  return {
    state: newState,
    duplicated,
  };
}

/**
 * Overwrites preset content while preserving ID and order position.
 *
 * Rules:
 * - Target preset ID is preserved
 * - Order position is preserved
 * - Only content fields (background, overlay, etc.) are updated
 * - isDefault flag is preserved on target preset
 * - Active preset remains active if overwritten preset was active
 */
export function overwritePresetContent(
  state: ActivePresetState,
  targetPresetId: string,
  importedPreset: Preset
): ActivePresetState | null {
  const targetPreset = state.presets[targetPresetId];
  if (!targetPreset) {
    return null; // Target preset doesn't exist
  }

  // Preserve ID, order position, and isDefault flag
  const updatedPreset: Preset = {
    ...importedPreset,
    id: targetPresetId,
    isDefault: targetPreset.isDefault, // Preserve default flag
  };

  const presets = { ...state.presets };
  presets[targetPresetId] = updatedPreset;

  // Order remains unchanged
  const order = [...state.order];

  // Active preset remains unchanged (whether target was active or not)
  const activePresetId = state.activePresetId;

  return {
    activePresetId,
    presets,
    order,
  };
}

/**
 * Creates a new preset using the default background as template.
 * - name: provided name
 * - background: taken from a fresh default preset
 * - isDefault: NEVER set
 */
export function createNewPresetWithDefaultBackground(name: string): Preset {
  const defaultPreset = createDefaultPreset();
  return {
    id: generatePresetId(),
    name,
    background: defaultPreset.background,
    // isDefault is intentionally omitted
  };
}

/**
 * Renames a preset while preserving all other fields.
 */
export function renamePreset(
  state: ActivePresetState,
  presetId: string,
  newName: string
): ActivePresetState {
  const preset = state.presets[presetId];
  if (!preset) {
    return state;
  }

  const presets = { ...state.presets };
  presets[presetId] = {
    ...preset,
    name: newName,
  };

  return {
    ...state,
    presets,
  };
}

/**
 * Sets the active preset ID without changing order.
 * If the target preset does not exist, state is returned unchanged.
 */
export function setActivePreset(
  state: ActivePresetState,
  presetId: string
): ActivePresetState {
  if (!state.presets[presetId]) {
    return state;
  }

  return {
    ...state,
    activePresetId: presetId,
  };
}

/**
 * Moves a preset one position up in the order array.
 * Active preset is not changed.
 */
export function movePresetUp(
  state: ActivePresetState,
  presetId: string
): ActivePresetState {
  const index = state.order.indexOf(presetId);
  if (index <= 0) {
    return state;
  }

  const order = [...state.order];
  const [item] = order.splice(index, 1);
  order.splice(index - 1, 0, item);

  return {
    ...state,
    order,
  };
}

/**
 * Moves a preset one position down in the order array.
 * Active preset is not changed.
 */
export function movePresetDown(
  state: ActivePresetState,
  presetId: string
): ActivePresetState {
  const index = state.order.indexOf(presetId);
  if (index === -1 || index >= state.order.length - 1) {
    return state;
  }

  const order = [...state.order];
  const [item] = order.splice(index, 1);
  order.splice(index + 1, 0, item);

  return {
    ...state,
    order,
  };
}

/**
 * Reorders presets by moving an item from one index to another
 * within the order array.
 *
 * Rules:
 * - activePresetId is never changed
 * - presets map is never changed
 * - Only order array is updated
 */
export function reorderPresets(
  state: ActivePresetState,
  fromIndex: number,
  toIndex: number
): ActivePresetState {
  const orderLength = state.order.length;
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= orderLength ||
    toIndex >= orderLength
  ) {
    return state;
  }

  const order = [...state.order];
  const [moved] = order.splice(fromIndex, 1);
  order.splice(toIndex, 0, moved);

  return {
    ...state,
    order,
  };
}

/**
 * Toggles the favorite status of a preset.
 * Does not change order or activePresetId.
 */
export function togglePresetFavorite(
  state: ActivePresetState,
  presetId: string
): ActivePresetState {
  const preset = state.presets[presetId];
  if (!preset) {
    return state; // Preset doesn't exist, no-op
  }

  const presets = { ...state.presets };
  presets[presetId] = {
    ...preset,
    isFavorite: preset.isFavorite === true ? undefined : true,
  };

  return {
    ...state,
    presets,
  };
}
