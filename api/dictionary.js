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
      if (!Array.isArray(value) || value.length > 100 ||
          value.some((item) => typeof item !== 'string' || item.length > MAX_INPUT)) return null
      validated.push(value)
    } else {
      const n = value === undefined ? rule : Number(value)
      if (!Number.isSafeInteger(n) || n < 1) return null
      validated.push(Math.min(n, rule))
    }
  }
  return validated
}

export async function POST(request) {
  if (Number(request.headers.get('content-length') || 0) > 12000) {
    return Response.json({ ok: false, error: 'Request too large' }, { status: 413 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const operation = typeof body?.operation === 'string' ? body.operation : ''
  const spec = Object.hasOwn(OPERATIONS, operation) ? OPERATIONS[operation] : null
  if (!spec) {
    return Response.json({ ok: false, error: 'Unsupported operation' }, { status: 400 })
  }

  const args = validateArgs(spec.args, body.args ?? [])
  if (args === null) {
    return Response.json({ ok: false, error: 'Invalid arguments' }, { status: 400 })
  }

  try {
    const result = await spec.fn(...args)
    return Response.json({ ok: true, result }, {
      headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
    })
  } catch (error) {
    console.error(`Dictionary API ${operation} failed:`, error?.name || 'Error')
    return Response.json({ ok: false, error: 'Dictionary query failed' }, { status: 502 })
  }
}
