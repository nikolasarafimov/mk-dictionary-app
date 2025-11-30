const DB_NAME = 'mk-dictionary-cache';
const STORE_NAME = 'files';
const DB_VERSION = 1;
const DB_FILE_KEY = 'msd-mk.sqlite';

/**
 * Open (or create) our tiny IndexedDB database.
 */
function openIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Load the cached SQLite file, if present.
 * @returns {Promise<ArrayBuffer | null>}
 */
export async function loadCachedDbFile() {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(DB_FILE_KEY);

    getReq.onsuccess = () => resolve(getReq.result || null);
    getReq.onerror = () => reject(getReq.error);
  });
}

/**
 * Save the SQLite file for future visits.
 * @param {ArrayBuffer} buffer
 */
export async function saveDbFile(buffer) {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const putReq = store.put(buffer, DB_FILE_KEY);

    putReq.onsuccess = () => resolve();
    putReq.onerror = () => reject(putReq.error);
  });
}