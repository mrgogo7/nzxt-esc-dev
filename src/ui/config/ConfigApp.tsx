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
import '../../render/styles/background.css';
import '../../render/styles/overlay.css';
import '../../styles/config.css';

export function ConfigApp(): JSX.Element {
  const { t } = useTranslation();
  const [preset, setPreset] = useState<Preset | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPresetManagerOpen, setIsPresetManagerOpen] = useState(false);
  const { openModal } = useModal();

  useEffect(() => {
    const state = loadActivePresetState();
    const activePreset = state.presets[state.activePresetId];
    
    if (activePreset) {
      setPreset(activePreset);
      setIsInitialized(true);
      
      const renderModel = presetToRenderModel(activePreset);
      sessionBus.publishActivePreset(renderModel);
    }
  }, []);

  const handleColorChange = useCallback((color: string) => {
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

    const renderModel = presetToRenderModel(updatedPreset);
    sessionBus.publishActivePreset(renderModel);
  }, [preset]);

  const handlePresetApplied = useCallback((appliedPreset: Preset) => {
    setPreset(appliedPreset);
    const renderModel = presetToRenderModel(appliedPreset);
    sessionBus.publishActivePreset(renderModel);
  }, []);

  const handleBackgroundMediaOverlayApply = useCallback(
    (overlay: BackgroundMediaOverlayConfig) => {
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

      const renderModel = presetToRenderModel(updatedPreset);
      sessionBus.publishActivePreset(renderModel);
    },
    [preset]
  );

  const handleBackgroundMediaOverlayRemove = useCallback(() => {
    if (!preset || !preset.background.mediaOverlay) {
      return;
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

  const renderModel = presetToRenderModel(preset);

  return (
    <div className="config-root">
      <ConfigHeader
        onPresetManagerClick={() => setIsPresetManagerOpen(true)}
        onPresetApplied={handlePresetApplied}
      />
      <div className="config-content">
        <div className="config-sidebar">
          <div className="config-preview">
            <BackgroundPreview model={renderModel} />
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

