import {
  useEffect,
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
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiSearch,
} from 'react-icons/fi'

import {
  WordDetailsSkeleton,
} from '../components/LoadingSkeletons'

import SearchBar
  from '../components/SearchBar'

import WordDetails
  from '../components/WordDetails'

import {
  getSimilarForms,
  getWordByForm,
} from '../db/client'

import useSearchSuggestions
  from '../hooks/useSearchSuggestions'

import {
  addRecentWord,
} from '../utils/recentManager'

import {
  addRecentSearch,
} from '../utils/searchHistoryManager'

import {
  buildDetailsPath,
  buildNotFoundPath,
  buildSearchPath,
} from '../utils/routes'


const LOCALE = 'mk-MK'


function normalizeSimilarForms(
  values,
  currentForm,
) {
  if (
    !Array.isArray(
      values,
    )
  ) {
    return []
  }


  const currentKey =
    String(
      currentForm ?? '',
    )
      .trim()
      .toLocaleLowerCase(
        LOCALE,
      )

  const seen =
    new Set()

  const result = []


  for (
    const value
    of values
  ) {
    const form =
      typeof value === 'string'
        ? value.trim()
        : String(
          value?.form ?? '',
        ).trim()


    if (!form) {
      continue
    }


    const key =
      form.toLocaleLowerCase(
        LOCALE,
      )


    if (
      key === currentKey
      || seen.has(
        key,
      )
    ) {
      continue
    }


    seen.add(
      key,
    )

    result.push(
      form,
    )
  }


  return result
}


export default function WordPage() {
  const {
    form,
  } = useParams()

  const navigate =
    useNavigate()


  const routeForm =
    String(
      form ?? '',
    ).trim()


  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    word,
    setWord,
  ] = useState(null)

  const [
    similar,
    setSimilar,
  ] = useState([])

  const [
    error,
    setError,
  ] = useState('')

  const [
    detailSearchInput,
    setDetailSearchInput,
  ] = useState(
    routeForm,
  )


  const {
    suggestions:
      detailSuggestions,

    setSuggestions:
      setDetailSuggestions,
  } = useSearchSuggestions(
    detailSearchInput,
    {
      ignoreValue:
        routeForm,

      limit: 8,
    },
  )


  useEffect(() => {
    setDetailSearchInput(
      routeForm,
    )

    setDetailSuggestions([])
  }, [
    routeForm,
    setDetailSuggestions,
  ])


  useEffect(() => {
    if (!routeForm) {
      return undefined
    }


    let cancelled = false


    async function loadWord() {
      setLoading(true)
      setWord(null)
      setSimilar([])
      setError('')


      try {
        const main =
          await getWordByForm(
            routeForm,
          )


        if (cancelled) {
          return
        }


        const mainForm =
          String(
            main?.form ?? '',
          ).trim()


        if (!mainForm) {
          navigate(
            buildNotFoundPath(
              routeForm,
            ),
            {
              replace: true,
            },
          )

          return
        }


        setWord(
          main,
        )


        addRecentWord({
          form:
            mainForm,

          lemma:
            String(
              main.lemma ?? '',
            ).trim(),

          tag:
            String(
              main.tag ?? '',
            ).trim(),
        })


        const lemma =
          String(
            main.lemma ?? '',
          ).trim()


        if (!lemma) {
          return
        }


        const similarForms =
          await getSimilarForms(
            lemma,
            mainForm,
          )


        if (cancelled) {
          return
        }


        setSimilar(
          normalizeSimilarForms(
            similarForms,
            mainForm,
          ),
        )
      } catch {
        if (!cancelled) {
          setError(
            'Податоците за зборот не можеа да се вчитаат.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }


    loadWord()


    return () => {
      cancelled = true
    }
  }, [
    routeForm,
    navigate,
  ])


  const submitSearch =
    (value) => {
      const query =
        String(
          value ?? '',
        ).trim()


      if (!query) {
        return
      }


      setDetailSuggestions([])

      addRecentSearch(
        query,
      )


      navigate(
        buildSearchPath(
          query,
        ),
      )
    }


  const selectSuggestion =
    (value) => {
      const selectedForm =
        String(
          value ?? '',
        ).trim()


      if (!selectedForm) {
        return
      }


      setDetailSearchInput(
        selectedForm,
      )

      setDetailSuggestions([])


      addRecentSearch(
        selectedForm,
      )


      navigate(
        buildDetailsPath(
          selectedForm,
        ),
      )
    }


  if (!routeForm) {
    return (
      <Navigate
        to="/home"
        replace
      />
    )
  }


  if (loading) {
    return (
      <WordDetailsSkeleton />
    )
  }


  if (error) {
    return (
      <motion.main
        className="dictionary-word-page"
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
        <section
          className="dictionary-state dictionary-state-error"
          role="alert"
        >
          <div
            className="dictionary-state-icon"
            aria-hidden="true"
          >
            <FiAlertCircle />
          </div>

          <h1>
            Грешка при вчитување
          </h1>

          <p>
            {error}
          </p>

          <Link
            to="/home"
            className="dictionary-back-link"
          >
            <FiArrowLeft
              aria-hidden="true"
            />

            Назад кон речникот
          </Link>
        </section>
      </motion.main>
    )
  }


  if (!word) {
    return null
  }


  return (
    <motion.main
      className="dictionary-word-page"
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
      <div className="dictionary-word-tools">
        <Link
          to="/home"
          className="dictionary-back-link"
        >
          <FiArrowLeft
            aria-hidden="true"
          />

          Речник
        </Link>


        <div className="dictionary-inline-search">
          <span className="dictionary-inline-search-label">
            <FiSearch
              aria-hidden="true"
            />

            Пребарај друг збор
          </span>

          <SearchBar
            term={
              detailSearchInput
            }
            onTermChange={
              setDetailSearchInput
            }
            onSearch={
              submitSearch
            }
            suggestions={
              detailSuggestions
            }
            onSuggestionSelect={
              selectSuggestion
            }
          />
        </div>
      </div>


      <WordDetails
        word={word}
      />


      {similar.length > 0 && (
        <section
          className="dictionary-related"
          aria-labelledby="related-forms-title"
        >
          <header className="dictionary-related-header">
            <div className="dictionary-facts-heading">
              <span className="dictionary-section-number">
                03
              </span>

              <div>
                <span className="dictionary-section-kicker">
                  Лексичко семејство
                </span>

                <h2 id="related-forms-title">
                  Поврзани форми
                </h2>
              </div>
            </div>

            <span className="dictionary-related-count">
              {similar.length.toLocaleString(
                LOCALE,
              )}
              {' '}
              форми
            </span>
          </header>


          <div className="dictionary-related-list">
            {similar.map(
              (
                similarForm,
                index,
              ) => (
                <Link
                  key={
                    similarForm
                  }
                  to={
                    buildDetailsPath(
                      similarForm,
                    )
                  }
                  className="dictionary-related-item"
                  aria-label={
                    `Отвори ја поврзаната форма „${similarForm}“`
                  }
                >
                  <span className="dictionary-related-index">
                    {String(
                      index + 1,
                    ).padStart(
                      2,
                      '0',
                    )}
                  </span>

                  <span className="dictionary-related-word">
                    {similarForm}
                  </span>

                  <FiArrowRight
                    aria-hidden="true"
                  />
                </Link>
              ),
            )}
          </div>
        </section>
      )}
    </motion.main>
  )
}