import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Link,
  Navigate,
  useNavigate,
  useParams,
} from 'react-router-dom'

import {
  motion,
} from 'framer-motion'

import {
  FiArrowLeft,
  FiBookOpen,
  FiSearch,
  FiX,
} from 'react-icons/fi'

import LetterNav
  from '../components/LetterNav'

import {
  ListSkeleton,
} from '../components/LoadingSkeletons'

import WordList
  from '../components/WordList'

import {
  getWordsByLetter,
} from '../db/client'

import {
  buildLetterPath,
} from '../utils/routes'


const LOCALE = 'mk-MK'

const LETTERS =
  'А Б В Г Д Ѓ Е Ж З Ѕ И Ј К Л Љ М Н Њ О П Р С Т Ќ У Ф Х Ц Ч Џ Ш'
    .split(' ')

const LETTER_SET =
  new Set(
    LETTERS,
  )


function normalizeLetter(
  value,
) {
  return String(
    value ?? '',
  )
    .trim()
    .toLocaleUpperCase(
      LOCALE,
    )
}


export default function ListPage() {
  const {
    letter,
  } = useParams()

  const navigate =
    useNavigate()


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

  const [
    filter,
    setFilter,
  ] = useState('')


  const normalizedLetter =
    normalizeLetter(
      letter,
    )

  const isValidLetter =
    LETTER_SET.has(
      normalizedLetter,
    )


  useEffect(() => {
    if (!isValidLetter) {
      setLoading(false)
      setWords([])
      setError('')

      return undefined
    }


    let cancelled = false


    async function loadWords() {
      setLoading(true)
      setError('')
      setWords([])
      setFilter('')


      try {
        const rows =
          await getWordsByLetter(
            normalizedLetter,
          )


        if (cancelled) {
          return
        }


        setWords(
          Array.isArray(
            rows,
          )
            ? rows.filter(
              (word) =>
                word
                && typeof word
                  === 'object'
                && String(
                  word.form ?? '',
                ).trim(),
            )
            : [],
        )
      } catch {
        if (cancelled) {
          return
        }


        setError(
          'Зборовите за избраната буква не можеа да се вчитаат.',
        )
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }


    loadWords()


    return () => {
      cancelled = true
    }
  }, [
    isValidLetter,
    normalizedLetter,
  ])


  const filteredWords =
    useMemo(
      () => {
        const query =
          filter
            .trim()
            .toLocaleLowerCase(
              LOCALE,
            )


        if (!query) {
          return words
        }


        return words.filter(
          (word) => {
            const form =
              String(
                word.form ?? '',
              )
                .toLocaleLowerCase(
                  LOCALE,
                )

            const lemma =
              String(
                word.lemma ?? '',
              )
                .toLocaleLowerCase(
                  LOCALE,
                )


            return (
              form.includes(
                query,
              )
              || lemma.includes(
                query,
              )
            )
          },
        )
      },
      [
        words,
        filter,
      ],
    )


  const handleLetterClick =
    useCallback(
      (nextLetter) => {
        const value =
          normalizeLetter(
            nextLetter,
          )


        if (
          !LETTER_SET.has(
            value,
          )
          || value
            === normalizedLetter
        ) {
          return
        }


        navigate(
          buildLetterPath(
            value,
          ),
        )
      },
      [
        navigate,
        normalizedLetter,
      ],
    )


  const handleClearFilter =
    () => {
      setFilter('')
    }


  if (!letter) {
    return (
      <Navigate
        to="/home"
        replace
      />
    )
  }


  if (!isValidLetter) {
    return (
      <Navigate
        to="/home"
        replace
      />
    )
  }


  if (
    letter !== normalizedLetter
  ) {
    return (
      <Navigate
        to={
          buildLetterPath(
            normalizedLetter,
          )
        }
        replace
      />
    )
  }


  if (loading) {
    return (
      <ListSkeleton />
    )
  }


  return (
    <motion.main
      className="lexicon-results-page"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 0.3,
      }}
    >
      <header className="lexicon-results-header">
        <Link
          to="/home"
          className="lexicon-back-link"
        >
          <FiArrowLeft
            aria-hidden="true"
          />

          Речник
        </Link>


        <div className="lexicon-title-grid">
          <div className="lexicon-title-copy">
            <span className="lexicon-eyebrow">
              Азбучен индекс
            </span>

            <h1>
              Зборови на

              <em>
                „{normalizedLetter}“
              </em>
            </h1>

            <p>
              Преглед на збороформите
              што започнуваат со
              избраната буква.
            </p>
          </div>


          <div className="lexicon-result-stat">
            <span>
              Прикажани форми
            </span>

            <strong>
              {words.length
                .toLocaleString(
                  LOCALE,
                )}
            </strong>

            <small>
              во азбучниот индекс
            </small>
          </div>
        </div>
      </header>


      <section
        className="lexicon-letter-switcher"
        aria-labelledby="letter-switcher-title"
      >
        <div className="lexicon-letter-switcher-heading">
          <span
            id="letter-switcher-title"
          >
            Азбука
          </span>

          <small>
            Изберете друга буква
          </small>
        </div>


        <div className="lexicon-letter-nav">
          <LetterNav
            selectedLetter={
              normalizedLetter
            }
            onLetterClick={
              handleLetterClick
            }
          />
        </div>
      </section>


      <section
        className="lexicon-results-body"
        aria-labelledby="letter-results-title"
      >
        <div className="lexicon-toolbar">
          <div className="lexicon-toolbar-copy">
            <FiBookOpen
              aria-hidden="true"
            />

            <div>
              <strong
                id="letter-results-title"
              >
                Речнички индекс
              </strong>

              <span>
                {filter
                  ? `${filteredWords.length.toLocaleString(
                    LOCALE,
                  )} од ${words.length.toLocaleString(
                    LOCALE,
                  )} форми`
                  : `${words.length.toLocaleString(
                    LOCALE,
                  )} форми`}
              </span>
            </div>
          </div>


          <label className="lexicon-filter">
            <FiSearch
              aria-hidden="true"
            />

            <input
              type="search"
              value={filter}
              placeholder={
                `Филтрирај во „${normalizedLetter}“…`
              }
              aria-label={
                `Филтрирај ги зборовите на ${normalizedLetter}`
              }
              autoComplete="off"
              spellCheck={false}
              onChange={
                (event) =>
                  setFilter(
                    event.target.value,
                  )
              }
              onKeyDown={
                (event) => {
                  if (
                    event.key
                    === 'Escape'
                  ) {
                    handleClearFilter()
                  }
                }
              }
            />


            {filter && (
              <button
                type="button"
                aria-label="Исчисти го филтерот"
                onClick={
                  handleClearFilter
                }
              >
                <FiX
                  aria-hidden="true"
                />
              </button>
            )}
          </label>
        </div>


        {error && (
          <div
            className="lexicon-error-state"
            role="alert"
          >
            <span
              aria-hidden="true"
            >
              !
            </span>

            <div>
              <strong>
                Неуспешно вчитување
              </strong>

              <p>
                {error}
              </p>
            </div>
          </div>
        )}


        {!error
          && filteredWords.length > 0
          && (
            <WordList
              words={
                filteredWords
              }
              highlightTerm={
                filter
              }
            />
          )}


        {!error
          && filteredWords.length === 0
          && (
            <div className="lexicon-empty-state">
              <span
                aria-hidden="true"
              >
                0
              </span>

              <div>
                <strong>
                  {filter
                    ? 'Нема совпаѓања со филтерот.'
                    : 'Нема достапни збороформи.'}
                </strong>

                <p>
                  {filter
                    ? `Не се пронајдени форми или леми што одговараат на „${filter.trim()}“.`
                    : `Во достапната база нема збороформи за буквата „${normalizedLetter}“.`}
                </p>


                {filter && (
                  <button
                    type="button"
                    onClick={
                      handleClearFilter
                    }
                  >
                    Исчисти филтер
                  </button>
                )}
              </div>
            </div>
          )}
      </section>
    </motion.main>
  )
}