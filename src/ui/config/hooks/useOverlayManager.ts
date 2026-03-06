import { useState, useCallback } from 'react';
import type { Preset } from '../../../core/preset/preset.types';
import {
  toggleOverlayEnabled,
  addTextOverlayElement,
  addShapeOverlayElement
} from '../overlay/overlayHelpers';
import {
  moveOverlayElementUp,
  moveOverlayElementDown,
  deleteOverlayElement
} from '../overlay/overlayListHelpers';

export function useOverlayManager(preset: Preset | null, setPreset: (preset: Preset) => void) {
  const [selectedOverlayElementId, setSelectedOverlayElementId] = useState<string | null>(null);
  const [collapsedElementIds, setCollapsedElementIds] = useState<Set<string>>(new Set());
  const [textColorDrawerOpen, setTextColorDrawerOpen] = useState(false);
  const [textColorDrawerElementId, setTextColorDrawerElementId] = useState<string | null>(null);

  const handleToggleOverlayEnabled = useCallback(() => {
    if (!preset) return;
    setPreset(toggleOverlayEnabled(preset));
  }, [preset, setPreset]);

  const handleAddTextOverlay = useCallback(() => {
    if (!preset) return;
    const updated = addTextOverlayElement(preset);
    if (updated) setPreset(updated);
  }, [preset, setPreset]);

  const handleAddShapeOverlay = useCallback(() => {
    if (!preset) return;
    const updated = addShapeOverlayElement(preset);
    if (updated) setPreset(updated);
  }, [preset, setPreset]);

  const handleElementDelete = useCallback((index: number) => {
    if (!preset) return;
    const elementToDelete = preset.overlay?.elements[index];
    const updated = deleteOverlayElement(preset, index);
    if (updated) {
      if (elementToDelete && selectedOverlayElementId === elementToDelete.id) {
        setSelectedOverlayElementId(null);
      }
      setPreset(updated);
    }
  }, [preset, selectedOverlayElementId, setPreset]);

  const handleToggleElementCollapse = useCallback((elementId: string) => {
    setCollapsedElementIds((prev) => {
      const next = new Set(prev);
      if (next.has(elementId)) next.delete(elementId);
      else next.add(elementId);
      return next;
    });
  }, []);

  return {
    selectedOverlayElementId,
    setSelectedOverlayElementId,
    collapsedElementIds,
    handleToggleElementCollapse,
    textColorDrawerOpen,
    setTextColorDrawerOpen,
    textColorDrawerElementId,
    setTextColorDrawerElementId,
    handleToggleOverlayEnabled,
    handleAddTextOverlay,
    handleAddShapeOverlay,
    handleElementDelete,
    handleElementMoveUp: (index: number) => {
      if (!preset) return;
      const updated = moveOverlayElementUp(preset, index);
      if (updated) setPreset(updated);
    },
    handleElementMoveDown: (index: number) => {
      if (!preset) return;
      const updated = moveOverlayElementDown(preset, index);
      if (updated) setPreset(updated);
    }
  };
}
