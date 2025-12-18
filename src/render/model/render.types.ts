// Render model type definitions

import type { BackgroundRenderModel } from '../../core/background/base/background.base.types';

/**
 * Minimal render model.
 * Represents the complete visual state to be rendered.
 */
export interface RenderModel {
  background: BackgroundRenderModel;
}
