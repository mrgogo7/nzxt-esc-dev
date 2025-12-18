/**
 * NZXT Platform Adapter
 *
 * Responsibilities:
 * - Install NZXT monitoring callback slot (window.nzxt.v1.onMonitoringDataUpdate)
 * - Expose latest raw monitoring payload (read-only)
 * - Provide LCD geometry attributes (width, height, shape, targetFps)
 *
 * Non-responsibilities:
 * - NO UI logic
 * - NO preset logic
 * - NO element or metric mapping
 * - NO state management beyond last payload
 *
 * This file is a thin platform boundary adapter.
 */

/**
 * NZXT API status information.
 */
export interface NZXTApiStatus {
  available: boolean;
  isRealDevice: boolean;
  resolution: {
    width: number;
    height: number;
    isCircular: boolean;
  };
  message: string;
}

/**
 * Default resolution (640x640 circular LCD).
 */
const DEFAULT_RESOLUTION = {
  width: 640,
  height: 640,
  isCircular: true,
};

let retryTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Detects NZXT Web Integration API availability.
 * Checks window.nzxt?.v1 (current state, not cached).
 */
function detectNZXTApi(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const nzxt = (window as any).nzxt;
  return !!(nzxt?.v1);
}

/**
 * Attempts to detect API and subscribe to monitoring.
 * Returns true if API was detected, false otherwise.
 */
function attemptDetection(): boolean {
  if (detectNZXTApi()) {
    // Clean up retry timer if active
    if (retryTimer !== null) {
      clearInterval(retryTimer);
      retryTimer = null;
    }
    
    // Subscribe to monitoring immediately
    subscribeToMonitoring();
    
    return true;
  }
  
  return false;
}

/**
 * Initializes bounded late-detection window.
 * Checks immediately, then retries every 300ms for up to 10 seconds.
 */
function initializeDetection(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Immediate check
  if (attemptDetection()) {
    return;
  }

  // Start bounded retry window
  const RETRY_INTERVAL = 300; // ms
  const MAX_DURATION = 10000; // 10 seconds
  const MAX_RETRIES = Math.floor(MAX_DURATION / RETRY_INTERVAL);
  
  let retryCount = 0;
  
  retryTimer = setInterval(() => {
    retryCount++;
    
    // Check if API is now available
    if (attemptDetection()) {
      // API detected, cleanup handled in attemptDetection
      return;
    }
    
    // Stop retrying after max duration
    if (retryCount >= MAX_RETRIES && retryTimer !== null) {
      clearInterval(retryTimer);
      retryTimer = null;
    }
  }, RETRY_INTERVAL);
}

/**
 * Gets LCD resolution from NZXT API.
 * Returns default resolution if API is unavailable.
 */
function getLCDResolution(): { width: number; height: number; isCircular: boolean } {
  if (typeof window === 'undefined') {
    return DEFAULT_RESOLUTION;
  }

  const nzxt = (window as any).nzxt;
  if (!nzxt?.v1?.getLCDSize) {
    return DEFAULT_RESOLUTION;
  }

  try {
    const size = nzxt.v1.getLCDSize();
    if (size && typeof size.width === 'number' && typeof size.height === 'number') {
      return {
        width: size.width,
        height: size.height,
        isCircular: size.shape === 'circle' || size.isCircular === true,
      };
    }
  } catch (error) {
    // API call failed, use default
  }

  return DEFAULT_RESOLUTION;
}

/**
 * Determines if running on a real NZXT device.
 */
function isRealDevice(): boolean {
  if (!detectNZXTApi()) {
    return false;
  }

  try {
    const nzxt = (window as any).nzxt;
    const size = nzxt.v1.getLCDSize();
    return !!(size && typeof size.width === 'number' && typeof size.height === 'number');
  } catch (error) {
    return false;
  }
}

/**
 * Gets comprehensive NZXT API status.
 * This is the primary entry point for NZXT API information.
 */
export function getNZXTApiStatus(): NZXTApiStatus {
  const available = detectNZXTApi();
  const isReal = isRealDevice();
  const resolution = getLCDResolution();

  let message: string;
  if (isReal) {
    message = `NZXT device detected: ${resolution.width}×${resolution.height}`;
  } else if (available) {
    message = 'NZXT API available (browser preview mode)';
  } else {
    message = 'Running in browser preview mode.';
  }

  return {
    available,
    isRealDevice: isReal,
    resolution,
    message,
  };
}

/**
 * Checks if NZXT API is available.
 */
export function isNZXTApiAvailable(): boolean {
  return detectNZXTApi();
}

/**
 * LCD attributes read helper.
 * Reads synchronously from window.nzxt.v1 if available, otherwise falls back to defaults.
 */
