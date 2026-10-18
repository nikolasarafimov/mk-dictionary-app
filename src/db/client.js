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

const DEFAULT_SEARCH_LIMIT = 10000
const DEFAULT_SUGGESTION_LIMIT = 10
const MAX_SUGGESTION_LIMIT = 25
const MAX_FUZZY_CANDIDATES = 450

const MACEDONIAN_LOCALE =
  'mk-MK'


const macedonianCollator =
  new Intl.Collator(
    MACEDONIAN_LOCALE,
    {
      sensitivity: 'base',
    },
  )


let worker = null
let initPromise = null
let nextId = 1
let rowIdRange = null

const pending =
  new Map()


function normalizeText(
  value,
) {
  return String(
    value ?? '',
  ).trim()
}


function normalizeLower(
  value,
) {
  return normalizeText(
    value,
  ).toLocaleLowerCase(
    MACEDONIAN_LOCALE,
  )
}


function escapeLikePattern(
  value,
) {
  return String(
    value ?? '',
  ).replace(
    /[\\%_]/g,
    '\\$&',
  )
}


function getCaseVariants(
  value,
) {
  const trimmed =
    normalizeText(
      value,
    )


  if (!trimmed) {
    return []
  }


  const lower =
    trimmed.toLocaleLowerCase(
      MACEDONIAN_LOCALE,
    )

  const upper =
    trimmed.toLocaleUpperCase(
      MACEDONIAN_LOCALE,
    )

  const title =
    lower
      ? (
          lower
            .charAt(0)
            .toLocaleUpperCase(
              MACEDONIAN_LOCALE,
            )
          + lower.slice(1)
        )
      : lower


  return [
    ...new Set([
      trimmed,
      lower,
      upper,
      title,
    ]),
  ]
}


function sanitizeLimit(
  value,
  fallback,
  maximum = DEFAULT_SEARCH_LIMIT,
) {
  const parsed =
    Number.parseInt(
      value,
      10,
    )


  if (
    !Number.isInteger(
      parsed,
    )
    || parsed <= 0
  ) {
    return fallback
  }


  return Math.min(
    parsed,
    maximum,
  )
}


function buildLikeClause(
  column,
  count,
) {
  return Array.from(
    {
      length: count,
    },
    () =>
      `${column} LIKE ? ESCAPE '\\'`,
  ).join(' OR ')
}


function buildExactClause(
  column,
  count,
) {
  const placeholders =
    Array.from(
      {
        length: count,
      },
      () => '?',
    ).join(', ')


  return `${column} IN (${placeholders})`
}


function normalizeRow(
  row,
) {
  if (
    !row
    || typeof row !== 'object'
  ) {
    return null
  }


  const form =
    normalizeText(
      row.form,
    )


  if (!form) {
    return null
  }


  return {
    form,

    lemma:
      normalizeText(
        row.lemma,
      ),

    tag:
      normalizeText(
        row.tag,
      ),
  }
}


function getRowKey(
  row,
) {
  return normalizeLower(
    row?.form,
  )
}


function mergeUniqueRows(
  target,
  rows,
  seen,
  limit,
  matchType = '',
) {
  if (
    !Array.isArray(
      rows,
    )
  ) {
    return
  }


  for (
    const row
    of rows
  ) {
    if (
      target.length
      >= limit
    ) {
      break
    }


    const normalized =
      normalizeRow(
        row,
      )


    if (!normalized) {
      continue
    }


    const key =
      getRowKey(
        normalized,
      )


    if (
      !key
      || seen.has(
        key,
      )
    ) {
      continue
    }


    seen.add(
      key,
    )

    target.push({
      ...normalized,
      matchType,
    })
  }
}


function mergeUniqueForms(
  target,
  rows,
  seen,
  limit,
  matchType,
) {
  if (
    !Array.isArray(
      rows,
    )
  ) {
    return
  }


  for (
    const row
    of rows
  ) {
    if (
      target.length
      >= limit
    ) {
      break
    }


    const normalized =
      normalizeRow(
        row,
      )


    if (!normalized) {
      continue
    }


    const key =
      getRowKey(
        normalized,
      )


    if (
      !key
      || seen.has(
        key,
      )
    ) {
      continue
    }


    seen.add(
      key,
    )

    target.push({
      ...normalized,
      matchType,
    })
  }
}


function rejectPendingRequests(
  error,
) {
  for (
    const {
      reject,
    }
    of pending.values()
  ) {
    reject(
      error,
    )
  }


  pending.clear()
}


