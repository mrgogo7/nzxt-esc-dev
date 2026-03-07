// Session bus for cross-tab communication

import type { RenderModel } from '../render/model/render.types';

/**
 * Render model snapshot for sync.
 *
 * FAZ-0 minimal structure (background only).
 * FAZ-5.A3: Extended with optional overlay field (NO-OP, not consumed yet).
 *
 * RenderModelSnapshot is compatible with RenderModel structure.
 * In practice, RenderModel is passed directly to sessionBus.
 * Overlay field is optional and may be undefined (backward compatible).
 *
 * Note: RenderModelSnapshot uses a simplified background structure for backward
 * compatibility, but in practice the full RenderModel is passed and consumed.
 */
export interface RenderModelSnapshot {
  /**
   * Base background layer (color / gradient).
   * Simplified structure for backward compatibility with existing consumers.
   */
  background: {
    kind: 'color';
    color: string;
  };

  /**
   * Optional media overlay (may be undefined).
   * Included for type compatibility with RenderModel.
   */
  mediaOverlay?: RenderModel['mediaOverlay'];

  /**
   * Optional overlay configuration (FAZ-5.A3).
   *
   * FAZ-5.A3: Overlay field exists but is intentionally unused (NO-OP).
   * Overlay is included in snapshot if present in RenderModel.
   * Overlay is not consumed by Kraken or Preview yet.
   *
   * Overlay rendering will be implemented in FAZ-5.B.
   */
  overlay?: RenderModel['overlay'];
}

/**
 * Session bus for cross-tab/context communication.
 * Uses BroadcastChannel if available, falls back to storage events.
 */
class SessionBus {
  private channel: BroadcastChannel | null = null;
  private subscribers: Set<(snapshot: RenderModelSnapshot) => void> = new Set();
  private readonly channelName = 'nzxt-esc-dev:sync';

  constructor() {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel(this.channelName);
        this.channel.onmessage = (event) => {
          if (event.data?.type === 'activePreset') {
            this.notifySubscribers(event.data.snapshot);
          }
        };
      } catch (error) {
        // BroadcastChannel not available, use storage events
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageEvent.bind(this));
    }
  }

  /**
   * Publishes active preset snapshot to all subscribers.
   */
  publishActivePreset(snapshot: RenderModelSnapshot): void {
    if (this.channel) {
      try {
        this.channel.postMessage({
          type: 'activePreset',
          snapshot,
        });
      } catch (error) {
        // Fallback to storage events
        this.publishViaStorage(snapshot);
      }
    } else {
      this.publishViaStorage(snapshot);
    }
  }

  /**
   * Subscribes to active preset changes.
   * Returns unsubscribe function.
   */
  subscribeActivePreset(handler: (snapshot: RenderModelSnapshot) => void): () => void {
    this.subscribers.add(handler);

    return () => {
      this.subscribers.delete(handler);
    };
  }

  /**
   * Notifies all subscribers of a new snapshot.
   */
  private notifySubscribers(snapshot: RenderModelSnapshot): void {
    for (const handler of this.subscribers) {
      try {
        handler(snapshot);
      } catch (error) {
        // Ignore subscriber errors
      }
    }
  }

  /**
   * Publishes via storage events (fallback).
   */
  private publishViaStorage(snapshot: RenderModelSnapshot): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    try {
      const key = 'nzxt-esc-dev:sync:activePreset';
      const value = JSON.stringify(snapshot);
      localStorage.setItem(key, value);
      localStorage.removeItem(key);
    } catch (error) {
      // Storage may be full or unavailable
    }
  }

  /**
   * Handles storage events for sync fallback.
   */
  private handleStorageEvent(event: StorageEvent): void {
    if (event.key === 'nzxt-esc-dev:sync:activePreset' && event.newValue) {
      try {
        const snapshot = JSON.parse(event.newValue) as RenderModelSnapshot;
        this.notifySubscribers(snapshot);
      } catch (error) {
        // Invalid data, ignore
      }
    }
  }
}

/**
 * Global session bus instance.
 */
export const sessionBus = new SessionBus();
