import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
} from 'react-router-dom'

import {
  getWordsByForms,
} from '../db/client'

import {
  getFavorites,
} from '../utils/favoriteManager'

export default function Favorites() {
  const [
    words,
    setWords,
  ] = useState([])

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadFavorites() {
      setLoading(true)
      setError('')

      const favoriteForms =
        getFavorites()

      if (favoriteForms.length === 0) {
        if (!cancelled) {
          setWords([])
          setLoading(false)
        }

        return
      }

      try {
        const data =
          await getWordsByForms(
            favoriteForms,
          )

        if (!cancelled) {
          setWords(data)
        }
      } catch {
        if (!cancelled) {
          setWords([])
          setError(
            'Омилените зборови не можеа да се вчитаат. Обидете се повторно.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadFavorites()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="favorites-page">
      <h1>
        Омилени зборови
      </h1>

      {loading && (
        <p
          className="favorites-loading"
          role="status"
          aria-live="polite"
        >
          Вчитување на омилените зборови…
        </p>
      )}

      {!loading && error && (
        <p
          className="empty-state"
          role="alert"
        >
          {error}
        </p>
      )}

      {!loading
        && !error
        && words.length === 0
        && (
          <p className="empty-state">
            Немате додадено омилени зборови.
          </p>
        )}

      {!loading
        && !error
        && words.length > 0
        && (
          <ul className="favorite-list">
            {words.map(
              (word) => (
                <li
                  key={word.form}
                  className="favorite-item"
                >
                  <Link
                    to={
                      `/details/${encodeURIComponent(
                        word.form,
                      )}`
                    }
                    className="favorite-link"
                  >
                    {word.form}
                  </Link>
                </li>
              ),
            )}
          </ul>
        )}
    </section>
  )
}