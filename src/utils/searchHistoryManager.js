const STORAGE_KEY =
  'mk-dictionary-search-history'

const MAX_ITEMS = 7

const LOCALE =
  'mk-MK'


export const SEARCH_HISTORY_CHANGED_EVENT =
  'mk-dictionary:search-history-changed'


function normalizeValue(
  value,
) {
  return String(
    value ?? '',
  ).trim()
}


function getValueKey(
  value,
) {
  return normalizeValue(
    value,
  ).toLocaleLowerCase(
    LOCALE,
  )
}


function getStorage() {
  if (
    typeof window === 'undefined'
  ) {
    return null
  }


  try {
    return window.localStorage
  } catch {
    return null
  }
}


function emitHistoryChanged() {
  if (
    typeof window === 'undefined'
  ) {
    return
  }


  window.dispatchEvent(
    new CustomEvent(
      SEARCH_HISTORY_CHANGED_EVENT,
    ),
  )
}


function writeSearches(
  searches,
) {
  const storage =
    getStorage()


  if (!storage) {
    return false
  }


  try {
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        searches,
      ),
    )

    emitHistoryChanged()

    return true
  } catch {
    return false
  }
}


export function getRecentSearches() {
  const storage =
    getStorage()


  if (!storage) {
    return []
  }


  try {
    const raw =
      storage.getItem(
        STORAGE_KEY,
      )


    if (!raw) {
      return []
    }


    const parsed =
      JSON.parse(
        raw,
      )


    if (
      !Array.isArray(
        parsed,
      )
    ) {
      return []
    }


    const seen =
      new Set()

    const searches = []


    for (
      const item
      of parsed
    ) {
      const query =
        normalizeValue(
          item,
        )


      if (!query) {
        continue
      }


      const key =
        getValueKey(
          query,
        )


      if (
        seen.has(
          key,
        )
      ) {
        continue
      }


      seen.add(
        key,
      )

      searches.push(
        query,
      )


      if (
        searches.length
        >= MAX_ITEMS
      ) {
        break
      }
    }


    return searches
  } catch {
    return []
  }
}


export function addRecentSearch(
  value,
) {
  const query =
    normalizeValue(
      value,
    )


  if (!query) {
    return false
  }


  const target =
    getValueKey(
      query,
    )

  const current =
    getRecentSearches()

  const withoutDuplicate =
    current.filter(
      (item) =>
        getValueKey(
          item,
        ) !== target,
    )


  const next = [
    query,
    ...withoutDuplicate,
  ].slice(
    0,
    MAX_ITEMS,
  )


  return writeSearches(
    next,
  )
}


export function clearRecentSearches() {
  const storage =
    getStorage()


  if (!storage) {
    return false
  }


  try {
    storage.removeItem(
      STORAGE_KEY,
    )

    emitHistoryChanged()

    return true
  } catch {
    return false
  }
}