import { loadCachedDbFile, saveDbFile } from './indexedDb';

let worker = null;
let pending = new Map();     // id -> {resolve, reject}
let nextId = 1;
let initPromise = null;

/**
 * Create the worker (once).
 */
function getWorker() {
  if (!worker) {
    worker = new Worker(
      new URL('./sqlWorker.js', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (event) => {
      const { id, result, error } = event.data;
      const entry = pending.get(id);
      if (!entry) return;

      pending.delete(id);
      if (error) {
        entry.reject(new Error(error));
      } else {
        entry.resolve(result);
      }
    };
  }
  return worker;
}

function postToWorker(type, payload) {
  const w = getWorker();
  return new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    w.postMessage({ id, type, payload });
  });
}

/**
 * Init DB: try IndexedDB cache, otherwise fetch /msd-mk.sqlite and cache it.
 * Lazy – only called when we first actually need the DB.
 */
export async function initDbIfNeeded() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // 1) Try cache
    let buffer = await loadCachedDbFile();

    if (!buffer) {
      // 2) Fetch from network once
      const resp = await fetch('/msd-mk.sqlite');
      buffer = await resp.arrayBuffer();
      // 3) Save for future visits
      saveDbFile(buffer).catch(() => {
        // non-fatal if it fails
        console.warn('Could not cache DB in IndexedDB');
      });
    }

    // 4) Send to worker
    await postToWorker('init', { dbArrayBuffer: buffer });
  })();

  return initPromise;
}

/**
 * Run query and return rows as array of {column: value} objects.
 */
export async function runQuery(sql, params = []) {
  await initDbIfNeeded();
  const result = await postToWorker('query', { sql, params });

  if (!result) return [];
  const { columns, values } = result;
  return values.map((row) =>
    Object.fromEntries(columns.map((c, i) => [c, row[i]]))
  );
}

/* ======= Convenience helpers with better SQL ======= */

/** Total number of forms (used on Home hero). */
export async function getTotalForms() {
  const rows = await runQuery('SELECT COUNT(*) AS cnt FROM words');
  return rows.length ? rows[0].cnt : 0;
}

/**
 * Optimized random form:
 *  - compute [minRowId, maxRowId] once
 *  - pick random rowid in this interval
 *  - select first form with rowid >= random
 */
let rowIdRange = null;

async function getRowIdRange() {
  if (rowIdRange) return rowIdRange;
  const rows = await runQuery(
    'SELECT MIN(rowid) AS minId, MAX(rowid) AS maxId FROM words'
  );
  rowIdRange = rows.length ? [rows[0].minId, rows[0].maxId] : [1, 1];
  return rowIdRange;
}

export async function getRandomForm() {
  const [minId, maxId] = await getRowIdRange();
  const randomId = Math.floor(Math.random() * (maxId - minId + 1)) + minId;
  const rows = await runQuery(
    'SELECT form FROM words WHERE rowid >= ? LIMIT 1',
    [randomId]
  );
  return rows.length ? rows[0].form : null;
}

/** All words starting with a given letter (uppercased). */
export async function getWordsByLetter(letter) {
  return runQuery(
    `SELECT form, lemma, tag FROM words
     WHERE UPPER(form) LIKE ?
     ORDER BY form COLLATE NOCASE
     LIMIT 10000`,
    [letter.toUpperCase() + '%']
  );
}

/** Exact form lookup. */
export async function getWordByForm(form) {
  const rows = await runQuery(
    `SELECT form, lemma, tag FROM words WHERE form = ? LIMIT 1`,
    [form]
  );
  return rows[0] || null;
}

/** Search by substring (used for queries). */
export async function searchForms(term) {
  return runQuery(
    `SELECT form, lemma, tag FROM words
     WHERE LOWER(form) LIKE ?
     ORDER BY form COLLATE NOCASE
     LIMIT 10000`,
    [`%${term.toLowerCase()}%`]
  );
}

/** Similar forms by lemma. */
export async function getSimilarForms(lemma, form) {
  const rows = await runQuery(
    `SELECT DISTINCT form FROM words
     WHERE lemma = ? AND form != ?
     ORDER BY RANDOM() LIMIT 8`,
    [lemma, form]
  );
  return rows.map((r) => r.form);
}
