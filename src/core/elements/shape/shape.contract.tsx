import type { ShapeElementConfig, ShapeElementConfigComplete } from './shape.types';
import type { BaseElementTransform } from '../base/element.transform.types';
import { normalizeShapeElement } from './shape.defaults';
import type { ElementContract, CSSStyleProperties, ElementInteractionHandlers } from '../registry';
import type { OverlayElementRenderModel, ShapeElementRenderData } from '../../overlay/overlay.types';
import type { ViewportDimensions } from '../../../render/viewport';

export const shapeElementContract: ElementContract<ShapeElementConfigComplete, ShapeElementRenderData> = {
  elementType: 'shape',

  validate(element: unknown): element is ShapeElementConfigComplete {
    if (!element || typeof element !== 'object') {
      return false;
    }

    const e = element as Partial<ShapeElementConfigComplete>;

    if (e.elementType !== 'shape') {
      return false;
    }

    if (typeof e.id !== 'string' || e.id.length === 0) {
      return false;
    }

    if (typeof e.typeSeq !== 'number' || !Number.isFinite(e.typeSeq) || e.typeSeq < 0) {
      return false;
    }

    if (!e.transform || typeof e.transform !== 'object') {
      return false;
    }

    const t = e.transform as Partial<BaseElementTransform>;
    if (
      typeof t.x !== 'number' ||
      !Number.isFinite(t.x) ||
      typeof t.y !== 'number' ||
      !Number.isFinite(t.y) ||
      typeof t.rotateDeg !== 'number' ||
      !Number.isFinite(t.rotateDeg)
    ) {
      return false;
    }

    if (!e.config || typeof e.config !== 'object') {
      return false;
    }

    const c = e.config as Partial<ShapeElementConfig>;
    if (
      typeof c.width !== 'number' ||
      !Number.isFinite(c.width) ||
      c.width <= 0 ||
      typeof c.height !== 'number' ||
      !Number.isFinite(c.height) ||
      c.height <= 0 ||
      typeof c.radius !== 'number' ||
      !Number.isFinite(c.radius) ||
      c.radius < 0 ||
      typeof c.fillColor !== 'string' ||
      c.fillColor.length === 0 ||
      typeof c.borderColor !== 'string' ||
      c.borderColor.length === 0
    ) {
      return false;
    }

    return true;
  },

  normalize(element: Partial<ShapeElementConfigComplete> | undefined): ShapeElementConfigComplete | null {
    return normalizeShapeElement(element);
  },

  toRenderData(element: ShapeElementConfigComplete): ShapeElementRenderData {
    return {
      width: element.config.width,
      height: element.config.height,
      radius: element.config.radius,
      fillColor: element.config.fillColor,
      borderColor: element.config.borderColor,
    };
  },

  render(element: OverlayElementRenderModel, viewport: ViewportDimensions): CSSStyleProperties | null {
    const pixelX = element.transform.x * (viewport.width / 2);
    const pixelY = element.transform.y * (viewport.height / 2);

    const positionStyle: CSSStyleProperties = {
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: `translate(${pixelX}px, ${pixelY}px) rotate(${element.transform.rotateDeg}deg)`,
      transformOrigin: 'center center',
    };

    const renderData = element.renderData as ShapeElementRenderData;
    if (!renderData) return null;

    const shapeStyle: CSSStyleProperties = {
      width: `${renderData.width}px`,
      height: `${renderData.height}px`,
      borderRadius: `${renderData.radius}px`,
      backgroundColor: renderData.fillColor,
      border: `1px solid ${renderData.borderColor}`,
      boxSizing: 'border-box',
      userSelect: 'none',
      pointerEvents: 'none',
    };

    return {
      ...positionStyle,
      ...shapeStyle,
    };
  },

  renderEditorOverlays(
    _element: OverlayElementRenderModel,
    _viewport: ViewportDimensions,
    _handlers: ElementInteractionHandlers
  ): JSX.Element | null {
    return (
      <>
        <div
          className="render-overlay-bounding-box"
          style={{
            position: 'absolute',
            inset: '-6px',
            border: '1px solid #00aaff',
            borderRadius: '2px',
            pointerEvents: 'none',
            boxShadow: '0 0 4px rgba(0, 170, 255, 0.5)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: '-32px',
            left: '50%',
            width: '2px',
            height: '26px',
            backgroundColor: '#00aaff',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
          }}
        />

        <div
          className="render-overlay-rotate-handle"
          style={{
            position: 'absolute',
            top: '-44px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '16px',
            height: '16px',
            backgroundColor: '#ffffff',
            border: '2px solid #00aaff',
            borderRadius: '50%',
            cursor: 'crosshair',
            pointerEvents: 'auto',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
        />

        <div
          className="render-overlay-resize-handle"
          style={{
            position: 'absolute',
            bottom: '-12px',
            right: '-12px',
            width: '14px',
            height: '14px',
            backgroundColor: '#ffffff',
            border: '2px solid #00aaff',
            borderRadius: '2px',
            cursor: 'nwse-resize',
            pointerEvents: 'auto',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
        />
      </>
    );
  },
};
