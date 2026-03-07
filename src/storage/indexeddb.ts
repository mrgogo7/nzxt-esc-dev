// IndexedDB storage implementation

const DB_NAME = 'nzxt-esc-dev';
const DB_VERSION = 1;
const STORE_NAME = 'localMedia';

export interface LocalMediaRecord {
  mediaId: string;
  blob: Blob;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: number;
}

let dbInstance: IDBDatabase | null = null;
let dbOpenPromise: Promise<IDBDatabase> | null = null;

/**
 * Opens the IndexedDB database.
 * Returns cached instance if already open.
 */
function openDatabase(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  if (dbOpenPromise) {
    return dbOpenPromise;
  }

  dbOpenPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      dbOpenPromise = null;
      reject(new Error(`Failed to open database: ${request.error?.message || 'Unknown error'}`));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      dbOpenPromise = null;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'mediaId' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });

  return dbOpenPromise;
}

/**
 * Stores a local media record in IndexedDB.
 */
export async function putLocalMedia(record: LocalMediaRecord): Promise<void> {
  const db = await openDatabase();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.put(record);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error(`Failed to store media: ${request.error?.message || 'Unknown error'}`));
    };
  });
}

/**
 * Retrieves a local media record from IndexedDB by mediaId.
 * Returns null if not found.
 */
export async function getLocalMedia(mediaId: string): Promise<LocalMediaRecord | null> {
  const db = await openDatabase();
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.get(mediaId);

    request.onsuccess = () => {
      const result = request.result;
      resolve(result || null);
    };

    request.onerror = () => {
      reject(new Error(`Failed to get media: ${request.error?.message || 'Unknown error'}`));
    };
  });
}

/**
 * Deletes a local media record from IndexedDB by mediaId.
 */
export async function deleteLocalMedia(mediaId: string): Promise<void> {
  const db = await openDatabase();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.delete(mediaId);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error(`Failed to delete media: ${request.error?.message || 'Unknown error'}`));
    };
  });
}
