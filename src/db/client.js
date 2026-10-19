const backend = import.meta.env.VITE_DICTIONARY_BACKEND === 'turso'
  ? import('./remoteClient.js')
  : import('./localClient.js')

async function call(name, args) {
  const client = await backend
  return client[name](...args)
}

export async function initDbIfNeeded(...args) {
  return call('initDbIfNeeded', args)
}

export async function runQuery(...args) {
  return call('runQuery', args)
}

export async function getTotalForms(...args) {
  return call('getTotalForms', args)
}

export async function getRandomForm(...args) {
  return call('getRandomForm', args)
}

export async function getWordsByLetter(...args) {
  return call('getWordsByLetter', args)
}

export async function getWordByForm(...args) {
  return call('getWordByForm', args)
}

export async function searchForms(...args) {
  return call('searchForms', args)
}

export async function getSearchSuggestionRows(...args) {
  return call('getSearchSuggestionRows', args)
}

export async function getSearchSuggestions(...args) {
  return call('getSearchSuggestions', args)
}

export async function getDidYouMeanSuggestions(...args) {
  return call('getDidYouMeanSuggestions', args)
}

export async function getSimilarForms(...args) {
  return call('getSimilarForms', args)
}

export async function getWordsByForms(...args) {
  return call('getWordsByForms', args)
}
