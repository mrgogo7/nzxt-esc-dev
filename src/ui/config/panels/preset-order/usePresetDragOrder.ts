import React from 'react';
import type { UsePresetDragOrderOptions, UsePresetDragOrderResult } from './presetOrder.types';

/**
 * UI-only drag & drop ordering hook for presets.
 *
 * - Drag is started ONLY from the handle (draggable element)
 * - Drop is handled on the row container
 */
export function usePresetDragOrder(options: UsePresetDragOrderOptions): UsePresetDragOrderResult {
  const { itemCount, onReorder, state } = options;

  const [draggingIndex, setDraggingIndex] = React.useState<number | null>(null);
  const [overIndex, setOverIndex] = React.useState<number | null>(null);

  const handleDragStart = React.useCallback((index: number) => {
    setDraggingIndex(index);
  }, []);

  const handleDragEnd = React.useCallback(() => {
    setDraggingIndex(null);
    setOverIndex(null);
  }, []);

  const handleDragOver = React.useCallback((index: number, event: React.DragEvent) => {
    event.preventDefault();
    if (index < 0 || index >= itemCount) return;
    if (index === draggingIndex) return;
    setOverIndex(index);
  }, [draggingIndex, itemCount]);

  const handleDrop = React.useCallback(
    (index: number, event: React.DragEvent) => {
      event.preventDefault();
      if (draggingIndex === null || !state) {
        handleDragEnd();
        return;
      }

      const fromIndex = draggingIndex;
      const toIndex = index;

      if (fromIndex !== toIndex) {
        onReorder(fromIndex, toIndex, state);
      }

      handleDragEnd();
    },
    [draggingIndex, handleDragEnd, onReorder, state]
  );

  const getHandleProps: UsePresetDragOrderResult['getHandleProps'] = (index) => ({
    draggable: true,
    onDragStart: (event: React.DragEvent) => {
      event.dataTransfer.effectAllowed = 'move';
      handleDragStart(index);
    },
    onDragEnd: handleDragEnd,
  });

  const getItemDropProps: UsePresetDragOrderResult['getItemDropProps'] = (index) => ({
    onDragOver: (event: React.DragEvent) => handleDragOver(index, event),
    onDrop: (event: React.DragEvent) => handleDrop(index, event),
  });

  return {
    draggingIndex,
    overIndex,
    getHandleProps,
    getItemDropProps,
  };
}
