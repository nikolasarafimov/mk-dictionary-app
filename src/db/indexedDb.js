const DB_NAME = 'mk-dictionary-cache'
const STORE_NAME = 'files'
const DB_VERSION = 3
const CACHE_VERSION = '1'

const DB_FILE_NAME = import.meta.env.PROD
  ? 'msd-mk-demo.sqlite'
  : 'msd-mk.sqlite'

const DB_FILE_KEY =
  `${DB_FILE_NAME}:v${CACHE_VERSION}`

function openIDB() {
  return new Promise(
    (resolve, reject) => {
      const request =
        indexedDB.open(
          DB_NAME,
          DB_VERSION,
        )

      request.onupgradeneeded = () => {
        const db = request.result

        if (
          db.objectStoreNames.contains(
            STORE_NAME,
          )
        ) {
          db.deleteObjectStore(
            STORE_NAME,
          )
        }

        db.createObjectStore(
          STORE_NAME,
        )
      }

      request.onsuccess = () => {
        resolve(
          request.result,
        )
      }

      request.onerror = () => {
        reject(
          request.error
          || new Error(
            'Could not open the dictionary cache.',
          ),
        )
      }
    },
  )
}

export async function loadCachedDbFile() {
  const db = await openIDB()

  try {
    return await new Promise(
      (resolve, reject) => {
        const transaction =
          db.transaction(
            STORE_NAME,
            'readonly',
          )

        const store =
          transaction.objectStore(
            STORE_NAME,
          )

        const request =
          store.get(
            DB_FILE_KEY,
          )

        request.onsuccess = () => {
          resolve(
            request.result || null,
          )
        }

        request.onerror = () => {
          reject(
            request.error
            || new Error(
              'Could not read the cached dictionary database.',
            ),
          )
        }

        transaction.onabort = () => {
          reject(
            transaction.error
            || new Error(
              'Dictionary cache read transaction was aborted.',
            ),
          )
        }
      },
    )
  } finally {
    db.close()
  }
}

export async function saveDbFile(buffer) {
  if (!(buffer instanceof ArrayBuffer)) {
    throw new TypeError(
      'Dictionary database cache requires an ArrayBuffer.',
    )
  }

  const db = await openIDB()

  try {
    await new Promise(
      (resolve, reject) => {
        const transaction =
          db.transaction(
            STORE_NAME,
            'readwrite',
          )

        const store =
          transaction.objectStore(
            STORE_NAME,
          )

        store.put(
          buffer,
          DB_FILE_KEY,
        )

        transaction.oncomplete = () => {
          resolve()
        }

        transaction.onerror = () => {
          reject(
            transaction.error
            || new Error(
              'Could not cache the dictionary database.',
            ),
          )
        }

        transaction.onabort = () => {
          reject(
            transaction.error
            || new Error(
              'Dictionary cache write transaction was aborted.',
            ),
          )
        }
      },
    )
  } finally {
    db.close()
  }
}