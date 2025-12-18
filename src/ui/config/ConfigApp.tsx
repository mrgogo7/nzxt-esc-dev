// Configuration Browser application entry point

import { useState, useEffect, useCallback } from 'react';
import { loadActivePresetState, savePreset } from '../../storage/local';
import { sessionBus } from '../../sync/sessionBus';
import { presetToRenderModel } from '../../render/engine';
import type { Preset } from '../../core/preset/preset.types';
import { useTranslation } from '../../i18n';
import { BackgroundPreview } from './preview/BackgroundPreview';
import { BackgroundSettingsPanel } from './panels/BackgroundSettingsPanel';
import { PresetManagerPanel } from './panels/PresetManagerPanel';
import { ConfigHeader } from './layout/ConfigHeader';
import '../../render/styles/background.css';
import '../../styles/config.css';

export function ConfigApp(): JSX.Element {
  const { t } = useTranslation();
  const [preset, setPreset] = useState<Preset | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPresetManagerOpen, setIsPresetManagerOpen] = useState(false);

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
        sourceType: 'color',
        color: color,
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
            color={preset.background.color}
            onColorChange={handleColorChange}
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

