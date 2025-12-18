// Session bus for cross-tab communication

/**
 * Render model snapshot for sync.
 * FAZ-0 minimal structure.
 */
export interface RenderModelSnapshot {
  background: {
    kind: 'color';
    color: string;
  };
}

/**
 * Session bus for cross-tab/context communication.
 * Uses BroadcastChannel if available, falls back to storage events.
 */
class SessionBus {
  private channel: BroadcastChannel | null = null;
  private subscribers: Set<(snapshot: RenderModelSnapshot) => void> = new Set();
  private readonly channelName = 'nzxt-esc-v2:sync';

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
      const key = 'nzxt-esc-v2:sync:activePreset';
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
    if (event.key === 'nzxt-esc-v2:sync:activePreset' && event.newValue) {
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
