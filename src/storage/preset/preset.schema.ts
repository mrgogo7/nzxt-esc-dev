// Preset export/import schema definitions
// This file defines the stable export format contract.

import type { Preset } from '../../core/preset/preset.types';

/**
 * Current preset export schema version.
 * This version must be incremented if breaking changes are introduced.
 * Future versions MUST remain backward compatible with v1.
 */
export const CURRENT_PRESET_EXPORT_SCHEMA_VERSION = 1;

/**
 * Preset export format version 1.
 *
 * This schema is locked and must remain stable for forward compatibility.
 * Future schema versions must NOT break v1 importers.
 *
 * Rules:
 * - schemaVersion is mandatory
 * - exportedAt is ISO 8601 timestamp
 * - app metadata comes from APP_META and APP_VERSION
 * - preset.isDefault is NEVER included in export (stripped)
 */
export interface PresetExportV1 {
  schemaVersion: 1;
  exportedAt: string; // ISO 8601 timestamp
  app: {
    name: string;
    version: string;
  };
  preset: Preset;
}

/**
 * Type guard to validate PresetExportV1 structure.
 * This function validates the schema shape but remains tolerant
 * to extra fields for future compatibility.
 */
export function isPresetExportV1(value: unknown): value is PresetExportV1 {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  // schemaVersion must be exactly 1
  if (obj.schemaVersion !== 1) {
    return false;
  }

  // exportedAt must be a string (ISO 8601)
  if (typeof obj.exportedAt !== 'string') {
    return false;
  }

  // app must be an object with name and version
  if (!obj.app || typeof obj.app !== 'object') {
    return false;
  }

  const app = obj.app as Record<string, unknown>;
  if (typeof app.name !== 'string' || typeof app.version !== 'string') {
    return false;
  }

  // preset must be an object (full validation happens in import layer)
  if (!obj.preset || typeof obj.preset !== 'object') {
    return false;
  }

  return true;
}
