// Favorite Preset Quick Apply Dropdown component

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../../i18n';
import { loadActivePresetState } from '../../../storage/local';
import type { Preset, ActivePresetState } from '../../../core/preset/preset.types';
import { setActivePreset } from '../../../storage/preset/state';
import { saveActivePresetState } from '../../../storage/local';
import { PresetIcons } from '../../icons';
import { Tooltip } from '../../shared/tooltip';

const DropdownIcon = PresetIcons.dropdown;

interface FavoritePresetDropdownProps {
  /**
   * Callback invoked when Preset Manager button is clicked.
   */
  onPresetManagerClick: () => void;
  /**
   * Callback invoked when a favorite preset is applied.
   * Same signature as PresetManagerPanel's onPresetApplied.
   */
  onPresetApplied: (preset: Preset) => void;
}

/**
 * Dropdown component for quick applying favorite presets.
 * Only shows favorite presets (isFavorite === true).
 * Presets are ordered by the order array from storage.
 * 
 * Behavior:
 * - Dropdown stays open after applying a preset (for quick switching)
 * - Closes only on outside click or ESC key
 * - Active preset is NOT visually marked in the dropdown
 */
export function FavoritePresetDropdown({
  onPresetManagerClick,
  onPresetApplied,
}: FavoritePresetDropdownProps): JSX.Element | null {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [presetState, setPresetState] = useState<ActivePresetState | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Load preset state
  useEffect(() => {
    const state = loadActivePresetState();
    setPresetState(state);
  }, []);

  // Refresh preset state when dropdown opens
  useEffect(() => {
    if (isOpen) {
      const state = loadActivePresetState();
      setPresetState(state);
    }
  }, [isOpen]);

  // Listen for storage changes (when preset is favorited/unfavorited)
  useEffect(() => {
    const handleStorageChange = () => {
      const state = loadActivePresetState();
      setPresetState(state);
    };

    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom event (for same-tab updates)
    window.addEventListener('presetStateChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('presetStateChanged', handleStorageChange);
    };
  }, []);

  // Handle ESC key to close dropdown
  useEffect(() => {
    if (!isOpen) return;

    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen]);

  // Handle click outside to close dropdown
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    // Use capture phase to catch clicks before they bubble
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [isOpen]);

  if (!presetState) {
    return null;
  }

  // Get favorite presets ordered by order array
  const favoritePresets = presetState.order
    .map((presetId) => presetState.presets[presetId])
    .filter((preset): preset is Preset => preset !== undefined && preset.isFavorite === true);

  const handleApply = (presetId: string) => {
    const newState = setActivePreset(presetState, presetId);
    if (newState !== presetState) {
      saveActivePresetState(newState);
      const appliedPreset = newState.presets[presetId];
      if (appliedPreset) {
        onPresetApplied(appliedPreset);
      }
      // Refresh state but keep dropdown open
      setPresetState(newState);
    }
  };

  return (
    <div className="favorite-preset-dropdown-container">
      <Tooltip content={t('tooltip.presetManager')} variant="label" placement="top">
        <button
          ref={buttonRef}
          type="button"
          className="preset-manager-header-button"
          onClick={(e) => {
            const clickedDropdown = (e.target as HTMLElement).closest('.preset-manager-header-button-dropdown');
            if (favoritePresets.length > 0 && clickedDropdown) {
              e.stopPropagation();
              setIsOpen(!isOpen);
            } else {
              onPresetManagerClick();
            }
          }}
        >
          {t('presetManagerButton')}
          {favoritePresets.length > 0 && (
            <span className="preset-manager-header-button-dropdown">
              <DropdownIcon size={12} />
            </span>
          )}
        </button>
      </Tooltip>
      {isOpen && favoritePresets.length > 0 && (
        <div ref={dropdownRef} className="favorite-preset-dropdown-menu">
          {favoritePresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="favorite-preset-dropdown-item"
              onClick={() => handleApply(preset.id)}
            >
              <span className="favorite-preset-dropdown-item-star">⭐</span>
              <span className="favorite-preset-dropdown-item-name">{preset.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
