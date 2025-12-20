// Background media overlay domain types

/**
 * Transform for media overlays.
 *
 * Coordinates are numeric and interpreted in a viewport-relative way
 * by the render layer (no browser APIs here).
 *
 * - x, y: position offsets
 * - scale: uniform scale factor (aspect-ratio locked)
 */
export interface MediaOverlayTransform {
  x: number;
  y: number;
  scale: number;
}

/**
 * Local media configuration for background overlays.
 *
 * This describes a single locally-provided media asset.
 */
export interface LocalMediaConfig {
  type: 'local';
  /**
   * Original filename as provided by the user.
   */
  fileName: string;
  /**
   * MIME type of the file (e.g. "image/png", "video/mp4").
   */
  fileType: string;
  /**
   * File size in bytes.
   */
  fileSize: number;
  /**
   * Opaque identifier for the stored media.
   *
   * FAZ-3A: this is treated as an opaque string and may
   * represent a blob URL or future IndexedDB key.
   */
  mediaId: string;
}

/**
 * URL-based media configuration for background overlays.
 */
export interface UrlMediaConfig {
  type: 'url';
  /**
   * Direct media URL (image / video).
   */
  url: string;
}

interface BaseBackgroundMediaOverlayConfig {
  kind: 'media-overlay';
  transform: MediaOverlayTransform;
}

export interface LocalBackgroundMediaOverlayConfig
  extends BaseBackgroundMediaOverlayConfig {
  source: 'local';
  media: LocalMediaConfig;
}

export interface UrlBackgroundMediaOverlayConfig
  extends BaseBackgroundMediaOverlayConfig {
  source: 'url';
  media: UrlMediaConfig;
}

/**
 * Unified background media overlay configuration.
 */
export type BackgroundMediaOverlayConfig =
  | LocalBackgroundMediaOverlayConfig
  | UrlBackgroundMediaOverlayConfig;

/**
 * Render-ready media overlay model consumed by the render layer.
 *
 * This is intentionally simple and browser-agnostic.
 */
export interface MediaOverlayRenderModel {
  kind: 'media';
  /**
   * Primitive type used by render layer.
   */
  primitive: 'image' | 'video';
  /**
   * Original source category.
   */
  source: 'local' | 'url';
  /**
   * Resolved source string (URL, blob URL, etc.).
   */
  src: string;
  /**
   * Transform applied on top of the base background.
   */
  transform: MediaOverlayTransform;
}
