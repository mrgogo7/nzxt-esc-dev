// Render model type definitions

/**
 * FAZ-0 minimal render model.
 * Represents the complete visual state to be rendered.
 */
export interface RenderModel {
  background: {
    kind: 'color';
    color: string; // rgba(...) for solid colors, or linear-gradient(...)/radial-gradient(...) for gradients
  };
}
