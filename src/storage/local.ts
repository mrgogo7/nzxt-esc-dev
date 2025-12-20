// LocalStorage implementation

import { STORAGE_KEYS } from './keys';
import type { Preset, ActivePresetState } from '../core/preset/preset.types';
import { createDefaultPreset } from '../core/preset/preset.defaults';
import { normalizeMediaOverlayTransform } from '../core/background/media-overlay/media-overlay.defaults';
import { isValidBackgroundMediaOverlayShape } from '../core/background/media-overlay/media-overlay.validate';

/**
 * Loads the active preset state from localStorage.
 * Returns default state if no data exists.
 * Automatically normalizes order and isDefault invariants.
 */
export function loadActivePresetState(): ActivePresetState {
  if (typeof window === 'undefined' || !window.localStorage) {
    return createDefaultState();
  }

  try {
    const activePresetId = localStorage.getItem(STORAGE_KEYS.ACTIVE_PRESET_ID);
    const presetsJson = localStorage.getItem(STORAGE_KEYS.PRESETS);
    const orderJson = localStorage.getItem(STORAGE_KEYS.PRESET_ORDER);

    if (!activePresetId || !presetsJson) {
      return createDefaultState();
    }

    const presetsData = JSON.parse(presetsJson);
    const presets: Record<string, Preset> = {};

    for (const [id, preset] of Object.entries(presetsData)) {
      if (isValidPreset(preset)) {
        presets[id] = preset as Preset;
      }
    }

    if (Object.keys(presets).length === 0 || !presets[activePresetId]) {
      return createDefaultState();
    }

    // Load order or synthesize from presets keys (backward compatibility)
    let order: string[] = [];
    if (orderJson) {
      try {
        const parsedOrder = JSON.parse(orderJson);
        if (Array.isArray(parsedOrder) && parsedOrder.every((id) => typeof id === 'string')) {
          order = parsedOrder;
        }
      } catch {
        // Invalid order JSON, will be normalized below
      }
    }

    // If no order exists, synthesize from presets (backward compatibility)
    if (order.length === 0) {
      order = Object.keys(presets);
    }

    const state: ActivePresetState = {
      activePresetId,
      presets,
      order,
    };

    // Normalize invariants before returning
    return normalizeState(state);
  } catch (error) {
    console.error('Failed to load preset state:', error);
    return createDefaultState();
  }
}

/**
 * Saves the active preset state to localStorage.
 * State is normalized before saving to ensure invariants.
 */
export function saveActivePresetState(state: ActivePresetState): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    // Normalize before saving
    const normalizedState = normalizeState(state);

    localStorage.setItem(STORAGE_KEYS.ACTIVE_PRESET_ID, normalizedState.activePresetId);
    localStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(normalizedState.presets));
    localStorage.setItem(STORAGE_KEYS.PRESET_ORDER, JSON.stringify(normalizedState.order));
  } catch (error) {
    console.error('Failed to save preset state:', error);
  }
}

/**
 * Saves a single preset to localStorage.
 * If preset is new, it is appended to the end of order.
 */
export function savePreset(preset: Preset): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    const state = loadActivePresetState();
    const isNew = !state.presets[preset.id];

    state.presets[preset.id] = preset;

    // Append to order if new
    if (isNew && !state.order.includes(preset.id)) {
      state.order.push(preset.id);
    }

    saveActivePresetState(state);
  } catch (error) {
    console.error('Failed to save preset:', error);
  }
}

/**
 * Creates default state with a default preset.
 */
function createDefaultState(): ActivePresetState {
  const defaultPreset = createDefaultPreset();

  return {
    activePresetId: defaultPreset.id,
    presets: {
      [defaultPreset.id]: defaultPreset,
    },
    order: [defaultPreset.id],
  };
}

/**
 * Validates if an object is a valid preset.
 */
function isValidPreset(obj: unknown): obj is Preset {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  const p = obj as Partial<Preset>;

  if (typeof p.id !== 'string' || typeof p.name !== 'string') {
    return false;
  }

  // isDefault is optional, but if present must be exactly true
  if (p.isDefault !== undefined && p.isDefault !== true) {
    return false;
  }

  const background = p.background as Partial<Preset['background']> | undefined;
  if (!background || typeof background !== 'object') {
    return false;
  }

  // Base layer must always be a valid color background (shape-level check only)
  const base = (background as any).base as
    | {
        sourceType?: unknown;
        color?: unknown;
      }
    | undefined;

  if (!base || typeof base !== 'object') {
    return false;
  }

  if (base.sourceType !== 'color' || typeof base.color !== 'string') {
    return false;
  }

  // mediaOverlay is optional; if present validate SHAPE only
  const mediaOverlay = (background as any).mediaOverlay as unknown;
  if (mediaOverlay !== undefined && mediaOverlay !== null) {
    if (!isValidBackgroundMediaOverlayShape(mediaOverlay)) {
      return false;
    }
  }

  return true;
}

/**
 * Normalizes ActivePresetState to enforce invariants:
 * 1. Every ID in order must exist in presets
 * 2. Every ID in presets must exist in order
 * 3. Exactly one preset must have isDefault: true
 *
 * This function is pure and returns a new normalized state.
 */
function normalizeState(state: ActivePresetState): ActivePresetState {
  const presets: Record<string, Preset> = { ...state.presets };
  let order = [...state.order];

  // Remove order entries that don't exist in presets
  order = order.filter((id) => id in presets);

  // Add missing preset IDs to order (append to end)
  const presetIds = Object.keys(presets);
  for (const id of presetIds) {
    if (!order.includes(id)) {
      order.push(id);
    }
  }

  // Normalize mediaOverlay transform defaults (shape-only, non-visual)
  for (const id of presetIds) {
    const preset = presets[id];
    if (!preset || !preset.background || typeof preset.background !== 'object') {
      continue;
    }

    const background = preset.background;
    const overlay = background.mediaOverlay;

    if (overlay) {
      const normalizedTransform = normalizeMediaOverlayTransform(overlay.transform);

      presets[id] = {
        ...preset,
        background: {
          ...background,
          mediaOverlay: {
            ...overlay,
            transform: normalizedTransform,
          },
        },
      };
    }
  }

  // Normalize isDefault: ensure exactly one preset has isDefault: true
  const defaultPresets = presetIds.filter((id) => presets[id].isDefault === true);

  if (defaultPresets.length === 0) {
    // No default preset: mark the first preset (by order) as default
    if (order.length > 0) {
      const firstId = order[0];
      presets[firstId] = { ...presets[firstId], isDefault: true };
    }
  } else if (defaultPresets.length > 1) {
    // Multiple default presets: keep the first one (by order), remove from others
    const orderIndices = defaultPresets.map((id) => ({ id, index: order.indexOf(id) }));
    orderIndices.sort((a, b) => a.index - b.index);
    const keepDefaultId = orderIndices[0]?.id;

    if (keepDefaultId) {
      for (const id of defaultPresets) {
        if (id !== keepDefaultId) {
          const { isDefault, ...rest } = presets[id];
          presets[id] = rest;
        }
      }
    }
  }

  // Ensure activePresetId exists in presets and order
  let activePresetId = state.activePresetId;
  if (!presets[activePresetId]) {
    // Active preset doesn't exist: use first preset in order
    activePresetId = order.length > 0 ? order[0] : '';
  }
  if (activePresetId && !order.includes(activePresetId)) {
    // Active preset not in order: add it
    order.push(activePresetId);
  }

  return {
    activePresetId,
    presets,
    order,
  };
}
