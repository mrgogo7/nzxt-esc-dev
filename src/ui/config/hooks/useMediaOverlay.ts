import { useCallback, useRef, useEffect } from 'react';
import type { Preset } from '../../../core/preset/preset.types';
import { getViewportDimensions } from '../../../render/viewport';
import { normalizeMediaOverlayTransform } from '../../../core/background/media-overlay/media-overlay.defaults';
import { localMediaResolver } from '../../../storage/localMediaResolver';

export function useMediaOverlay(preset: Preset | null, setPreset: (preset: Preset) => void) {
  const autoscaleComputedRef = useRef<Set<string>>(new Set());
  const handleIntrinsicSizeAvailable = useCallback(async (width: number, height: number) => {
    if (!preset || !preset.background.mediaOverlay) return;
    const overlay = preset.background.mediaOverlay;
    const mediaId = overlay.source === 'local' ? overlay.media.mediaId : overlay.source === 'youtube' ? overlay.media.videoId : overlay.media.url;
    const key = `${overlay.source}:${mediaId}`;
    if (autoscaleComputedRef.current.has(key)) {
      if (!overlay.media.intrinsic || overlay.media.intrinsic.width !== width || overlay.media.intrinsic.height !== height) {
        setPreset({ ...preset, background: { ...preset.background, mediaOverlay: { ...overlay, media: { ...overlay.media, intrinsic: { width, height } } as any } } });
      }
      return;
    }
    const vp = getViewportDimensions();
    const autoScale = Math.min(vp.width, vp.height) / Math.min(width, height);
    setPreset({ ...preset, background: { ...preset.background, mediaOverlay: { ...overlay, media: { ...overlay.media, intrinsic: { width, height } } as any, transform: { ...overlay.transform, autoScale, scale: 1 } } } });
    autoscaleComputedRef.current.add(key);
  }, [preset, setPreset]);

  const applyTransformDelta = useCallback((dx: number, dy: number, ds?: number) => {
    if (!preset || !preset.background.mediaOverlay) return;
    const vp = getViewportDimensions();
    const t = preset.background.mediaOverlay.transform;
    let nt = { ...t };
    if (ds !== undefined) nt.scale = Math.max(0.01, t.scale * (1 + ds));
    else { nt.offsetX = t.offsetX + dx / (vp.width / 2); nt.offsetY = t.offsetY + dy / (vp.height / 2); }
    setPreset({ ...preset, background: { ...preset.background, mediaOverlay: { ...preset.background.mediaOverlay, transform: normalizeMediaOverlayTransform(nt) } } });
  }, [preset, setPreset]);

  const handleRemoveMediaOverlay = useCallback(() => {
    if (!preset || !preset.background.mediaOverlay) return;
    if (preset.background.mediaOverlay.source === 'local') localMediaResolver.revokeMediaId(preset.background.mediaOverlay.media.mediaId);
    setPreset({ ...preset, background: { ...preset.background, mediaOverlay: undefined } });
  }, [preset, setPreset]);

  useEffect(() => {
    if (!preset?.background.mediaOverlay) { autoscaleComputedRef.current.clear(); return; }
    const overlay = preset.background.mediaOverlay;
    const mediaId = overlay.source === 'local' ? overlay.media.mediaId : overlay.source === 'youtube' ? overlay.media.videoId : overlay.media.url;
    const key = `${overlay.source}:${mediaId}`;
    Array.from(autoscaleComputedRef.current).forEach(k => { if (k !== key) autoscaleComputedRef.current.delete(k); });
  }, [preset?.background.mediaOverlay]);

  return { handleIntrinsicSizeAvailable, applyTransformDelta, handleRemoveMediaOverlay };
}
