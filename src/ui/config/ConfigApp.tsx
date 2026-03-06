// Configuration Browser application entry point

import { useState, useCallback, useRef } from 'react';
import type { BackgroundMediaOverlayConfig } from '../../core/background/media-overlay/media-overlay.types';
import { useTranslation } from '../../i18n';
import { useModal } from '../shared/modal/modal.context';
import { BackgroundPreview } from './preview/BackgroundPreview';
import { OverlayPreview } from './preview/OverlayPreview';
import { BackgroundSettingsPanel } from './panels/BackgroundSettingsPanel';
import { OverlaySettingsPanel } from './panels/OverlaySettingsPanel';
import { PresetManagerPanel } from './panels/PresetManagerPanel';
import { ConfigHeader } from './layout/ConfigHeader';
import { getViewportDimensions } from '../../render/viewport';
import { updateOverlayElementTransform, updateOverlayElementFontSize } from './overlay/overlayUpdates';
import type { OverlayElement } from '../../core/overlay/overlay.types';
import type { TextElementConfigComplete } from '../../core/elements/text/text.types';
import { normalizeTextElementConfig } from '../../core/elements/text/text.defaults';
import { normalizeBaseTransform } from '../../core/overlay/overlay.defaults';

// Hooks
import { usePreset } from './hooks/usePreset';
import { useOverlayManager } from './hooks/useOverlayManager';
import { useMediaOverlay } from './hooks/useMediaOverlay';

import '../../render/styles/background.css';
import '../../render/styles/overlay.css';
import '../../styles/config.css';
import '../../styles/root.css';

