import type { ActivePresetState } from '../../../../core/preset/preset.types';

export interface PresetDragItem {
  index: number;
}

export interface UsePresetDragOrderOptions {
  itemCount: number;
  onReorder: (fromIndex: number, toIndex: number, state: ActivePresetState) => void;
  state: ActivePresetState | null;
}

export interface UsePresetDragOrderResult {
  draggingIndex: number | null;
  overIndex: number | null;
  getHandleProps: (index: number) => {
    draggable: boolean;
    onDragStart: (event: React.DragEvent) => void;
    onDragEnd: () => void;
  };
  getItemDropProps: (index: number) => {
    onDragOver: (event: React.DragEvent) => void;
    onDrop: (event: React.DragEvent) => void;
  };
}