export function getLcdAttributes(defaults: {
  width: number;
  height: number;
  shape: string;
  targetFps?: number;
}): {
  width: number;
  height: number;
  shape: string;
  targetFps?: number;
  source: 'nzxt' | 'defaults';
} {
  if (typeof window === 'undefined') {
    return { ...defaults, source: 'defaults' };
  }

  try {
    const win = window as any;
    const v1 = win.nzxt?.v1;

    if (!v1) {
      return { ...defaults, source: 'defaults' };
    }

    const width = typeof v1.width === 'number' ? v1.width : defaults.width;
    const height = typeof v1.height === 'number' ? v1.height : defaults.height;
    const shape = typeof v1.shape === 'string' ? v1.shape : defaults.shape;
    const targetFps =
      typeof v1.targetFps === 'number' ? v1.targetFps : defaults.targetFps;

    const hasNzxtValues =
      typeof v1.width === 'number' ||
      typeof v1.height === 'number' ||
      typeof v1.shape === 'string' ||
      typeof v1.targetFps === 'number';

    return {
      width,
      height,
      shape,
      targetFps,
      source: hasNzxtValues ? 'nzxt' : 'defaults',
    };
  } catch {
    return { ...defaults, source: 'defaults' };
  }
}

/**
 * Monitoring data storage.
 */
let latestMonitoringData: unknown = null;
let monitoringCallbackFired: boolean = false;
let monitoringSubscribed: boolean = false;
let monitoringInstalled: boolean = false;
const monitoringLog: Array<{ timestamp: string; payload: unknown }> = [];

/**
 * Subscribes to NZXT monitoring data updates if available.
 * Subscription happens once when API is detected (immediately or late).
 */
function subscribeToMonitoring(): void {
  if (monitoringSubscribed) {
    return;
  }

  if (typeof window === 'undefined') {
    return;
  }

  const nzxt = (window as any).nzxt;
  if (!nzxt?.v1?.onMonitoringDataUpdate) {
    return;
  }

  try {
    nzxt.v1.onMonitoringDataUpdate((data: unknown) => {
      latestMonitoringData = data;
      monitoringCallbackFired = true;
    });
    monitoringSubscribed = true;
  } catch (error) {
    // Subscription failed silently
  }
}

// Initialize detection at module load (bounded late-detection window)
if (typeof window !== 'undefined') {
  initializeDetection();
}

/**
 * Gets the latest received monitoring data payload.
 * Returns null if no data has been received yet.
 */
export function getLatestMonitoringData(): unknown {
  return latestMonitoringData;
}

/**
 * Returns true if monitoring callback has fired at least once.
 * This is proof that the API is active and working.
 */
export function isMonitoringActive(): boolean {
  return monitoringCallbackFired;
}

/**
 * Returns the full monitoring log (TEMP diagnostic).
 */
export function getMonitoringLog(): Array<{ timestamp: string; payload: unknown }> {
  return monitoringLog;
}

/**
 * Returns true if any monitoring payload has ever been received.
 */
export function hasEverReceivedMonitoring(): boolean {
  return monitoringCallbackFired || monitoringLog.length > 0;
}

/**
 * Installs the NZXT monitoring callback slot in window.nzxt.v1.
 * Always assigns window.nzxt.v1.onMonitoringDataUpdate = handler.
 * Returns a cleanup function that restores the previous handler.
 */
function installMonitoringHandler(
  handler: (data: unknown) => void,
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const win = window as any;
  if (!win.nzxt) {
    win.nzxt = {};
  }
  if (!win.nzxt.v1) {
    win.nzxt.v1 = {};
  }

  const v1 = win.nzxt.v1;
  const previous = v1.onMonitoringDataUpdate;
  let active = true;

  v1.onMonitoringDataUpdate = (data: unknown) => {
    try {
      handler(data);
    } catch {
      // Swallow handler errors to avoid breaking CAM
    }
  };

  return () => {
    if (!active) return;
    v1.onMonitoringDataUpdate = previous;
    active = false;
  };
}

/**
 * Starts NZXT monitoring by installing the monitoring handler.
 * Returns a cleanup function that restores any previous handler.
 */
export function startNzxtMonitoring(): () => void {
  if (monitoringInstalled) {
    // Already installed; no-op cleanup
    return () => {};
  }

  monitoringInstalled = true;

  const cleanup = installMonitoringHandler((data: unknown) => {
    latestMonitoringData = data;
    monitoringCallbackFired = true;
    monitoringLog.push({
      timestamp: new Date().toISOString(),
      payload: data,
    });
  });

  return () => {
    cleanup();
    monitoringInstalled = false;
  };
}

