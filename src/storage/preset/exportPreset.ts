// Preset export logic (storage layer, no UI)
// Pure functions for building and serializing preset exports.

import { APP_META } from '../../app/meta';
import { APP_VERSION } from '../../app/version';
import type { Preset } from '../../core/preset/preset.types';
import type { PresetExportV1 } from './preset.schema';

/**
 * Builds a PresetExportV1 object from a Preset.
 * Strips isDefault flag as per export rules.
 */
export function buildPresetExport(preset: Preset): PresetExportV1 {
  // Strip isDefault from preset (export rule: isDefault is never persisted)
  const { isDefault, ...presetWithoutDefault } = preset;

  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    app: {
      name: APP_META.appName,
      version: APP_VERSION.toString(),
    },
    preset: presetWithoutDefault,
  };
}

/**
 * Serializes a PresetExportV1 to JSON string.
 */
export function serializePresetExport(exportData: PresetExportV1): string {
  return JSON.stringify(exportData, null, 2);
}

/**
 * Creates export metadata for UI layer to trigger download.
 * This function does NOT perform any browser operations (no DOM, no window).
 * UI layer is responsible for creating Blob and triggering download.
 */
export function createPresetExportMetadata(preset: Preset): {
  filename: string;
  mimeType: string;
  content: string;
} {
  const exportData = buildPresetExport(preset);
  const content = serializePresetExport(exportData);

  // Sanitize preset name for filename (remove invalid chars, keep safe)
  const safeName = preset.name
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .trim() || 'preset';

  return {
    filename: `${safeName}.nzxtesc-preset`,
    mimeType: 'application/json',
    content,
  };
}
