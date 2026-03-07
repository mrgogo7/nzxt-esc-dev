import type { OverlayElementType, OverlayElementRenderModel } from '../overlay/overlay.types';
import type { ViewportDimensions } from '../../render/viewport';

/**
 * CSS style properties for rendering.
 */
export interface CSSStyleProperties {
  [key: string]: string | number | undefined;
}

/**
 * Interaction handlers for an element.
 */
export interface ElementInteractionHandlers {
  onTransformDelta?: (elementId: string, deltaX: number, deltaY: number) => void;
  onRotateDelta?: (elementId: string, deltaDeg: number) => void;
  onResizeDelta?: (elementId: string, deltaX: number, deltaY: number) => void;
  onFontSizeDelta?: (elementId: string, fontSizeDelta: number) => void;
}

/**
 * Common interface for all element contracts.
 * This enables polymorphic handling of different element types.
 */
export interface ElementContract<TElement = any, TRenderData = any> {
  /**
   * The type of element this contract handles.
   */
  elementType: OverlayElementType;

  /**
   * Full validation of the element structure and semantics.
   */
  validate(element: unknown): element is TElement;

  /**
   * Normalizes partial data into a complete element config.
   */
  normalize(element: Partial<TElement> | undefined): TElement | null;

  /**
   * Resolves the complete config into render-ready data.
   */
  toRenderData(element: TElement): TRenderData;

  /**
   * Renders the element to CSS styles.
   */
  render(element: OverlayElementRenderModel, viewport: ViewportDimensions): CSSStyleProperties | null;

  /**
   * Renders any element-specific editor overlays (handles, etc.).
   */
  renderEditorOverlays?(
    element: OverlayElementRenderModel,
    viewport: ViewportDimensions,
    handlers: ElementInteractionHandlers
  ): JSX.Element | null;
}

import { textElementContract } from './text/text.contract.tsx';
import { shapeElementContract } from './shape/shape.contract.tsx';

const elementRegistry = new Map<OverlayElementType, ElementContract>();

// Register core elements
registerElement(textElementContract);
registerElement(shapeElementContract);

/**
 * Registers an element contract.
 */
export function registerElement(contract: ElementContract): void {
  elementRegistry.set(contract.elementType, contract);
}

/**
 * Retrieves an element contract by type.
 */
export function getElementContract(type: OverlayElementType): ElementContract | undefined {
  return elementRegistry.get(type);
}

/**
 * Retrieves all registered element types.
 */
export function getRegisteredElementTypes(): OverlayElementType[] {
  return Array.from(elementRegistry.keys());
}
