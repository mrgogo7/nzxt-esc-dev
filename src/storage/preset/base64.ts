// Base64 encoding/decoding utilities for export/import

/**
 * Converts a Blob to base64-encoded string.
 * Uses FileReader API (async).
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        // Remove data URL prefix (e.g., "data:image/png;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to read blob as base64'));
      }
    };
    reader.onerror = () => {
      reject(new Error('Failed to read blob'));
    };
    reader.readAsDataURL(blob);
  });
}

/**
 * Converts a base64-encoded string to Blob.
 *
 * @param base64 - Base64-encoded string (without data URL prefix)
 * @param mimeType - MIME type for the blob (e.g., "image/png", "video/mp4")
 */
export function base64ToBlob(base64: string, mimeType: string): Blob {
  try {
    // Decode base64 to binary string
    const binaryString = atob(base64);

    // Convert binary string to Uint8Array
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return new Blob([bytes], { type: mimeType });
  } catch (error) {
    throw new Error(`Failed to decode base64: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

