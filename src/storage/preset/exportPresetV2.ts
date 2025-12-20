// Preset export logic v2 (storage layer, no UI)
// Supports local media blobs embedded as base64.

import { APP_META } from '../../app/meta';
import { APP_VERSION } from '../../app/version';
import type { Preset } from '../../core/preset/preset.types';
import type { LocalBackgroundMediaOverlayConfig } from '../../core/background/media-overlay/media-overlay.types';
import { loadActivePresetState, loadLocalMediaBlob } from '../local';
import { getLocalMedia } from '../indexeddb';
import type { PresetExportV2, PresetExportV2MediaEntry } from './exportImportV2.types';
import { blobToBase64 } from './base64';

/**
 * Error thrown when preset is not found during export.
 */
export class PresetNotFoundError extends Error {
  constructor(presetId: string) {
    super(`Preset with ID "${presetId}" not found`);
    this.name = 'PresetNotFoundError';
  }
}

/**
 * Collects all local mediaIds referenced by a preset.
 *
 * Currently checks:
 * - background.mediaOverlay (if source === 'local')
 *
 * Returns a Set of unique mediaIds.
 */
export function collectLocalMediaIdsFromPreset(preset: Preset): Set<string> {
  const mediaIds = new Set<string>();

  const overlay = preset.background?.mediaOverlay;
  if (overlay && overlay.source === 'local') {
    const localOverlay = overlay as LocalBackgroundMediaOverlayConfig;
    if (localOverlay.media?.mediaId) {
      mediaIds.add(localOverlay.media.mediaId);
    }
  }

  return mediaIds;
}

/**
 * Exports a preset as PresetExportV2 with embedded local media blobs.
 *
 * @param presetId - ID of preset to export
 * @returns PresetExportV2 object with preset and embedded media
 * @throws PresetNotFoundError if preset is not found
 */
export async function exportPresetV2(presetId: string): Promise<PresetExportV2> {
  const state = loadActivePresetState();
  const preset = state.presets[presetId];

  if (!preset) {
    throw new PresetNotFoundError(presetId);
  }

  // Deep clone preset for export (do not mutate stored preset)
  // Remove isDefault (never exported)
  const { isDefault, ...presetWithoutDefault } = preset;
  const exportPreset: Preset = {
    ...presetWithoutDefault,
    background: {
      ...presetWithoutDefault.background,
      base: { ...presetWithoutDefault.background.base },
      mediaOverlay: presetWithoutDefault.background.mediaOverlay
        ? { ...presetWithoutDefault.background.mediaOverlay }
        : undefined,
    },
  };

  // Collect referenced local mediaIds
  const mediaIds = collectLocalMediaIdsFromPreset(exportPreset);

  // Build media section (if any mediaIds exist)
  const media: Record<string, PresetExportV2MediaEntry> | undefined =
    mediaIds.size > 0 ? {} : undefined;

  if (media) {
    // For each mediaId, load blob and encode to base64
    for (const mediaId of mediaIds) {
      try {
        const blob = await loadLocalMediaBlob(mediaId);
        if (!blob) {
          // Blob not found: skip this mediaId (permissive philosophy)
          continue;
        }

        // Try to get metadata from IndexedDB record
        let fileName = 'unknown';
        let fileType = 'application/octet-stream';
        let fileSize = blob.size;
        let createdAt: number | undefined;

        try {
          const record = await getLocalMedia(mediaId);
          if (record) {
            fileName = record.fileName;
            fileType = record.fileType;
            fileSize = record.fileSize;
            createdAt = record.createdAt;
          } else {
            // Fallback: if overlay has metadata, use it
            const overlay = exportPreset.background?.mediaOverlay;
            if (overlay && overlay.source === 'local') {
              const localOverlay = overlay as LocalBackgroundMediaOverlayConfig;
              if (localOverlay.media?.mediaId === mediaId) {
                fileName = localOverlay.media.fileName || fileName;
                fileType = localOverlay.media.fileType || fileType;
                fileSize = localOverlay.media.fileSize || fileSize;
              }
            }
          }
        } catch (error) {
          // Metadata fetch failed: use blob size and defaults
          console.warn(`Failed to load metadata for mediaId ${mediaId}:`, error);
        }

        // Encode blob to base64
        const base64 = await blobToBase64(blob);

        media[mediaId] = {
          data: base64,
          fileName,
          fileType,
          fileSize,
          ...(createdAt !== undefined && { createdAt }),
        };
      } catch (error) {
        // Encoding or loading failed: skip this mediaId (permissive)
        console.warn(`Failed to export mediaId ${mediaId}:`, error);
        continue;
      }
    }

    // If no media entries were successfully added, omit media field
    if (Object.keys(media).length === 0) {
      return {
        schemaVersion: 2,
        exportedAt: new Date().toISOString(),
        app: {
          name: APP_META.appName,
          version: APP_VERSION.toString(),
        },
        preset: exportPreset,
        // media field omitted
      };
    }
  }

  return {
    schemaVersion: 2,
    exportedAt: new Date().toISOString(),
    app: {
      name: APP_META.appName,
      version: APP_VERSION.toString(),
    },
    preset: exportPreset,
    ...(media && Object.keys(media).length > 0 && { media }),
  };
}

