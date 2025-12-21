// Export/Import v2 type definitions (storage layer)

import type { Preset } from '../../core/preset/preset.types';

/**
 * Media entry in PresetExportV2.
 * Contains base64-encoded blob data and metadata.
 */
export interface PresetExportV2MediaEntry {
  /** Base64-encoded blob data */
  data: string;
  /** Original filename */
  fileName: string;
  /** MIME type (e.g., "image/png", "video/mp4") */
  fileType: string;
  /** File size in bytes */
  fileSize: number;
  /** Optional: creation timestamp (milliseconds since epoch) */
  createdAt?: number;
}

/**
 * Preset export format version 2.
 *
 * This schema supports:
 * - Background color
 * - Background media (URL)
 * - Background media (Local via IndexedDB + mediaId)
 *
 * Rules:
 * - schemaVersion must be exactly 2
 * - exportedAt is ISO 8601 timestamp
 * - preset.isDefault is NEVER included (stripped during export)
 * - media field is omitted if empty (no local media referenced)
 */
export interface PresetExportV2 {
  schemaVersion: 2;
  exportedAt: string; // ISO 8601 timestamp
  app: {
    name: string;
    version: string;
  };
  preset: Preset;
  /**
   * Local media blobs (embedded as base64).
   * Key is mediaId, value contains blob data and metadata.
   * Omitted entirely if no local media is referenced.
   */
  media?: Record<string, PresetExportV2MediaEntry>;
}

/**
 * Result of preset import operation (v2).
 *
 * Structured result type with explicit error cases and success details.
 */
export type ImportPresetV2Result =
  | {
      kind: 'ok';
      preset: Preset;
      /**
       * Media restoration status.
       * Maps mediaId to restoration result.
       */
      restoredMedia: Map<string, 'restored' | 'failed' | 'skipped'>;
      /**
       * Media IDs referenced by preset but not present in export.media.
       * These will use fallback during rendering until user re-uploads.
       */
      missingMediaIds: string[];
    }
  | { kind: 'invalidFormat'; message: string }
  | { kind: 'unsupportedSchema'; schemaVersion: number };



