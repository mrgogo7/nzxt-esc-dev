// Kraken Browser application entry point

import { useState, useEffect } from 'react';
import { loadActivePresetState } from '../../storage/local';
import { sessionBus } from '../../sync/sessionBus';
import { presetToRenderModel, renderBackground, renderMediaOverlay } from '../../render/engine';
import { getViewportDimensions } from '../../render/viewport';
import { startNzxtMonitoring } from '../../platform/nzxtApi';
import { DebugMonitoringOverlay } from './debug/DebugMonitoringOverlay';
import type { RenderModel } from '../../render/model/render.types';
import '../../render/styles/background.css';
import '../../render/styles/overlay.css';
import '../../styles/kraken.css';

export function KrakenApp(): JSX.Element {
  const [model, setModel] = useState<RenderModel | null>(null);
  const [viewport, setViewport] = useState(getViewportDimensions());
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const state = loadActivePresetState();
    const activePreset = state.presets[state.activePresetId];
    
    if (activePreset) {
      const renderModel = presetToRenderModel(activePreset);
      setModel(renderModel);
      setIsInitialized(true);

      const color = activePreset.background.base.color;
      // CSS variables don't support gradients, so only set for solid colors
      if (
        color &&
        !color.startsWith('linear-gradient(') &&
        !color.startsWith('radial-gradient(')
      ) {
        document.documentElement.style.setProperty('--kraken-bg-color', color);
      }
    }

    const unsubscribe = sessionBus.subscribeActivePreset((snapshot) => {
      setModel(snapshot);
      // Only set CSS variable for solid colors (not gradients)
      if (snapshot.background.kind === 'color') {
        const color = snapshot.background.color;
        // CSS variables don't support gradients, so only set for solid colors
        if (
          color &&
          !color.startsWith('linear-gradient(') &&
          !color.startsWith('radial-gradient(')
        ) {
          document.documentElement.style.setProperty('--kraken-bg-color', color);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Refresh viewport once on mount to pick up NZXT LCD attributes if available
    setViewport(getViewportDimensions());
  }, []);

  // Start NZXT monitoring on mount
  useEffect(() => {
    const stop = startNzxtMonitoring();
    return () => {
      stop();
    };
  }, []);

  if (!isInitialized || !model) {
    return (
      <div className="kraken-root">
        <div>Loading...</div>
      </div>
    );
  }

  const backgroundStyle = renderBackground(model, viewport);
  const overlay = renderMediaOverlay(model, viewport);

  return (
    <div className="kraken-root">
      <div className="kraken-viewport">
        <div
          className="render-background render-background-circle"
          style={{
            ...backgroundStyle,
            borderRadius: viewport.isCircular ? '50%' : '0',
          }}
        >
          {overlay && (
            <div className="render-media-overlay">
              {overlay.primitive === 'image' ? (
                <img
                  className="render-media-overlay-media"
                  src={overlay.src}
                  alt=""
                />
              ) : (
                <video
                  className="render-media-overlay-media"
                  src={overlay.src}
                  autoPlay
                  loop
                  muted
                />
              )}
            </div>
          )}
        </div>
        <DebugMonitoringOverlay />
      </div>
    </div>
  );
}
