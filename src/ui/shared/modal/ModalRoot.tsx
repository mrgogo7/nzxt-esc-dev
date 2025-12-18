import React from 'react';
import { createPortal } from 'react-dom';
import { useModal } from './modal.context';
import type { ModalPayloadMap, ModalState } from './modal.types';
import { useTranslation } from '../../../i18n';
import '../../../styles/modal.css';

/**
 * Resolves the rendered content for the current modal state.
 * This function is the single place where modal type → UI
 * mapping is defined.
 * 
 * Note: This function does NOT use hooks. State management
 * for modals (like rename input) must happen in ModalRoot.
 */
function renderModalContent(
  state: ModalState,
  t: (key: string) => string,
  closeModal: () => void,
  renameValue?: string,
  setRenameValue?: (value: string) => void
): JSX.Element | null {
  if (!state.type || !state.props) {
    return null;
  }

  switch (state.type) {
    case 'GENERIC': {
      const props = state.props as ModalPayloadMap['GENERIC'];
      return (
        <>
          <div className="modal-header">
            <h2>{t(props.titleKey)}</h2>
          </div>
          <div className="modal-body">
            {props.bodyKey && <p>{t(props.bodyKey)}</p>}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="modal-close-button"
              onClick={closeModal}
            >
              {t('modalClose')}
            </button>
          </div>
        </>
      );
    }

    case 'PRESET_DELETE_CONFIRM': {
      const props = state.props as ModalPayloadMap['PRESET_DELETE_CONFIRM'];
      const bodyText = t(props.bodyKey).replace('{presetName}', props.presetName);
      return (
        <>
          <div className="modal-header">
            <h2>{t(props.titleKey)}</h2>
          </div>
          <div className="modal-body">
            <p>{bodyText}</p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="modal-button modal-button-secondary"
              onClick={() => {
                props.onCancel?.();
                closeModal();
              }}
            >
              {t(props.cancelLabelKey)}
            </button>
            <button
              type="button"
              className="modal-button modal-button-primary"
              onClick={() => {
                props.onConfirm();
                closeModal();
              }}
            >
              {t(props.confirmLabelKey)}
            </button>
          </div>
        </>
      );
    }

    case 'PRESET_IMPORT_CONFLICT': {
      const props = state.props as ModalPayloadMap['PRESET_IMPORT_CONFLICT'];
      const bodyText = t(props.bodyKey).replace('{importedPresetName}', props.importedPresetName);
      const currentRenameValue = renameValue ?? props.importedPresetName;

      return (
        <>
          <div className="modal-header">
            <h2>{t(props.titleKey)}</h2>
          </div>
          <div className="modal-body">
            <p>{bodyText}</p>
            <div className="modal-input-group">
              <label htmlFor="preset-rename-input">
                {t('presetImportConflictRenameLabel')}
              </label>
              <input
                id="preset-rename-input"
                type="text"
                value={currentRenameValue}
                onChange={(e) => setRenameValue?.(e.target.value)}
                className="modal-input"
                autoFocus
              />
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="modal-button modal-button-secondary"
              onClick={() => {
                props.onCancel?.();
                closeModal();
              }}
            >
              {t(props.cancelLabelKey)}
            </button>
            <button
              type="button"
              className="modal-button modal-button-secondary"
              onClick={() => {
                props.onRename(currentRenameValue.trim() || props.importedPresetName);
                closeModal();
              }}
            >
              {t(props.confirmRenameLabelKey)}
            </button>
            <button
              type="button"
              className="modal-button modal-button-primary"
              onClick={() => {
                props.onOverwrite();
                closeModal();
              }}
            >
              {t(props.confirmOverwriteLabelKey)}
            </button>
          </div>
        </>
      );
    }

    case 'PRESET_RENAME': {
      const props = state.props as ModalPayloadMap['PRESET_RENAME'];
      const bodyText = t(props.bodyKey);
      const currentRenameValue = renameValue ?? props.currentName;

      return (
        <>
          <div className="modal-header">
            <h2>{t(props.titleKey)}</h2>
          </div>
          <div className="modal-body">
            <p>{bodyText}</p>
            <div className="modal-input-group">
              <label htmlFor="preset-rename-input">
                {t('presetImportConflictRenameLabel')}
              </label>
              <input
                id="preset-rename-input"
                type="text"
                value={currentRenameValue}
                onChange={(e) => setRenameValue?.(e.target.value)}
                className="modal-input"
                autoFocus
              />
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="modal-button modal-button-secondary"
              onClick={() => {
                props.onCancel?.();
                closeModal();
              }}
            >
              {t(props.cancelLabelKey)}
            </button>
            <button
              type="button"
              className="modal-button modal-button-primary"
              onClick={() => {
                props.onConfirm(currentRenameValue.trim() || props.currentName);
                closeModal();
              }}
            >
              {t(props.confirmLabelKey)}
            </button>
          </div>
        </>
      );
    }

    case 'PRESET_EXPORT': {
      const props = state.props as ModalPayloadMap['PRESET_EXPORT'];
      const bodyText = t(props.bodyKey);
      const currentExportValue = renameValue ?? props.defaultName;

      return (
        <>
          <div className="modal-header">
            <h2>{t(props.titleKey)}</h2>
          </div>
          <div className="modal-body">
            <p>{bodyText}</p>
            <div className="modal-input-group">
              <label htmlFor="preset-export-input">
                {t(props.labelKey)}
              </label>
              <input
                id="preset-export-input"
                type="text"
                value={currentExportValue}
                onChange={(e) => setRenameValue?.(e.target.value)}
                className="modal-input"
                autoFocus
              />
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="modal-button modal-button-secondary"
              onClick={() => {
                props.onCancel?.();
                closeModal();
              }}
            >
              {t(props.cancelLabelKey)}
            </button>
            <button
              type="button"
              className="modal-button modal-button-primary"
              onClick={() => {
                props.onConfirm(currentExportValue.trim() || props.defaultName);
                closeModal();
              }}
            >
              {t(props.confirmLabelKey)}
            </button>
          </div>
        </>
      );
    }

    case 'PRESET_CREATE': {
      const props = state.props as ModalPayloadMap['PRESET_CREATE'];
      const bodyText = t(props.bodyKey);
      const currentCreateValue = renameValue ?? props.defaultName;

      return (
        <>
          <div className="modal-header">
            <h2>{t(props.titleKey)}</h2>
          </div>
          <div className="modal-body">
            <p>{bodyText}</p>
            <div className="modal-input-group">
              <label htmlFor="preset-create-input">
                {t(props.labelKey)}
              </label>
              <input
                id="preset-create-input"
                type="text"
                value={currentCreateValue}
                onChange={(e) => setRenameValue?.(e.target.value)}
                className="modal-input"
                autoFocus
              />
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="modal-button modal-button-secondary"
              onClick={() => {
                props.onCancel?.();
                closeModal();
              }}
            >
              {t(props.cancelLabelKey)}
            </button>
            <button
              type="button"
              className="modal-button modal-button-primary"
              onClick={() => {
                props.onConfirm(currentCreateValue.trim() || props.defaultName);
                closeModal();
              }}
            >
              {t(props.confirmLabelKey)}
            </button>
          </div>
        </>
      );
    }

    default:
      return null;
  }
}

