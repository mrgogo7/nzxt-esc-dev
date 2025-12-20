// Background preview component

import { useEffect, useRef } from 'react';
import type { SyntheticEvent } from 'react';
import type { RenderModel } from '../../../render/model/render.types';
import { renderBackground, renderMediaOverlay } from '../../../render/engine';
import { getViewportDimensions } from '../../../render/viewport';

interface BackgroundPreviewProps {
  model: RenderModel;
  onIntrinsicSizeAvailable?: (width: number, height: number) => void;
  showOverlayGuides?: boolean;
}

export function BackgroundPreview({
  model,
  onIntrinsicSizeAvailable,
  showOverlayGuides = false,
}: BackgroundPreviewProps): JSX.Element {
  // FAZ-4.2.1 Viewport Unification: Use LCD viewport for all transform math
  // Preview scaling is visual only (CSS), not mathematical
  const lcdViewport = getViewportDimensions();
  const previewSize = 250;
  const previewScale = previewSize / lcdViewport.width;

  const lastMediaSrcRef = useRef<string | null>(null);

  // Render at LCD viewport size (transform math uses LCD viewport)
  const backgroundStyle = renderBackground(model, lcdViewport);
  const overlay = renderMediaOverlay(model, lcdViewport);

  // Track media source changes
  const currentMediaSrc = overlay?.src || null;
  useEffect(() => {
    if (currentMediaSrc !== lastMediaSrcRef.current) {
      lastMediaSrcRef.current = currentMediaSrc;
    }
  }, [currentMediaSrc]);

  // Handle image intrinsic size
  const handleImageLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    if (!onIntrinsicSizeAvailable) return;

    const img = event.currentTarget;
    const { naturalWidth, naturalHeight } = img;

    if (naturalWidth > 0 && naturalHeight > 0) {
      onIntrinsicSizeAvailable(naturalWidth, naturalHeight);
    }
  };

  // Handle video intrinsic size
  const handleVideoLoadedMetadata = (
    event: SyntheticEvent<HTMLVideoElement>
  ) => {
    if (!onIntrinsicSizeAvailable) return;

    const video = event.currentTarget;
    const { videoWidth, videoHeight } = video;

    if (videoWidth > 0 && videoHeight > 0) {
      onIntrinsicSizeAvailable(videoWidth, videoHeight);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
    }}>
      {/* Preview wrapper: visual scaling only, no transform math */}
      <div
        style={{
          width: `${previewSize}px`,
          height: `${previewSize}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Inner container: rendered at LCD size, scaled down visually */}
        <div
          style={{
            width: `${lcdViewport.width}px`,
            height: `${lcdViewport.height}px`,
            transform: `scale(${previewScale})`,
            transformOrigin: 'center center',
          }}
        >
          <div
            className="render-background render-background-circle"
            style={{
              ...backgroundStyle,
              width: `${lcdViewport.width}px`,
              height: `${lcdViewport.height}px`,
              border: '14px solid #000',
              borderRadius: '50%',
              boxSizing: 'border-box',
            }}
          >
            {overlay && (
              <div className="render-media-overlay">
                <div
                  className="render-media-world"
                  style={{
                    width: `${overlay.worldWidth}px`,
                    height: `${overlay.worldHeight}px`,
                    marginLeft: `-${overlay.worldWidth / 2}px`,
                    marginTop: `-${overlay.worldHeight / 2}px`,
                    transform: overlay.worldTransform,
                  }}
                >
                  {overlay.primitive === 'image' ? (
                    <img
                      className="render-media-overlay-media"
                      src={overlay.src}
                      alt=""
                      onLoad={handleImageLoad}
                    />
                  ) : (
                    <video
                      className="render-media-overlay-media"
                      src={overlay.src}
                      autoPlay
                      loop
                      muted
                      onLoadedMetadata={handleVideoLoadedMetadata}
                    />
                  )}
                  {showOverlayGuides && (
                    <>
                      {/* Crosshair guide - follows world transform */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: 0,
                          right: 0,
                          height: '1px',
                          backgroundColor: 'rgba(255, 255, 255, 0.3)',
                          transform: 'translateY(-50%)',
                          pointerEvents: 'none',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          left: '50%',
                          top: 0,
                          bottom: 0,
                          width: '1px',
                          backgroundColor: 'rgba(255, 255, 255, 0.3)',
                          transform: 'translateX(-50%)',
                          pointerEvents: 'none',
                        }}
                      />
                      {/* Bounding box guide - shows world bounds */}
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          pointerEvents: 'none',
                        }}
                      />
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
