// Language selector dropdown component

import React from 'react';
import { useTranslation, type LanguageCode } from '../../../i18n';
import { Tooltip } from '../../shared/tooltip';

/**
 * Language selector dropdown component.
 * Displays available languages and allows switching.
 * Matches V1 visual style and behavior.
 */
export function LanguageSelector(): JSX.Element {
  const { currentLanguage, setLanguage, languages } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Close dropdown on ESC key
  React.useEffect(() => {
    function handleEscape(event: KeyboardEvent): void {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  const currentLanguageData = languages.find((lang) => lang.code === currentLanguage);

  const handleLanguageSelect = (code: LanguageCode): void => {
    setLanguage(code);
    setIsOpen(false);
  };

  const { t } = useTranslation();

  return (
    <div className="language-selector" ref={dropdownRef}>
      <Tooltip content={t('tooltip.languageSelector')} variant="label" placement="top">
        <button
          type="button"
          className="language-selector-button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Select language"
        >
          <span className="language-selector-current">
            {currentLanguageData?.nativeLabel || currentLanguageData?.label || 'English'}
          </span>
          <span className="language-selector-arrow">{isOpen ? '▲' : '▼'}</span>
        </button>
      </Tooltip>
      {isOpen && (
        <div className="language-selector-dropdown">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              className={`language-selector-option ${
                lang.code === currentLanguage ? 'language-selector-option-active' : ''
              }`}
              onClick={() => handleLanguageSelect(lang.code)}
            >
              {lang.nativeLabel}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
