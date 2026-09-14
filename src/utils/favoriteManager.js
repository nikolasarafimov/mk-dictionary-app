const STORAGE_KEY = 'mkd_favorites'

function normalizeForm(value) {
  if (typeof value !== 'string') {
    return ''
  }

  return value.trim()
}

export function getFavorites() {
  try {
    const storedValue =
      localStorage.getItem(STORAGE_KEY)

    if (!storedValue) {
      return []
    }

    const parsed =
      JSON.parse(storedValue)

    if (!Array.isArray(parsed)) {
      return []
    }

    return [
      ...new Set(
        parsed
          .map(normalizeForm)
          .filter(Boolean),
      ),
    ]
  } catch {
    return []
  }
}

export function isFavorite(form) {
  const normalizedForm =
    normalizeForm(form)

  if (!normalizedForm) {
    return false
  }

  return getFavorites().includes(
    normalizedForm,
  )
}

export function toggleFavorite(word) {
  const form =
    normalizeForm(
      word?.form,
    )

  if (!form) {
    return false
  }

  const favorites =
    getFavorites()

  const exists =
    favorites.includes(form)

  const updatedFavorites =
    exists
      ? favorites.filter(
          (favorite) =>
            favorite !== form,
        )
      : [
          ...favorites,
          form,
        ]

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        updatedFavorites,
      ),
    )
  } catch {
    return exists
  }

  return !exists
}