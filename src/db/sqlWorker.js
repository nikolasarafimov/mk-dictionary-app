import initSqlJs from 'sql.js';

let db = null;

/**
 * Message format from main thread:
 * { id, type: 'init', payload: { dbArrayBuffer } }
 * { id, type: 'query', payload: { sql, params } }
 */
self.onmessage = async (event) => {
  const { id, type, payload } = event.data;

  try {
    if (type === 'init') {
      const { dbArrayBuffer } = payload;

      const SQL = await initSqlJs({
        locateFile: (file) => `/${file}`, // sql-wasm.wasm in /public
      });

      db = new SQL.Database(new Uint8Array(dbArrayBuffer));
      self.postMessage({ id, result: 'ok' });
    }

    if (type === 'query') {
      if (!db) {
        throw new Error('Database not initialized in worker');
      }

      const { sql, params = [] } = payload;
      const res = db.exec(sql, params);

      // We only ever use first result set.
      const first = res[0] || null;
      self.postMessage({ id, result: first });
    }
  } catch (err) {
    self.postMessage({
      id,
      error: err instanceof Error ? err.message : String(err),
    });
  }
};