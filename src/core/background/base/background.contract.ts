// Base background contract definitions

import type {
  BaseBackgroundConfig,
  BackgroundRenderModel,
} from './background.base.types';

/**
 * Unified background contract interface.
 * Each background source owns its own implementation of this contract.
 */
export interface BackgroundContract<TConfig extends BaseBackgroundConfig> {
  /**
   * Discriminator for the background source type.
   */
  sourceType: TConfig['sourceType'];

  /**
   * Validates a background configuration object for this source.
   */
  validate(config: unknown): config is TConfig;

  /**
   * Normalizes a potentially partial configuration into a full config.
   * This function MUST be pure and side-effect free.
   */
  normalize(config: Partial<TConfig>): TConfig;

  /**
   * Resolves a validated configuration into a render-ready background model.
   * Render layer must remain source-agnostic and only consume this model.
   */
  toRenderModel(config: TConfig): BackgroundRenderModel;
}

export type AnyBackgroundContract = BackgroundContract<BaseBackgroundConfig>;
