// Color background validation logic

import type { ColorBackgroundConfig } from './color.types';

/**
 * Validates a hex color string (format: #RRGGBB).
 * Returns true if valid, false otherwise.
 */
export function isValidHexColor(color: string): boolean {
  if (typeof color !== 'string') {
    return false;
  }
  
  const hexPattern = /^#[0-9A-Fa-f]{6}$/;
  return hexPattern.test(color);
}

/**
 * Validates a color background configuration.
 * Returns true if valid, false otherwise.
 */
export function validateColorBackground(config: unknown): config is ColorBackgroundConfig {
  if (!config || typeof config !== 'object') {
    return false;
  }
  
  const c = config as Partial<ColorBackgroundConfig>;
  
  if (c.sourceType !== 'color') {
    return false;
  }
  
  if (typeof c.color !== 'string') {
    return false;
  }
  
  return isValidHexColor(c.color);
}

/**
 * Normalizes a color value to hex format.
 * Accepts hex strings and converts to uppercase #RRGGBB format.
 */
export function normalizeColor(color: string): string {
  if (isValidHexColor(color)) {
    return color.toUpperCase();
  }
  
  return '#000000';
}

