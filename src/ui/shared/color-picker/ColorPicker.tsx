// Unified color and gradient picker component
// Wraps react-best-gradient-color-picker for consistent usage across the app

import React from 'react';
import ColorPickerLib from 'react-best-gradient-color-picker';
import './color-picker.css';

interface ColorPickerProps {
  /**
   * Current color value.
   * Can be rgba(...) for solid colors or linear-gradient(...)/radial-gradient(...) for gradients.
   */
  value: string;
  /**
   * Callback invoked when color changes.
   * Receives the new color string (rgba or gradient format).
   */
  onChange: (value: string) => void;
  /**
   * Hide input type selector.
   * Used for background color picker. Other usages may not need this.
   */
  hideInputType?: boolean;
  /**
   * Width of the color picker canvas.
   * Default: 294
   */
  width?: number;
  /**
   * Height of the color picker canvas.
   * Default: 294
   */
  height?: number;
}

/**
 * Unified color and gradient picker component.
 * Provides full-featured color selection including solid colors and gradients.
 * This component will be reused for background, outline, text, etc. in the future.
 */
export function ColorPicker({ 
  value, 
  onChange, 
  hideInputType = false,
  width = 294,
  height = 150,
}: ColorPickerProps): JSX.Element {
  return (
    <div className="unified-color-picker-wrapper">
      <ColorPickerLib
        value={value}
        onChange={onChange}
        hideInputs={false}
        hideControls={false}
        hidePresets={false}
        hideInputType={hideInputType}
        width={width}
        height={height}
      />
    </div>
  );
}
