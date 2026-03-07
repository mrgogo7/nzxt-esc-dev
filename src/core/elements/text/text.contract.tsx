import type { TextElementConfig, TextElementConfigComplete } from './text.types';
import type { BaseElementTransform } from '../base/element.transform.types';
import { normalizeTextElement } from './text.defaults';
import type { ElementContract, CSSStyleProperties, ElementInteractionHandlers } from '../registry';
import type { OverlayElementRenderModel, TextElementRenderData } from '../../overlay/overlay.types';
import type { ViewportDimensions } from '../../../render/viewport';

export const textElementContract: ElementContract<TextElementConfigComplete, TextElementRenderData> = {
  elementType: 'text',

  validate(element: unknown): element is TextElementConfigComplete {
    if (!element || typeof element !== 'object') {
      return false;
    }

    const e = element as Partial<TextElementConfigComplete>;

    if (e.elementType !== 'text') {
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

    const c = e.config as Partial<TextElementConfig>;
    if (
      typeof c.content !== 'string' ||
      typeof c.color !== 'string' ||
      c.color.length === 0 ||
      typeof c.fontSize !== 'number' ||
      !Number.isFinite(c.fontSize) ||
      c.fontSize <= 0
    ) {
      return false;
    }

    if (c.fontFamily !== undefined && typeof c.fontFamily !== 'string') {
      return false;
    }
    if (c.outlineWidth !== undefined && (typeof c.outlineWidth !== 'number' || !Number.isFinite(c.outlineWidth) || c.outlineWidth < 0)) {
      return false;
    }
    if (c.outlineColor !== undefined && (typeof c.outlineColor !== 'string' || c.outlineColor.length === 0)) {
      return false;
    }

    return true;
  },

  normalize(element: Partial<TextElementConfigComplete> | undefined): TextElementConfigComplete | null {
    return normalizeTextElement(element);
  },

  toRenderData(element: TextElementConfigComplete): TextElementRenderData {
    return {
      content: element.config.content,
      color: element.config.color,
      fontSize: element.config.fontSize,
      fontFamily: element.config.fontFamily,
      outlineWidth: element.config.outlineWidth,
      outlineColor: element.config.outlineColor,
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

    const renderData = element.renderData as TextElementRenderData;
    if (!renderData) return null;

    const textStyle: CSSStyleProperties = {
      fontSize: `${renderData.fontSize}px`,
      color: renderData.color,
      fontFamily: renderData.fontFamily || 'nzxt-extrabold',
      fontWeight: 800,
      fontStyle: 'normal',
      whiteSpace: 'nowrap',
      userSelect: 'none',
      pointerEvents: 'none',
    };

    if (renderData.outlineWidth && renderData.outlineWidth > 0 && renderData.outlineColor) {
      textStyle.WebkitTextStroke = `${renderData.outlineWidth}px ${renderData.outlineColor}`;
      textStyle.WebkitTextStrokeWidth = `${renderData.outlineWidth}px`;
      textStyle.WebkitTextStrokeColor = renderData.outlineColor;
    }

    return {
      ...positionStyle,
      ...textStyle,
    };
  },

  renderEditorOverlays(
    _element: OverlayElementRenderModel,
    _viewport: ViewportDimensions,
    handlers: ElementInteractionHandlers
  ): JSX.Element | null {
    return (
      <>
        <div
          className="render-overlay-bounding-box"
          style={{
            position: 'absolute',
            inset: '-6px',
            border: '2px solid #00aaff',
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
            if (handlers.onFontSizeDelta) {
              (e.currentTarget as any)._isResizeHandle = true;
            }
          }}
        />
      </>
    );
  },
};