/**
 * Global modal root.
 *
 * Handles:
 * - Backdrop rendering
 * - ESC key to close
 * - Click-outside to close
 * - Portal mounting into document.body
 */
export function ModalRoot(): JSX.Element | null {
  const { state, closeModal } = useModal();
  const { t } = useTranslation();

  // State for rename input (used for PRESET_IMPORT_CONFLICT and PRESET_RENAME modals)
  const [renameValue, setRenameValue] = React.useState<string>('');

  // Reset rename value when modal opens/closes
  React.useEffect(() => {
    if (!state.type || !state.props) {
      setRenameValue('');
      return;
    }

    if (state.type === 'PRESET_IMPORT_CONFLICT') {
      const props = state.props as ModalPayloadMap['PRESET_IMPORT_CONFLICT'];
      setRenameValue(props.importedPresetName);
      return;
    }

    if (state.type === 'PRESET_RENAME') {
      const props = state.props as ModalPayloadMap['PRESET_RENAME'];
      setRenameValue(props.currentName);
      return;
    }

    if (state.type === 'PRESET_EXPORT') {
      const props = state.props as ModalPayloadMap['PRESET_EXPORT'];
      setRenameValue(props.defaultName);
      return;
    }

    if (state.type === 'PRESET_CREATE') {
      const props = state.props as ModalPayloadMap['PRESET_CREATE'];
      setRenameValue(props.defaultName);
      return;
    }

    setRenameValue('');
  }, [state.type, state.props]);

  const handleKeyDown = React.useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeModal();
      }
    },
    [closeModal]
  );

  React.useEffect(() => {
    if (!state.type) {
      return;
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [state.type, handleKeyDown]);

  const handleBackdropClick: React.MouseEventHandler<HTMLDivElement> =
    (event) => {
      if (event.target === event.currentTarget) {
        closeModal();
      }
    };

  // Do not render anything when there is no active modal.
  if (!state.type) {
    return null;
  }

  if (typeof document === 'undefined') {
    return null;
  }

  const content = renderModalContent(state, t, closeModal, renameValue, setRenameValue);

  if (!content) {
    return null;
  }

  // Determine aria-label from modal type
  let ariaLabel = '';
  if (state.type === 'PRESET_DELETE_CONFIRM') {
    const props = state.props as ModalPayloadMap['PRESET_DELETE_CONFIRM'];
    ariaLabel = t(props.titleKey);
  } else if (state.type === 'PRESET_IMPORT_CONFLICT') {
    const props = state.props as ModalPayloadMap['PRESET_IMPORT_CONFLICT'];
    ariaLabel = t(props.titleKey);
  } else if (state.type === 'PRESET_RENAME') {
    const props = state.props as ModalPayloadMap['PRESET_RENAME'];
    ariaLabel = t(props.titleKey);
  } else if (state.type === 'PRESET_EXPORT') {
    const props = state.props as ModalPayloadMap['PRESET_EXPORT'];
    ariaLabel = t(props.titleKey);
  } else if (state.type === 'PRESET_CREATE') {
    const props = state.props as ModalPayloadMap['PRESET_CREATE'];
    ariaLabel = t(props.titleKey);
  } else if (state.type === 'GENERIC') {
    const props = state.props as ModalPayloadMap['GENERIC'];
    ariaLabel = t(props.titleKey);
  }

  return createPortal(
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={handleBackdropClick}
    >
      <div
        className="modal-container"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {content}
      </div>
    </div>,
    document.body
  );
}

