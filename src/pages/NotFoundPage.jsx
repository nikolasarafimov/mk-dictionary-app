import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'

import {
  motion,
} from 'framer-motion'

import {
  FiArrowLeft,
  FiArrowRight,
  FiBookOpen,
  FiSearch,
  FiZap,
} from 'react-icons/fi'

import SearchBar
  from '../components/SearchBar'

import {
  getDidYouMeanSuggestions,
} from '../db/client'

import useSearchSuggestions
  from '../hooks/useSearchSuggestions'

import {
  buildDetailsPath,
  buildSearchPath,
} from '../utils/routes'


const LOCALE = 'mk-MK'


function normalizeCorrection(
  value,
) {
  if (
    typeof value === 'string'
  ) {
    return value.trim()
  }


  if (
    value
    && typeof value === 'object'
  ) {
    return String(
      value.form ?? '',
    ).trim()
  }


  return ''
}


export default function NotFoundPage() {
  const {
    term,
  } = useParams()

  const navigate =
    useNavigate()


  const searchedTerm =
    String(
      term ?? '',
    ).trim()

  const hasSearchTerm =
    Boolean(
      searchedTerm,
    )


  const [
    searchValue,
    setSearchValue,
  ] = useState('')

  const [
    corrections,
    setCorrections,
  ] = useState([])

  const [
    correctionsLoading,
    setCorrectionsLoading,
  ] = useState(false)


  const {
    suggestions,
    setSuggestions,
  } = useSearchSuggestions(
    searchValue,
    {
      ignoreValue:
        searchedTerm,

      limit: 8,
    },
  )


  useEffect(() => {
    setSearchValue('')
    setSuggestions([])
  }, [
    searchedTerm,
    setSuggestions,
  ])


  useEffect(() => {
    if (!searchedTerm) {
      setCorrections([])
      setCorrectionsLoading(false)

      return undefined
    }


    let cancelled = false


    async function loadCorrections() {
      setCorrectionsLoading(
        true,
      )

      setCorrections([])


      try {
        const results =
          await getDidYouMeanSuggestions(
            searchedTerm,
            5,
          )


        if (cancelled) {
          return
        }


        const queryLower =
          searchedTerm
            .toLocaleLowerCase(
              LOCALE,
            )

        const seen =
          new Set()

        const normalizedResults =
          (
            Array.isArray(
              results,
            )
              ? results
              : []
          )
            .map(
              normalizeCorrection,
            )
            .filter(
              (value) => {
                if (!value) {
                  return false
                }


                const key =
                  value
                    .toLocaleLowerCase(
                      LOCALE,
                    )


                if (
                  key === queryLower
                  || seen.has(
                    key,
                  )
                ) {
                  return false
                }


                seen.add(
                  key,
                )

                return true
              },
            )
            .slice(
              0,
              5,
            )


        setCorrections(
          normalizedResults,
        )
      } catch {
        if (!cancelled) {
          setCorrections([])
        }
      } finally {
        if (!cancelled) {
          setCorrectionsLoading(
            false,
          )
        }
      }
    }


    loadCorrections()


    return () => {
      cancelled = true
    }
  }, [
    searchedTerm,
  ])


  const correctionCount =
    corrections.length


  const correctionStatus =
    useMemo(
      () =>
        correctionsLoading
        || correctionCount > 0,
      [
        correctionsLoading,
        correctionCount,
      ],
    )


  const handleSearch =
    (value) => {
      const query =
        String(
          value ?? '',
        ).trim()


      if (!query) {
        return
      }


      setSuggestions([])

      navigate(
        buildSearchPath(
          query,
        ),
      )
    }


  const handleSuggestion =
    (value) => {
      const form =
        String(
          value ?? '',
        ).trim()


      if (!form) {
        return
      }


      setSearchValue(
        form,
      )

      setSuggestions([])

      navigate(
        buildDetailsPath(
          form,
        ),
      )
    }


  const openCorrection =
    (value) => {
      const form =
        String(
          value ?? '',
        ).trim()


      if (!form) {
        return
      }


      navigate(
        buildDetailsPath(
          form,
        ),
      )
    }


  return (
    <motion.main
      className="not-found-page"
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
      <div className="not-found-back">
        <Link to="/home">
          <FiArrowLeft
            aria-hidden="true"
          />

          Назад кон речникот
        </Link>
      </div>


      <section
        className="not-found-layout"
        aria-labelledby="not-found-title"
      >
        <div
          className="not-found-code"
          aria-hidden="true"
        >
          <span>
            {hasSearchTerm
              ? '0'
              : '404'}
          </span>

          <span>
            {hasSearchTerm
              ? 'резултати'
              : 'страница'}
          </span>
        </div>


        <div className="not-found-main">
          <span className="not-found-eyebrow">
            {hasSearchTerm
              ? 'Пребарувањето заврши'
              : 'Непостоечка страница'}
          </span>


          <h1 id="not-found-title">
            {hasSearchTerm ? (
              <>
                Не го пронајдовме

                <em>
                  „{searchedTerm}“
                </em>
              </>
            ) : (
              <>
                Страницата не е

                <em>
                  пронајдена.
                </em>
              </>
            )}
          </h1>


          <p>
            {hasSearchTerm
              ? (
                <>
                  Во достапната речничка
                  база нема директно
                  совпаѓање со внесениот
                  поим. Проверете го
                  правописот или обидете се
                  со друга форма на зборот.
                </>
              )
              : (
                <>
                  Адресата што ја отворивте
                  не води до постоечка
                  страница. Можете да се
                  вратите во речникот или
                  да започнете ново
                  пребарување.
                </>
              )}
          </p>


          {hasSearchTerm
            && correctionStatus
            && (
              <section
                className="not-found-corrections"
                aria-labelledby="corrections-title"
              >
                <header>
                  <span
                    className="not-found-corrections-icon"
                    aria-hidden="true"
                  >
                    <FiZap />
                  </span>

                  <div>
                    <span>
                      Интелигентен предлог
                    </span>

                    <strong id="corrections-title">
                      Дали мислевте на…
                    </strong>
                  </div>
                </header>


                {correctionsLoading ? (
                  <div
                    className="not-found-correction-loading"
                    role="status"
                    aria-live="polite"
                  >
                    Се бараат блиски
                    збороформи…
                  </div>
                ) : (
                  <div className="not-found-correction-list">
                    {corrections.map(
                      (
                        correction,
                        index,
                      ) => (
                        <button
                          key={
                            correction
                          }
                          type="button"
                          onClick={() =>
                            openCorrection(
                              correction,
                            )
                          }
                        >
                          <span>
                            {String(
                              index + 1,
                            ).padStart(
                              2,
                              '0',
                            )}
                          </span>

                          <strong>
                            {
                              correction
                            }
                          </strong>

                          <FiArrowRight
                            aria-hidden="true"
                          />
                        </button>
                      ),
                    )}
                  </div>
                )}
              </section>
            )}


          <div className="not-found-search">
            <div className="not-found-search-heading">
              <FiSearch
                aria-hidden="true"
              />

              <span>
                Ново пребарување
              </span>
            </div>


            <SearchBar
              term={
                searchValue
              }
              onTermChange={
                setSearchValue
              }
              onSearch={
                handleSearch
              }
              suggestions={
                suggestions
              }
              onSuggestionSelect={
                handleSuggestion
              }
            />
          </div>


          {hasSearchTerm && (
            <div className="not-found-guidance">
              <div>
                <span>
                  01
                </span>

                <div>
                  <strong>
                    Проверете го зборот
                  </strong>

                  <p>
                    Проверете дали
                    зборот е внесен со
                    точни македонски
                    букви.
                  </p>
                </div>
              </div>


              <div>
                <span>
                  02
                </span>

                <div>
                  <strong>
                    Пробајте ја лемата
                  </strong>

                  <p>
                    Наместо конкретна
                    збороформа, пребарајте
                    ја основната форма на
                    зборот.
                  </p>
                </div>
              </div>


              <div>
                <span>
                  03
                </span>

                <div>
                  <strong>
                    Користете го индексот
                  </strong>

                  <p>
                    Прегледајте ги
                    зборовите според
                    нивната почетна
                    буква.
                  </p>
                </div>
              </div>
            </div>
          )}


          <Link
            to="/home"
            className="not-found-home-link"
          >
            <FiBookOpen
              aria-hidden="true"
            />

            {hasSearchTerm
              ? 'Отвори азбучен индекс'
              : 'Отвори го речникот'}
          </Link>
        </div>
      </section>
    </motion.main>
  )
}