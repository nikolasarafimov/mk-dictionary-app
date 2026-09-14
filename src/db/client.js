import {
  loadCachedDbFile,
  saveDbFile,
} from './indexedDb'

const DB_FILE =
  import.meta.env.PROD
    ? 'msd-mk-demo.sqlite'
    : 'msd-mk.sqlite'

const DB_URL =
  `${import.meta.env.BASE_URL}${DB_FILE}`

let worker = null
let initPromise = null
let nextId = 1
let rowIdRange = null

const pending = new Map()


function rejectPendingRequests(error) {
  for (
    const {
      reject,
    } of pending.values()
  ) {
    reject(error)
  }

  pending.clear()
}


function getWorker() {
  if (worker) {
    return worker
  }

  worker = new Worker(
    new URL(
      './sqlWorker.js',
      import.meta.url,
    ),
    {
      type: 'module',
    },
  )

  worker.onmessage = (event) => {
    const {
      id,
      result,
      error,
    } = event.data

    const entry =
      pending.get(id)

    if (!entry) {
      return
    }

    pending.delete(id)

    if (error) {
      entry.reject(
        new Error(error),
      )

      return
    }

    entry.resolve(result)
  }

  worker.onerror = () => {
    const error =
      new Error(
        'The dictionary database worker stopped unexpectedly.',
      )

    rejectPendingRequests(
      error,
    )

    worker.terminate()
    worker = null

    initPromise = null
    rowIdRange = null
  }

  return worker
}


function postToWorker(
  type,
  payload,
) {
  const activeWorker =
    getWorker()

  return new Promise(
    (
      resolve,
      reject,
    ) => {
      const id =
        nextId

      nextId += 1

      pending.set(
        id,
        {
          resolve,
          reject,
        },
      )

      try {
        activeWorker.postMessage({
          id,
          type,
          payload,
        })
      } catch (error) {
        pending.delete(id)
        reject(error)
      }
    },
  )
}


async function fetchDatabaseFile() {
  const response =
    await fetch(DB_URL)

  if (!response.ok) {
    throw new Error(
      `Could not load database file: ${DB_URL}`,
    )
  }

  return response.arrayBuffer()
}


async function cacheDatabaseFile(buffer) {
  try {
    await saveDbFile(buffer)
  } catch {
    console.warn(
      'Could not cache the dictionary database in IndexedDB.',
    )
  }
}


async function loadDatabaseFile() {
  try {
    const cachedBuffer =
      await loadCachedDbFile()

    if (cachedBuffer) {
      return {
        buffer: cachedBuffer,
        fromCache: true,
      }
    }
  } catch {
    console.warn(
      'Could not read the dictionary database from IndexedDB. Falling back to the network copy.',
    )
  }

  const buffer =
    await fetchDatabaseFile()

  await cacheDatabaseFile(
    buffer,
  )

  return {
    buffer,
    fromCache: false,
  }
}


export async function initDbIfNeeded() {
  if (initPromise) {
    return initPromise
  }

  initPromise =
    (async () => {
      try {
        const {
          buffer,
          fromCache,
        } = await loadDatabaseFile()

        try {
          await postToWorker(
            'init',
            {
              dbArrayBuffer: buffer,
            },
          )
        } catch (error) {
          if (!fromCache) {
            throw error
          }

          console.warn(
            'The cached dictionary database could not be opened. Loading a fresh copy.',
          )

          const freshBuffer =
            await fetchDatabaseFile()

          await postToWorker(
            'init',
            {
              dbArrayBuffer:
                freshBuffer,
            },
          )

          await cacheDatabaseFile(
            freshBuffer,
          )
        }
      } catch (error) {
        initPromise = null
        throw error
      }
    })()

  return initPromise
}


export async function runQuery(
  sql,
  params = [],
) {
  await initDbIfNeeded()

  const result =
    await postToWorker(
      'query',
      {
        sql,
        params,
      },
    )

  if (!result) {
    return []
  }

  const {
    columns,
    values,
  } = result

  return values.map(
    (row) =>
      Object.fromEntries(
        columns.map(
          (
            column,
            index,
          ) => [
            column,
            row[index],
          ],
        ),
      ),
  )
}


export async function getTotalForms() {
  const rows =
    await runQuery(
      `
        SELECT COUNT(*) AS cnt
        FROM words
      `,
    )

  return rows.length
    ? rows[0].cnt
    : 0
}


async function getRowIdRange() {
  if (rowIdRange) {
    return rowIdRange
  }

  const rows =
    await runQuery(
      `
        SELECT
          MIN(rowid) AS minId,
          MAX(rowid) AS maxId
        FROM words
      `,
    )

  rowIdRange =
    rows.length
      ? [
          rows[0].minId,
          rows[0].maxId,
        ]
      : [
          1,
          1,
        ]

  return rowIdRange
}


