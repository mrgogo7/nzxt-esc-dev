// Render model type definitions

import type { BackgroundRenderModel } from '../../core/background/base/background.base.types';
import type { MediaOverlayRenderModel } from '../../core/background/media-overlay/media-overlay.types';
import type { OverlayRenderModel } from '../../core/overlay/overlay.types';

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

  /**
   * Optional overlay configuration (FAZ-5).
   *
   * FAZ-5.A3: Overlay field exists but is intentionally unused (NO-OP).
   * Overlay is set to undefined if:
   * - preset.overlay is undefined
   * - preset.overlay.enabled is false
   * - overlay normalization/validation fails
   *
   * No render logic is executed for overlay in FAZ-5.A3.
   * Overlay rendering will be implemented in FAZ-5.B.
   */
  overlay?: OverlayRenderModel;
}
