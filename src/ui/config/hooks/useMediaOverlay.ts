import { useCallback, useRef, useEffect } from 'react';
import type { Preset } from '../../../core/preset/preset.types';
import { getViewportDimensions } from '../../../render/viewport';
import { normalizeMediaOverlayTransform } from '../../../core/background/media-overlay/media-overlay.defaults';
import { localMediaResolver } from '../../../storage/localMediaResolver';

export function useMediaOverlay(preset: Preset | null, setPreset: (preset: Preset) => void) {
  const autoscaleComputedRef = useRef<Set<string>>(new Set());

  const handleIntrinsicSizeAvailable = useCallback(
    async (width: number, height: number) => {
      if (!preset || !preset.background.mediaOverlay) return;

      const overlay = preset.background.mediaOverlay;
      const mediaId = overlay.source === 'local' ? overlay.media.mediaId :
                      overlay.source === 'youtube' ? overlay.media.videoId : overlay.media.url;
      const mediaKey = `${overlay.source}:${mediaId}`;

      if (autoscaleComputedRef.current.has(mediaKey)) {
        if (!overlay.media.intrinsic || overlay.media.intrinsic.width !== width || overlay.media.intrinsic.height !== height) {
           setPreset({
            ...preset,
            background: {
              ...preset.background,
              mediaOverlay: {
                ...overlay,
                media: { ...overlay.media, intrinsic: { width, height } } as any,
              },
            },
          });
        }
        return;
      }

      const viewport = getViewportDimensions();
      const viewportShortEdge = Math.min(viewport.width, viewport.height);
      const mediaShortEdge = Math.min(width, height);
      const autoScaleShortEdge = viewportShortEdge / mediaShortEdge;

      setPreset({
        ...preset,
        background: {
          ...preset.background,
          mediaOverlay: {
            ...overlay,
            media: { ...overlay.media, intrinsic: { width, height } } as any,
            transform: {
              ...overlay.transform,
              autoScale: autoScaleShortEdge,
              scale: 1,
            },
          },
        },
      });

      autoscaleComputedRef.current.add(mediaKey);
    },
    [preset, setPreset]
  );

  const applyTransformDelta = useCallback(
    (deltaX: number, deltaY: number, deltaScale?: number) => {
      if (!preset || !preset.background.mediaOverlay) return;

      const viewport = getViewportDimensions();
      const currentTransform = preset.background.mediaOverlay.transform;
      const offsetDeltaX = deltaX / (viewport.width / 2);
      const offsetDeltaY = deltaY / (viewport.height / 2);

      let newTransform = { ...currentTransform };
      if (deltaScale !== undefined) {
        newTransform.scale = Math.max(0.01, currentTransform.scale * (1 + deltaScale));
      } else {
        newTransform.offsetX = currentTransform.offsetX + offsetDeltaX;
        newTransform.offsetY = currentTransform.offsetY + offsetDeltaY;
      }

      newTransform = normalizeMediaOverlayTransform(newTransform);

      setPreset({
        ...preset,
        background: {
          ...preset.background,
          mediaOverlay: {
            ...preset.background.mediaOverlay,
            transform: newTransform,
          },
        },
      });
    },
    [preset, setPreset]
  );

  const handleRemoveMediaOverlay = useCallback(() => {
    if (!preset || !preset.background.mediaOverlay) return;

    if (preset.background.mediaOverlay.source === 'local') {
      const mediaId = preset.background.mediaOverlay.media.mediaId;
      if (mediaId) localMediaResolver.revokeMediaId(mediaId);
    }

    setPreset({
      ...preset,
      background: {
        ...preset.background,
        mediaOverlay: undefined,
      },
    });
  }, [preset, setPreset]);

  // Reset autoscale tracking when media source changes
  useEffect(() => {
    if (!preset?.background.mediaOverlay) {
      autoscaleComputedRef.current.clear();
      return;
    }

    const overlay = preset.background.mediaOverlay;
    const mediaId = overlay.source === 'local' ? overlay.media.mediaId :
                    overlay.source === 'youtube' ? overlay.media.videoId : overlay.media.url;
    const mediaKey = `${overlay.source}:${mediaId}`;

    const currentKeys = Array.from(autoscaleComputedRef.current);
    for (const key of currentKeys) {
      if (key !== mediaKey) autoscaleComputedRef.current.delete(key);
    }
  }, [preset?.background.mediaOverlay]);

  return {
    handleIntrinsicSizeAvailable,
    applyTransformDelta,
    handleRemoveMediaOverlay
  };
}