export async function getRandomForm() {
  const [
    minId,
    maxId,
  ] = await getRowIdRange()

  if (
    minId === null
    || maxId === null
  ) {
    return null
  }

  const randomId =
    Math.floor(
      Math.random()
      * (
        maxId
        - minId
        + 1
      ),
    )
    + minId

  const rows =
    await runQuery(
      `
        SELECT form
        FROM words
        WHERE rowid >= ?
        ORDER BY rowid
        LIMIT 1
      `,
      [
        randomId,
      ],
    )

  return rows.length
    ? rows[0].form
    : null
}


export async function getWordsByLetter(
  letter,
) {
  const trimmed =
    String(letter).trim()

  if (!trimmed) {
    return []
  }

  const lowerPattern =
    `${trimmed.toLocaleLowerCase('mk-MK')}%`

  const upperPattern =
    `${trimmed.toLocaleUpperCase('mk-MK')}%`

  return runQuery(
    `
      SELECT
        form,
        lemma,
        tag
      FROM words
      WHERE form LIKE ?
         OR form LIKE ?
      ORDER BY form
      LIMIT 10000
    `,
    [
      lowerPattern,
      upperPattern,
    ],
  )
}


export async function getWordByForm(
  form,
) {
  const trimmed =
    String(form).trim()

  if (!trimmed) {
    return null
  }

  const lowerForm =
    trimmed.toLocaleLowerCase(
      'mk-MK',
    )

  const upperForm =
    trimmed.toLocaleUpperCase(
      'mk-MK',
    )

  const rows =
    await runQuery(
      `
        SELECT
          form,
          lemma,
          tag
        FROM words
        WHERE form = ?
           OR form = ?
           OR form = ?
        LIMIT 1
      `,
      [
        trimmed,
        lowerForm,
        upperForm,
      ],
    )

  return rows[0] || null
}


export async function searchForms(
  term,
) {
  const trimmed =
    String(term).trim()

  if (!trimmed) {
    return []
  }

  const lowerPattern =
    `%${trimmed.toLocaleLowerCase('mk-MK')}%`

  const upperPattern =
    `%${trimmed.toLocaleUpperCase('mk-MK')}%`

  return runQuery(
    `
      SELECT
        form,
        lemma,
        tag
      FROM words
      WHERE form LIKE ?
         OR form LIKE ?
      ORDER BY form
      LIMIT 10000
    `,
    [
      lowerPattern,
      upperPattern,
    ],
  )
}


export async function getSearchSuggestions(
  term,
  limit = 10,
) {
  const trimmed =
    String(term).trim()

  if (!trimmed) {
    return []
  }

  const safeLimit =
    Number.isInteger(limit)
    && limit > 0
      ? limit
      : 10

  const lower =
    trimmed.toLocaleLowerCase(
      'mk-MK',
    )

  const upper =
    trimmed.toLocaleUpperCase(
      'mk-MK',
    )

  const starts =
    await runQuery(
      `
        SELECT DISTINCT form
        FROM words
        WHERE form LIKE ?
           OR form LIKE ?
        ORDER BY form
        LIMIT ?
      `,
      [
        `${lower}%`,
        `${upper}%`,
        safeLimit,
      ],
    )

  if (
    starts.length
    >= safeLimit
  ) {
    return starts.map(
      (row) => row.form,
    )
  }

  const remaining =
    safeLimit
    - starts.length

  const existingForms =
    starts.map(
      (row) => row.form,
    )

  const excludedPlaceholders =
    existingForms.length > 0
      ? existingForms
        .map(() => '?')
        .join(', ')
      : ''

  const exclusionClause =
    existingForms.length > 0
      ? `AND form NOT IN (${excludedPlaceholders})`
      : ''

  const contains =
    await runQuery(
      `
        SELECT DISTINCT form
        FROM words
        WHERE (
          form LIKE ?
          OR form LIKE ?
        )
        ${exclusionClause}
        ORDER BY form
        LIMIT ?
      `,
      [
        `%${lower}%`,
        `%${upper}%`,
        ...existingForms,
        remaining,
      ],
    )

  return [
    ...starts,
    ...contains,
  ].map(
    (row) => row.form,
  )
}


export async function getSimilarForms(
  lemma,
  form,
) {
  if (
    !lemma
    || !form
  ) {
    return []
  }

  const rows =
    await runQuery(
      `
        SELECT DISTINCT form
        FROM words
        WHERE lemma = ?
          AND form != ?
        ORDER BY RANDOM()
        LIMIT 8
      `,
      [
        lemma,
        form,
      ],
    )

  return rows.map(
    (row) => row.form,
  )
}


export async function getWordsByForms(
  forms,
) {
  if (
    !Array.isArray(forms)
    || forms.length === 0
  ) {
    return []
  }

  const uniqueForms = [
    ...new Set(
      forms
        .filter(
          (form) =>
            typeof form === 'string',
        )
        .map(
          (form) =>
            form.trim(),
        )
        .filter(Boolean),
    ),
  ]

  if (
    uniqueForms.length === 0
  ) {
    return []
  }

  const placeholders =
    uniqueForms
      .map(() => '?')
      .join(', ')

  return runQuery(
    `
      SELECT
        form,
        lemma,
        tag
      FROM words
      WHERE form IN (${placeholders})
      ORDER BY form
    `,
    uniqueForms,
  )
}