// Configuration Browser application entry point

import { useState, useEffect, useCallback } from 'react';
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
            <BackgroundPreview model={resolvedRenderModel} />
          </div>
        </div>
        <div className="background-panel">
          <BackgroundSettingsPanel
            color={preset.background.base.color}
            onColorChange={handleColorChange}
            hasMediaOverlay={Boolean(preset.background.mediaOverlay)}
            onOpenBackgroundMediaModal={handleOpenBackgroundMediaModal}
            onRemoveBackgroundMediaOverlay={handleConfirmRemoveBackgroundMedia}
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

