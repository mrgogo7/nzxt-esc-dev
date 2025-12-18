// Configuration Browser header component

import { LanguageSelector } from './LanguageSelector';
import { FavoritePresetDropdown } from '../header/FavoritePresetDropdown';
import { useTranslation } from '../../../i18n';
import type { Preset } from '../../../core/preset/preset.types';

interface ConfigHeaderProps {
  onPresetManagerClick: () => void;
  /**
   * Callback invoked when a favorite preset is applied via dropdown.
   * Same signature as PresetManagerPanel's onPresetApplied.
   */
  onPresetApplied: (preset: Preset) => void;
}

/**
 * Header component for Configuration Browser.
 * Contains language selector, Preset Manager button, and Favorite Preset dropdown.
 * Matches V1 layout and styling.
 */
export function ConfigHeader({ onPresetManagerClick, onPresetApplied }: ConfigHeaderProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <header className="config-header">
      <div className="config-header-content">
        <div className="config-header-preset-controls">
          <FavoritePresetDropdown
            onPresetManagerClick={onPresetManagerClick}
            onPresetApplied={onPresetApplied}
          />
        </div>
        <LanguageSelector />
      </div>
    </header>
  );
}
