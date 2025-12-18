// Preset import logic (storage layer, no UI)
// Pure functions for parsing and validating imported preset data.

import { generatePresetId } from '../../core/preset/preset.defaults';
import type { Preset } from '../../core/preset/preset.types';
import { CURRENT_PRESET_EXPORT_SCHEMA_VERSION } from './preset.schema';
import { isPresetExportV1, type PresetExportV1 } from './preset.schema';

/**
 * Result of preset import operation.
 */
export type PresetImportResult =
  | { kind: 'ok'; preset: Preset }
  | { kind: 'unsupportedSchema'; schemaVersion: number }
  | { kind: 'invalidFormat' };

/**
 * Parses JSON string into PresetExportV1.
 * Returns null if parsing or validation fails.
 */
export function parsePresetExportJson(json: string): PresetExportV1 | null {
  try {
    const parsed = JSON.parse(json);
    if (isPresetExportV1(parsed)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Imports a preset from JSON string.
 *
 * Rules:
 * - Generates a new ID for the imported preset
 * - Strips isDefault flag (import rule: isDefault is never set by import)
 * - Preserves name and background fields
 * - Ignores unknown fields on preset for forward compatibility
 */
export function importPresetFromJson(json: string): PresetImportResult {
  const exportData = parsePresetExportJson(json);

  if (!exportData) {
    return { kind: 'invalidFormat' };
  }

  // Validate schema version
  if (exportData.schemaVersion !== CURRENT_PRESET_EXPORT_SCHEMA_VERSION) {
    return {
      kind: 'unsupportedSchema',
      schemaVersion: exportData.schemaVersion,
    };
  }

  // Extract preset and generate new ID
  const importedPreset = exportData.preset;

  // Strip isDefault if present (import rule: isDefault is never set by import)
  const { isDefault, ...presetWithoutDefault } = importedPreset;

  // Build new preset with generated ID
  const preset: Preset = {
    ...presetWithoutDefault,
    id: generatePresetId(),
    // isDefault is explicitly NOT set (import rule)
  };

  return { kind: 'ok', preset };
}
