// Kraken Browser application entry point

import { useState, useEffect } from 'react';
import { loadActivePresetState } from '../../storage/local';
import { sessionBus } from '../../sync/sessionBus';
import { presetToRenderModel, renderBackground, renderMediaOverlay, renderOverlay, renderOverlayElement } from '../../render/engine';
import type { TextElementRenderData } from '../../core/overlay/overlay.types';
import { getViewportDimensions } from '../../render/viewport';
import { startNzxtMonitoring } from '../../platform/nzxtApi';
import { DebugMonitoringOverlay } from './debug/DebugMonitoringOverlay';
import type { RenderModel } from '../../render/model/render.types';
import type { Preset } from '../../core/preset/preset.types';
import { localMediaResolver } from '../../storage/localMediaResolver';
import '../../render/styles/background.css';
import '../../render/styles/overlay.css';
import '../../styles/kraken.css';
import '../../styles/root.css';

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

export function KrakenApp(): JSX.Element {
  const [model, setModel] = useState<RenderModel | null>(null);
  const [viewport, setViewport] = useState(getViewportDimensions());
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const state = loadActivePresetState();
      const activePreset = state.presets[state.activePresetId];
      
      if (activePreset) {
        // Resolve local media before rendering
        const resolvedPreset = await createResolvedRenderInput(activePreset);
        const renderModel = presetToRenderModel(resolvedPreset);
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
    };

    initialize();

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
      // Cleanup: revoke all objectURLs on unmount
      localMediaResolver.revokeAll();
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

  // Render parity with Preview:
  // - Uses the same render functions (renderBackground, renderMediaOverlay, renderOverlay)
  // - Uses the same CSS classes (render-background, render-media-overlay, render-overlay, etc.)
  // - Uses the same viewport dimensions
  // - Produces pixel-identical output to Preview (Preview is just a CSS-scaled camera view)
  const backgroundStyle = renderBackground(model, viewport);
  const mediaOverlay = renderMediaOverlay(model, viewport);
  const overlayElements = renderOverlay(model, viewport);

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
          {mediaOverlay && (
            <div className="render-media-overlay">
              <div
                className="render-media-world"
                style={{
                  width: `${mediaOverlay.worldWidth}px`,
                  height: `${mediaOverlay.worldHeight}px`,
                  marginLeft: `-${mediaOverlay.worldWidth / 2}px`,
                  marginTop: `-${mediaOverlay.worldHeight / 2}px`,
                  transform: mediaOverlay.worldTransform,
                }}
              >
                {mediaOverlay.source === 'youtube' ? (
                  <iframe
                    className="render-media-overlay-media"
                    src={mediaOverlay.src}
                    allow="autoplay; encrypted-media"
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                    }}
                  />
                ) : mediaOverlay.primitive === 'image' ? (
                  <img
                    className="render-media-overlay-media"
                    src={mediaOverlay.src}
                    alt=""
                  />
                ) : (
                  <video
                    className="render-media-overlay-media"
                    src={mediaOverlay.src}
                    autoPlay
                    loop
                    muted
                  />
                )}
              </div>
            </div>
          )}
          {/* FAZ-5.B1: Overlay elements rendering */}
          {/* Overlay elements are rendered above background and media overlay */}
          {/* Preview and Kraken use identical render functions (parity guarantee) */}
          {overlayElements && overlayElements.length > 0 && (
            <div className="render-overlay">
              {overlayElements.map((element) => {
                const elementStyle = renderOverlayElement(element, viewport);
                if (!elementStyle) {
                  return null;
                }

                // TEXT element rendering
                if (element.elementType === 'text') {
                  const textData = element.renderData as TextElementRenderData;
                  return (
                    <div
                      key={element.id}
                      className="render-overlay-element render-overlay-text"
                      style={elementStyle}
                    >
                      {textData.content}
                    </div>
                  );
                }

                return null;
              })}
            </div>
          )}
        </div>
        <DebugMonitoringOverlay />
      </div>
    </div>
  );
}
