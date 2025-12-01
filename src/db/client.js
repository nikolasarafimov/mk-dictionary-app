import { loadCachedDbFile, saveDbFile } from './indexedDb';

let worker = null;
let pending = new Map();    
let nextId = 1;
let initPromise = null;

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


export async function initDbIfNeeded() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    let buffer = await loadCachedDbFile();

    if (!buffer) {
      const resp = await fetch('/msd-mk.sqlite');
      buffer = await resp.arrayBuffer();
      saveDbFile(buffer).catch(() => {
        console.warn('Could not cache DB in IndexedDB');
      });
    }

    await postToWorker('init', { dbArrayBuffer: buffer });
  })();

  return initPromise;
}

export async function runQuery(sql, params = []) {
  await initDbIfNeeded();
  const result = await postToWorker('query', { sql, params });

  if (!result) return [];
  const { columns, values } = result;
  return values.map((row) =>
    Object.fromEntries(columns.map((c, i) => [c, row[i]]))
  );
}

export async function getTotalForms() {
  const rows = await runQuery('SELECT COUNT(*) AS cnt FROM words');
  return rows.length ? rows[0].cnt : 0;
}

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

export async function getWordsByLetter(letter) {
  return runQuery(
    `SELECT form, lemma, tag FROM words
     WHERE UPPER(form) LIKE ?
     ORDER BY form COLLATE NOCASE
     LIMIT 10000`,
    [letter.toUpperCase() + '%']
  );
}

export async function getWordByForm(form) {
  const rows = await runQuery(
    `SELECT form, lemma, tag FROM words WHERE form = ? LIMIT 1`,
    [form]
  );
  return rows[0] || null;
}

export async function searchForms(term) {
  return runQuery(
    `SELECT form, lemma, tag FROM words
     WHERE LOWER(form) LIKE ?
     ORDER BY form COLLATE NOCASE
     LIMIT 10000`,
    [`%${term.toLowerCase()}%`]
  );
}

export async function getSearchSuggestions(term, limit = 10) {
  const trimmed = term.trim();
  if (!trimmed) return [];

  const lower = trimmed.toLowerCase();

  const starts = await runQuery(
    `SELECT DISTINCT form FROM words
     WHERE LOWER(form) LIKE ?
     ORDER BY form COLLATE NOCASE
     LIMIT ?`,
    [lower + '%', limit]
  );

  if (starts.length >= limit) {
    return starts.map((r) => r.form);
  }

  const remaining = limit - starts.length;

  const contains = await runQuery(
    `SELECT DISTINCT form FROM words
     WHERE LOWER(form) LIKE ?
       AND LOWER(form) NOT LIKE ?
     ORDER BY form COLLATE NOCASE
     LIMIT ?`,
    ['%' + lower + '%', lower + '%', remaining]
  );

  return [...starts, ...contains].map((r) => r.form);
}


export async function getSimilarForms(lemma, form) {
  const rows = await runQuery(
    `SELECT DISTINCT form FROM words
     WHERE lemma = ? AND form != ?
     ORDER BY RANDOM() LIMIT 8`,
    [lemma, form]
  );
  return rows.map((r) => r.form);
}

export async function getWordsByForms(forms) {
  if (!forms || forms.length === 0) return [];

  const placeholders = forms.map(() => "?").join(",");

  return runQuery(
    `SELECT form, lemma, tag FROM words
     WHERE form IN (${placeholders})
     ORDER BY form COLLATE NOCASE`,
    forms
  );
}