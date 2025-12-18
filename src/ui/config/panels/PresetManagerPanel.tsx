// Preset Manager slide-in panel component

import React, { useEffect, useRef } from 'react';
import { useTranslation } from '../../../i18n';
import { loadActivePresetState, saveActivePresetState } from '../../../storage/local';
import type { Preset, ActivePresetState } from '../../../core/preset/preset.types';
import { useModal } from '../../shared/modal/modal.context';
import { createPresetExportMetadata } from '../../../storage/preset/exportPreset';
import { importPresetFromJson } from '../../../storage/preset/importPreset';
import {
  addPreset,
  deletePreset,
  duplicatePreset,
  overwritePresetContent,
  createNewPresetWithDefaultBackground,
  renamePreset,
  setActivePreset,
  reorderPresets,
  togglePresetFavorite,
} from '../../../storage/preset/state';
import { PresetIcons } from '../../icons';
import { Tooltip } from '../../shared/tooltip';
import { usePresetDragOrder } from './preset-order/usePresetDragOrder';

const CheckIcon = PresetIcons.check;

interface PresetManagerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Optional callback invoked when a preset is applied.
   * Allows parent (ConfigApp) to update local render state and
   * publish the new render model without duplicating apply logic.
   */
  onPresetApplied?: (preset: Preset) => void;
}

/**
 * Preset Manager slide-in panel.
 * Opens from the right side of the screen.
 * Displays preset list and management controls.
 */
