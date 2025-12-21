// Background preview component

import { useEffect, useRef } from 'react';
import type { SyntheticEvent } from 'react';
import { Move } from 'lucide-react';
import type { RenderModel } from '../../../render/model/render.types';
import { renderBackground, renderMediaOverlay } from '../../../render/engine';
import { getViewportDimensions } from '../../../render/viewport';
import { useTranslation } from '../../../i18n';

interface BackgroundPreviewProps {
  model: RenderModel;
  onIntrinsicSizeAvailable?: (width: number, height: number) => void;
  showOverlayGuides?: boolean;
  onTransformDelta?: (deltaX: number, deltaY: number) => void;
  onScaleDelta?: (delta: number) => void;
  onKeyArrow?: (direction: 'up' | 'down' | 'left' | 'right', shift: boolean) => void;
  onDragEnd?: () => void;
}

/**
 * Background preview component.
 *
 * Architecture:
 * - Preview is a visual camera model: it does NOT produce transform math.
 * - All transform math is done in LCD viewport space (e.g. 640x640).
 * - Preview renders at LCD viewport size, then scales down visually via CSS.
 * - Preview size must NEVER affect transform calculations.
 * - Uses the same render path as Kraken (renderBackground, renderMediaOverlay).
 * - Uses the same CSS classes as Kraken (render-background, render-media-overlay, etc.).
 */
export function BackgroundPreview({
  model,
  onIntrinsicSizeAvailable,
  showOverlayGuides = false,
  onTransformDelta,
  onScaleDelta,
  onKeyArrow,
  onDragEnd,
}: BackgroundPreviewProps): JSX.Element {
  const { t } = useTranslation();
  
  // All transform math is done in LCD viewport space (e.g. 640x640).
  // Preview is a visual camera scaled via CSS.
  // Preview size must NEVER affect transform calculations.
  const lcdViewport = getViewportDimensions();
  const previewSize = 250;
  const previewScale = previewSize / lcdViewport.width;

  const lastMediaSrcRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const lastPointerPosRef = useRef<{ x: number; y: number } | null>(null);
  const persistDebounceTimerRef = useRef<number | null>(null);

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

  // Interaction handlers - only active when mediaOverlay exists
  const hasMediaOverlay = Boolean(model.mediaOverlay);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!hasMediaOverlay || !onTransformDelta || !containerRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = true;
    const rect = containerRef.current.getBoundingClientRect();
    lastPointerPosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    containerRef.current.setPointerCapture(e.pointerId);
    
    // Force cursor update
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing';
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!hasMediaOverlay || !onTransformDelta || !isDraggingRef.current || !lastPointerPosRef.current || !containerRef.current) return;
    
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    const deltaX = (currentX - lastPointerPosRef.current.x) / previewScale;
    const deltaY = (currentY - lastPointerPosRef.current.y) / previewScale;
    
    onTransformDelta(deltaX, deltaY);
    
    lastPointerPosRef.current = { x: currentX, y: currentY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!hasMediaOverlay || !isDraggingRef.current) return;
    
    isDraggingRef.current = false;
    lastPointerPosRef.current = null;
    if (containerRef.current) {
      containerRef.current.releasePointerCapture(e.pointerId);
      containerRef.current.style.cursor = hasMediaOverlay ? 'grab' : 'default';
    }
    
    if (onDragEnd) {
      onDragEnd();
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!hasMediaOverlay || !onScaleDelta) return;
    
    e.preventDefault();
    const delta = -e.deltaY * 0.001; // Scale sensitivity
    onScaleDelta(delta);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!hasMediaOverlay || !onKeyArrow) return;
    
    const shift = e.shiftKey;
    let direction: 'up' | 'down' | 'left' | 'right' | null = null;
    
    if (e.key === 'ArrowUp') {
      direction = 'up';
    } else if (e.key === 'ArrowDown') {
      direction = 'down';
    } else if (e.key === 'ArrowLeft') {
      direction = 'left';
    } else if (e.key === 'ArrowRight') {
      direction = 'right';
    }
    
    if (direction) {
      e.preventDefault();
      onKeyArrow(direction, shift);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (persistDebounceTimerRef.current !== null) {
        clearTimeout(persistDebounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
    }}>
      {/* Preview wrapper: visual scaling only, no transform math */}
      <div
        ref={containerRef}
        tabIndex={hasMediaOverlay ? 0 : undefined}
        style={{
          width: `${previewSize}px`,
          height: `${previewSize}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          cursor: hasMediaOverlay ? 'grab' : 'default',
          outline: 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        onKeyDown={handleKeyDown}
      >
        {/* Inner container: rendered at LCD viewport size, scaled down visually via CSS */}
        {/* This is the camera model - CSS transform does NOT affect render math */}
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
                  {overlay.source === 'youtube' ? (
                    // YouTube proxy: red rectangle representing video footprint
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#ff0000',
                        border: '2px solid #cc0000',
                        boxSizing: 'border-box',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        pointerEvents: 'none',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '22px',
                          color: '#ffffff',
                          textAlign: 'center',
                          fontWeight: 500,
                        }}
                      >
                        {t('backgroundMediaYoutubeProxyTitle')}
                      </div>
                      <Move
                        size={64}
                        color="#ffffff"
                        strokeWidth={2}
                      />
                      <div
                        style={{
                          fontSize: '22px',
                          color: '#ffffff',
                          textAlign: 'center',
                          fontWeight: 500,
                        }}
                      >
                        {t('backgroundMediaYoutubeProxyDescription')}
                      </div>
                    </div>
                  ) : overlay.primitive === 'image' ? (
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
                  {/* Overlay guides: UI-only, never rendered in Kraken, not persisted to preset */}
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
