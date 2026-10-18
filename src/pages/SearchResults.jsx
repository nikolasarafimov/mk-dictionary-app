import {
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
  FiSearch,
  FiSliders,
  FiX,
} from 'react-icons/fi'

import {
  ResultsSkeleton,
} from '../components/LoadingSkeletons'

import WordList
  from '../components/WordList'

import {
  getWordByForm,
  searchForms,
} from '../db/client'

import {
  addRecentSearch,
} from '../utils/searchHistoryManager'

import {
  buildDetailsPath,
  buildNotFoundPath,
} from '../utils/routes'


const LOCALE = 'mk-MK'


const collator =
  new Intl.Collator(
    LOCALE,
    {
      sensitivity: 'base',
    },
  )


function normalize(
  value,
) {
  return String(
    value ?? '',
  )
    .trim()
    .toLocaleLowerCase(
      LOCALE,
    )
}


function getMatchGroup(
  matchType,
) {
  return String(
    matchType ?? '',
  ).includes(
    'lemma',
  )
    ? 'lemma'
    : 'form'
}


function normalizeResults(
  results,
) {
  if (
    !Array.isArray(
      results,
    )
  ) {
    return []
  }


  return results.filter(
    (word) =>
      word
      && typeof word === 'object'
      && String(
        word.form ?? '',
      ).trim(),
  )
}


