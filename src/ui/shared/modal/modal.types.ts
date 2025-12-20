// Modal system core types.
// This file must not import any UI components.

import type { TranslationKey } from '../../../i18n';
import type { BackgroundMediaOverlayConfig } from '../../../core/background/media-overlay/media-overlay.types';

/**
 * All supported modal types.
 */
export type ModalType =
  | 'GENERIC'
  | 'PRESET_DELETE_CONFIRM'
  | 'PRESET_IMPORT_CONFLICT'
  | 'PRESET_RENAME'
  | 'PRESET_EXPORT'
  | 'PRESET_CREATE'
  | 'BACKGROUND_MEDIA'
  | 'BACKGROUND_MEDIA_REMOVE_CONFIRM';

/**
 * Strongly-typed payloads for each modal type.
 *
 * New modal types should extend this map so that
 * `openModal` calls remain type-safe.
 *
 * Modal payloads contain only primitive data + callbacks.
 * No storage state or Preset objects are passed directly.
 */
export type ModalPayloadMap = {
  GENERIC: {
    /**
     * i18n key for the modal title.
     */
    titleKey: TranslationKey;
    /**
     * Optional i18n key for the modal body content.
     */
    bodyKey?: TranslationKey;
  };
  PRESET_DELETE_CONFIRM: {
    titleKey: TranslationKey;
    bodyKey: TranslationKey;
    confirmLabelKey: TranslationKey;
    cancelLabelKey: TranslationKey;
    presetId: string;
    presetName: string;
    onConfirm: () => void;
    onCancel?: () => void;
  };
  PRESET_IMPORT_CONFLICT: {
    titleKey: TranslationKey;
    bodyKey: TranslationKey;
    confirmOverwriteLabelKey: TranslationKey;
    confirmRenameLabelKey: TranslationKey;
    cancelLabelKey: TranslationKey;
    existingPresetId: string;
    existingPresetName: string;
    importedPresetName: string;
    onOverwrite: () => void;
    onRename: (newName: string) => void;
    onCancel?: () => void;
  };
  PRESET_RENAME: {
    titleKey: TranslationKey;
    bodyKey: TranslationKey;
    confirmLabelKey: TranslationKey;
    cancelLabelKey: TranslationKey;
    presetId: string;
    currentName: string;
    onConfirm: (newName: string) => void;
    onCancel?: () => void;
  };
  PRESET_EXPORT: {
    titleKey: TranslationKey;
    bodyKey: TranslationKey;
    labelKey: TranslationKey;
    confirmLabelKey: TranslationKey;
    cancelLabelKey: TranslationKey;
    defaultName: string;
    onConfirm: (exportName: string) => void;
    onCancel?: () => void;
  };
  PRESET_CREATE: {
    titleKey: TranslationKey;
    bodyKey: TranslationKey;
    labelKey: TranslationKey;
    confirmLabelKey: TranslationKey;
    cancelLabelKey: TranslationKey;
    defaultName: string;
    onConfirm: (presetName: string) => void;
    onCancel?: () => void;
  };
  BACKGROUND_MEDIA: {
    /**
     * i18n key for the modal title.
     */
    titleKey: TranslationKey;
    /**
     * Indicates whether a media overlay already exists on the active preset.
     * Used only for showing replace warnings in the UI.
     */
    hasExistingOverlay: boolean;
    /**
     * Metadata for an existing local overlay (if any), used for duplicate detection.
     */
    existingLocalFileName?: string;
    existingLocalFileSize?: number;
    /**
     * Metadata for an existing URL overlay (if any).
     * FAZ-3B does not special-case this beyond display.
     */
    existingUrl?: string;
    /**
     * Callback invoked when the user confirms a new or updated overlay.
     * Preset mutation and storage writes happen in the caller.
     */
    onApply: (overlay: BackgroundMediaOverlayConfig) => void;
    /**
     * Optional cancel callback.
     */
    onCancel?: () => void;
  };
  BACKGROUND_MEDIA_REMOVE_CONFIRM: {
    titleKey: TranslationKey;
    bodyKey: TranslationKey;
    confirmLabelKey: TranslationKey;
    cancelLabelKey: TranslationKey;
    onConfirm: () => void;
    onCancel?: () => void;
  };
};

/**
 * Internal modal state representation.
 * `type` is `null` when no modal is active.
 */
export interface ModalState<TType extends ModalType = ModalType> {
  type: TType | null;
  /**
   * Modal props are stored as the mapped payload type
   * for the current modal type. When no modal is open,
   * this is `undefined`.
   */
  props: TType extends ModalType ? ModalPayloadMap[TType] | undefined : unknown;
}

