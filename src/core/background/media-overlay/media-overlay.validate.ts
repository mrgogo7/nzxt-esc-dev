// Validation helpers for background media overlay configurations

import type {
  BackgroundMediaOverlayConfig,
  LocalBackgroundMediaOverlayConfig,
  UrlBackgroundMediaOverlayConfig,
  LocalMediaConfig,
  UrlMediaConfig,
  MediaOverlayTransform,
} from './media-overlay.types';

/**
 * Validates media overlay transform shape (numbers only).
 *
 * This is a SHAPE check used by storage layer; it does not
 * enforce semantic ranges.
 */
export function isValidMediaOverlayTransformShape(
  transform: unknown
): transform is MediaOverlayTransform {
  if (!transform || typeof transform !== 'object') {
    return false;
  }

  const t = transform as Partial<MediaOverlayTransform>;

  if (t.x !== undefined && typeof t.x !== 'number') {
    return false;
  }

  if (t.y !== undefined && typeof t.y !== 'number') {
    return false;
  }

  if (t.scale !== undefined && typeof t.scale !== 'number') {
    return false;
  }

  return true;
}

function isValidLocalMediaConfigShape(media: unknown): media is LocalMediaConfig {
  if (!media || typeof media !== 'object') {
    return false;
  }

  const m = media as Partial<LocalMediaConfig>;

  if (m.type !== 'local') {
    return false;
  }

  if (typeof m.fileName !== 'string' || m.fileName.length === 0) {
    return false;
  }

  if (typeof m.fileType !== 'string' || m.fileType.length === 0) {
    return false;
  }

  if (typeof m.fileSize !== 'number' || !Number.isFinite(m.fileSize) || m.fileSize < 0) {
    return false;
  }

  if (typeof m.mediaId !== 'string' || m.mediaId.length === 0) {
    return false;
  }

  return true;
}

function isValidUrlMediaConfigShape(media: unknown): media is UrlMediaConfig {
  if (!media || typeof media !== 'object') {
    return false;
  }

  const m = media as Partial<UrlMediaConfig>;

  if (m.type !== 'url') {
    return false;
  }

  if (typeof m.url !== 'string' || m.url.length === 0) {
    return false;
  }

  return true;
}

function isValidLocalOverlayShape(
  config: unknown
): config is LocalBackgroundMediaOverlayConfig {
  if (!config || typeof config !== 'object') {
    return false;
  }

  const c = config as Partial<LocalBackgroundMediaOverlayConfig>;

  if (c.kind !== 'media-overlay') {
    return false;
  }

  if (c.source !== 'local') {
    return false;
  }

  if (!isValidLocalMediaConfigShape((c as any).media)) {
    return false;
  }

  if (c.transform !== undefined && !isValidMediaOverlayTransformShape(c.transform)) {
    return false;
  }

  return true;
}

function isValidUrlOverlayShape(config: unknown): config is UrlBackgroundMediaOverlayConfig {
  if (!config || typeof config !== 'object') {
    return false;
  }

  const c = config as Partial<UrlBackgroundMediaOverlayConfig>;

  if (c.kind !== 'media-overlay') {
    return false;
  }

  if (c.source !== 'url') {
    return false;
  }

  if (!isValidUrlMediaConfigShape((c as any).media)) {
    return false;
  }

  if (c.transform !== undefined && !isValidMediaOverlayTransformShape(c.transform)) {
    return false;
  }

  return true;
}

/**
 * Validates background media overlay SHAPE.
 *
 * Storage layer uses this to ensure the structure is well-formed.
 * Transform may be missing; when present it must be numeric.
 */
export function isValidBackgroundMediaOverlayShape(
  config: unknown
): config is BackgroundMediaOverlayConfig {
  return isValidLocalOverlayShape(config) || isValidUrlOverlayShape(config);
}