function getWorker() {
  if (worker) {
    return worker
  }


  const createdWorker =
    new Worker(
      new URL(
        './sqlWorker.js',
        import.meta.url,
      ),
      {
        type: 'module',
      },
    )


  worker =
    createdWorker


  const handleWorkerFailure =
    () => {
      if (
        worker
        !== createdWorker
      ) {
        return
      }


      const error =
        new Error(
          'The dictionary database worker stopped unexpectedly.',
        )


      rejectPendingRequests(
        error,
      )

      createdWorker.terminate()

      worker = null
      initPromise = null
      rowIdRange = null
    }


  createdWorker.onmessage =
    (event) => {
      const {
        id,
        result,
        error,
      } =
        event.data || {}


      const entry =
        pending.get(
          id,
        )


      if (!entry) {
        return
      }


      pending.delete(
        id,
      )


      if (error) {
        entry.reject(
          new Error(
            typeof error === 'string'
              ? error
              : 'Database worker request failed.',
          ),
        )

        return
      }


      entry.resolve(
        result,
      )
    }


  createdWorker.onerror =
    handleWorkerFailure

  createdWorker.onmessageerror =
    handleWorkerFailure


  return createdWorker
}


function postToWorker(
  type,
  payload,
  transferables = [],
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
        activeWorker.postMessage(
          {
            id,
            type,
            payload,
          },
          transferables,
        )
      } catch (error) {
        pending.delete(
          id,
        )

        reject(
          error,
        )
      }
    },
  )
}


async function fetchDatabaseFile() {
  const response =
    await fetch(
      DB_URL,
    )


  if (!response.ok) {
    throw new Error(
      `Could not load database file: ${DB_URL}`,
    )
  }


  return response.arrayBuffer()
}


async function cacheDatabaseFile(
  buffer,
) {
  try {
    await saveDbFile(
      buffer,
    )

    return true
  } catch {
    return false
  }
}


