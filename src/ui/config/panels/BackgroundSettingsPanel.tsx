// Background settings panel component

import React, { useState, useCallback, useRef } from 'react';
import { useTranslation } from '../../../i18n';
import { ColorPicker } from '../../shared/color-picker';
import { Drawer } from '../../shared/drawer';
import type { MediaOverlayTransform } from '../../../core/background/media-overlay/media-overlay.types';
import '../../shared/drawer/drawer.css';

interface BackgroundSettingsPanelProps {
  color: string;
  onColorChange: (color: string) => void;
  hasMediaOverlay: boolean;
  onOpenBackgroundMediaModal: () => void;
  onRemoveBackgroundMediaOverlay: () => void;
  transform?: MediaOverlayTransform;
  onTransformChange?: (transform: MediaOverlayTransform) => void;
  showOverlayGuides?: boolean;
  onOverlayGuidesChange?: (show: boolean) => void;
  mediaOverlaySource?: 'local' | 'url' | 'youtube';
}

export function BackgroundSettingsPanel({
  color,
  onColorChange,
  hasMediaOverlay,
  onOpenBackgroundMediaModal,
  onRemoveBackgroundMediaOverlay,
  transform,
  onTransformChange,
  showOverlayGuides = false,
  onOverlayGuidesChange,
  mediaOverlaySource,
}: BackgroundSettingsPanelProps): JSX.Element {
  const { t } = useTranslation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Numeric input with arrow keys and mouse wheel support
  const NumericInput = useCallback(
    ({
      label,
      value,
      onChange,
      onReset,
      min,
      max,
      step = 0.01,
      decimals = 2,
      disabled = false,
    }: {
      label: string;
      value: number;
      onChange: (value: number) => void;
      onReset?: () => void;
      min?: number;
      max?: number;
      step?: number;
      decimals?: number;
      disabled?: boolean;
    }) => {
      const inputRef = useRef<HTMLInputElement>(null);

      const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            const newValue = Math.min(
              max ?? Infinity,
              Math.max(min ?? -Infinity, value + step)
            );
            onChange(newValue);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const newValue = Math.min(
              max ?? Infinity,
              Math.max(min ?? -Infinity, value - step)
            );
            onChange(newValue);
          }
        },
        [value, onChange, min, max, step]
      );

      const handleWheel = useCallback(
        (e: React.WheelEvent<HTMLInputElement>) => {
          if (document.activeElement === inputRef.current) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -step : step;
            const newValue = Math.min(
              max ?? Infinity,
              Math.max(min ?? -Infinity, value + delta)
            );
            onChange(newValue);
          }
        },
        [value, onChange, min, max, step]
      );

      const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
          const numValue = parseFloat(e.target.value);
          if (!isNaN(numValue)) {
            const clamped = Math.min(
              max ?? Infinity,
              Math.max(min ?? -Infinity, numValue)
            );
            onChange(clamped);
          }
        },
        [onChange, min, max]
      );

      return (
        <div className="background-settings-panel-row">
          <label className="background-settings-panel-label">{label}</label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <input
              ref={inputRef}
              type="number"
              value={value.toFixed(decimals)}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onWheel={handleWheel}
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              style={{
                width: '80px',
                padding: '4px 8px',
                backgroundColor: disabled ? '#0f0f0f' : '#1a1a1f',
                border: '1px solid #2a2a2f',
                borderRadius: '4px',
                color: disabled ? '#666' : '#fff',
                fontSize: '14px',
                cursor: disabled ? 'not-allowed' : 'text',
                opacity: disabled ? 0.5 : 1,
              }}
            />
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                style={{
                  padding: '4px 8px',
                  backgroundColor: 'transparent',
                  border: '1px solid #2a2a2f',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
                title={t('backgroundMediaTransformReset')}
              >
                ↺
              </button>
            )}
          </div>
        </div>
      );
    },
    [t]
  );

  // Get preview style for swatch
  // For gradients, use the gradient string directly; for solid colors, use backgroundColor
  const getSwatchStyle = (): React.CSSProperties => {
    if (color.startsWith('linear-gradient(') || color.startsWith('radial-gradient(')) {
      return { background: color };
    }
    // For rgba or hex colors, use backgroundColor
    return { backgroundColor: color || '#000000' };
  };

  return (
    <div className="background-settings-panel">
      <h2 className="background-settings-panel-title">
        {t('backgroundSettingsTitle')}
      </h2>

      <div className="background-settings-panel-content">
        <div className="background-settings-panel-row">
          <label className="background-settings-panel-label">
            {t('backgroundColorLabel')}
          </label>
          <button
            type="button"
            className="background-settings-panel-swatch"
            onClick={() => setIsDrawerOpen(true)}
            style={getSwatchStyle()}
            title={t('backgroundColorLabel')}
            aria-label={t('backgroundColorLabel')}
          />
        </div>
        <div className="background-settings-panel-row">
          <label className="background-settings-panel-label">
            {t('backgroundMediaLabel')}
          </label>
          <div className="background-settings-panel-actions">
            <button
              type="button"
              className="background-settings-panel-button background-settings-panel-button-primary"
              onClick={onOpenBackgroundMediaModal}
            >
              {hasMediaOverlay ? t('backgroundMediaUpdate') : t('backgroundMediaAdd')}
            </button>
            {hasMediaOverlay && (
              <button
                type="button"
                className="background-settings-panel-button background-settings-panel-button-danger"
                onClick={onRemoveBackgroundMediaOverlay}
              >
                {t('backgroundMediaRemove')}
              </button>
            )}
          </div>
        </div>
        {hasMediaOverlay && transform && onTransformChange && (
          <>
            <div
              style={{
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid #2a2a2f',
              }}
            >
              <NumericInput
                label={t('backgroundMediaTransformScale')}
                value={transform.scale}
                onChange={(value) =>
                  onTransformChange({ ...transform, scale: value })
                }
                onReset={() =>
                  // FAZ-4.2.1: Reset scale = 1 (user scale), not autoScale
                  // Autoscale is baked into world dimensions, so reset returns to natural cover state
                  onTransformChange({ ...transform, scale: 1 })
                }
                min={0.01}
                step={0.01}
                decimals={2}
              />
              <div>
                <NumericInput
                  label={t('backgroundMediaTransformRotate')}
                  value={transform.rotateDeg}
                  onChange={(value) =>
                    onTransformChange({ ...transform, rotateDeg: value })
                  }
                  onReset={() =>
                    onTransformChange({ ...transform, rotateDeg: 0 })
                  }
                  min={-180}
                  max={180}
                  step={1}
                  decimals={0}
                  disabled={mediaOverlaySource === 'youtube'}
                />
                {mediaOverlaySource === 'youtube' && (
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#a0a0a0',
                      marginTop: '4px',
                      fontStyle: 'italic',
                    }}
                  >
                    {t('backgroundMediaTransformRotateYoutubeDisabled') || 'Rotation is not supported for YouTube videos'}
                  </div>
                )}
              </div>
              <NumericInput
                label={t('backgroundMediaTransformOffsetX')}
                value={transform.offsetX}
                onChange={(value) =>
                  onTransformChange({ ...transform, offsetX: value })
                }
                onReset={() =>
                  onTransformChange({ ...transform, offsetX: 0 })
                }
                min={-2}
                max={2}
                step={0.01}
                decimals={2}
              />
              <NumericInput
                label={t('backgroundMediaTransformOffsetY')}
                value={transform.offsetY}
                onChange={(value) =>
                  onTransformChange({ ...transform, offsetY: value })
                }
                onReset={() =>
                  onTransformChange({ ...transform, offsetY: 0 })
                }
                min={-2}
                max={2}
                step={0.01}
                decimals={2}
              />
            </div>
            {onOverlayGuidesChange && (
              <div
                className="background-settings-panel-row"
                style={{ marginTop: '16px' }}
              >
                <label className="background-settings-panel-label">
                  {t('backgroundMediaOverlayGuides')}
                </label>
                <input
                  type="checkbox"
                  checked={showOverlayGuides}
                  onChange={(e) => onOverlayGuidesChange(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={t('backgroundColorLabel')}
      >
        <ColorPicker value={color} onChange={onColorChange} hideInputType={true} />
      </Drawer>
    </div>
  );
}

