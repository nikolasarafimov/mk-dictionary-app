const STORAGE_KEY = "mkd_favorites";

export function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function isFavorite(form) {
  const favs = getFavorites();
  return favs.includes(form);
}

export function toggleFavorite(word) {
  const favs = getFavorites();
  const exists = favs.includes(word.form);

  let updated;
  if (exists) {
    updated = favs.filter(f => f !== word.form);
  } else {
    updated = [...favs, word.form];
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return !exists;
}