async function loadDatabaseFile() {
  try {
    const cachedBuffer =
      await loadCachedDbFile()


    if (
      cachedBuffer
      instanceof ArrayBuffer
      && cachedBuffer.byteLength > 0
    ) {
      return {
        buffer:
          cachedBuffer,

        fromCache:
          true,
      }
    }
  } catch {
    return {
      buffer:
        await fetchDatabaseFile(),

      fromCache:
        false,
    }
  }


  const buffer =
    await fetchDatabaseFile()


  await cacheDatabaseFile(
    buffer,
  )


  return {
    buffer,

    fromCache:
      false,
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
        } =
          await loadDatabaseFile()


        try {
          await postToWorker(
            'init',
            {
              dbArrayBuffer:
                buffer,
            },
            [
              buffer,
            ],
          )
        } catch (error) {
          if (!fromCache) {
            throw error
          }


          const freshBuffer =
            await fetchDatabaseFile()


          await cacheDatabaseFile(
            freshBuffer,
          )


          await postToWorker(
            'init',
            {
              dbArrayBuffer:
                freshBuffer,
            },
            [
              freshBuffer,
            ],
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
  const query =
    normalizeText(
      sql,
    )


  if (!query) {
    return []
  }


  await initDbIfNeeded()


  const result =
    await postToWorker(
      'query',
      {
        sql:
          query,

        params:
          Array.isArray(
            params,
          )
            ? params
            : [],
      },
    )


  if (
    !result
    || !Array.isArray(
      result.columns,
    )
    || !Array.isArray(
      result.values,
    )
  ) {
    return []
  }


  const {
    columns,
    values,
  } = result


  return values
    .filter(
      Array.isArray,
    )
    .map(
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


async function queryExactRows(
  column,
  value,
  limit,
) {
  const variants =
    getCaseVariants(
      value,
    )


  if (
    variants.length === 0
  ) {
    return []
  }


  const safeLimit =
    sanitizeLimit(
      limit,
      DEFAULT_SEARCH_LIMIT,
    )


  return runQuery(
    `
      SELECT DISTINCT
        form,
        lemma,
        tag
      FROM words
      WHERE ${buildExactClause(
        column,
        variants.length,
      )}
      ORDER BY
        LENGTH(form),
        form,
        lemma,
        tag
      LIMIT ?
    `,
    [
      ...variants,
      safeLimit,
    ],
  )
}


async function queryLikeRows(
  column,
  value,
  mode,
  limit,
) {
  const variants =
    getCaseVariants(
      value,
    )


  if (
    variants.length === 0
  ) {
    return []
  }


  const safeLimit =
    sanitizeLimit(
      limit,
      DEFAULT_SEARCH_LIMIT,
    )


  const patterns =
    variants.map(
      (variant) => {
        const escaped =
          escapeLikePattern(
            variant,
          )


        if (
          mode === 'prefix'
        ) {
          return `${escaped}%`
        }


        return `%${escaped}%`
      },
    )


  return runQuery(
    `
      SELECT DISTINCT
        form,
        lemma,
        tag
      FROM words
      WHERE (
        ${buildLikeClause(
          column,
          patterns.length,
        )}
      )
      ORDER BY
        LENGTH(form),
        form,
        lemma,
        tag
      LIMIT ?
    `,
    [
      ...patterns,
      safeLimit,
    ],
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


  const count =
    Number(
      rows[0]?.cnt,
    )


  return Number.isFinite(
    count,
  )
    ? count
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


  const minId =
    Number(
      rows[0]?.minId,
    )

  const maxId =
    Number(
      rows[0]?.maxId,
    )


  if (
    !Number.isFinite(
      minId,
    )
    || !Number.isFinite(
      maxId,
    )
  ) {
    rowIdRange = [
      null,
      null,
    ]
  } else {
    rowIdRange = [
      minId,
      maxId,
    ]
  }


  return rowIdRange
}


export async function getRandomForm() {
  const [
    minId,
    maxId,
  ] =
    await getRowIdRange()


  if (
    minId === null
    || maxId === null
    || maxId < minId
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


  const form =
    normalizeText(
      rows[0]?.form,
    )


  return form || null
}


export async function getWordsByLetter(
  letter,
  limit = DEFAULT_SEARCH_LIMIT,
) {
  const trimmed =
    normalizeText(
      letter,
    )


  if (!trimmed) {
    return []
  }


  const safeLimit =
    sanitizeLimit(
      limit,
      DEFAULT_SEARCH_LIMIT,
    )

  const variants =
    getCaseVariants(
      trimmed,
    )

  const patterns =
    variants.map(
      (variant) =>
        `${escapeLikePattern(
          variant,
        )}%`,
    )


  return runQuery(
    `
      SELECT
        form,
        lemma,
        tag
      FROM words
      WHERE (
        ${buildLikeClause(
          'form',
          patterns.length,
        )}
      )
      ORDER BY form
      LIMIT ?
    `,
    [
      ...patterns,
      safeLimit,
    ],
  )
}


export async function getWordByForm(
  form,
) {
  const trimmed =
    normalizeText(
      form,
    )


  if (!trimmed) {
    return null
  }


  const variants =
    getCaseVariants(
      trimmed,
    )

  const exactClause =
    buildExactClause(
      'form',
      variants.length,
    )

  const rankSql =
    variants
      .map(
        (
          _,
          index,
        ) =>
          `WHEN form = ? THEN ${index}`,
      )
      .join('\n')


  const rows =
    await runQuery(
      `
        SELECT
          form,
          lemma,
          tag
        FROM words
        WHERE ${exactClause}
        ORDER BY
          CASE
            ${rankSql}
            ELSE 999
          END,
          rowid
        LIMIT 1
      `,
      [
        ...variants,
        ...variants,
      ],
    )


  return normalizeRow(
    rows[0],
  )
}


export async function searchForms(
  term,
  limit = DEFAULT_SEARCH_LIMIT,
) {
  const trimmed =
    normalizeText(
      term,
    )


  if (!trimmed) {
    return []
  }


  const safeLimit =
    sanitizeLimit(
      limit,
      DEFAULT_SEARCH_LIMIT,
    )

  const results = []
  const seen =
    new Set()


  const addStage =
    async (
      loader,
      matchType,
    ) => {
      if (
        results.length
        >= safeLimit
      ) {
        return
      }


      const remaining =
        safeLimit
        - results.length

      const rows =
        await loader(
          remaining,
        )


      mergeUniqueRows(
        results,
        rows,
        seen,
        safeLimit,
        matchType,
      )
    }


  await addStage(
    (remaining) =>
      queryExactRows(
        'form',
        trimmed,
        remaining,
      ),
    'exact-form',
  )

  await addStage(
    (remaining) =>
      queryLikeRows(
        'form',
        trimmed,
        'prefix',
        remaining,
      ),
    'prefix-form',
  )

  await addStage(
    (remaining) =>
      queryExactRows(
        'lemma',
        trimmed,
        remaining,
      ),
    'exact-lemma',
  )

  await addStage(
    (remaining) =>
      queryLikeRows(
        'lemma',
        trimmed,
        'prefix',
        remaining,
      ),
    'prefix-lemma',
  )

  await addStage(
    (remaining) =>
      queryLikeRows(
        'form',
        trimmed,
        'contains',
        remaining,
      ),
    'contains-form',
  )

  await addStage(
    (remaining) =>
      queryLikeRows(
        'lemma',
        trimmed,
        'contains',
        remaining,
      ),
    'contains-lemma',
  )


  return results
}


export async function getSearchSuggestionRows(
  term,
  limit = DEFAULT_SUGGESTION_LIMIT,
) {
  const trimmed =
    normalizeText(
      term,
    )


  if (!trimmed) {
    return []
  }


  const safeLimit =
    sanitizeLimit(
      limit,
      DEFAULT_SUGGESTION_LIMIT,
      MAX_SUGGESTION_LIMIT,
    )

  const results = []
  const seen =
    new Set()


  const addStage =
    async (
      loader,
      matchType,
    ) => {
      if (
        results.length
        >= safeLimit
      ) {
        return
      }


      const remaining =
        safeLimit
        - results.length

      const queryLimit =
        Math.min(
          remaining * 3,
          50,
        )

      const rows =
        await loader(
          queryLimit,
        )


      mergeUniqueForms(
        results,
        rows,
        seen,
        safeLimit,
        matchType,
      )
    }


  await addStage(
    (queryLimit) =>
      queryExactRows(
        'form',
        trimmed,
        queryLimit,
      ),
    'exact-form',
  )

  await addStage(
    (queryLimit) =>
      queryLikeRows(
        'form',
        trimmed,
        'prefix',
        queryLimit,
      ),
    'prefix-form',
  )

  await addStage(
    (queryLimit) =>
      queryExactRows(
        'lemma',
        trimmed,
        queryLimit,
      ),
    'exact-lemma',
  )

  await addStage(
    (queryLimit) =>
      queryLikeRows(
        'lemma',
        trimmed,
        'prefix',
        queryLimit,
      ),
    'prefix-lemma',
  )

  await addStage(
    (queryLimit) =>
      queryLikeRows(
        'form',
        trimmed,
        'contains',
        queryLimit,
      ),
    'contains-form',
  )

  await addStage(
    (queryLimit) =>
      queryLikeRows(
        'lemma',
        trimmed,
        'contains',
        queryLimit,
      ),
    'contains-lemma',
  )


  return results
}


export async function getSearchSuggestions(
  term,
  limit = DEFAULT_SUGGESTION_LIMIT,
) {
  const rows =
    await getSearchSuggestionRows(
      term,
      limit,
    )


  return rows
    .map(
      (row) =>
        normalizeText(
          row.form,
        ),
    )
    .filter(Boolean)
}


function levenshteinDistance(
  first,
  second,
) {
  const a =
    normalizeLower(
      first,
    )

  const b =
    normalizeLower(
      second,
    )


  if (a === b) {
    return 0
  }


  const firstChars =
    Array.from(
      a,
    )

  const secondChars =
    Array.from(
      b,
    )


  if (
    firstChars.length === 0
  ) {
    return secondChars.length
  }


  if (
    secondChars.length === 0
  ) {
    return firstChars.length
  }


  let previous =
    Array.from(
      {
        length:
          secondChars.length
          + 1,
      },
      (
        _,
        index,
      ) => index,
    )


  for (
    let firstIndex = 0;
    firstIndex < firstChars.length;
    firstIndex += 1
  ) {
    const current = [
      firstIndex + 1,
    ]


    for (
      let secondIndex = 0;
      secondIndex < secondChars.length;
      secondIndex += 1
    ) {
      const substitutionCost =
        firstChars[firstIndex]
        === secondChars[secondIndex]
          ? 0
          : 1


      current.push(
        Math.min(
          current[secondIndex]
            + 1,

          previous[
            secondIndex + 1
          ]
            + 1,

          previous[
            secondIndex
          ]
            + substitutionCost,
        ),
      )
    }


    previous =
      current
  }


  return previous[
    secondChars.length
  ]
}


export async function getDidYouMeanSuggestions(
  term,
  limit = 5,
) {
  const trimmed =
    normalizeText(
      term,
    )


  if (!trimmed) {
    return []
  }


  const safeLimit =
    sanitizeLimit(
      limit,
      5,
      10,
    )

  const chars =
    Array.from(
      trimmed,
    )


  if (
    chars.length <= 2
  ) {
    return getSearchSuggestions(
      trimmed,
      safeLimit,
    )
  }


  const twoCharacterSeed =
    chars
      .slice(
        0,
        2,
      )
      .join('')


  let candidates =
    await queryLikeRows(
      'form',
      twoCharacterSeed,
      'prefix',
      MAX_FUZZY_CANDIDATES,
    )


  if (
    candidates.length < 30
  ) {
    const broader =
      await queryLikeRows(
        'form',
        chars[0],
        'prefix',
        MAX_FUZZY_CANDIDATES,
      )

    const seen =
      new Set(
        candidates
          .map(
            getRowKey,
          )
          .filter(Boolean),
      )


    for (
      const row
      of broader
    ) {
      const key =
        getRowKey(
          row,
        )


      if (
        key
        && !seen.has(
          key,
        )
      ) {
        seen.add(
          key,
        )

        candidates.push(
          row,
        )
      }


      if (
        candidates.length
        >= MAX_FUZZY_CANDIDATES
      ) {
        break
      }
    }
  }


  const target =
    normalizeLower(
      trimmed,
    )

  const targetLength =
    Array.from(
      target,
    ).length

  const maxDistance =
    Math.max(
      2,
      Math.ceil(
        targetLength
        * 0.34,
      ),
    )

  const byForm =
    new Map()


  for (
    const candidate
    of candidates
  ) {
    const form =
      normalizeText(
        candidate?.form,
      )


    if (!form) {
      continue
    }


    const formKey =
      normalizeLower(
        form,
      )


    if (
      formKey === target
    ) {
      continue
    }


    const formDistance =
      levenshteinDistance(
        target,
        form,
      )

    const lemma =
      normalizeText(
        candidate?.lemma,
      )

    const lemmaDistance =
      lemma
        ? levenshteinDistance(
            target,
            lemma,
          )
        : Number.POSITIVE_INFINITY

    const distance =
      Math.min(
        formDistance,
        lemmaDistance,
      )


    if (
      distance
      > maxDistance
    ) {
      continue
    }


    const existing =
      byForm.get(
        formKey,
      )


    if (
      !existing
      || distance
        < existing.distance
    ) {
      byForm.set(
        formKey,
        {
          form,

          distance,

          lengthDifference:
            Math.abs(
              Array.from(
                form,
              ).length
              - targetLength,
            ),
        },
      )
    }
  }


  return [
    ...byForm.values(),
  ]
    .sort(
      (
        first,
        second,
      ) =>
        first.distance
          - second.distance
        || first.lengthDifference
          - second.lengthDifference
        || macedonianCollator.compare(
          first.form,
          second.form,
        ),
    )
    .slice(
      0,
      safeLimit,
    )
    .map(
      (item) =>
        item.form,
    )
}


export async function getSimilarForms(
  lemma,
  form,
) {
  const normalizedLemma =
    normalizeText(
      lemma,
    )

  const normalizedForm =
    normalizeText(
      form,
    )


  if (
    !normalizedLemma
    || !normalizedForm
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
        normalizedLemma,
        normalizedForm,
      ],
    )


  return rows
    .map(
      (row) =>
        normalizeText(
          row.form,
        ),
    )
    .filter(Boolean)
}


export async function getWordsByForms(
  forms,
) {
  if (
    !Array.isArray(
      forms,
    )
    || forms.length === 0
  ) {
    return []
  }


  const seen =
    new Set()

  const uniqueForms = []


  for (
    const value
    of forms
  ) {
    const form =
      normalizeText(
        value,
      )


    if (!form) {
      continue
    }


    const key =
      normalizeLower(
        form,
      )


    if (
      seen.has(
        key,
      )
    ) {
      continue
    }


    seen.add(
      key,
    )

    uniqueForms.push(
      form,
    )
  }


  if (
    uniqueForms.length === 0
  ) {
    return []
  }


  const placeholders =
    uniqueForms
      .map(
        () => '?',
      )
      .join(', ')


  return runQuery(
    `
      SELECT
        form,
        lemma,
        tag
      FROM words
      WHERE form IN (
        ${placeholders}
      )
      ORDER BY form
    `,
    uniqueForms,
  )
}