export function ConfigApp(): JSX.Element {
  const { t } = useTranslation();
  const { openModal } = useModal();
  
  // Custom Hooks
  const { preset, setPreset, resolvedRenderModel, isInitialized } = usePreset();
  const {
    selectedOverlayElementId,
    setSelectedOverlayElementId,
    collapsedElementIds,
    handleToggleElementCollapse,
    textColorDrawerOpen,
    textColorDrawerElementId,
    setTextColorDrawerElementId,
    handleToggleOverlayEnabled,
    handleAddTextOverlay,
    handleAddShapeOverlay,
    handleElementDelete,
    handleElementMoveUp,
    handleElementMoveDown
  } = useOverlayManager(preset, setPreset);

  const {
    handleIntrinsicSizeAvailable,
    applyTransformDelta,
    handleRemoveMediaOverlay
  } = useMediaOverlay(preset, setPreset);

  // UI-only states
  const [isPresetManagerOpen, setIsPresetManagerOpen] = useState(false);
  const [showOverlayGuides, setShowOverlayGuides] = useState(false);
  const [showBackground, setShowBackground] = useState(true);
  const [backgroundOpacity, setBackgroundOpacity] = useState(1.0);
  
  // Interaction tracking for persistence
  const persistDebounceTimerRef = useRef<number | null>(null);

  const schedulePersist = useCallback(() => {
    if (persistDebounceTimerRef.current !== null) {
      clearTimeout(persistDebounceTimerRef.current);
    }
    persistDebounceTimerRef.current = window.setTimeout(() => {
      persistDebounceTimerRef.current = null;
    }, 400);
  }, []);

  const handleColorChange = useCallback((color: string) => {
    if (!preset) return;
    setPreset({
      ...preset,
      background: {
        ...preset.background,
        base: { ...preset.background.base, sourceType: 'color', color },
      },
    });
  }, [preset, setPreset]);

  const handleBackgroundMediaOverlayApply = useCallback((overlay: BackgroundMediaOverlayConfig) => {
    if (!preset) return;
    setPreset({
      ...preset,
      background: { ...preset.background, mediaOverlay: overlay },
    });
  }, [preset, setPreset]);

  const handleOpenBackgroundMediaModal = useCallback(() => {
    if (!preset) return;
    const existingOverlay = preset.background.mediaOverlay;
    openModal({
      type: 'BACKGROUND_MEDIA',
      props: {
        titleKey: 'backgroundMediaLabel',
        hasExistingOverlay: Boolean(existingOverlay),
        existingLocalFileName: existingOverlay?.source === 'local' ? existingOverlay.media.fileName : undefined,
        existingLocalFileSize: existingOverlay?.source === 'local' ? existingOverlay.media.fileSize : undefined,
        existingUrl: existingOverlay?.source === 'url' ? existingOverlay.media.url : undefined,
        onApply: handleBackgroundMediaOverlayApply,
      },
    });
  }, [openModal, preset, handleBackgroundMediaOverlayApply]);

  const handleConfirmRemoveBackgroundMedia = useCallback(() => {
    if (!preset?.background.mediaOverlay) return;
    openModal({
      type: 'BACKGROUND_MEDIA_REMOVE_CONFIRM',
      props: {
        titleKey: 'backgroundMediaLabel',
        bodyKey: 'backgroundMediaRemove',
        confirmLabelKey: 'backgroundMediaRemove',
        cancelLabelKey: 'backgroundMediaCancel',
        onConfirm: handleRemoveMediaOverlay,
      },
    });
  }, [openModal, preset, handleRemoveMediaOverlay]);

  const applyOverlayElementTransformDelta = useCallback((elementId: string, deltaX: number, deltaY: number) => {
    if (!preset) return;
    const viewport = getViewportDimensions();
    const updated = updateOverlayElementTransform(preset, elementId, deltaX / (viewport.width / 2), deltaY / (viewport.height / 2));
    if (updated) setPreset(updated);
  }, [preset, setPreset]);

  const applyOverlayElementFontSizeDelta = useCallback((elementId: string, fontSizeDelta: number) => {
    if (!preset) return;
    const updated = updateOverlayElementFontSize(preset, elementId, fontSizeDelta);
    if (updated) setPreset(updated);
  }, [preset, setPreset]);

  const updateTextElement = useCallback((elementId: string, updater: (config: any) => any) => {
    if (!preset?.overlay?.enabled) return;
    const index = preset.overlay.elements.findIndex(el => el.id === elementId);
    if (index === -1) return;
    const element = preset.overlay.elements[index] as TextElementConfigComplete;

    const updatedElement = {
      ...element,
      config: normalizeTextElementConfig(updater(element.config))
    };

    const updatedElements = [...preset.overlay.elements];
    updatedElements[index] = updatedElement;

    setPreset({
      ...preset,
      overlay: { ...preset.overlay, elements: updatedElements as OverlayElement[] }
    });
    schedulePersist();
  }, [preset, setPreset, schedulePersist]);

  if (!isInitialized || !preset) {
    return (
      <div className="config-root">
        <div>{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="config-root">
      <ConfigHeader
        onPresetManagerClick={() => setIsPresetManagerOpen(true)}
        onPresetApplied={setPreset}
      />
      <div className="config-content">
        <div className="config-sidebar">
          <div className="config-preview">
            <BackgroundPreview
              model={resolvedRenderModel}
              onIntrinsicSizeAvailable={handleIntrinsicSizeAvailable}
              showOverlayGuides={showOverlayGuides}
              onTransformDelta={applyTransformDelta}
              onScaleDelta={(delta) => { applyTransformDelta(0, 0, delta); schedulePersist(); }}
              onKeyArrow={(dir, shift) => {
                const viewport = getViewportDimensions();
                const step = shift ? 0.1 : 0.05;
                let dx = 0, dy = 0;
                if (dir === 'left') dx = -step * (viewport.width / 2);
                else if (dir === 'right') dx = step * (viewport.width / 2);
                else if (dir === 'up') dy = -step * (viewport.height / 2);
                else if (dir === 'down') dy = step * (viewport.height / 2);
                applyTransformDelta(dx, dy);
                schedulePersist();
              }}
              onDragEnd={() => {}}
            />
          </div>
        </div>
        <div className="background-panel">
          <BackgroundSettingsPanel
            color={preset.background.base.color}
            onColorChange={handleColorChange}
            hasMediaOverlay={Boolean(preset.background.mediaOverlay)}
            onOpenBackgroundMediaModal={handleOpenBackgroundMediaModal}
            onRemoveBackgroundMediaOverlay={handleConfirmRemoveBackgroundMedia}
            transform={preset.background.mediaOverlay?.transform}
            onTransformChange={(t) => setPreset({ ...preset, background: { ...preset.background, mediaOverlay: { ...preset.background.mediaOverlay!, transform: t } } })}
            showOverlayGuides={showOverlayGuides}
            onOverlayGuidesChange={setShowOverlayGuides}
            mediaOverlaySource={preset.background.mediaOverlay?.source}
          />
        </div>
        
        <div style={{ gridColumn: '1 / -1', height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.06)', margin: '24px 0' }} />
        
        <div className="config-sidebar">
          <div className="config-preview">
            <OverlayPreview
              model={resolvedRenderModel}
              selectedOverlayElementId={selectedOverlayElementId}
              onOverlayElementSelect={setSelectedOverlayElementId}
              onOverlayElementTransformDelta={applyOverlayElementTransformDelta}
              onOverlayElementFontSizeDelta={applyOverlayElementFontSizeDelta}
              onOverlayElementKeyArrow={(id, dir) => {
                 const step = 1;
                 let dx = 0, dy = 0;
                 if (dir === 'left') dx = -step;
                 else if (dir === 'right') dx = step;
                 else if (dir === 'up') dy = -step;
                 else if (dir === 'down') dy = step;
                 applyOverlayElementTransformDelta(id, dx, dy);
                 schedulePersist();
              }}
              onOverlayElementDragEnd={() => {}}
              showBackground={showBackground}
              backgroundOpacity={backgroundOpacity}
            />
          </div>
        </div>
        <div className="background-panel">
          <OverlaySettingsPanel
            overlayEnabled={preset.overlay?.enabled ?? false}
            elements={preset.overlay?.elements ?? []}
            selectedElementId={selectedOverlayElementId}
            canAddElement={(preset.overlay?.elements.length ?? 0) < 20}
            onToggleEnabled={handleToggleOverlayEnabled}
            onAddTextOverlay={handleAddTextOverlay}
            onAddShapeOverlay={handleAddShapeOverlay}
            onElementSelect={setSelectedOverlayElementId}
            onElementMoveUp={handleElementMoveUp}
            onElementMoveDown={handleElementMoveDown}
            onElementDelete={handleElementDelete}
            showBackground={showBackground}
            backgroundOpacity={backgroundOpacity}
            onShowBackgroundChange={setShowBackground}
            onBackgroundOpacityChange={setBackgroundOpacity}
            collapsedElementIds={collapsedElementIds}
            onToggleElementCollapse={handleToggleElementCollapse}
            onTextElementContentChange={(id, content) => updateTextElement(id, c => ({ ...c, content }))}
            onTextElementFontSizeChange={(id, size) => {
              const el = preset.overlay?.elements.find(e => e.id === id) as TextElementConfigComplete;
              if (el) applyOverlayElementFontSizeDelta(id, size - el.config.fontSize);
            }}
            onTextElementFontFamilyChange={(id, fontFamily) => updateTextElement(id, c => ({ ...c, fontFamily }))}
            onTextElementRotateChange={(id, rotateDeg) => {
              const index = preset.overlay!.elements.findIndex(el => el.id === id);
              const element = preset.overlay!.elements[index];
              const updated = { ...element, transform: normalizeBaseTransform({ ...element.transform, rotateDeg }) };
              const elements = [...preset.overlay!.elements];
              elements[index] = updated;
              setPreset({ ...preset, overlay: { ...preset.overlay!, elements } });
              schedulePersist();
            }}
            onTextElementOffsetChange={(id, x, y) => {
              const index = preset.overlay!.elements.findIndex(el => el.id === id);
              const element = preset.overlay!.elements[index];
              const updated = { ...element, transform: normalizeBaseTransform({ ...element.transform, x, y }) };
              const elements = [...preset.overlay!.elements];
              elements[index] = updated;
              setPreset({ ...preset, overlay: { ...preset.overlay!, elements } });
              schedulePersist();
            }}
            textColorDrawerOpen={textColorDrawerOpen}
            textColorDrawerElementId={textColorDrawerElementId}
            onOpenTextColorDrawer={setTextColorDrawerElementId}
            onCloseTextColorDrawer={() => setTextColorDrawerElementId(null)}
            onTextElementColorChange={(id, color) => updateTextElement(id, c => ({ ...c, color }))}
            onTextElementOutlineChange={(id, w, c) => updateTextElement(id, conf => ({ ...conf, outlineWidth: w, outlineColor: w > 0 && c === undefined ? '#000000' : c }))}
          />
        </div>
      </div>
      <PresetManagerPanel
        isOpen={isPresetManagerOpen}
        onClose={() => setIsPresetManagerOpen(false)}
        onPresetApplied={setPreset}
      />
    </div>
  );
}
