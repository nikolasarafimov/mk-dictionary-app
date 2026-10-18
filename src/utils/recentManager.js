const STORAGE_KEY =
  'mk-dictionary-recent-words'

const MAX_RECENT_WORDS = 8

const LOCALE =
  'mk-MK'


function normalizeText(
  value,
) {
  return String(
    value ?? '',
  ).trim()
}


function getFormKey(
  value,
) {
  return normalizeText(
    value,
  ).toLocaleLowerCase(
    LOCALE,
  )
}


function normalizeWord(
  value,
) {
  if (
    typeof value === 'string'
  ) {
    const form =
      normalizeText(
        value,
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
    !value
    || typeof value !== 'object'
  ) {
    return null
  }


  const form =
    normalizeText(
      value.form,
    )


  if (!form) {
    return null
  }


  return {
    form,

    lemma:
      normalizeText(
        value.lemma,
      ),

    tag:
      normalizeText(
        value.tag,
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


function readStorage() {
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


      if (
        normalized.length
        >= MAX_RECENT_WORDS
      ) {
        break
      }
    }


    return normalized
  } catch {
    return []
  }
}


function writeStorage(
  words,
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
        words,
      ),
    )

    return true
  } catch {
    return false
  }
}


export function getRecentWords() {
  return readStorage()
}


export function addRecentWord(
  word,
) {
  const normalizedWord =
    normalizeWord(
      word,
    )


  if (!normalizedWord) {
    return false
  }


  const target =
    getFormKey(
      normalizedWord.form,
    )

  const current =
    readStorage()

  const withoutDuplicate =
    current.filter(
      (item) =>
        getFormKey(
          item.form,
        ) !== target,
    )


  const next = [
    normalizedWord,
    ...withoutDuplicate,
  ].slice(
    0,
    MAX_RECENT_WORDS,
  )


  return writeStorage(
    next,
  )
}


export function clearRecentWords() {
  const storage =
    getStorage()


  if (!storage) {
    return false
  }


  try {
    storage.removeItem(
      STORAGE_KEY,
    )

    return true
  } catch {
    return false
  }
}