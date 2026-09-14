import initSqlJs from 'sql.js'

let db = null
let sqlJsPromise = null

function getSqlJs() {
  if (!sqlJsPromise) {
    sqlJsPromise = initSqlJs({
      locateFile: (file) =>
        `${import.meta.env.BASE_URL}${file}`,
    })
  }

  return sqlJsPromise
}

async function initializeDatabase(dbArrayBuffer) {
  if (!(dbArrayBuffer instanceof ArrayBuffer)) {
    throw new TypeError(
      'Database initialization requires an ArrayBuffer.',
    )
  }

  const SQL = await getSqlJs()

  if (db) {
    db.close()
  }

  db = new SQL.Database(
    new Uint8Array(dbArrayBuffer),
  )
}

function executeQuery(sql, params = []) {
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

  const results = db.exec(
    sql,
    params,
  )

  return results[0] || null
}

self.onmessage = async (event) => {
  const {
    id,
    type,
    payload = {},
  } = event.data || {}

  try {
    if (type === 'init') {
      await initializeDatabase(
        payload.dbArrayBuffer,
      )

      self.postMessage({
        id,
        result: 'ok',
      })

      return
    }

    if (type === 'query') {
      const result = executeQuery(
        payload.sql,
        payload.params || [],
      )

      self.postMessage({
        id,
        result,
      })

      return
    }

    throw new Error(
      `Unsupported worker message type: ${String(type)}`,
    )
  } catch (error) {
    self.postMessage({
      id,
      error:
        error instanceof Error
          ? error.message
          : String(error),
    })
  }
}