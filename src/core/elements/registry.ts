import type { OverlayElementType } from '../overlay/overlay.types';

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
}

const elementRegistry = new Map<OverlayElementType, ElementContract>();

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
