// Overlay preview component
//
// FAZ-5.C1.1: Dedicated overlay preview panel.
// Renders ONLY overlay elements (no background content).
// Uses the same render pipeline as BackgroundPreview and Kraken (parity guarantee).

import { useRef } from 'react';
import type { RenderModel } from '../../../render/model/render.types';
import { renderBackground, renderMediaOverlay, renderOverlay, renderOverlayElement } from '../../../render/engine';
import { getViewportDimensions } from '../../../render/viewport';
import { getElementContract } from '../../../core/elements/registry';
import './preview.css';

interface OverlayPreviewProps {
  model: RenderModel;
  // FAZ-5.B2: Overlay element interaction props
  selectedOverlayElementId?: string | null;
  onOverlayElementSelect?: (elementId: string | null) => void;
  onOverlayElementTransformDelta?: (elementId: string, deltaX: number, deltaY: number) => void;
  onOverlayElementRotateDelta?: (elementId: string, deltaDeg: number) => void;
  onOverlayElementResizeDelta?: (elementId: string, deltaX: number, deltaY: number) => void;
  onOverlayElementFontSizeDelta?: (elementId: string, fontSizeDelta: number) => void;
  onOverlayElementKeyArrow?: (elementId: string, direction: 'up' | 'down' | 'left' | 'right') => void;
  onOverlayElementDragEnd?: () => void;
  // FAZ-5.E1.4: Background preview controls (UI-only, not persisted)
  showBackground?: boolean;
  backgroundOpacity?: number;
}

/**
 * Overlay preview component.
 *
 * Architecture:
 * - Preview is a visual camera model: it does NOT produce transform math.
 * - All transform math is done in LCD viewport space (e.g. 640x640).
 * - Preview renders at LCD viewport size, then scales down visually via CSS.
 * - Preview size must NEVER affect transform calculations.
 * - Uses the same render path as Kraken (renderOverlay, renderOverlayElement).
 * - Uses the same CSS classes as Kraken (render-overlay, render-overlay-element, etc.).
 */
