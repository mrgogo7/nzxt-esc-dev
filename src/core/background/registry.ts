// Background type registry and factory

import type { BaseBackgroundConfig } from './base/background.base.types';
import { colorBackgroundContract } from './color/color.contract';

/**
 * Background contract registry.
 * Maps source types to their contract implementations.
 */
export const backgroundRegistry = {
  color: colorBackgroundContract,
} as const;

/**
 * Gets the contract for a given background source type.
 */
export function getBackgroundContract<T extends BaseBackgroundConfig>(
  sourceType: T['sourceType']
): typeof backgroundRegistry[T['sourceType']] | undefined {
  return backgroundRegistry[sourceType as keyof typeof backgroundRegistry] as
    | typeof backgroundRegistry[T['sourceType']]
    | undefined;
}
