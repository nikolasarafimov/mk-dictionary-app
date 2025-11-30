import initSqlJs from 'sql.js';

let db = null;

self.onmessage = async (event) => {
  const { id, type, payload } = event.data;

  try {
    if (type === 'init') {
      const { dbArrayBuffer } = payload;

      const SQL = await initSqlJs({
        locateFile: (file) => `/${file}`, 
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