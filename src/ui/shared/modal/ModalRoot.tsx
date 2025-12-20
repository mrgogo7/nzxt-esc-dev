import React from 'react';
import { createPortal } from 'react-dom';
import { useModal } from './modal.context';
import type { ModalPayloadMap, ModalState } from './modal.types';
import { useTranslation } from '../../../i18n';
import type { TranslationKey } from '../../../i18n';
import type {
  BackgroundMediaOverlayConfig,
  LocalMediaConfig,
} from '../../../core/background/media-overlay/media-overlay.types';
import { mediaOverlayContract } from '../../../core/background/media-overlay/media-overlay.contract';
import {
  resolveBackgroundMediaFromUrl,
  classifyBackgroundMediaUrl,
  type BackgroundMediaUrlKind,
  ResolveError,
} from '../../../core/background/media-overlay/media-overlay.resolve';
import { FileImage, Link } from 'lucide-react';
import { Alert } from '../alert';
import '../../../styles/modal.css';

type BackgroundMediaInternalState =
  | { phase: 'idle' }
  | { phase: 'selecting'; source: 'local' | 'url' }
  | { phase: 'resolved'; overlay: BackgroundMediaOverlayConfig }
  | { phase: 'error'; message: string };

interface BackgroundMediaSelectedFileInfo {
  name: string;
  size: number;
  type: string;
}

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
  t: (key: TranslationKey) => string,
  closeModal: () => void,
  renameValue?: string,
  setRenameValue?: (value: string) => void,
  backgroundMediaState?: BackgroundMediaInternalState,
  setBackgroundMediaState?: (next: BackgroundMediaInternalState) => void,
  backgroundMediaSource?: 'local' | 'url' | null,
  setBackgroundMediaSource?: (source: 'local' | 'url' | null) => void,
  backgroundMediaUrlInput?: string,
  setBackgroundMediaUrlInput?: (value: string) => void,
  backgroundMediaSelectedFile?: BackgroundMediaSelectedFileInfo | null,
  setBackgroundMediaSelectedFile?: (info: BackgroundMediaSelectedFileInfo | null) => void,
  backgroundMediaUrlKind?: BackgroundMediaUrlKind | null,
  setBackgroundMediaUrlKind?: (kind: BackgroundMediaUrlKind | null) => void,
  isBackgroundMediaResolvingUrl?: boolean,
  setIsBackgroundMediaResolvingUrl?: (value: boolean) => void
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

    case 'BACKGROUND_MEDIA_REMOVE_CONFIRM': {
      const props = state.props as ModalPayloadMap['BACKGROUND_MEDIA_REMOVE_CONFIRM'];
      const bodyText = t(props.bodyKey);

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

    case 'BACKGROUND_MEDIA': {
      const props = state.props as ModalPayloadMap['BACKGROUND_MEDIA'];

      if (
        !backgroundMediaState ||
        !setBackgroundMediaState ||
        !setBackgroundMediaSource ||
        !setBackgroundMediaUrlInput ||
        !setBackgroundMediaSelectedFile ||
        !setBackgroundMediaUrlKind ||
        typeof isBackgroundMediaResolvingUrl !== 'boolean' ||
        !setIsBackgroundMediaResolvingUrl
      ) {
        return null;
      }

      const currentSource = backgroundMediaSource ?? null;
      const urlInput = backgroundMediaUrlInput ?? '';
      const selectedFile = backgroundMediaSelectedFile ?? null;
      const isResolved = backgroundMediaState.phase === 'resolved';
      const hasError = backgroundMediaState.phase === 'error';
      const errorMessage = hasError ? backgroundMediaState.message : '';
      const urlKind = backgroundMediaUrlKind ?? 'unknown';

      let canApply = false;
      if (currentSource === 'local') {
        canApply = isResolved;
      } else if (currentSource === 'url') {
        if (urlKind === 'pinterest') {
          // Pinterest: Apply triggers resolve, so only check if not already resolving and URL is not empty
          canApply = urlInput.trim().length > 0 && !isBackgroundMediaResolvingUrl;
        } else {
          canApply = urlInput.trim().length > 0 && !isBackgroundMediaResolvingUrl;
        }
      }

      const handleSelectSource = (source: 'local' | 'url') => {
        setBackgroundMediaSource(source);
        setBackgroundMediaState({ phase: 'selecting', source });
        setBackgroundMediaUrlInput('');
        setBackgroundMediaSelectedFile(null);
        setBackgroundMediaUrlKind(null);
        setIsBackgroundMediaResolvingUrl(false);
      };

      const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        const file = event.target.files?.[0] ?? null;

        // Allow re-selecting the same input
        event.target.value = '';

        if (!file) {
          if (currentSource) {
            setBackgroundMediaState({ phase: 'selecting', source: currentSource });
          } else {
            setBackgroundMediaState({ phase: 'idle' });
          }
          setBackgroundMediaSelectedFile(null);
          return;
        }

        // Local duplicate detection: same name + same size as existing overlay
        if (
          props.existingLocalFileName &&
          typeof props.existingLocalFileSize === 'number' &&
          file.name === props.existingLocalFileName &&
          file.size === props.existingLocalFileSize
        ) {
          setBackgroundMediaSelectedFile({
            name: file.name,
            size: file.size,
            type: file.type,
          });
          setBackgroundMediaState({
            phase: 'error',
            message: t('backgroundMediaInvalidSource'),
          });
          return;
        }

        const mediaConfig: LocalMediaConfig = {
          type: 'local',
          fileName: file.name,
          fileType: file.type || 'application/octet-stream',
          fileSize: file.size,
          // For FAZ-3B, mediaId is a blob URL treated as an opaque string.
          mediaId: URL.createObjectURL(file),
        };

        try {
          const normalized = mediaOverlayContract.normalize({
            source: 'local',
            media: mediaConfig,
          } as Partial<BackgroundMediaOverlayConfig>);

          if (!mediaOverlayContract.validate(normalized)) {
            setBackgroundMediaSelectedFile({
              name: file.name,
              size: file.size,
              type: file.type,
            });
            setBackgroundMediaState({
              phase: 'error',
              message: t('backgroundMediaInvalidSource'),
            });
            return;
          }

          setBackgroundMediaSelectedFile({
            name: file.name,
            size: file.size,
            type: file.type,
          });
          setBackgroundMediaState({
            phase: 'resolved',
            overlay: normalized,
          });
        } catch {
          setBackgroundMediaSelectedFile({
            name: file.name,
            size: file.size,
            type: file.type,
          });
          setBackgroundMediaState({
            phase: 'error',
            message: t('backgroundMediaInvalidSource'),
          });
        }
      };

      const handleApply = async () => {
        if (currentSource === 'url') {
          const raw = (backgroundMediaUrlInput ?? '').trim();

          if (!raw) {
            setBackgroundMediaState({
              phase: 'error',
              message: t('backgroundMediaInvalidSource'),
            });
            return;
          }

          // Pinterest URLs: resolve on Apply (no separate Resolve button)
          if (urlKind === 'pinterest') {
            setIsBackgroundMediaResolvingUrl(true);
            setBackgroundMediaState({
              phase: 'selecting',
              source: 'url',
            });

            try {
              const overlay = await resolveBackgroundMediaFromUrl(raw);
              setBackgroundMediaState({
                phase: 'resolved',
                overlay,
              });
              props.onApply(overlay);
              closeModal();
            } catch (error: unknown) {
              let messageKey: TranslationKey = 'backgroundMediaInvalidSource';

              if (error instanceof ResolveError) {
                if (error.code === 'PINTEREST_FETCH_FAILED') {
                  messageKey = 'backgroundMediaPinterestFetchFailed';
                } else if (error.code === 'PINTEREST_MEDIA_NOT_FOUND') {
                  messageKey = 'backgroundMediaPinterestNoMedia';
                } else {
                  messageKey = 'backgroundMediaInvalidSource';
                }
              }

              setBackgroundMediaState({
                phase: 'error',
                message: t(messageKey),
              });
            } finally {
              setIsBackgroundMediaResolvingUrl(false);
            }

            return;
          }

          // Direct / YouTube / unknown URLs are resolved on Apply.
          try {
            const overlay = await resolveBackgroundMediaFromUrl(raw);
            props.onApply(overlay);
            closeModal();
          } catch (error: unknown) {
            let messageKey: TranslationKey = 'backgroundMediaInvalidSource';

            if (error instanceof ResolveError) {
              if (error.code === 'PINTEREST_FETCH_FAILED') {
                messageKey = 'backgroundMediaPinterestFetchFailed';
              } else if (error.code === 'PINTEREST_MEDIA_NOT_FOUND') {
                messageKey = 'backgroundMediaPinterestNoMedia';
              } else {
                messageKey = 'backgroundMediaInvalidSource';
              }
            }

            setBackgroundMediaState({
              phase: 'error',
              message: t(messageKey),
            });
          }

          return;
        }

        if (currentSource === 'local') {
          if (!isResolved) {
            return;
          }
          props.onApply(backgroundMediaState.overlay);
          closeModal();
        }
      };

      const handleCancel = () => {
        props.onCancel?.();
        closeModal();
      };

      const isCompact = currentSource !== null;
      const existingSourceType = props.existingLocalFileName ? 'local' : props.existingUrl ? 'url' : null;
      const showLocalReplaceWarning = props.hasExistingOverlay && currentSource === 'local' && selectedFile !== null;
      const showUrlReplaceWarning = props.hasExistingOverlay && currentSource === 'url';

      return (
        <>
          <div className="modal-header">
            <h2>{t(props.titleKey)}</h2>
          </div>
          <div className="modal-body background-media-modal-body">
            {props.hasExistingOverlay && (
              <div className="background-media-modal-current-info">
                <div className="background-media-modal-current-label">
                  Current Background Media: {existingSourceType === 'local' ? 'Local' : 'URL'}
                </div>
                <div className="background-media-modal-current-value">
                  {existingSourceType === 'local' 
                    ? props.existingLocalFileName 
                    : props.existingUrl}
                </div>
              </div>
            )}

            {!props.hasExistingOverlay && currentSource === null && (
              <div className="background-media-modal-empty-instruction">
                {t('backgroundMediaEmptyStateInstruction')}
              </div>
            )}
            
            <div className={`background-media-source-cards ${isCompact ? 'background-media-source-cards--compact' : ''}`}>
              <button
                type="button"
                className={`background-media-source-card ${
                  currentSource === 'local' ? 'background-media-source-card--selected' : ''
                } ${isCompact ? 'background-media-source-card--compact' : ''}`}
                onClick={() => handleSelectSource('local')}
              >
                <FileImage size={isCompact ? 16 : 20} />
                <span>{t('backgroundMediaSourceLocal')}</span>
              </button>
              <button
                type="button"
                className={`background-media-source-card ${
                  currentSource === 'url' ? 'background-media-source-card--selected' : ''
                } ${isCompact ? 'background-media-source-card--compact' : ''}`}
                onClick={() => handleSelectSource('url')}
              >
                <Link size={isCompact ? 16 : 20} />
                <span>{t('backgroundMediaSourceUrl')}</span>
              </button>
            </div>

            {currentSource === 'local' && (
              <div className="background-media-modal-section">
                <div className="background-media-modal-local-description">
                  {t('backgroundMediaLocalBrowseDescription')}
                </div>
                <div className="background-media-modal-file-row">
                  <button
                    type="button"
                    className="background-media-modal-browse-button"
                    onClick={() => {
                      const input = document.getElementById(
                        'background-media-file-input'
                      ) as HTMLInputElement | null;
                      input?.click();
                    }}
                  >
                    {t('backgroundMediaBrowse')}
                  </button>
                  <input
                    id="background-media-file-input"
                    type="file"
                    accept="image/*,video/*"
                    className="background-media-modal-file-input"
                    onChange={handleFileChange}
                  />
                  {selectedFile && (
                    <span className="background-media-modal-file-info">
                      {selectedFile.name}
                    </span>
                  )}
                </div>
                {showLocalReplaceWarning && (
                  <Alert variant="warning">
                    {t('backgroundMediaReplaceWarning')}
                  </Alert>
                )}
              </div>
            )}

            {currentSource === 'url' && (
              <div className="background-media-modal-section">
                <div className="background-media-modal-url-description">
                  {t('backgroundMediaUrlDescription')}
                </div>
                <div className="background-media-modal-url-examples">
                  {t('backgroundMediaUrlExamples')}
                </div>
                <div className="background-media-modal-url-row">
                  <input
                    id="background-media-url-input"
                    type="text"
                    className="modal-input background-media-modal-url-input"
                    value={urlInput}
                    onChange={(event) => {
                      const value = event.target.value;
                      setBackgroundMediaUrlInput(value);
                      setBackgroundMediaUrlKind(classifyBackgroundMediaUrl(value));
                      if (value.trim()) {
                        setBackgroundMediaState({
                          phase: 'selecting',
                          source: 'url',
                        });
                      } else {
                        setBackgroundMediaState({ phase: 'idle' });
                      }
                    }}
                  />
                </div>
                
                {showUrlReplaceWarning && (
                  <Alert variant="warning">
                    {t('backgroundMediaUrlReplaceWarning')}
                  </Alert>
                )}

                {isBackgroundMediaResolvingUrl && (
                  <Alert variant="loading">
                    {t('backgroundMediaResolving')} Please wait
                  </Alert>
                )}

                {hasError && !isBackgroundMediaResolvingUrl && (
                  <Alert variant="warning">
                    {errorMessage || t('backgroundMediaInvalidSource')}
                  </Alert>
                )}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="modal-button modal-button-secondary"
              onClick={handleCancel}
            >
              {t('backgroundMediaCancel')}
            </button>
            <button
              type="button"
              className="modal-button modal-button-primary"
              disabled={!canApply}
              onClick={handleApply}
            >
              {t('backgroundMediaApply')}
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

  // State for background media modal (FAZ-3B, UI-local only)
  const [backgroundMediaState, setBackgroundMediaState] = React.useState<BackgroundMediaInternalState>({
    phase: 'idle',
  });
  const [backgroundMediaSource, setBackgroundMediaSource] = React.useState<'local' | 'url' | null>(
    null
  );
  const [backgroundMediaUrlInput, setBackgroundMediaUrlInput] = React.useState<string>('');
  const [backgroundMediaSelectedFile, setBackgroundMediaSelectedFile] =
    React.useState<BackgroundMediaSelectedFileInfo | null>(null);
  const [backgroundMediaUrlKind, setBackgroundMediaUrlKind] =
    React.useState<BackgroundMediaUrlKind | null>(null);
  const [isBackgroundMediaResolvingUrl, setIsBackgroundMediaResolvingUrl] =
    React.useState<boolean>(false);

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

  // Reset background media modal state whenever it closes or switches to another modal type.
  // Initialize source based on existing overlay if present.
  React.useEffect(() => {
    if (state.type !== 'BACKGROUND_MEDIA' || !state.props) {
      setBackgroundMediaState({ phase: 'idle' });
      setBackgroundMediaSource(null);
      setBackgroundMediaUrlInput('');
      setBackgroundMediaSelectedFile(null);
      setBackgroundMediaUrlKind(null);
      setIsBackgroundMediaResolvingUrl(false);
      return;
    }

    const props = state.props as ModalPayloadMap['BACKGROUND_MEDIA'];
    
    // Initialize source based on existing overlay
    if (props.hasExistingOverlay) {
      if (props.existingLocalFileName) {
        setBackgroundMediaSource('local');
        setBackgroundMediaState({ phase: 'selecting', source: 'local' });
      } else if (props.existingUrl) {
        setBackgroundMediaSource('url');
        setBackgroundMediaUrlInput(props.existingUrl);
        setBackgroundMediaUrlKind(classifyBackgroundMediaUrl(props.existingUrl));
        setBackgroundMediaState({ phase: 'selecting', source: 'url' });
      }
    } else {
      // No existing overlay, start in idle state
      setBackgroundMediaState({ phase: 'idle' });
      setBackgroundMediaSource(null);
      setBackgroundMediaUrlInput('');
      setBackgroundMediaSelectedFile(null);
      setBackgroundMediaUrlKind(null);
      setIsBackgroundMediaResolvingUrl(false);
    }
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

  const content = renderModalContent(
    state,
    t,
    closeModal,
    renameValue,
    setRenameValue,
    backgroundMediaState,
    setBackgroundMediaState,
    backgroundMediaSource,
    setBackgroundMediaSource,
    backgroundMediaUrlInput,
    setBackgroundMediaUrlInput,
    backgroundMediaSelectedFile,
    setBackgroundMediaSelectedFile,
    backgroundMediaUrlKind,
    setBackgroundMediaUrlKind,
    isBackgroundMediaResolvingUrl,
    setIsBackgroundMediaResolvingUrl
  );

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
  } else if (state.type === 'BACKGROUND_MEDIA') {
    const props = state.props as ModalPayloadMap['BACKGROUND_MEDIA'];
    ariaLabel = t(props.titleKey);
  } else if (state.type === 'BACKGROUND_MEDIA_REMOVE_CONFIRM') {
    const props = state.props as ModalPayloadMap['BACKGROUND_MEDIA_REMOVE_CONFIRM'];
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

