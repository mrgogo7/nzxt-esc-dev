// Type definitions for preset configuration

/**
 * FAZ-0 minimal preset structure.
 * Only includes background color source.
 */
export interface Preset {
  id: string;
  name: string;
  /**
   * Marks this preset as the default preset.
   *
   * Invariants:
   * - At most one preset in the system may have `isDefault: true`.
   * - Default preset cannot be deleted but can be renamed.
   *
   * Export/import rules:
   * - MUST NOT be persisted in export files
   * - MUST NOT be set by import flows.
   */
  isDefault?: true;
  /**
   * Marks this preset as a favorite preset.
   *
   * Favorite presets can be quickly accessed via the dropdown
   * in the Configuration Browser header.
   *
   * Export/import rules:
   * - IS persisted in export files
   * - IS set by import flows
   */
  isFavorite?: true;
  background: {
    sourceType: 'color';
    color: string; // rgba(...) for solid colors, or linear-gradient(...)/radial-gradient(...) for gradients
  };
}

/**
 * Active preset state.
 *
 * `presets` is a dictionary of presetId → Preset.
 * `order` is the explicit ordering of presetIds and is the
 * single source of truth for list ordering and future rotation.
 */
export interface ActivePresetState {
  activePresetId: string;
  presets: Record<string, Preset>;
  order: string[];
}
