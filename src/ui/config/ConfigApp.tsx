// Configuration Browser application entry point

import { useState, useEffect, useCallback, useRef } from 'react';
import { loadActivePresetState, savePreset } from '../../storage/local';
import { sessionBus } from '../../sync/sessionBus';
import { presetToRenderModel } from '../../render/engine';
import type { Preset } from '../../core/preset/preset.types';
import type { BackgroundMediaOverlayConfig } from '../../core/background/media-overlay/media-overlay.types';
import { useTranslation } from '../../i18n';
import { useModal } from '../shared/modal/modal.context';
import { BackgroundPreview } from './preview/BackgroundPreview';
import { BackgroundSettingsPanel } from './panels/BackgroundSettingsPanel';
import { PresetManagerPanel } from './panels/PresetManagerPanel';
import { ConfigHeader } from './layout/ConfigHeader';
import { localMediaResolver } from '../../storage/localMediaResolver';
import { createDefaultPreset } from '../../core/preset/preset.defaults';
import { getViewportDimensions } from '../../render/viewport';
import { normalizeMediaOverlayTransform } from '../../core/background/media-overlay/media-overlay.defaults';
import '../../render/styles/background.css';
import '../../render/styles/overlay.css';
import '../../styles/config.css';

/**
 * Creates a render input from a preset by resolving local media to objectURLs.
 * This is an ephemeral object for render only - NOT persisted.
 * Does NOT mutate the original preset.
 */
async function createResolvedRenderInput(preset: Preset): Promise<Preset> {
  const overlay = preset.background.mediaOverlay;

  // If no overlay or not local media, return as-is
  if (!overlay || overlay.source !== 'local' || !overlay.media.mediaId) {
    return preset;
  }

  // Resolve mediaId to objectURL
  const objectURL = await localMediaResolver.resolveMediaId(overlay.media.mediaId);

  // If resolution failed, return preset without overlay (for render)
  if (!objectURL) {
    return {
      ...preset,
      background: {
        ...preset.background,
        mediaOverlay: undefined,
      },
    };
  }

  // Create shallow clone with mediaId replaced by objectURL
  return {
    ...preset,
    background: {
      ...preset.background,
      mediaOverlay: {
        ...overlay,
        media: {
          ...overlay.media,
          mediaId: objectURL, // Replace stable ID with objectURL for render
        },
      },
    },
  };
}

