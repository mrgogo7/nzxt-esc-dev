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
    return primitive !== null;
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

      const overlay: LocalBackgroundMediaOverlayConfig = {
        kind,
        source: 'local',
        media: {
          type: 'local',
          fileName: media.fileName,
          fileType: media.fileType,
          fileSize: media.fileSize,
          mediaId: media.mediaId,
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

      const overlay: UrlBackgroundMediaOverlayConfig = {
        kind,
        source: 'url',
        media: {
          type: 'url',
          url: media.url,
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
    };
  },
};