export function PresetManagerPanel({
  isOpen,
  onClose,
  onPresetApplied,
}: PresetManagerPanelProps): JSX.Element | null {
  const { t } = useTranslation();
  const { openModal } = useModal();
  const panelRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [presetState, setPresetState] = React.useState<ActivePresetState | null>(null);

  // Load preset state when panel opens
  useEffect(() => {
    if (isOpen) {
      const state = loadActivePresetState();
      setPresetState(state);
    }
  }, [isOpen]);

  // Handle ESC key to close panel
  useEffect(() => {
    if (!isOpen) return;

    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  // Handle click outside panel to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        // Check if click is on the backdrop (not on other UI elements)
        const target = e.target as HTMLElement;
        if (target.classList.contains('preset-manager-backdrop')) {
          onClose();
        }
      }
    };

    // Use capture phase to catch clicks before they bubble
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Get presets in order
  const presetsInOrder = presetState
    ? presetState.order.map((id) => presetState.presets[id]).filter((p): p is Preset => p !== undefined)
    : [];
  const activePresetId = presetState?.activePresetId || '';

  // Refresh preset state from storage
  const refreshPresetState = React.useCallback(() => {
    const state = loadActivePresetState();
    setPresetState(state);
  }, []);

  const dragOrder = usePresetDragOrder({
    itemCount: presetsInOrder.length,
    state: presetState,
    onReorder: (fromIndex, toIndex, state) => {
      const newState = reorderPresets(state, fromIndex, toIndex);
      if (newState !== state) {
        saveActivePresetState(newState);
        refreshPresetState();
      }
    },
  });

  // Export handler: open export name modal for active preset
  const handleExport = React.useCallback(() => {
    if (!presetState) return;

    const activePreset = presetState.presets[activePresetId];
    if (!activePreset) return;

    openModal({
      type: 'PRESET_EXPORT',
      props: {
        titleKey: 'presetExportTitle',
        bodyKey: 'presetExportBody',
        labelKey: 'presetExportLabel',
        confirmLabelKey: 'presetExportConfirm',
        cancelLabelKey: 'presetExportCancel',
        defaultName: activePreset.name,
        onConfirm: (exportName: string) => {
          const exportMeta = createPresetExportMetadata(activePreset);
          const baseName = exportName.trim() || activePreset.name;
          const safeName =
            baseName
              .replace(/[<>:\"/\\|?*]/g, '_')
              .replace(/\s+/g, '_')
              .trim() || 'preset';

          const filename = `${safeName}.nzxtesc-preset`;

          const blob = new Blob([exportMeta.content], {
            type: exportMeta.mimeType,
          });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        },
      },
    });
  }, [activePresetId, openModal, presetState]);

  // Import handler: trigger file input
  const handleImport = React.useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // File input change handler
  const handleFileChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Read file as text
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text !== 'string') return;

        // Import preset
        const result = importPresetFromJson(text);

        if (result.kind === 'invalidFormat') {
          alert(t('presetImportErrorInvalidFile'));
          return;
        }

        if (result.kind === 'unsupportedSchema') {
          alert(t('presetImportErrorUnsupportedVersion'));
          return;
        }

        if (!presetState) return;

        // Check for name conflict
        const existingPreset = Object.values(presetState.presets).find(
          (p) => p.name === result.preset.name
        );

        if (existingPreset) {
          // Open conflict modal
          openModal({
            type: 'PRESET_IMPORT_CONFLICT',
            props: {
              titleKey: 'presetImportConflictTitle',
              bodyKey: 'presetImportConflictBody',
              confirmOverwriteLabelKey: 'presetImportConflictOverwrite',
              confirmRenameLabelKey: 'presetImportConflictRename',
              cancelLabelKey: 'presetImportConflictCancel',
              existingPresetId: existingPreset.id,
              existingPresetName: existingPreset.name,
              importedPresetName: result.preset.name,
              onOverwrite: () => {
                const newState = overwritePresetContent(presetState, existingPreset.id, result.preset);
                if (newState) {
                  saveActivePresetState(newState);
                  refreshPresetState();
                }
              },
              onRename: (newName: string) => {
                const renamedPreset = { ...result.preset, name: newName.trim() || result.preset.name };
                const newState = addPreset(presetState, renamedPreset);
                saveActivePresetState(newState);
                refreshPresetState();
              },
            },
          });
        } else {
          // No conflict: add preset
          const newState = addPreset(presetState, result.preset);
          saveActivePresetState(newState);
          refreshPresetState();
        }
      };

      reader.readAsText(file);
    },
    [presetState, t, openModal, refreshPresetState]
  );

  // Delete handler
  const handleDelete = React.useCallback(
    (presetId: string, presetName: string) => {
      if (!presetState) return;

      const preset = presetState.presets[presetId];
      if (!preset) return;

      // Cannot delete default preset
      if (preset.isDefault === true) {
        return; // Silently ignore (or could show a message)
      }

      openModal({
        type: 'PRESET_DELETE_CONFIRM',
        props: {
          titleKey: 'presetDeleteConfirmTitle',
          bodyKey: 'presetDeleteConfirmBody',
          confirmLabelKey: 'presetDeleteConfirmConfirm',
          cancelLabelKey: 'presetDeleteConfirmCancel',
          presetId,
          presetName,
          onConfirm: () => {
            const newState = deletePreset(presetState, presetId);
            if (newState) {
              saveActivePresetState(newState);
              refreshPresetState();
            }
          },
        },
      });
    },
    [presetState, openModal, refreshPresetState]
  );

  // Duplicate handler
  const handleDuplicate = React.useCallback(
    (presetId: string) => {
      if (!presetState) return;

      const result = duplicatePreset(presetState, presetId);
      if (result) {
        saveActivePresetState(result.state);
        refreshPresetState();
      }
    },
    [presetState, refreshPresetState]
  );

  // Create preset handler: open create name modal
  const handleCreatePreset = React.useCallback(() => {
    if (!presetState) {
      return;
    }

    openModal({
      type: 'PRESET_CREATE',
      props: {
        titleKey: 'presetCreateTitle',
        bodyKey: 'presetCreateBody',
        labelKey: 'presetCreateLabel',
        confirmLabelKey: 'presetCreateConfirm',
        cancelLabelKey: 'presetCreateCancel',
        defaultName: 'New Preset',
        onConfirm: (presetName: string) => {
          const trimmedName = presetName.trim() || 'New Preset';
          const newPreset = createNewPresetWithDefaultBackground(trimmedName);
          const newState = addPreset(presetState, newPreset);
          saveActivePresetState(newState);
          refreshPresetState();
        },
      },
    });
  }, [openModal, presetState, refreshPresetState]);

  // Rename handler
  const handleRename = React.useCallback(
    (presetId: string, presetName: string) => {
      if (!presetState) return;

      openModal({
        type: 'PRESET_RENAME',
        props: {
          titleKey: 'presetRenameTitle',
          bodyKey: 'presetRenameBody',
          confirmLabelKey: 'presetRenameConfirm',
          cancelLabelKey: 'presetRenameCancel',
          presetId,
          currentName: presetName,
          onConfirm: (newName: string) => {
            const trimmed = newName.trim() || presetName;
            const newState = renamePreset(presetState, presetId, trimmed);
            saveActivePresetState(newState);
            refreshPresetState();
          },
        },
      });
    },
    [openModal, presetState, refreshPresetState]
  );

  // Apply handler
  const handleApply = React.useCallback(
    (presetId: string) => {
      if (!presetState) return;
      const newState = setActivePreset(presetState, presetId);
      if (newState !== presetState) {
        saveActivePresetState(newState);
        refreshPresetState();

        // Notify parent about the newly applied preset so that
        // it can update render state and publish via sessionBus.
        const appliedPreset = newState.presets[presetId];
        if (appliedPreset && onPresetApplied) {
          onPresetApplied(appliedPreset);
        }
      }
    },
    [onPresetApplied, presetState, refreshPresetState]
  );

  // Toggle favorite handler
  const handleToggleFavorite = React.useCallback(
    (presetId: string) => {
      if (!presetState) return;
      const newState = togglePresetFavorite(presetState, presetId);
      if (newState !== presetState) {
        saveActivePresetState(newState);
        refreshPresetState();
        // Dispatch custom event to notify dropdown of state change
        window.dispatchEvent(new CustomEvent('presetStateChanged'));
      }
    },
    [presetState, refreshPresetState]
  );

  // Don't render if not open (for performance)
  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`preset-manager-backdrop ${isOpen ? 'preset-manager-backdrop-open' : ''}`}
        aria-hidden="true"
      />
      
      {/* Slide-in panel */}
      <div
        ref={panelRef}
        className={`preset-manager-panel ${isOpen ? 'preset-manager-panel-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="preset-manager-title"
      >
        {/* Header */}
        <div className="preset-manager-header">
          <h2 id="preset-manager-title" className="preset-manager-title">
            {t('presetManager')}
          </h2>
          <button
            className="preset-manager-close"
            onClick={onClose}
            aria-label="Close Preset Manager"
            type="button"
          >
            ×
          </button>
        </div>

        {/* Action buttons */}
        <div className="preset-manager-actions">
          <Tooltip
            content={t('tooltip.preset.create')}
            variant="label"
            placement="top"
          >
            <button
              className="preset-manager-button preset-manager-button-primary"
              onClick={handleCreatePreset}
              type="button"
            >
              {t('createPreset')}
            </button>
          </Tooltip>
          <Tooltip
            content={t('tooltip.preset.export')}
            variant="label"
            placement="top"
          >
            <button
              className="preset-manager-button"
              onClick={handleExport}
              type="button"
              disabled={!presetState || !activePresetId || !presetState.presets[activePresetId]}
            >
              {t('export')}
            </button>
          </Tooltip>
          <Tooltip
            content={t('tooltip.preset.import')}
            variant="label"
            placement="top"
          >
            <button
              className="preset-manager-button"
              onClick={handleImport}
              type="button"
            >
              {t('import')}
            </button>
          </Tooltip>
        </div>

        {/* Hidden file input for import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".nzxtesc-preset"
          className="preset-manager-file-input"
          aria-label={t('import')}
          onChange={handleFileChange}
        />

        {/* Preset list */}
        <div className="preset-manager-list">
          {presetsInOrder.length === 0 ? (
            <div className="preset-manager-empty">
              {t('noPresetsAvailable')}
            </div>
          ) : (
            presetsInOrder.map((preset, index) => {
              const isActive = preset.id === activePresetId;
              const DeleteIcon = PresetIcons.delete;
              const DuplicateIcon = PresetIcons.duplicate;
              const DragHandleIcon = PresetIcons.dragHandle;
              const ApplyIcon = PresetIcons.apply;
              const RenameIcon = PresetIcons.rename;
              const FavoriteIcon = PresetIcons.favoriteOff;
              const canDelete = preset.isDefault !== true;
              const isDragging = dragOrder.draggingIndex === index;
              const isOver = dragOrder.overIndex === index && !isDragging;

              return (
                <div
                  key={preset.id}
                  className={`preset-manager-item ${
                    isActive ? 'preset-manager-item-active' : ''
                  } ${isDragging ? 'preset-manager-item-dragging' : ''} ${
                    isOver ? 'preset-manager-item-drop-target' : ''
                  }`}
                  {...dragOrder.getItemDropProps(index)}
                  onDoubleClick={() => handleApply(preset.id)}
                >
                  {/* Drag handle (far left) */}
                  <div className="preset-manager-item-drag">
                    <button
                      type="button"
                      className="preset-manager-item-action preset-manager-item-drag-handle"
                      aria-label={t('tooltip.preset.reorder')}
                      {...dragOrder.getHandleProps(index)}
                    >
                      <DragHandleIcon size={13} />
                    </button>
                  </div>

                  {/* Preset name */}
                  <div className="preset-manager-item-name">
                    <span className="preset-manager-item-name-main">{preset.name}</span>
                    {preset.isDefault === true && (
                      <span className="preset-manager-item-name-default">[Default]</span>
                    )}
                    {isActive && (
                      <span className="preset-manager-item-active-label">
                        <CheckIcon size={10} />
                        {t('active')}
                      </span>
                    )}
                  </div>

                  {/* Actions (right side) */}
                  <div className="preset-manager-item-actions">
                    {/* Delete */}
                    {canDelete && (
                      <Tooltip
                        content={t('tooltip.preset.delete')}
                        variant="label"
                        placement="top"
                      >
                        <button
                          type="button"
                          className="preset-manager-item-action preset-manager-item-action-delete"
                          onClick={() => handleDelete(preset.id, preset.name)}
                          aria-label={t('tooltip.preset.delete')}
                        >
                          <DeleteIcon size={13} />
                        </button>
                      </Tooltip>
                    )}
                    {/* Favorite */}
                    <Tooltip
                      content={
                        preset.isFavorite === true
                          ? t('tooltip.preset.favorite.remove')
                          : t('tooltip.preset.favorite.add')
                      }
                      variant="label"
                      placement="top"
                    >
                      <button
                        type="button"
                        className={`preset-manager-item-action preset-manager-item-action-favorite ${
                          preset.isFavorite === true ? 'preset-manager-item-action-favorite-active' : ''
                        }`}
                        onClick={() => handleToggleFavorite(preset.id)}
                        aria-label={
                          preset.isFavorite === true
                            ? t('tooltip.preset.favorite.remove')
                            : t('tooltip.preset.favorite.add')
                        }
                      >
                        <FavoriteIcon size={13} fill={preset.isFavorite === true ? 'currentColor' : 'none'} />
                      </button>
                    </Tooltip>
                    {/* Duplicate */}
                    <Tooltip
                      content={t('tooltip.preset.duplicate')}
                      variant="label"
                      placement="top"
                    >
                      <button
                        type="button"
                        className="preset-manager-item-action preset-manager-item-action-duplicate"
                        onClick={() => handleDuplicate(preset.id)}
                        aria-label={t('tooltip.preset.duplicate')}
                      >
                        <DuplicateIcon size={13} />
                      </button>
                    </Tooltip>
                    {/* Rename */}
                    <Tooltip
                      content={t('tooltip.preset.rename')}
                      variant="label"
                      placement="top"
                    >
                      <button
                        type="button"
                        className="preset-manager-item-action preset-manager-item-action-rename"
                        onClick={() => handleRename(preset.id, preset.name)}
                        aria-label={t('tooltip.preset.rename')}
                      >
                        <RenameIcon size={13} />
                      </button>
                    </Tooltip>
                    {/* Apply (rightmost) */}
                    <Tooltip
                      content={t('tooltip.preset.apply')}
                      variant="label"
                      placement="top"
                    >
                      <button
                        type="button"
                        className="preset-manager-item-action preset-manager-item-action-apply"
                        onClick={() => handleApply(preset.id)}
                        aria-label={t('tooltip.preset.apply')}
                      >
                        <ApplyIcon size={13} />
                      </button>
                    </Tooltip>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
