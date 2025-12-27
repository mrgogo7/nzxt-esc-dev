// Unified color and gradient picker component
// Wraps react-best-gradient-color-picker for consistent usage across the app

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
  /**
   * Hide color type buttons (solid/gradient toggle).
   * Used for text/outline color pickers (gradient not supported).
   * Default: false
   */
  hideColorTypeBtns?: boolean;
  /**
   * Hide gradient type selector (linear/radial).
   * Used for text/outline color pickers (gradient not supported).
   * Default: false
   */
  hideGradientType?: boolean;
  /**
   * Hide gradient angle control.
   * Used for text/outline color pickers (gradient not supported).
   * Default: false
   */
  hideGradientAngle?: boolean;
  /**
   * Hide gradient stop controls.
   * Used for text/outline color pickers (gradient not supported).
   * Default: false
   */
  hideGradientStop?: boolean;
  /**
   * Hide gradient controls (all gradient-related UI).
   * Used for text/outline color pickers (gradient not supported).
   * Default: false
   */
  hideGradientControls?: boolean;
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
  hideColorTypeBtns = false,
  hideGradientType = false,
  hideGradientAngle = false,
  hideGradientStop = false,
  hideGradientControls = false,
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
        hideColorTypeBtns={hideColorTypeBtns}
        hideGradientType={hideGradientType}
        hideGradientAngle={hideGradientAngle}
        hideGradientStop={hideGradientStop}
        hideGradientControls={hideGradientControls}
        width={width}
        height={height}
      />
    </div>
  );
}
