
import {
  getDidYouMeanSuggestions,
  getRandomForm,
  getSearchSuggestionRows,
  getSearchSuggestions,
  getSimilarForms,
  getTotalForms,
  getWordByForm,
  getWordsByForms,
  getWordsByLetter,
  searchForms,
} from '../server/dictionary.js'

const MAX_INPUT = 80
const MAX_BODY_BYTES = 12000

const OPERATIONS = Object.freeze({
  getTotalForms: { fn: getTotalForms, args: [] },
  getRandomForm: { fn: getRandomForm, args: [] },
  getWordByForm: { fn: getWordByForm, args: ['text'] },
  getWordsByLetter: { fn: getWordsByLetter, args: ['text', 10000] },
  searchForms: { fn: searchForms, args: ['text', 300] },
  getSearchSuggestionRows: { fn: getSearchSuggestionRows, args: ['text', 25] },
  getSearchSuggestions: { fn: getSearchSuggestions, args: ['text', 25] },
  getDidYouMeanSuggestions: { fn: getDidYouMeanSuggestions, args: ['text', 10] },
  getSimilarForms: { fn: getSimilarForms, args: ['text', 'text'] },
  getWordsByForms: { fn: getWordsByForms, args: ['forms'] },
})

function reply(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

function validateArgs(spec, inputs) {
  if (!Array.isArray(inputs) || inputs.length > spec.length) return null

  const validated = []

  for (let i = 0; i < spec.length; i += 1) {
    const rule = spec[i]
    const value = inputs[i]

    if (rule === 'text') {
      if (typeof value !== 'string' || value.trim().length > MAX_INPUT) return null
      validated.push(value.trim())
    } else if (rule === 'forms') {
      if (
        !Array.isArray(value)
        || value.length > 100
        || value.some((item) => typeof item !== 'string' || item.length > MAX_INPUT)
      ) return null
      validated.push(value)
    } else {
      const n = value === undefined ? rule : Number(value)
      if (!Number.isSafeInteger(n) || n < 1) return null
      validated.push(Math.min(n, rule))
    }
  }

  return validated
}

async function parseLimitedJson(request) {
  const contentType = request.headers.get('content-type') ?? ''
  if (!/^application\/json(?:\s*;|\s*$)/i.test(contentType.trim())) {
    return { error: 'Expected application/json', status: 415 }
  }

  const declaredLength = request.headers.get('content-length')
  if (declaredLength !== null && Number(declaredLength) > MAX_BODY_BYTES) {
    return { error: 'Request too large', status: 413 }
  }

  if (!request.body || typeof request.body.getReader !== 'function') {
    return { error: 'Invalid request body', status: 400 }
  }

  const reader = request.body.getReader()
  const chunks = []
  let total = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      total += value.byteLength
      if (total > MAX_BODY_BYTES) {
        await reader.cancel().catch(() => {})
        return { error: 'Request too large', status: 413 }
      }
      chunks.push(value)
    }
  } catch {
    return { error: 'Invalid request body', status: 400 }
  } finally {
    reader.releaseLock()
  }

  const buffer = new Uint8Array(total)
  let offset = 0

  for (const chunk of chunks) {
    buffer.set(chunk, offset)
    offset += chunk.byteLength
  }

  try {
    const data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(buffer))
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return { error: 'Invalid JSON object', status: 400 }
    }
    return { data }
  } catch {
    return { error: 'Invalid JSON', status: 400 }
  }
}

export async function POST(request) {
  const parsed = await parseLimitedJson(request)
  if (parsed.error) {
    return reply({ ok: false, error: parsed.error }, parsed.status)
  }

  const { data } = parsed
  const operation = typeof data.operation === 'string' ? data.operation : ''
  const spec = Object.hasOwn(OPERATIONS, operation) ? OPERATIONS[operation] : null

  if (!spec) {
    return reply({ ok: false, error: 'Unsupported operation' }, 400)
  }

  const args = validateArgs(spec.args, data.args ?? [])
  if (args === null) {
    return reply({ ok: false, error: 'Invalid arguments' }, 400)
  }

  try {
    const result = await spec.fn(...args)
    return reply({ ok: true, result })
  } catch (error) {
    console.error(`Dictionary API ${operation} failed:`, error?.name || 'Error')
    return reply({ ok: false, error: 'Dictionary query failed' }, 502)
  }
}