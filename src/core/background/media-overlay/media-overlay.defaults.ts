// Default values and helpers for background media overlays

import type { MediaOverlayTransform, BackgroundMediaOverlayConfig } from './media-overlay.types';

/**
 * Default transform for new media overlays.
 *
 * - scale: 1 (no scaling)
 * - autoScale: 1 (no autoscale computed yet)
 * - offsetX: 0 (centered)
 * - offsetY: 0 (centered)
 * - rotateDeg: 0 (no rotation)
 */
export const DEFAULT_MEDIA_OVERLAY_TRANSFORM: MediaOverlayTransform = {
  scale: 1,
  autoScale: 1,
  offsetX: 0,
  offsetY: 0,
  rotateDeg: 0,
};

/**
 * Normalizes a potentially partial transform into a full transform,
 * filling missing fields with defaults.
 *
 * Normalization rules:
 * - Fill missing fields with defaults
 * - Replace NaN / Infinity with defaults
 * - Clamp:
 *   - offsetX / offsetY → [-2, 2]
 *   - rotateDeg → [-180, 180]
 *   - scale / autoScale → > 0 (clamp to minimum 0.01)
 */
export function normalizeMediaOverlayTransform(
  transform: Partial<MediaOverlayTransform> | undefined
): MediaOverlayTransform {
  if (!transform || typeof transform !== 'object') {
    return { ...DEFAULT_MEDIA_OVERLAY_TRANSFORM };
  }

  const MIN_SCALE = 0.01;

  const scale =
    typeof transform.scale === 'number' && Number.isFinite(transform.scale) && transform.scale > 0
      ? Math.max(MIN_SCALE, transform.scale)
      : DEFAULT_MEDIA_OVERLAY_TRANSFORM.scale;

  const autoScale =
    typeof transform.autoScale === 'number' &&
    Number.isFinite(transform.autoScale) &&
    transform.autoScale > 0
      ? Math.max(MIN_SCALE, transform.autoScale)
      : DEFAULT_MEDIA_OVERLAY_TRANSFORM.autoScale;

  const offsetX =
    typeof transform.offsetX === 'number' && Number.isFinite(transform.offsetX)
      ? Math.max(-2, Math.min(2, transform.offsetX))
      : DEFAULT_MEDIA_OVERLAY_TRANSFORM.offsetX;

  const offsetY =
    typeof transform.offsetY === 'number' && Number.isFinite(transform.offsetY)
      ? Math.max(-2, Math.min(2, transform.offsetY))
      : DEFAULT_MEDIA_OVERLAY_TRANSFORM.offsetY;

  const rotateDeg =
    typeof transform.rotateDeg === 'number' && Number.isFinite(transform.rotateDeg)
      ? Math.max(-180, Math.min(180, transform.rotateDeg))
      : DEFAULT_MEDIA_OVERLAY_TRANSFORM.rotateDeg;

  return { scale, autoScale, offsetX, offsetY, rotateDeg };
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
