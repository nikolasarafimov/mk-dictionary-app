import {
  useEffect,
  useState,
} from 'react'

import {
  FiClipboard,
  FiHeart,
  FiShare2,
} from 'react-icons/fi'

import useToast
  from '../hooks/useToast'

import {
  isFavorite,
  toggleFavorite,
} from '../utils/favoriteManager'

import {
  decodeTag,
} from '../utils/tagDecoder'


function getTitleSizeClass(
  value,
) {
  const length =
    Array.from(
      String(
        value || '',
      ),
    ).length


  if (length >= 28) {
    return 'word-title-xxl'
  }


  if (length >= 20) {
    return 'word-title-xl'
  }


  if (length >= 14) {
    return 'word-title-lg'
  }


  return ''
}


function getMorphology(
  tag,
) {
  if (!tag) {
    return '—'
  }


  try {
    const decoded =
      decodeTag(
        tag,
      )


    if (
      typeof decoded !== 'string'
      || !decoded.trim()
    ) {
      return '—'
    }


    return decoded.trim()
  } catch {
    return '—'
  }
}


export default function WordDetails({
  word,
}) {
  const toast =
    useToast()


  const [
    favorite,
    setFavorite,
  ] = useState(false)


  useEffect(() => {
    if (!word?.form) {
      setFavorite(false)

      return
    }


    try {
      setFavorite(
        Boolean(
          isFavorite(
            word.form,
          ),
        ),
      )
    } catch {
      setFavorite(false)
    }
  }, [
    word?.form,
  ])


  if (!word?.form) {
    return null
  }


  const titleSizeClass =
    getTitleSizeClass(
      word.form,
    )


  const morphology =
    getMorphology(
      word.tag,
    )


  const handleFavorite =
    () => {
      try {
        const isNowFavorite =
          Boolean(
            toggleFavorite(
              word,
            ),
          )


        setFavorite(
          isNowFavorite,
        )


        if (isNowFavorite) {
          toast.success(
            `„${word.form}“ е додаден во омилени.`,
          )

          return
        }


        toast.info(
          `„${word.form}“ е отстранет од омилени.`,
        )
      } catch {
        toast.error(
          'Омилените не можеа да се ажурираат.',
        )
      }
    }


  const handleCopyWord =
    async () => {
      try {
        if (
          typeof navigator
            === 'undefined'
          || !navigator.clipboard
            ?.writeText
        ) {
          throw new Error(
            'Clipboard unavailable',
          )
        }


        await navigator.clipboard
          .writeText(
            word.form,
          )


        toast.success(
          `Зборот „${word.form}“ е копиран.`,
        )
      } catch {
        toast.error(
          'Зборот не можеше да се копира.',
        )
      }
    }


  const handleShare =
    async () => {
      if (
        typeof window
          === 'undefined'
        || typeof navigator
          === 'undefined'
      ) {
        return
      }


      const url =
        window.location.href


      try {
        if (
          typeof navigator.share
            === 'function'
        ) {
          await navigator.share({
            title:
              `${word.form} — Македонски речник`,

            text:
              `Погледни го зборот „${word.form}“ во Македонскиот речник.`,

            url,
          })


          toast.success(
            'Зборот е успешно споделен.',
          )

          return
        }


        if (
          !navigator.clipboard
            ?.writeText
        ) {
          throw new Error(
            'Clipboard unavailable',
          )
        }


        await navigator.clipboard
          .writeText(
            url,
          )


        toast.success(
          'Линкот до зборот е копиран.',
        )
      } catch (error) {
        if (
          error instanceof Error
          && error.name
            === 'AbortError'
        ) {
          return
        }


        toast.error(
          'Линкот не можеше да се сподели.',
        )
      }
    }


  return (
    <article className="word-details">
      <header className="word-details-header">
        <div className="word-details-heading">
          <span className="ui-eyebrow">
            Речничка единица
          </span>


          <h1
            className={
              `word-title ${titleSizeClass}`
                .trim()
            }
          >
            {word.form}
          </h1>
        </div>


        <div
          className="word-actions"
          role="group"
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
            aria-pressed={
              favorite
            }
            onClick={
              handleFavorite
            }
          >
            <FiHeart
              aria-hidden="true"
            />

            <span>
              {favorite
                ? 'Омилен'
                : 'Додај во омилени'}
            </span>
          </button>


          <button
            type="button"
            className="badge-button"
            onClick={
              handleCopyWord
            }
          >
            <FiClipboard
              aria-hidden="true"
            />

            <span>
              Копирај збор
            </span>
          </button>


          <button
            type="button"
            className="badge-button"
            onClick={
              handleShare
            }
          >
            <FiShare2
              aria-hidden="true"
            />

            <span>
              Сподели
            </span>
          </button>
        </div>
      </header>


      <section
        className="word-info"
        aria-label="Лингвистички податоци"
      >
        <div className="word-info-row">
          <span>
            Лема
          </span>

          <strong>
            {word.lemma || '—'}
          </strong>
        </div>


        <div className="word-info-row">
          <span>
            Морфолошка ознака
          </span>

          <strong className="word-raw-tag">
            {word.tag || '—'}
          </strong>
        </div>


        <div className="word-info-row">
          <span>
            Морфолошки опис
          </span>

          <strong>
            {morphology}
          </strong>
        </div>
      </section>
    </article>
  )
}