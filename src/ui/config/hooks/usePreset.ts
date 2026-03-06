import { useState, useEffect, useCallback, useRef } from 'react';
import type { Preset } from '../../../core/preset/preset.types';
import { loadActivePresetState, savePreset } from '../../../storage/local';
import { presetToRenderModel } from '../../../render/engine';
import { sessionBus } from '../../../sync/sessionBus';
import { localMediaResolver } from '../../../storage/localMediaResolver';
import { createDefaultPreset } from '../../../core/preset/preset.defaults';
import type { RenderModel } from '../../../render/model/render.types';

async function createResolvedRenderInput(preset: Preset): Promise<Preset> {
  const overlay = preset.background.mediaOverlay;
  if (!overlay || overlay.source !== 'local' || !overlay.media.mediaId) return preset;
  const objectURL = await localMediaResolver.resolveMediaId(overlay.media.mediaId);
  if (!objectURL) return { ...preset, background: { ...preset.background, mediaOverlay: undefined } };
  return { ...preset, background: { ...preset.background, mediaOverlay: { ...overlay, media: { ...overlay.media, mediaId: objectURL } } } };
}

export function usePreset() {
  const [preset, setPreset] = useState<Preset | null>(null);
  const [resolvedRenderModel, setResolvedRenderModel] = useState<RenderModel>(presetToRenderModel(createDefaultPreset()));
  const [isInitialized, setIsInitialized] = useState(false);
  const throttleTimerRef = useRef<number | null>(null);
  const pendingPublishRef = useRef<boolean>(false);
  const lastPresetRef = useRef<Preset | null>(null);

  const throttledPublish = useCallback(async (presetToPublish: Preset) => {
    lastPresetRef.current = presetToPublish;
    if (throttleTimerRef.current === null) {
      throttleTimerRef.current = window.setTimeout(async () => {
        throttleTimerRef.current = null;
        if (pendingPublishRef.current && lastPresetRef.current) {
          pendingPublishRef.current = false;
          const resolvedPreset = await createResolvedRenderInput(lastPresetRef.current);
          sessionBus.publishActivePreset(presetToRenderModel(resolvedPreset));
        } else if (lastPresetRef.current) {
          const resolvedPreset = await createResolvedRenderInput(lastPresetRef.current);
          sessionBus.publishActivePreset(presetToRenderModel(resolvedPreset));
        }
      }, 100);
    } else pendingPublishRef.current = true;
  }, []);

  useEffect(() => {
    const initialize = async () => {
      const state = loadActivePresetState();
      const activePreset = state.presets[state.activePresetId];
      if (activePreset) {
        setPreset(activePreset);
        setIsInitialized(true);
        const resolvedPreset = await createResolvedRenderInput(activePreset);
        const renderModel = presetToRenderModel(resolvedPreset);
        setResolvedRenderModel(renderModel);
        sessionBus.publishActivePreset(renderModel);
      }
    };
    initialize();
    return () => {
      localMediaResolver.revokeAll();
      if (throttleTimerRef.current !== null) clearTimeout(throttleTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!preset) return;
    const updateRenderModel = async () => {
      const resolvedPreset = await createResolvedRenderInput(preset);
      setResolvedRenderModel(presetToRenderModel(resolvedPreset));
    };
    updateRenderModel();
  }, [preset]);

  const updatePreset = useCallback((updatedPreset: Preset, persist = true) => {
    setPreset(updatedPreset);
    if (persist) savePreset(updatedPreset);
    throttledPublish(updatedPreset);
  }, [throttledPublish]);

  return { preset, setPreset: updatePreset, resolvedRenderModel, isInitialized };
}
