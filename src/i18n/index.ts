// Internationalization setup and exports

import React from 'react';
import { en } from './locales/en';
import { tr } from './locales/tr';
import { es } from './locales/es';
import { de } from './locales/de';
import { pt } from './locales/pt';
import { fr } from './locales/fr';
import { it } from './locales/it';
import { ja } from './locales/ja';
import { STORAGE_KEYS } from '../storage/keys';

/**
 * Supported language codes.
 * Must match V1 language order exactly.
 */
export type LanguageCode = 'en' | 'tr' | 'es' | 'de' | 'pt' | 'fr' | 'it' | 'ja';

/**
 * Language metadata for UI display.
 * Order matches V1 exactly.
 */
export const LANGUAGES: ReadonlyArray<{
  code: LanguageCode;
  label: string;
  nativeLabel: string;
}> = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'tr', label: 'Turkish', nativeLabel: 'Türkçe' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português' },
  { code: 'fr', label: 'French', nativeLabel: 'Français' },
  { code: 'it', label: 'Italian', nativeLabel: 'Italiano' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語' },
] as const;

/**
 * Translation keys type.
 * All locale files must have the same keys.
 */
export type TranslationKey = keyof typeof en;

/**
 * Locale data map.
 */
const LOCALES: Record<LanguageCode, Record<string, string>> = {
  en,
  tr,
  es,
  de,
  pt,
  fr,
  it,
  ja,
};

/**
 * Fallback language (English).
 */
const FALLBACK_LANGUAGE: LanguageCode = 'en';

/**
 * Current active language.
 * Initialized from storage or defaults to English.
 */
let currentLanguage: LanguageCode = FALLBACK_LANGUAGE;

/**
 * Language change listeners.
 */
const listeners = new Set<(lang: LanguageCode) => void>();

/**
 * Loads language preference from localStorage.
 */
function loadLanguageFromStorage(): LanguageCode {
  if (typeof window === 'undefined' || !window.localStorage) {
    return FALLBACK_LANGUAGE;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    if (stored && isValidLanguageCode(stored)) {
      return stored as LanguageCode;
    }
  } catch (error) {
    console.error('Failed to load language from storage:', error);
  }

  return FALLBACK_LANGUAGE;
}

/**
 * Saves language preference to localStorage.
 */
function saveLanguageToStorage(lang: LanguageCode): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  } catch (error) {
    console.error('Failed to save language to storage:', error);
  }
}

/**
 * Validates if a string is a valid language code.
 */
function isValidLanguageCode(code: string): code is LanguageCode {
  return LANGUAGES.some((lang) => lang.code === code);
}

/**
 * Initializes i18n system.
 * Loads language from storage and sets current language.
 */
export function initI18n(): void {
  currentLanguage = loadLanguageFromStorage();
}

/**
 * Gets the current active language.
 */
export function getCurrentLanguage(): LanguageCode {
  return currentLanguage;
}

/**
 * Sets the active language.
 * Updates storage and notifies listeners.
 */
export function setLanguage(lang: LanguageCode): void {
  if (!isValidLanguageCode(lang)) {
    console.warn(`Invalid language code: ${lang}, falling back to ${FALLBACK_LANGUAGE}`);
    lang = FALLBACK_LANGUAGE;
  }

  currentLanguage = lang;
  saveLanguageToStorage(lang);

  // Notify all listeners
  listeners.forEach((listener) => listener(lang));
}

/**
 * Subscribes to language changes.
 * Returns unsubscribe function.
 */
export function subscribeToLanguageChanges(
  listener: (lang: LanguageCode) => void
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Translates a key to the current language.
 * Falls back to English if key is missing.
 */
export function t(key: TranslationKey): string {
  const locale = LOCALES[currentLanguage] || LOCALES[FALLBACK_LANGUAGE];
  const translation = locale[key];

  if (translation === undefined) {
    // Fallback to English
    const fallbackTranslation = LOCALES[FALLBACK_LANGUAGE][key];
    if (fallbackTranslation !== undefined) {
      return fallbackTranslation;
    }
    console.warn(`Translation key "${key}" not found in any locale`);
    return key;
  }

  return translation;
}

/**
 * Gets all translations for a specific language.
 * Useful for testing or bulk operations.
 */
export function getTranslations(lang: LanguageCode): Record<string, string> {
  return LOCALES[lang] || LOCALES[FALLBACK_LANGUAGE];
}

/**
 * React hook for translations.
 * Automatically re-renders when language changes.
 */
export function useTranslation(): {
  t: (key: TranslationKey) => string;
  currentLanguage: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  languages: typeof LANGUAGES;
} {
  const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);

  React.useEffect(() => {
    const unsubscribe = subscribeToLanguageChanges(() => {
      forceUpdate();
    });
    return unsubscribe;
  }, []);

  return {
    t,
    currentLanguage: getCurrentLanguage(),
    setLanguage,
    languages: LANGUAGES,
  };
}

// Initialize on module load
initI18n();
