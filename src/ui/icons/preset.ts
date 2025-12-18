// Preset-related icons from Lucide React
// UI components must import icons ONLY from this barrel, not directly from lucide-react.

import { Trash2, Pencil, Copy, Play, Check, GripVertical, Star, ChevronDown } from 'lucide-react';

export const PresetIcons = {
  delete: Trash2,
  rename: Pencil,
  duplicate: Copy,
  apply: Play,
  check: Check,
  dragHandle: GripVertical,
  favoriteOn: Star,
  favoriteOff: Star,
  dropdown: ChevronDown,
} as const;
