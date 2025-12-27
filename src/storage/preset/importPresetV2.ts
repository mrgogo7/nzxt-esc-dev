// Preset import logic v2 (storage layer, no UI)
// Supports importing presets with embedded local media blobs.

import { generatePresetId } from '../../core/preset/preset.defaults';
import type { Preset } from '../../core/preset/preset.types';
import { putLocalMedia } from '../indexeddb';
import type { LocalMediaRecord } from '../indexeddb';
import type { PresetExportV2, ImportPresetV2Result } from './exportImportV2.types';
import { collectLocalMediaIdsFromPreset } from './exportPresetV2';
import { base64ToBlob } from './base64';

/**
 * Type guard to validate PresetExportV2 structure.
 */
function isPresetExportV2(value: unknown): value is PresetExportV2 {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  // schemaVersion must be exactly 2
  if (obj.schemaVersion !== 2) {
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

  // media is optional, but if present must be an object
  if (obj.media !== undefined && (typeof obj.media !== 'object' || obj.media === null)) {
    return false;
  }

  return true;
}

/**
 * Parses JSON string into PresetExportV2.
 * Returns null if parsing or validation fails.
 */
function parsePresetExportV2Json(json: string): PresetExportV2 | null {
  try {
    const parsed = JSON.parse(json);
    if (isPresetExportV2(parsed)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Imports a preset from JSON string (v2 format).
 *
 * Implementation steps:
 * A) Parse & validate schema
 * B) Normalize preset (strip isDefault, generate new ID)
 * C) Restore media blobs to IndexedDB (if export.media exists)
 * D) Find missing mediaIds (referenced but not in export)
 * E) Return result with preset + media status
 *
 * IMPORTANT:
 * - Does NOT call LocalMediaResolver (runtime resolution happens later)
 * - Does NOT create objectURLs
 * - Does NOT write to ActivePresetState (UI layer handles this)
 */
export async function importPresetV2(jsonText: string): Promise<ImportPresetV2Result> {
  // A) Parse & validate
  const exportData = parsePresetExportV2Json(jsonText);
  if (!exportData) {
    return { kind: 'invalidFormat', message: 'Invalid JSON or schema structure' };
  }

  // Validate schema version
  if (exportData.schemaVersion !== 2) {
    return {
      kind: 'unsupportedSchema',
      schemaVersion: exportData.schemaVersion,
    };
  }

  // B) Normalize preset
  const importedPreset = exportData.preset;

  // Strip isDefault if present (import rule: isDefault is never set by import)
  const { isDefault, ...presetWithoutDefault } = importedPreset;

  // Generate new preset ID (avoid collisions)
  const preset: Preset = {
    ...presetWithoutDefault,
    id: generatePresetId(),
    // isDefault is explicitly NOT set (import rule)
  };

  // C) Restore media (if export.media exists)
  const restoredMedia = new Map<string, 'restored' | 'failed' | 'skipped'>();
  const restoredMediaIds = new Set<string>();

  if (exportData.media) {
    for (const [mediaId, mediaEntry] of Object.entries(exportData.media)) {
      try {
        // Decode base64 -> Blob
        const blob = base64ToBlob(mediaEntry.data, mediaEntry.fileType);

        // Optional: validate fileSize matches (if mismatch => mark 'failed' and skip)
        if (blob.size !== mediaEntry.fileSize) {
          console.warn(
            `File size mismatch for mediaId ${mediaId}: expected ${mediaEntry.fileSize}, got ${blob.size}`
          );
          restoredMedia.set(mediaId, 'failed');
          continue;
        }

        // Check if already exists in IndexedDB (REPLACE strategy: overwrite)
        // Note: We always overwrite (export is authoritative)
        try {
          const record: LocalMediaRecord = {
            mediaId,
            blob,
            fileName: mediaEntry.fileName,
            fileType: mediaEntry.fileType,
            fileSize: mediaEntry.fileSize,
            createdAt: mediaEntry.createdAt ?? Date.now(),
          };

          await putLocalMedia(record);
          restoredMedia.set(mediaId, 'restored');
          restoredMediaIds.add(mediaId);
        } catch (error) {
          console.error(`Failed to store mediaId ${mediaId} in IndexedDB:`, error);
          restoredMedia.set(mediaId, 'failed');
        }
      } catch (error) {
        // Decode failed
        console.error(`Failed to decode base64 for mediaId ${mediaId}:`, error);
        restoredMedia.set(mediaId, 'failed');
      }
    }
  }

  // D) Find missing mediaIds (referenced by preset but not in export.media)
  const referencedMediaIds = collectLocalMediaIdsFromPreset(preset);
  const missingMediaIds: string[] = [];

  for (const mediaId of referencedMediaIds) {
    if (!restoredMediaIds.has(mediaId) && !exportData.media?.[mediaId]) {
      // Referenced but not restored and not in export
      missingMediaIds.push(mediaId);
      // Note: preset still has the mediaId reference (permissive)
      // It will use fallback during rendering
    }
  }

  // E) Return result
  return {
    kind: 'ok',
    preset,
    restoredMedia,
    missingMediaIds,
  };
}






