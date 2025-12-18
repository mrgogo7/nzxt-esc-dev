// Background type registry and factory

import type { BackgroundSourceType } from './base/background.base.types';
import type { AnyBackgroundContract } from './base/background.contract';
import { colorBackgroundContract } from './color/color.contract';
import { mediaUrlBackgroundContract } from './media-url/media-url.contract';
import { youtubeBackgroundContract } from './youtube/youtube.contract';
import { pinterestBackgroundContract } from './pinterest/pinterest.contract';
import { localMediaBackgroundContract } from './local-media/local-media.contract';

/**
 * Background contract registry.
 * Maps source types to their contract implementations.
 */
const backgroundRegistry: Record<BackgroundSourceType, AnyBackgroundContract> = {
  color: colorBackgroundContract,
  'media-url': mediaUrlBackgroundContract,
  youtube: youtubeBackgroundContract,
  pinterest: pinterestBackgroundContract,
  'local-media': localMediaBackgroundContract,
};

/**
 * Gets the contract for a given background source type.
 */
export function getBackgroundContract(
  sourceType: BackgroundSourceType
): AnyBackgroundContract | undefined {
  return backgroundRegistry[sourceType];
}
