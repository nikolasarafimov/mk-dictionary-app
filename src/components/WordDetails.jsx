import {
  useEffect,
  useState,
} from 'react'

import {
  isFavorite,
  toggleFavorite,
} from '../utils/favoriteManager'

import {
  decodeTag,
} from '../utils/tagDecoder'

export default function WordDetails({
  word,
}) {
  const [
    favorite,
    setFavorite,
  ] = useState(false)

  const [
    copied,
    setCopied,
  ] = useState(false)

  const [
    shared,
    setShared,
  ] = useState(false)

  useEffect(() => {
    if (!word?.form) {
      setFavorite(false)
      return
    }

    setFavorite(
      isFavorite(word.form),
    )
  }, [word?.form])

  useEffect(() => {
    if (!copied) {
      return undefined
    }

    const timer =
      setTimeout(
        () => {
          setCopied(false)
        },
        1200,
      )

    return () => {
      clearTimeout(timer)
    }
  }, [copied])

  useEffect(() => {
    if (!shared) {
      return undefined
    }

    const timer =
      setTimeout(
        () => {
          setShared(false)
        },
        1200,
      )

    return () => {
      clearTimeout(timer)
    }
  }, [shared])

  if (!word) {
    return null
  }

  const handleFavorite = () => {
    const isNowFavorite =
      toggleFavorite(word)

    setFavorite(
      isNowFavorite,
    )
  }

  const handleCopyWord = async () => {
    try {
      if (!navigator.clipboard) {
        throw new Error(
          'Clipboard API is unavailable.',
        )
      }

      await navigator.clipboard.writeText(
        word.form,
      )

      setCopied(true)
    } catch {
      console.warn(
        'Зборот не можеше да се копира.',
      )
    }
  }

  const handleShare = async () => {
    const url =
      window.location.href

    try {
      if (navigator.share) {
        await navigator.share({
          title: word.form,
          text:
            `Погледни го поимот „${word.form}“ `
            + 'во Македонскиот речник.',
          url,
        })

        return
      }

      if (!navigator.clipboard) {
        throw new Error(
          'Clipboard API is unavailable.',
        )
      }

      await navigator.clipboard.writeText(
        url,
      )

      setShared(true)
    } catch (error) {
      if (
        error instanceof Error
        && error.name === 'AbortError'
      ) {
        return
      }

      console.warn(
        'Линкот не можеше да се сподели.',
      )
    }
  }

  return (
    <article className="word-details">
      <div className="word-details-header">
        <h2 className="word-title">
          {word.form}
        </h2>

        <div
          className="word-actions"
          aria-label="Дејства за зборот"
        >
          <button
            type="button"
            className={
              `badge-button ${
                favorite
                  ? 'badge-fav'
                  : ''
              }`
            }
            aria-pressed={favorite}
            onClick={handleFavorite}
          >
            {favorite
              ? '★ Омилен'
              : '☆ Додај во омилени'}
          </button>

          <button
            type="button"
            className="badge-button"
            onClick={handleCopyWord}
          >
            <span aria-hidden="true">
              📋
            </span>
            {' '}
            Копирај збор
          </button>

          <button
            type="button"
            className="badge-button"
            onClick={handleShare}
          >
            <span aria-hidden="true">
              🔗
            </span>
            {' '}
            Сподели
          </button>
        </div>

        <div
          className="word-action-status"
          role="status"
          aria-live="polite"
        >
          {copied && (
            <span className="copy-toast">
              ✓ Копирано!
            </span>
          )}

          {shared && (
            <span className="share-toast">
              ✓ Линкот е копиран!
            </span>
          )}
        </div>
      </div>

      <div className="word-info">
        <p>
          <strong>
            Лема:
          </strong>
          {' '}
          {word.lemma || '—'}
        </p>

        <p>
          <strong>
            Морфолошка ознака:
          </strong>
          {' '}
          {word.tag || '—'}
        </p>

        <p>
          <strong>
            Морфолошки опис:
          </strong>
          {' '}
          {word.tag
            ? decodeTag(word.tag)
            : '—'}
        </p>
      </div>
    </article>
  )
}