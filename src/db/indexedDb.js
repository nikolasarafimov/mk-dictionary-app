const DB_NAME =
  'mk-dictionary-cache'

const STORE_NAME =
  'files'

const DB_VERSION = 3

const CACHE_VERSION =
  '1'


const DB_FILE_NAME =
  import.meta.env.PROD
    ? 'msd-mk-demo.sqlite'
    : 'msd-mk.sqlite'

const DB_FILE_KEY =
  `${DB_FILE_NAME}:v${CACHE_VERSION}`


function getIndexedDbFactory() {
  if (
    typeof indexedDB
    === 'undefined'
  ) {
    return null
  }

  return indexedDB
}


function openIDB() {
  return new Promise(
    (
      resolve,
      reject,
    ) => {
      const factory =
        getIndexedDbFactory()


      if (!factory) {
        reject(
          new Error(
            'IndexedDB is not available in this environment.',
          ),
        )

        return
      }


      const request =
        factory.open(
          DB_NAME,
          DB_VERSION,
        )

      let settled = false


      request.onupgradeneeded =
        () => {
          const db =
            request.result


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


      request.onsuccess =
        () => {
          const db =
            request.result


          if (settled) {
            db.close()

            return
          }


          settled = true


          db.onversionchange =
            () => {
              db.close()
            }


          resolve(
            db,
          )
        }


      request.onerror =
        () => {
          if (settled) {
            return
          }


          settled = true

          reject(
            request.error
            || new Error(
              'Could not open the dictionary cache.',
            ),
          )
        }


      request.onblocked =
        () => {
          if (settled) {
            return
          }


          settled = true

          reject(
            new Error(
              'Dictionary cache upgrade is blocked by another open tab.',
            ),
          )
        }
    },
  )
}


export async function loadCachedDbFile() {
  const db =
    await openIDB()


  try {
    return await new Promise(
      (
        resolve,
        reject,
      ) => {
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

        let result = null


        request.onsuccess =
          () => {
            result =
              request.result
              ?? null
          }


        request.onerror =
          () => {
            reject(
              request.error
              || new Error(
                'Could not read the cached dictionary database.',
              ),
            )
          }


        transaction.oncomplete =
          () => {
            resolve(
              result,
            )
          }


        transaction.onerror =
          () => {
            reject(
              transaction.error
              || new Error(
                'Could not read the dictionary cache.',
              ),
            )
          }


        transaction.onabort =
          () => {
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


export async function saveDbFile(
  buffer,
) {
  if (
    !(buffer instanceof ArrayBuffer)
  ) {
    throw new TypeError(
      'Dictionary database cache requires an ArrayBuffer.',
    )
  }


  if (
    buffer.byteLength === 0
  ) {
    throw new TypeError(
      'Dictionary database cache cannot store an empty ArrayBuffer.',
    )
  }


  const db =
    await openIDB()


  try {
    await new Promise(
      (
        resolve,
        reject,
      ) => {
        const transaction =
          db.transaction(
            STORE_NAME,
            'readwrite',
          )

        const store =
          transaction.objectStore(
            STORE_NAME,
          )

        const request =
          store.put(
            buffer,
            DB_FILE_KEY,
          )


        request.onerror =
          () => {
            reject(
              request.error
              || new Error(
                'Could not cache the dictionary database.',
              ),
            )
          }


        transaction.oncomplete =
          () => {
            resolve()
          }


        transaction.onerror =
          () => {
            reject(
              transaction.error
              || new Error(
                'Could not cache the dictionary database.',
              ),
            )
          }


        transaction.onabort =
          () => {
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