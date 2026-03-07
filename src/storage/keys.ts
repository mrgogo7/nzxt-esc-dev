// Storage key constants and management

/**
 * Storage keys for NZXT-ESC-DEV.
 * All keys use dev namespace prefix.
 */
export const STORAGE_KEYS = {
  ACTIVE_PRESET_ID: 'nzxt-esc-dev:activePresetId',
  PRESETS: 'nzxt-esc-dev:presets',
  PRESET_ORDER: 'nzxt-esc-dev:presetOrder',
  LANGUAGE: 'nzxt-esc-dev:language',
} as const;