export function ConfigApp(): JSX.Element {
  const { t } = useTranslation();
  const [preset, setPreset] = useState<Preset | null>(null);
  const [resolvedRenderModel, setResolvedRenderModel] = useState(
    presetToRenderModel(createDefaultPreset())
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPresetManagerOpen, setIsPresetManagerOpen] = useState(false);
  const { openModal } = useModal();
  const autoscaleComputedRef = useRef<Set<string>>(new Set());
  const [showOverlayGuides, setShowOverlayGuides] = useState(false);
  
  // Throttled publish mechanism
  const throttleTimerRef = useRef<number | null>(null);
  const pendingPublishRef = useRef<boolean>(false);
  const lastPresetRef = useRef<Preset | null>(null);
  
  // Persist debounce timers
  const persistDebounceTimerRef = useRef<number | null>(null);
  const isInteractionActiveRef = useRef<boolean>(false);

  useEffect(() => {
    const initialize = async () => {
      const state = loadActivePresetState();
      const activePreset = state.presets[state.activePresetId];
      
      if (activePreset) {
        setPreset(activePreset);
        setIsInitialized(true);
        
        // Resolve local media before rendering
        const resolvedPreset = await createResolvedRenderInput(activePreset);
        const renderModel = presetToRenderModel(resolvedPreset);
        setResolvedRenderModel(renderModel);
        sessionBus.publishActivePreset(renderModel);
      }
    };

    initialize();

    // Cleanup: revoke all objectURLs on unmount
    return () => {
      localMediaResolver.revokeAll();
    };
  }, []);

  // Update resolved render model when preset changes
  useEffect(() => {
    if (!preset) return;

    const updateRenderModel = async () => {
      const resolvedPreset = await createResolvedRenderInput(preset);
      const renderModel = presetToRenderModel(resolvedPreset);
      setResolvedRenderModel(renderModel);
    };

    updateRenderModel();
  }, [preset]);

  // Throttled publish function (~100ms)
  const throttledPublish = useCallback(async (presetToPublish: Preset) => {
    lastPresetRef.current = presetToPublish;
    
    if (throttleTimerRef.current === null) {
      throttleTimerRef.current = window.setTimeout(async () => {
        throttleTimerRef.current = null;
        
        if (pendingPublishRef.current && lastPresetRef.current) {
          pendingPublishRef.current = false;
          const resolvedPreset = await createResolvedRenderInput(lastPresetRef.current);
          const renderModel = presetToRenderModel(resolvedPreset);
          sessionBus.publishActivePreset(renderModel);
        } else if (lastPresetRef.current) {
          // Publish even if no pending flag (first call)
          const resolvedPreset = await createResolvedRenderInput(lastPresetRef.current);
          const renderModel = presetToRenderModel(resolvedPreset);
          sessionBus.publishActivePreset(renderModel);
        }
      }, 100);
    } else {
      pendingPublishRef.current = true;
    }
  }, []);

  // Cleanup throttle on unmount and preset change
  useEffect(() => {
    return () => {
      if (throttleTimerRef.current !== null) {
        clearTimeout(throttleTimerRef.current);
        throttleTimerRef.current = null;
      }
      if (persistDebounceTimerRef.current !== null) {
        clearTimeout(persistDebounceTimerRef.current);
        persistDebounceTimerRef.current = null;
      }
      pendingPublishRef.current = false;
      isInteractionActiveRef.current = false;
    };
  }, [preset?.id]);

  // Cancel interaction on preset change
  useEffect(() => {
    if (persistDebounceTimerRef.current !== null) {
      clearTimeout(persistDebounceTimerRef.current);
      persistDebounceTimerRef.current = null;
    }
    isInteractionActiveRef.current = false;
  }, [preset?.id]);

  const handleColorChange = useCallback(async (color: string) => {
    if (!preset) return;

    const updatedPreset: Preset = {
      ...preset,
      background: {
        ...preset.background,
        base: {
          ...preset.background.base,
          sourceType: 'color',
          color,
        },
      },
    };

    setPreset(updatedPreset);
    savePreset(updatedPreset);

      // Resolve local media before rendering
      const resolvedPreset = await createResolvedRenderInput(updatedPreset);
      const renderModel = presetToRenderModel(resolvedPreset);
      setResolvedRenderModel(renderModel);
      sessionBus.publishActivePreset(renderModel);
  }, [preset]);

  const handlePresetApplied = useCallback(async (appliedPreset: Preset) => {
    setPreset(appliedPreset);
    
    // Resolve local media before rendering
    const resolvedPreset = await createResolvedRenderInput(appliedPreset);
    const renderModel = presetToRenderModel(resolvedPreset);
    setResolvedRenderModel(renderModel);
    sessionBus.publishActivePreset(renderModel);
  }, []);

  const handleBackgroundMediaOverlayApply = useCallback(
    async (overlay: BackgroundMediaOverlayConfig) => {
      if (!preset) {
        return;
      }

      // For YouTube, ensure default intrinsic is set and compute autoscale if needed
      if (overlay.source === 'youtube' && overlay.media.intrinsic) {
        const mediaKey = `youtube:${overlay.media.videoId}`;
        const isNewYouTube = !autoscaleComputedRef.current.has(mediaKey);
        const isDefaultTransform =
          overlay.transform.scale === 1 &&
          overlay.transform.autoScale === 1 &&
          overlay.transform.offsetX === 0 &&
          overlay.transform.offsetY === 0 &&
          overlay.transform.rotateDeg === 0;

        if (isNewYouTube && isDefaultTransform) {
          // Compute autoscale for YouTube using default intrinsic
          const viewport = getViewportDimensions();
          const viewportShortEdge = Math.min(viewport.width, viewport.height);
          const mediaShortEdge = Math.min(
            overlay.media.intrinsic.width,
            overlay.media.intrinsic.height
          );
          const autoScaleShortEdge = viewportShortEdge / mediaShortEdge;

          overlay = {
            ...overlay,
            transform: {
              ...overlay.transform,
              autoScale: autoScaleShortEdge,
              scale: 1,
            },
          };

          autoscaleComputedRef.current.add(mediaKey);
        }
      }

      const updatedPreset: Preset = {
        ...preset,
        background: {
          ...preset.background,
          mediaOverlay: overlay,
        },
      };

      setPreset(updatedPreset);
      savePreset(updatedPreset);

      // Resolve local media before rendering
      const resolvedPreset = await createResolvedRenderInput(updatedPreset);
      const renderModel = presetToRenderModel(resolvedPreset);
      setResolvedRenderModel(renderModel);
      sessionBus.publishActivePreset(renderModel);
    },
    [preset]
  );

  const handleBackgroundMediaOverlayRemove = useCallback(async () => {
    if (!preset || !preset.background.mediaOverlay) {
      return;
    }

    // Revoke objectURL if it was a local media
    if (preset.background.mediaOverlay.source === 'local') {
      const mediaId = preset.background.mediaOverlay.media.mediaId;
      if (mediaId) {
        localMediaResolver.revokeMediaId(mediaId);
      }
    }

    const updatedPreset: Preset = {
      ...preset,
      background: {
        ...preset.background,
        mediaOverlay: undefined,
      },
    };

    setPreset(updatedPreset);
    savePreset(updatedPreset);

    const renderModel = presetToRenderModel(updatedPreset);
    setResolvedRenderModel(renderModel);
    sessionBus.publishActivePreset(renderModel);
  }, [preset]);

  const handleOpenBackgroundMediaModal = useCallback(() => {
    if (!preset) {
      return;
    }

    const existingOverlay = preset.background.mediaOverlay;

    let existingLocalFileName: string | undefined;
    let existingLocalFileSize: number | undefined;
    let existingUrl: string | undefined;

    if (existingOverlay?.source === 'local') {
      existingLocalFileName = existingOverlay.media.fileName;
      existingLocalFileSize = existingOverlay.media.fileSize;
    } else if (existingOverlay?.source === 'url') {
      existingUrl = existingOverlay.media.url;
    }

    openModal({
      type: 'BACKGROUND_MEDIA',
      props: {
        titleKey: 'backgroundMediaLabel',
        hasExistingOverlay: Boolean(existingOverlay),
        existingLocalFileName,
        existingLocalFileSize,
        existingUrl,
        onApply: handleBackgroundMediaOverlayApply,
      },
    });
  }, [openModal, preset, handleBackgroundMediaOverlayApply]);

  const handleConfirmRemoveBackgroundMedia = useCallback(() => {
    if (!preset || !preset.background.mediaOverlay) {
      return;
    }

    openModal({
      type: 'BACKGROUND_MEDIA_REMOVE_CONFIRM',
      props: {
        titleKey: 'backgroundMediaLabel',
        bodyKey: 'backgroundMediaRemove',
        confirmLabelKey: 'backgroundMediaRemove',
        cancelLabelKey: 'backgroundMediaCancel',
        onConfirm: handleBackgroundMediaOverlayRemove,
      },
    });
  }, [openModal, preset, handleBackgroundMediaOverlayRemove]);

  // Handle transform change (from input fields - immediate persist)
  const handleTransformChange = useCallback(
    async (transform: BackgroundMediaOverlayConfig['transform']) => {
      if (!preset || !preset.background.mediaOverlay) {
        return;
      }

      const updatedPreset: Preset = {
        ...preset,
        background: {
          ...preset.background,
          mediaOverlay: {
            ...preset.background.mediaOverlay,
            transform,
          },
        },
      };

      setPreset(updatedPreset);
      savePreset(updatedPreset);

      // Update render model
      const resolvedPreset = await createResolvedRenderInput(updatedPreset);
      const renderModel = presetToRenderModel(resolvedPreset);
      setResolvedRenderModel(renderModel);
      sessionBus.publishActivePreset(renderModel);
    },
    [preset]
  );

  // Apply transform delta (for interactive manipulation)
  const applyTransformDelta = useCallback(
    (deltaX: number, deltaY: number, deltaScale?: number) => {
      if (!preset || !preset.background.mediaOverlay) {
        return;
      }

      const viewport = getViewportDimensions();
      const currentTransform = preset.background.mediaOverlay.transform;
      
      // Convert pixel deltas to normalized offset deltas
      // offsetX/Y are in [-2, 2] range, representing viewport-relative offsets
      const offsetDeltaX = deltaX / (viewport.width / 2);
      const offsetDeltaY = deltaY / (viewport.height / 2);
      
      let newTransform = { ...currentTransform };
      
      if (deltaScale !== undefined) {
        // Scale delta: multiply current scale
        newTransform.scale = Math.max(0.01, currentTransform.scale * (1 + deltaScale));
      } else {
        // Offset delta: add to current offsets
        newTransform.offsetX = currentTransform.offsetX + offsetDeltaX;
        newTransform.offsetY = currentTransform.offsetY + offsetDeltaY;
      }
      
      // Normalize transform
      newTransform = normalizeMediaOverlayTransform(newTransform);
      
      const updatedPreset: Preset = {
        ...preset,
        background: {
          ...preset.background,
          mediaOverlay: {
            ...preset.background.mediaOverlay,
            transform: newTransform,
          },
        },
      };

      // Update in-memory preset immediately
      setPreset(updatedPreset);
      
      // Update preview render model immediately (async resolution for local media)
      createResolvedRenderInput(updatedPreset).then((resolvedPreset) => {
        const renderModel = presetToRenderModel(resolvedPreset);
        setResolvedRenderModel(renderModel);
      });
      
      // Throttled publish to Kraken
      throttledPublish(updatedPreset);
    },
    [preset, throttledPublish]
  );

  // Persist with debounce (for wheel/keyboard)
  const schedulePersist = useCallback(() => {
    if (persistDebounceTimerRef.current !== null) {
      clearTimeout(persistDebounceTimerRef.current);
    }
    
    persistDebounceTimerRef.current = window.setTimeout(() => {
      if (preset) {
        savePreset(preset);
        persistDebounceTimerRef.current = null;
        isInteractionActiveRef.current = false;
      }
    }, 400);
    
    isInteractionActiveRef.current = true;
  }, [preset]);

  // Immediate persist (for drag end)
  const persistImmediate = useCallback(() => {
    if (persistDebounceTimerRef.current !== null) {
      clearTimeout(persistDebounceTimerRef.current);
      persistDebounceTimerRef.current = null;
    }
    
    if (preset) {
      savePreset(preset);
      isInteractionActiveRef.current = false;
    }
  }, [preset]);

  // Preview interaction handlers
  const handleTransformDelta = useCallback(
    (deltaX: number, deltaY: number) => {
      applyTransformDelta(deltaX, deltaY);
    },
    [applyTransformDelta]
  );

  const handleScaleDelta = useCallback(
    (delta: number) => {
      applyTransformDelta(0, 0, delta);
      schedulePersist();
    },
    [applyTransformDelta, schedulePersist]
  );

  const handleKeyArrow = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right', shift: boolean) => {
      if (!preset || !preset.background.mediaOverlay) return;
      
      const viewport = getViewportDimensions();
      const step = shift ? 0.1 : 0.05; // Larger step with Shift
      
      let deltaX = 0;
      let deltaY = 0;
      
      if (direction === 'left') deltaX = -step * (viewport.width / 2);
      else if (direction === 'right') deltaX = step * (viewport.width / 2);
      else if (direction === 'up') deltaY = -step * (viewport.height / 2);
      else if (direction === 'down') deltaY = step * (viewport.height / 2);
      
      applyTransformDelta(deltaX, deltaY);
      schedulePersist();
    },
    [preset, applyTransformDelta, schedulePersist]
  );

  const handleDragEnd = useCallback(() => {
    persistImmediate();
  }, [persistImmediate]);

  // Handle intrinsic size available (autoscale computation + intrinsic persistence)
  const handleIntrinsicSizeAvailable = useCallback(
    async (width: number, height: number) => {
      if (!preset || !preset.background.mediaOverlay) {
        return;
      }

      const overlay = preset.background.mediaOverlay;
      const transform = overlay.transform;

      // Get media source identifier for tracking
      const mediaId =
        overlay.source === 'local'
          ? overlay.media.mediaId
          : overlay.source === 'youtube'
            ? overlay.media.videoId
            : overlay.media.url;
      const mediaKey = `${overlay.source}:${mediaId}`;

      // Check if autoscale already computed for this media
      if (autoscaleComputedRef.current.has(mediaKey)) {
        // Still persist intrinsic even if autoscale was already computed
        // (in case it wasn't persisted before)
        if (!overlay.media.intrinsic || overlay.media.intrinsic.width !== width || overlay.media.intrinsic.height !== height) {
          const updatedPreset: Preset = {
            ...preset,
            background: {
              ...preset.background,
              mediaOverlay: {
                ...overlay,
                media: {
                  ...overlay.media,
                  intrinsic: { width, height },
                },
              },
            },
          };

          setPreset(updatedPreset);
          savePreset(updatedPreset);

          const resolvedPreset = await createResolvedRenderInput(updatedPreset);
          const renderModel = presetToRenderModel(resolvedPreset);
          setResolvedRenderModel(renderModel);
          sessionBus.publishActivePreset(renderModel);
        }
        return;
      }

      // Check if user has customized transform
      const isDefaultTransform =
        transform.scale === 1 &&
        transform.autoScale === 1 &&
        transform.offsetX === 0 &&
        transform.offsetY === 0 &&
        transform.rotateDeg === 0;

      // Compute autoscale so the media short edge fills the viewport short edge
      const viewport = getViewportDimensions();
      const viewportShortEdge = Math.min(viewport.width, viewport.height);
      const mediaShortEdge = Math.min(width, height);
      const autoScaleShortEdge = viewportShortEdge / mediaShortEdge;

      // FAZ-4.2.1: Autoscale is baked into world dimensions, not transform.scale
      // When autoscale is computed:
      // - autoScale = autoScaleCover (stored as reference)
      // - scale = 1 (user scale starts at 1, autoscale already applied to world)
      // - World size will be: intrinsic * autoScale (computed in render layer)
      const updatedPreset: Preset = {
        ...preset,
        background: {
          ...preset.background,
          mediaOverlay: {
            ...overlay,
            media: {
              ...overlay.media,
              intrinsic: { width, height },
            },
            transform: isDefaultTransform
              ? {
                  ...transform,
                  autoScale: autoScaleShortEdge,
                  scale: 1, // User scale = 1 initially (autoscale baked into world size)
                }
              : transform,
          },
        },
      };

      setPreset(updatedPreset);
      savePreset(updatedPreset);

      // Mark as computed
      autoscaleComputedRef.current.add(mediaKey);

      // Update render model
      const resolvedPreset = await createResolvedRenderInput(updatedPreset);
      const renderModel = presetToRenderModel(resolvedPreset);
      setResolvedRenderModel(renderModel);
      sessionBus.publishActivePreset(renderModel);
    },
    [preset]
  );

  // Reset autoscale tracking when media source changes
  useEffect(() => {
    if (!preset?.background.mediaOverlay) {
      autoscaleComputedRef.current.clear();
      return;
    }

    const overlay = preset.background.mediaOverlay;
    const mediaId =
      overlay.source === 'local'
        ? overlay.media.mediaId
        : overlay.source === 'youtube'
          ? overlay.media.videoId
          : overlay.media.url;
    const mediaKey = `${overlay.source}:${mediaId}`;

    // If media changed, clear tracking for old media
    const currentKeys = Array.from(autoscaleComputedRef.current);
    for (const key of currentKeys) {
      if (key !== mediaKey) {
        autoscaleComputedRef.current.delete(key);
      }
    }
  }, [preset?.background.mediaOverlay]);

  if (!isInitialized || !preset) {
    return (
      <div className="config-root">
        <div>{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="config-root">
      <ConfigHeader
        onPresetManagerClick={() => setIsPresetManagerOpen(true)}
        onPresetApplied={handlePresetApplied}
      />
      <div className="config-content">
        <div className="config-sidebar">
          <div className="config-preview">
            <BackgroundPreview
              model={resolvedRenderModel}
              onIntrinsicSizeAvailable={handleIntrinsicSizeAvailable}
              showOverlayGuides={showOverlayGuides}
              onTransformDelta={handleTransformDelta}
              onScaleDelta={handleScaleDelta}
              onKeyArrow={handleKeyArrow}
              onDragEnd={handleDragEnd}
            />
          </div>
        </div>
        <div className="background-panel">
          <BackgroundSettingsPanel
            color={preset.background.base.color}
            onColorChange={handleColorChange}
            hasMediaOverlay={Boolean(preset.background.mediaOverlay)}
            onOpenBackgroundMediaModal={handleOpenBackgroundMediaModal}
            onRemoveBackgroundMediaOverlay={handleConfirmRemoveBackgroundMedia}
            transform={preset.background.mediaOverlay?.transform}
            onTransformChange={handleTransformChange}
            showOverlayGuides={showOverlayGuides}
            onOverlayGuidesChange={setShowOverlayGuides}
            mediaOverlaySource={preset.background.mediaOverlay?.source}
          />
        </div>
      </div>
      <PresetManagerPanel
        isOpen={isPresetManagerOpen}
        onClose={() => setIsPresetManagerOpen(false)}
        onPresetApplied={handlePresetApplied}
      />
    </div>
  );
}
