// Default values and helpers for background media overlays

import type { MediaOverlayTransform, BackgroundMediaOverlayConfig } from './media-overlay.types';

/**
 * Default transform for new media overlays.
 *
 * - x, y: no offset
 * - scale: 1 (no scaling)
 */
export const DEFAULT_MEDIA_OVERLAY_TRANSFORM: MediaOverlayTransform = {
  x: 0,
  y: 0,
  scale: 1,
};

/**
 * Normalizes a potentially partial transform into a full transform,
 * filling missing fields with defaults.
 */
export function normalizeMediaOverlayTransform(
  transform: Partial<MediaOverlayTransform> | undefined
): MediaOverlayTransform {
  if (!transform || typeof transform !== 'object') {
    return { ...DEFAULT_MEDIA_OVERLAY_TRANSFORM };
  }

  const x = typeof transform.x === 'number' ? transform.x : DEFAULT_MEDIA_OVERLAY_TRANSFORM.x;
  const y = typeof transform.y === 'number' ? transform.y : DEFAULT_MEDIA_OVERLAY_TRANSFORM.y;
  const scale =
    typeof transform.scale === 'number' && Number.isFinite(transform.scale)
      ? transform.scale
      : DEFAULT_MEDIA_OVERLAY_TRANSFORM.scale;

  return { x, y, scale };
}

/**
 * Ensures a BackgroundMediaOverlayConfig has a fully-populated transform.
 * Returns a new object without mutating the input.
 */
export function withDefaultTransform(
  overlay: Omit<BackgroundMediaOverlayConfig, 'transform'> &
    Partial<Pick<BackgroundMediaOverlayConfig, 'transform'>>
): BackgroundMediaOverlayConfig {
  const transform = normalizeMediaOverlayTransform(overlay.transform);

  return {
    ...(overlay as BackgroundMediaOverlayConfig),
    transform,
  };
}