export default function SearchResults() {
  const {
    term,
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

  const [
    scope,
    setScope,
  ] = useState('all')

  const [
    sort,
    setSort,
  ] = useState('relevance')


  const searchTerm =
    String(
      term ?? '',
    ).trim()


  useEffect(() => {
    if (!searchTerm) {
      return undefined
    }


    let cancelled = false


    setLoading(true)
    setError('')
    setWords([])
    setFilter('')
    setScope('all')
    setSort('relevance')


    addRecentSearch(
      searchTerm,
    )


    async function loadResults() {
      try {
        const exact =
          await getWordByForm(
            searchTerm,
          )


        if (cancelled) {
          return
        }


        const exactForm =
          String(
            exact?.form ?? '',
          ).trim()


        if (exactForm) {
          navigate(
            buildDetailsPath(
              exactForm,
            ),
            {
              replace: true,
            },
          )

          return
        }


        const results =
          normalizeResults(
            await searchForms(
              searchTerm,
            ),
          )


        if (cancelled) {
          return
        }


        if (
          results.length === 0
        ) {
          navigate(
            buildNotFoundPath(
              searchTerm,
            ),
            {
              replace: true,
            },
          )

          return
        }


        setWords(
          results,
        )
      } catch {
        if (!cancelled) {
          setError(
            'Резултатите не можеа да се вчитаат. Обидете се повторно.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }


    loadResults()


    return () => {
      cancelled = true
    }
  }, [
    searchTerm,
    navigate,
  ])


  const counts =
    useMemo(
      () => {
        let formMatches = 0
        let lemmaMatches = 0


        for (
          const word
          of words
        ) {
          if (
            getMatchGroup(
              word.matchType,
            ) === 'lemma'
          ) {
            lemmaMatches += 1
          } else {
            formMatches += 1
          }
        }


        return {
          all:
            words.length,

          form:
            formMatches,

          lemma:
            lemmaMatches,
        }
      },
      [
        words,
      ],
    )


  const visibleWords =
    useMemo(
      () => {
        const normalizedFilter =
          normalize(
            filter,
          )


        const filtered =
          words.filter(
            (word) => {
              if (
                scope !== 'all'
                && getMatchGroup(
                  word.matchType,
                ) !== scope
              ) {
                return false
              }


              if (!normalizedFilter) {
                return true
              }


              const form =
                normalize(
                  word.form,
                )

              const lemma =
                normalize(
                  word.lemma,
                )


              return (
                form.includes(
                  normalizedFilter,
                )
                || lemma.includes(
                  normalizedFilter,
                )
              )
            },
          )


        if (
          sort !== 'alphabetical'
        ) {
          return filtered
        }


        return [
          ...filtered,
        ].sort(
          (
            first,
            second,
          ) =>
            collator.compare(
              String(
                first.form ?? '',
              ),
              String(
                second.form ?? '',
              ),
            ),
        )
      },
      [
        words,
        filter,
        scope,
        sort,
      ],
    )


  const handleResetFilters =
    () => {
      setFilter('')
      setScope('all')
      setSort('relevance')
    }


  if (!searchTerm) {
    return (
      <Navigate
        to="/home"
        replace
      />
    )
  }


  if (loading) {
    return (
      <ResultsSkeleton />
    )
  }


  if (error) {
    return (
      <motion.main
        className="search-results-v2"
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.28,
        }}
      >
        <section
          className="search-results-error"
          role="alert"
        >
          <span>
            Грешка
          </span>

          <h1>
            Пребарувањето не успеа.
          </h1>

          <p>
            {error}
          </p>

          <Link to="/home">
            <FiArrowLeft
              aria-hidden="true"
            />

            Назад кон речникот
          </Link>
        </section>
      </motion.main>
    )
  }


  return (
    <motion.main
      className="search-results-v2"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 0.28,
      }}
    >
      <header className="search-results-header">
        <Link
          to="/home"
          className="search-results-back"
        >
          <FiArrowLeft
            aria-hidden="true"
          />

          Назад кон речникот
        </Link>


        <div className="search-results-overline">
          <span>
            Резултати
          </span>

          <span
            aria-hidden="true"
          />

          <span>
            Интелигентно пребарување
          </span>
        </div>


        <div className="search-results-heading">
          <div>
            <h1>
              „{searchTerm}“
            </h1>

            <p>
              Резултатите се
              подредени според
              релевантност: точно
              совпаѓање, почеток на
              збор, лема и делумно
              совпаѓање.
            </p>
          </div>


          <div className="search-results-total">
            <strong>
              {words.length
                .toLocaleString(
                  LOCALE,
                )}
            </strong>

            <span>
              пронајдени
              збороформи
            </span>
          </div>
        </div>
      </header>


      <section
        className="search-match-summary"
        aria-label="Тип на совпаѓање"
      >
        <button
          type="button"
          className={
            scope === 'all'
              ? 'active'
              : ''
          }
          aria-pressed={
            scope === 'all'
          }
          onClick={() =>
            setScope(
              'all',
            )
          }
        >
          <span>
            Сите
          </span>

          <strong>
            {counts.all}
          </strong>
        </button>


        <button
          type="button"
          className={
            scope === 'form'
              ? 'active'
              : ''
          }
          aria-pressed={
            scope === 'form'
          }
          onClick={() =>
            setScope(
              'form',
            )
          }
        >
          <span>
            По збороформа
          </span>

          <strong>
            {counts.form}
          </strong>
        </button>


        <button
          type="button"
          className={
            scope === 'lemma'
              ? 'active'
              : ''
          }
          aria-pressed={
            scope === 'lemma'
          }
          onClick={() =>
            setScope(
              'lemma',
            )
          }
        >
          <span>
            По лема
          </span>

          <strong>
            {counts.lemma}
          </strong>
        </button>
      </section>


      <section
        className="search-results-toolbar"
        aria-label="Филтрирање и подредување"
      >
        <label className="search-results-filter">
          <FiSearch
            aria-hidden="true"
          />

          <input
            type="search"
            value={filter}
            placeholder="Филтрирај ги прикажаните резултати..."
            aria-label="Филтрирај резултати"
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
                  event.key === 'Escape'
                ) {
                  setFilter('')
                }
              }
            }
          />


          {filter && (
            <button
              type="button"
              aria-label="Исчисти филтер"
              onClick={() =>
                setFilter('')
              }
            >
              <FiX
                aria-hidden="true"
              />
            </button>
          )}
        </label>


        <label className="search-results-sort">
          <FiSliders
            aria-hidden="true"
          />

          <span>
            Подреди
          </span>

          <select
            value={sort}
            aria-label="Подреди резултати"
            onChange={
              (event) =>
                setSort(
                  event.target.value,
                )
            }
          >
            <option value="relevance">
              По релевантност
            </option>

            <option value="alphabetical">
              Азбучно
            </option>
          </select>
        </label>
      </section>


      <div
        className="search-results-current"
        aria-live="polite"
      >
        <span>
          Прикажани
        </span>

        <strong>
          {visibleWords.length
            .toLocaleString(
              LOCALE,
            )}
        </strong>

        <span>
          од
        </span>

        <strong>
          {words.length
            .toLocaleString(
              LOCALE,
            )}
        </strong>
      </div>


      {visibleWords.length > 0 ? (
        <WordList
          words={
            visibleWords
          }
          highlightTerm={
            filter || searchTerm
          }
          showMatchType
        />
      ) : (
        <div className="search-results-empty">
          <span
            aria-hidden="true"
          >
            0
          </span>

          <div>
            <strong>
              Нема резултати со
              избраните филтри.
            </strong>

            <p>
              Исчистете го локалниот
              филтер или прикажете ги
              сите типови на
              совпаѓање.
            </p>

            <button
              type="button"
              onClick={
                handleResetFilters
              }
            >
              Ресетирај филтри
            </button>
          </div>
        </div>
      )}
    </motion.main>
  )
}