export function OverlayPreview({
  model,
  selectedOverlayElementId = null,
  onOverlayElementSelect,
  onOverlayElementTransformDelta,
  onOverlayElementRotateDelta,
  onOverlayElementResizeDelta,
  onOverlayElementFontSizeDelta,
  onOverlayElementKeyArrow,
  onOverlayElementDragEnd,
  showBackground = true,
  backgroundOpacity = 1.0,
}: OverlayPreviewProps): JSX.Element {
  // All transform math is done in LCD viewport space (e.g. 640x640).
  // Preview is a visual camera scaled via CSS.
  // Preview size must NEVER affect transform calculations.
  const lcdViewport = getViewportDimensions();
  const previewSize = 250;
  const previewScale = previewSize / lcdViewport.width;

  const containerRef = useRef<HTMLDivElement>(null);
  
  // FAZ-5.B2: Overlay element interaction state
  const isDraggingOverlayRef = useRef(false);
  const isResizingOverlayRef = useRef(false);
  const isRotatingOverlayRef = useRef(false);
  const draggedOverlayElementIdRef = useRef<string | null>(null);
  const lastOverlayPointerPosRef = useRef<{ x: number; y: number } | null>(null);

  // Render at LCD viewport size (transform math uses LCD viewport)
  const overlayElements = renderOverlay(model, lcdViewport);
  const backgroundStyle = renderBackground(model, lcdViewport);
  const mediaOverlay = renderMediaOverlay(model, lcdViewport);

  // FAZ-5.B2: Overlay element interaction handlers
  const handleOverlayElementClick = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    if (onOverlayElementSelect) {
      onOverlayElementSelect(elementId);
    }
  };

  const handleOverlayElementPointerDown = (e: React.PointerEvent, elementId: string) => {
    if (!containerRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as HTMLElement;

    if (target.closest('.render-overlay-rotate-handle')) {
      if (!onOverlayElementRotateDelta) return;
      isRotatingOverlayRef.current = true;
    } else if (target.closest('.render-overlay-resize-handle')) {
      if (!onOverlayElementFontSizeDelta && !onOverlayElementResizeDelta) return;
      isResizingOverlayRef.current = true;
    } else {
      if (!onOverlayElementTransformDelta) return;
      isDraggingOverlayRef.current = true;
    }

    draggedOverlayElementIdRef.current = elementId;
    const rect = containerRef.current.getBoundingClientRect();
    lastOverlayPointerPosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    containerRef.current.setPointerCapture(e.pointerId);
    
    // Select element on drag start
    if (onOverlayElementSelect) {
      onOverlayElementSelect(elementId);
    }
  };

  const handleOverlayElementPointerMove = (e: React.PointerEvent) => {
    if (!draggedOverlayElementIdRef.current || !lastOverlayPointerPosRef.current || !containerRef.current) return;
    
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    const deltaX = (currentX - lastOverlayPointerPosRef.current.x) / previewScale;
    const deltaY = (currentY - lastOverlayPointerPosRef.current.y) / previewScale;

    if (isDraggingOverlayRef.current && onOverlayElementTransformDelta) {
      onOverlayElementTransformDelta(draggedOverlayElementIdRef.current, deltaX, deltaY);
    } else if (isRotatingOverlayRef.current && onOverlayElementRotateDelta) {
      // Rotation logic: pivot around center
      // For now, let's use a simpler delta-based approach or coordinate-to-angle
      // Actually we should pivot around the element center.
      // But for simplicity in this step, let's just use vertical delta as rotation for now
      // and improve it in the next step.
      const rotationDelta = deltaX * 0.5;
      onOverlayElementRotateDelta(draggedOverlayElementIdRef.current, rotationDelta);
    } else if (isResizingOverlayRef.current) {
      if (onOverlayElementFontSizeDelta) {
        const scaleFactor = 0.5;
        const fontSizeDelta = deltaY * scaleFactor;
        onOverlayElementFontSizeDelta(draggedOverlayElementIdRef.current, fontSizeDelta);
      } else if (onOverlayElementResizeDelta) {
        onOverlayElementResizeDelta(draggedOverlayElementIdRef.current, deltaX, deltaY);
      }
    }
    
    lastOverlayPointerPosRef.current = { x: currentX, y: currentY };
  };

  const handleOverlayElementPointerUp = (e: React.PointerEvent) => {
    if (!isDraggingOverlayRef.current && !isResizingOverlayRef.current && !isRotatingOverlayRef.current) return;
    
    isDraggingOverlayRef.current = false;
    isResizingOverlayRef.current = false;
    isRotatingOverlayRef.current = false;
    draggedOverlayElementIdRef.current = null;
    lastOverlayPointerPosRef.current = null;
    if (containerRef.current) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }
    
    if (onOverlayElementDragEnd) {
      onOverlayElementDragEnd();
    }
  };

  const handleOverlayElementWheel = (e: React.WheelEvent, elementId: string) => {
    if (!onOverlayElementFontSizeDelta) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Small step: ±1 or ±2 per wheel tick
    const step = Math.abs(e.deltaY) > 50 ? 2 : 1;
    const fontSizeDelta = e.deltaY > 0 ? -step : step;
    
    onOverlayElementFontSizeDelta(elementId, fontSizeDelta);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // FAZ-5.B2: Overlay element keyboard handling
    if (selectedOverlayElementId && onOverlayElementKeyArrow) {
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
        e.stopPropagation();
        onOverlayElementKeyArrow(selectedOverlayElementId, direction);
        return;
      }
    }
  };

  return (
    <div>
      {/* FAZ-5.D2.3: Preview Frame - UI card context (250x250), owns layout only */}
      {/* FAZ-5.D2.3: Removed backgroundColor to fix square leak - frame should not have background */}
      <div
        ref={containerRef}
        tabIndex={overlayElements && overlayElements.length > 0 ? 0 : undefined}
        className="preview-frame"
        onPointerMove={handleOverlayElementPointerMove}
        onPointerUp={(e) => {
          handleOverlayElementPointerUp(e);
        }}
        onKeyDown={handleKeyDown}
        onClick={(e) => {
          // Click outside overlay elements deselects
          if (onOverlayElementSelect && !(e.target as HTMLElement).closest('.render-overlay-element')) {
            onOverlayElementSelect(null);
          }
        }}
      >
        {/* FAZ-5.D2.3: Preview Viewport - Physical visibility boundary (640x640 circular) */}
        {/* Clips ALL content, invisible boundary */}
        {/* Dynamic transform remains inline (computed previewScale) */}
        <div
          className="preview-viewport"
          style={{
            transform: `scale(${previewScale})`,
          }}
        >
          {/* FAZ-5.C3: Background render (conditional, UI-only) */}
          {/* Background is rendered only when showBackground is true */}
          {/* Background opacity is applied only to background container, not overlay elements */}
          {showBackground && (
            <div
              className="render-background render-background-circle"
              style={{
                ...backgroundStyle,
                width: `${lcdViewport.width}px`,
                height: `${lcdViewport.height}px`,
                borderRadius: '50%',
                boxSizing: 'border-box',
                position: 'absolute',
                inset: 0,
                opacity: backgroundOpacity,
                pointerEvents: 'none', // Background does not interfere with overlay interactions
                zIndex: 0, // Background behind overlay elements
              }}
            >
            {/* FAZ-5.C3: Media overlay render (if present) */}
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
                        YouTube
                      </div>
                    </div>
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
            </div>
          )}

          {/* FAZ-5.C1.1.2: Overlay interaction layer - inside clipping container */}
          {/* This layer is the positioning reference for overlay elements */}
          {/* Positioned absolutely, sized to LCD viewport (640x640) to match render math coordinate system */}
          {/* Overlay elements render here, using the same coordinate system as render math (LCD viewport) */}
          {overlayElements && overlayElements.length > 0 ? (
            <div
              className="overlay-interaction-layer"
              style={{
                position: 'absolute',
                inset: 0,
                width: `${lcdViewport.width}px`,
                height: `${lcdViewport.height}px`,
                pointerEvents: 'auto',
                zIndex: 1, // Overlay elements above background
              }}
            >
            <div 
              className="render-overlay"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
              }}
            >
              {overlayElements.map((element) => {
                const elementStyle = renderOverlayElement(element, lcdViewport);
                if (!elementStyle) {
                  return null;
                }

                const isSelected = selectedOverlayElementId === element.id;
                const contract = getElementContract(element.elementType);

                return (
                  <div
                    key={element.id}
                    className={`render-overlay-element render-overlay-${element.elementType} ${isSelected ? 'render-overlay-element-selected' : ''}`}
                    style={{
                      ...elementStyle,
                      cursor: isSelected ? 'move' : 'pointer',
                      pointerEvents: 'auto',
                    }}
                    onClick={(e) => handleOverlayElementClick(e, element.id)}
                    onPointerDown={(e) => handleOverlayElementPointerDown(e, element.id)}
                    onWheel={(e) => {
                      if (isSelected) {
                        handleOverlayElementWheel(e, element.id);
                      }
                    }}
                  >
                    {/* Element-specific content (for TEXT this is the text itself) */}
                    {element.elementType === 'text' && (element.renderData as any)?.content}

                    {/* Element-specific editor overlays */}
                    {isSelected && contract?.renderEditorOverlays?.(element, lcdViewport, {
                      onTransformDelta: onOverlayElementTransformDelta,
                      onRotateDelta: onOverlayElementRotateDelta,
                      onResizeDelta: onOverlayElementResizeDelta,
                      onFontSizeDelta: onOverlayElementFontSizeDelta,
                    })}

                    {/* Generic handles (if any) could go here too, but contract-based is cleaner */}
                  </div>
                );
              })}
            </div>
            </div>
          ) : (
            // Empty state: show nothing or a placeholder
            <div
              className="overlay-interaction-layer"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666666',
                fontSize: '12px',
                pointerEvents: 'none',
              }}
            >
              No overlay elements
            </div>
          )}
        </div>

        {/* FAZ-5.E1.1: preview-border element removed - border visuals not needed for Overlay Preview */}
        {/* FAZ-5.E1.4: Background controls moved to OverlaySettingsPanel */}
      </div>
    </div>
  );
}

