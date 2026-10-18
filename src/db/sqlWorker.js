import initSqlJs
  from 'sql.js'


let db = null
let sqlJsPromise = null


function getSqlJs() {
  if (!sqlJsPromise) {
    sqlJsPromise =
      initSqlJs({
        locateFile:
          (file) =>
            `${import.meta.env.BASE_URL}${file}`,
      }).catch(
        (error) => {
          sqlJsPromise = null

          throw error
        },
      )
  }


  return sqlJsPromise
}


async function initializeDatabase(
  dbArrayBuffer,
) {
  if (
    !(dbArrayBuffer instanceof ArrayBuffer)
  ) {
    throw new TypeError(
      'Database initialization requires an ArrayBuffer.',
    )
  }


  if (
    dbArrayBuffer.byteLength === 0
  ) {
    throw new TypeError(
      'Database initialization requires a non-empty ArrayBuffer.',
    )
  }


  const SQL =
    await getSqlJs()


  const nextDb =
    new SQL.Database(
      new Uint8Array(
        dbArrayBuffer,
      ),
    )


  const previousDb =
    db

  db =
    nextDb


  if (previousDb) {
    try {
      previousDb.close()
    } catch {
      return
    }
  }
}


function normalizeParams(
  params,
) {
  if (
    params === undefined
    || params === null
  ) {
    return []
  }


  if (
    Array.isArray(
      params,
    )
  ) {
    return params
  }


  if (
    typeof params === 'object'
  ) {
    return params
  }


  throw new TypeError(
    'SQL query parameters must be an array or object.',
  )
}


function hasParams(
  params,
) {
  if (
    Array.isArray(
      params,
    )
  ) {
    return params.length > 0
  }


  return Object.keys(
    params,
  ).length > 0
}


function executeQuery(
  sql,
  params = [],
) {
  if (!db) {
    throw new Error(
      'Dictionary database is not initialized.',
    )
  }


  if (
    typeof sql !== 'string'
    || !sql.trim()
  ) {
    throw new TypeError(
      'A non-empty SQL query is required.',
    )
  }


  const query =
    sql.trim()

  const normalizedParams =
    normalizeParams(
      params,
    )

  const statement =
    db.prepare(
      query,
    )


  try {
    if (
      hasParams(
        normalizedParams,
      )
    ) {
      statement.bind(
        normalizedParams,
      )
    }


    const columns =
      statement.getColumnNames()

    const values = []


    while (
      statement.step()
    ) {
      values.push(
        statement.get(),
      )
    }


    if (
      columns.length === 0
    ) {
      return null
    }


    return {
      columns,
      values,
    }
  } finally {
    statement.free()
  }
}


self.onmessage =
  async (event) => {
    const {
      id,
      type,
      payload,
    } =
      event.data || {}


    try {
      if (
        type === 'init'
      ) {
        await initializeDatabase(
          payload?.dbArrayBuffer,
        )


        self.postMessage({
          id,
          result: 'ok',
        })

        return
      }


      if (
        type === 'query'
      ) {
        const result =
          executeQuery(
            payload?.sql,
            payload?.params,
          )


        self.postMessage({
          id,
          result,
        })

        return
      }


      throw new Error(
        `Unsupported worker message type: ${String(
          type,
        )}`,
      )
    } catch (error) {
      self.postMessage({
        id,

        error:
          error instanceof Error
            ? error.message
            : String(
              error,
            ),
      })
    }
  }