// Default preset values and configurations

import type { Preset } from './preset.types';

/**
 * Creates a default preset with black background.
 */
export function createDefaultPreset(): Preset {
  return {
    id: generatePresetId(),
    name: 'Default',
    isDefault: true,
    background: {
      base: {
        sourceType: 'color',
        color: '#000000',
      },
      // No mediaOverlay by default in FAZ-3A
    },
  };
}

/**
 * Generates a unique preset ID.
 */
export function generatePresetId(): string {
  return `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
