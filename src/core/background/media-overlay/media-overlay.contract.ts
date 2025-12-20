// Background media overlay contract implementation

import type {
  BackgroundMediaOverlayConfig,
  MediaOverlayRenderModel,
  LocalBackgroundMediaOverlayConfig,
  UrlBackgroundMediaOverlayConfig,
  LocalMediaConfig,
  UrlMediaConfig,
} from './media-overlay.types';
import { withDefaultTransform } from './media-overlay.defaults';
import { isValidBackgroundMediaOverlayShape } from './media-overlay.validate';

export interface MediaOverlayContract {
  /**
   * Validates a background media overlay configuration.
   *
   * This is a full validation used by the render pipeline.
   */
  validate(config: unknown): config is BackgroundMediaOverlayConfig;

  /**
   * Normalizes a potentially partial overlay configuration into a full config.
   *
   * This function is pure and side-effect free.
   */
  normalize(config: Partial<BackgroundMediaOverlayConfig>): BackgroundMediaOverlayConfig;

  /**
   * Resolves a validated overlay configuration into a render-ready model.
   *
   * Any failure to resolve should be handled by callers (e.g. ignored overlay).
   */
  toRenderModel(config: BackgroundMediaOverlayConfig): MediaOverlayRenderModel;
}

/**
 * Determines primitive type (image/video) for a given media description.
 * Returns null if the type cannot be determined.
 */
function resolvePrimitive(media: LocalMediaConfig | UrlMediaConfig):
  | 'image'
  | 'video'
  | null {
  if (media.type === 'local') {
    const mime = media.fileType.toLowerCase();
    if (mime.startsWith('image/')) {
      return 'image';
    }
    if (mime === 'video/mp4' || mime.startsWith('video/')) {
      return 'video';
    }
    return null;
  }

  if (media.type === 'url') {
    const url = media.url.toLowerCase();
    if (url.endsWith('.mp4')) {
      return 'video';
    }

    if (
      url.endsWith('.jpg') ||
      url.endsWith('.jpeg') ||
      url.endsWith('.png') ||
      url.endsWith('.gif') ||
      url.endsWith('.webp') ||
      url.endsWith('.bmp') ||
      url.endsWith('.apng')
    ) {
      return 'image';
    }

    return null;
  }

  return null;
}

/**
 * Background media overlay contract implementation for FAZ-3A.
 */
export const mediaOverlayContract: MediaOverlayContract = {
  validate(config: unknown): config is BackgroundMediaOverlayConfig {
    if (!isValidBackgroundMediaOverlayShape(config)) {
      return false;
    }

    const overlay = config as BackgroundMediaOverlayConfig;
    const primitive = resolvePrimitive(overlay.media);
    if (primitive === null) {
      return false;
    }

    // FAZ-4: Validate transform values are finite and scale/autoScale > 0
    const transform = overlay.transform;
    if (transform) {
      if (
        !Number.isFinite(transform.scale) ||
        !Number.isFinite(transform.autoScale) ||
        !Number.isFinite(transform.offsetX) ||
        !Number.isFinite(transform.offsetY) ||
        !Number.isFinite(transform.rotateDeg)
      ) {
        return false;
      }

      if (transform.scale <= 0 || transform.autoScale <= 0) {
        return false;
      }
    }

    return true;
  },

  normalize(config: Partial<BackgroundMediaOverlayConfig>): BackgroundMediaOverlayConfig {
    // Ensure kind is always set
    const kind: 'media-overlay' = 'media-overlay';

    if (!config || typeof config !== 'object') {
      throw new Error('Invalid media overlay config: expected object');
    }

    const c = config as Partial<BackgroundMediaOverlayConfig>;

    if (c.source === 'local') {
      const media = c.media as LocalMediaConfig | undefined;
      if (!media) {
        throw new Error('Invalid media overlay config: missing local media');
      }

      // FAZ-4.1: Normalize intrinsic if present
      let intrinsic: { width: number; height: number } | undefined;
      if (media.intrinsic) {
        const i = media.intrinsic;
        if (
          typeof i.width === 'number' &&
          Number.isFinite(i.width) &&
          i.width > 0 &&
          typeof i.height === 'number' &&
          Number.isFinite(i.height) &&
          i.height > 0
        ) {
          intrinsic = { width: i.width, height: i.height };
        }
      }

      const overlay: LocalBackgroundMediaOverlayConfig = {
        kind,
        source: 'local',
        media: {
          type: 'local',
          fileName: media.fileName,
          fileType: media.fileType,
          fileSize: media.fileSize,
          mediaId: media.mediaId,
          ...(intrinsic && { intrinsic }),
        },
        transform: (c as any).transform,
      };

      return withDefaultTransform(overlay);
    }

    if (c.source === 'url') {
      const media = c.media as UrlMediaConfig | undefined;
      if (!media) {
        throw new Error('Invalid media overlay config: missing URL media');
      }

      // FAZ-4.1: Normalize intrinsic if present
      let intrinsic: { width: number; height: number } | undefined;
      if (media.intrinsic) {
        const i = media.intrinsic;
        if (
          typeof i.width === 'number' &&
          Number.isFinite(i.width) &&
          i.width > 0 &&
          typeof i.height === 'number' &&
          Number.isFinite(i.height) &&
          i.height > 0
        ) {
          intrinsic = { width: i.width, height: i.height };
        }
      }

      const overlay: UrlBackgroundMediaOverlayConfig = {
        kind,
        source: 'url',
        media: {
          type: 'url',
          url: media.url,
          ...(intrinsic && { intrinsic }),
        },
        transform: (c as any).transform,
      };

      return withDefaultTransform(overlay);
    }

    throw new Error('Invalid media overlay config: unsupported source');
  },

  toRenderModel(config: BackgroundMediaOverlayConfig): MediaOverlayRenderModel {
    const primitive = resolvePrimitive(config.media);
    if (!primitive) {
      throw new Error('Unsupported media type');
    }

    let src: string;

    if (config.source === 'local') {
      src = config.media.mediaId;
    } else {
      src = config.media.url;
    }

    return {
      kind: 'media',
      primitive,
      source: config.source,
      src,
      transform: config.transform,
      intrinsic: config.media.intrinsic,
    };
  },
};
