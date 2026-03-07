// Runtime resolver for local media (mediaId -> objectURL)
// Manages objectURL lifecycle and caching

import { loadLocalMediaBlob } from './local';

/**
 * Runtime resolver for local media.
 * Resolves mediaId to objectURL, manages lifecycle.
 */
export class LocalMediaResolver {
  private cache: Map<string, string> = new Map(); // mediaId -> objectURL
  private pending: Map<string, Promise<string | null>> = new Map(); // mediaId -> pending promise

  /**
   * Resolves a single mediaId to objectURL.
   * 
   * Flow:
   * 1. Check cache (if objectURL already exists for this mediaId)
   * 2. If pending exists, await it
   * 3. Otherwise create promise:
   *    - load blob from IndexedDB
   *    - if null -> return null
   *    - create objectURL: URL.createObjectURL(blob)
   *    - cache it
   *    - return url
   * 
   * Returns null if mediaId not found in IndexedDB.
   */
  async resolveMediaId(mediaId: string): Promise<string | null> {
    // Check cache first
    const cached = this.cache.get(mediaId);
    if (cached) {
      return cached;
    }

    // Check if already pending
    const pendingPromise = this.pending.get(mediaId);
    if (pendingPromise) {
      return pendingPromise;
    }

    // Create new resolution promise
    const promise = (async () => {
      try {
        const blob = await loadLocalMediaBlob(mediaId);
        if (!blob) {
          return null;
        }

        const objectURL = URL.createObjectURL(blob);
        this.cache.set(mediaId, objectURL);
        return objectURL;
      } catch (error) {
        console.error(`Failed to resolve mediaId ${mediaId}:`, error);
        return null;
      } finally {
        // Remove from pending after completion
        this.pending.delete(mediaId);
      }
    })();

    // Store in pending map
    this.pending.set(mediaId, promise);

    return promise;
  }

  /**
   * Pre-resolves multiple mediaIds in batch.
   * Returns Map with only successfully resolved mediaIds.
   */
  async resolveMediaIds(mediaIds: string[]): Promise<Map<string, string>> {
    const results = new Map<string, string>();

    // Resolve all in parallel
    const promises = mediaIds.map(async (mediaId) => {
      const url = await this.resolveMediaId(mediaId);
      if (url) {
        results.set(mediaId, url);
      }
    });

    await Promise.all(promises);

    return results;
  }

  /**
   * Revokes objectURL for a given mediaId.
   * Removes from cache.
   * Safe to call multiple times (idempotent).
   */
  revokeMediaId(mediaId: string): void {
    const objectURL = this.cache.get(mediaId);
    if (objectURL) {
      URL.revokeObjectURL(objectURL);
      this.cache.delete(mediaId);
    }
  }

  /**
   * Revokes all cached objectURLs.
   * Should be called on app unmount.
   * Safe to call multiple times (idempotent).
   */
  revokeAll(): void {
    for (const objectURL of this.cache.values()) {
      URL.revokeObjectURL(objectURL);
    }
    this.cache.clear();
  }

  /**
   * Checks if a mediaId is already resolved (cached).
   */
  isResolved(mediaId: string): boolean {
    return this.cache.has(mediaId);
  }
}

/**
 * Singleton instance of LocalMediaResolver.
 */
export const localMediaResolver = new LocalMediaResolver();

