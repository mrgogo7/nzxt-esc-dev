// Render model type definitions

import type { BackgroundRenderModel } from '../../core/background/base/background.base.types';
import type { MediaOverlayRenderModel } from '../../core/background/media-overlay/media-overlay.types';

/**
 * Render model.
 * Represents the complete visual state to be rendered.
 */
export interface RenderModel {
  /**
   * Base background layer (color / gradient).
   */
  background: BackgroundRenderModel;

  /**
   * Optional single media overlay rendered on top of the base background.
   */
  mediaOverlay?: MediaOverlayRenderModel;
}
