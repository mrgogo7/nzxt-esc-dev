/**
 * Math utilities for consistent rounding and coordinate transformations.
 */

/**
 * Rounds a number to a specified number of decimal places.
 * Default is 2 decimal places.
 */
export function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Rounds all numeric values in an object to a specified number of decimal places.
 */
export function roundObject<T extends object>(obj: T, decimals: number = 2): T {
  const result = { ...obj } as any;
  for (const key in result) {
    if (typeof result[key] === 'number') {
      result[key] = round(result[key], decimals);
    }
  }
  return result;
}
