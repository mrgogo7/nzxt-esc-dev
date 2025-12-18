// Background settings panel component

import React, { useState } from 'react';
import { useTranslation } from '../../../i18n';
import { ColorPicker } from '../../shared/color-picker';
import { Drawer } from '../../shared/drawer';
import '../../shared/drawer/drawer.css';

interface BackgroundSettingsPanelProps {
  color: string;
  onColorChange: (color: string) => void;
}

export function BackgroundSettingsPanel({
  color,
  onColorChange,
}: BackgroundSettingsPanelProps): JSX.Element {
  const { t } = useTranslation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

