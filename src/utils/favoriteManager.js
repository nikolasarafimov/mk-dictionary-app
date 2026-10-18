const STORAGE_KEY =
  'mk-dictionary-favorites'

const LOCALE =
  'mk-MK'


export const FAVORITES_CHANGED_EVENT =
  'mk-dictionary:favorites-changed'


function normalizeForm(
  value,
) {
  return String(
    value ?? '',
  ).trim()
}


function getFormKey(
  value,
) {
  return normalizeForm(
    value,
  ).toLocaleLowerCase(
    LOCALE,
  )
}


function normalizeWord(
  word,
) {
  if (
    typeof word === 'string'
  ) {
    const form =
      normalizeForm(
        word,
      )


    if (!form) {
      return null
    }


    return {
      form,
      lemma: '',
      tag: '',
    }
  }


  if (
    !word
    || typeof word !== 'object'
  ) {
    return null
  }


  const form =
    normalizeForm(
      word.form,
    )


  if (!form) {
    return null
  }


  return {
    form,

    lemma:
      normalizeForm(
        word.lemma,
      ),

    tag:
      normalizeForm(
        word.tag,
      ),
  }
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


function emitFavoritesChanged() {
  if (
    typeof window === 'undefined'
  ) {
    return
  }


  window.dispatchEvent(
    new CustomEvent(
      FAVORITES_CHANGED_EVENT,
    ),
  )
}


function readFavorites() {
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

    const normalized = []


    for (
      const item
      of parsed
    ) {
      const word =
        normalizeWord(
          item,
        )


      if (!word) {
        continue
      }


      const key =
        getFormKey(
          word.form,
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

      normalized.push(
        word,
      )
    }


    return normalized
  } catch {
    return []
  }
}


function writeFavorites(
  favorites,
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
        favorites,
      ),
    )

    emitFavoritesChanged()

    return true
  } catch {
    return false
  }
}


export function getFavorites() {
  return readFavorites()
}


export function isFavorite(
  form,
) {
  const target =
    getFormKey(
      form,
    )


  if (!target) {
    return false
  }


  return readFavorites().some(
    (word) =>
      getFormKey(
        word.form,
      ) === target,
  )
}


export function toggleFavorite(
  word,
) {
  const normalized =
    normalizeWord(
      word,
    )


  if (!normalized) {
    return false
  }


  const current =
    readFavorites()

  const target =
    getFormKey(
      normalized.form,
    )

  const exists =
    current.some(
      (item) =>
        getFormKey(
          item.form,
        ) === target,
    )


  if (exists) {
    const next =
      current.filter(
        (item) =>
          getFormKey(
            item.form,
          ) !== target,
      )


    writeFavorites(
      next,
    )

    return false
  }


  writeFavorites([
    normalized,
    ...current,
  ])


  return true
}


export function removeFavorite(
  form,
) {
  const target =
    getFormKey(
      form,
    )


  if (!target) {
    return false
  }


  const current =
    readFavorites()

  const next =
    current.filter(
      (item) =>
        getFormKey(
          item.form,
        ) !== target,
    )


  if (
    next.length
    === current.length
  ) {
    return false
  }


  return writeFavorites(
    next,
  )
}


export function clearFavorites() {
  const storage =
    getStorage()


  if (!storage) {
    return false
  }


  try {
    storage.removeItem(
      STORAGE_KEY,
    )

    emitFavoritesChanged()

    return true
  } catch {
    return false
  }
}