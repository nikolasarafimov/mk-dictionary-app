const API_URL = `${import.meta.env.BASE_URL}api/dictionary`

async function request(operation, args = []) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operation, args }),
  })

  if (!response.ok) {
    throw new Error(`Dictionary API request failed (${response.status})`)
  }

  const body = await response.json()
  if (!body || body.ok !== true) {
    throw new Error('Invalid response from dictionary API')
  }
  return body.result
}

export async function initDbIfNeeded() {
  return undefined
}

export async function runQuery() {
  throw new Error('Arbitrary SQL is disabled for the remote dictionary')
}

export async function getTotalForms(...args) {
  return request('getTotalForms', args)
}

export async function getRandomForm(...args) {
  return request('getRandomForm', args)
}

export async function getWordsByLetter(...args) {
  return request('getWordsByLetter', args)
}

export async function getWordByForm(...args) {
  return request('getWordByForm', args)
}

export async function searchForms(...args) {
  return request('searchForms', args)
}

export async function getSearchSuggestionRows(...args) {
  return request('getSearchSuggestionRows', args)
}

export async function getSearchSuggestions(...args) {
  return request('getSearchSuggestions', args)
}

export async function getDidYouMeanSuggestions(...args) {
  return request('getDidYouMeanSuggestions', args)
}

export async function getSimilarForms(...args) {
  return request('getSimilarForms', args)
}

export async function getWordsByForms(...args) {
  return request('getWordsByForms', args)
}
