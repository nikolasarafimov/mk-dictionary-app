import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'

import {
  AnimatePresence,
  motion,
} from 'framer-motion'

import Abbreviations
  from './components/Abbreviations'
import Footer
  from './components/Footer'
import LanguageInfo
  from './components/LanguageInfo'
import LetterNav
  from './components/LetterNav'
import LoadingOverlay
  from './components/LoadingOverlay'
import NavBar
  from './components/NavBar'
import NotFoundPage
  from './components/NotFoundPage'
import RandomWordButton
  from './components/RandomWordButton'
import SearchBar
  from './components/SearchBar'
import WordDetails
  from './components/WordDetails'
import WordList
  from './components/WordList'

import Favorites
  from './pages/Favorites'

import {
  getRandomForm,
  getSearchSuggestions,
  getSimilarForms,
  getTotalForms,
  getWordByForm,
  getWordsByLetter,
  searchForms,
} from './db/client'


const pageTransition = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -8,
  },
  transition: {
    duration: 0.25,
  },
}

const IS_DEMO_BUILD =
  import.meta.env.PROD


function buildDetailsPath(form) {
  return `/details/${encodeURIComponent(form)}`
}


function buildNotFoundPath(term) {
  return `/not-found/${encodeURIComponent(term)}`
}


function buildLetterPath(letter) {
  return `/list/${encodeURIComponent(letter)}`
}


function Home({
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  selectedLetter,
  onLetterClick,
  onRandom,
  totalWords,
  isDbBusy,
  suggestions,
  onSuggestionSelect,
}) {
  return (
    <div className="home-container">
      <section className="home-hero card">
        <div className="hero-top">
          <h1 className="hero-title">
            Македонски дигитален речник
          </h1>

          <p className="hero-subtitle">
            Интерактивен и современ дигитален
            ресурс за пребарување и истражување
            на македонскиот јазик.
          </p>
        </div>

        <div className="hero-meta">
          <div className="hero-stat">
            <span className="hero-stat-label">
              Форми во базата
            </span>

            <span className="hero-stat-value">
              {totalWords === null
                ? 'Вчитување…'
                : totalWords.toLocaleString(
                    'mk-MK',
                  )}
            </span>
          </div>

          <div className="hero-stat">
            <span className="hero-stat-label">
              Тип
            </span>

            <span className="hero-stat-value">
              еднојазичен дигитален речник
            </span>
          </div>
        </div>
      </section>

      {IS_DEMO_BUILD && (
        <section className="demo-notice card">
          <strong>
            Демо-верзија:
          </strong>
          {' '}
          Јавната верзија користи намалена
          база на податоци за побрзо
          вчитување во прелистувачот.
          Целосната база со повеќе од
          1,3 милиони македонски збороформи
          е вклучена во изворниот проект.
        </section>
      )}

      <section className="search-wrapper">
        <SearchBar
          term={searchInput}
          onTermChange={
            onSearchInputChange
          }
          onSearch={
            onSearchSubmit
          }
          suggestions={
            suggestions
          }
          onSuggestionSelect={
            onSuggestionSelect
          }
          disabled={
            isDbBusy
          }
        />
      </section>

      <section className="home-random-section">
        <RandomWordButton
          onRandom={onRandom}
          disabled={isDbBusy}
        />
      </section>

      <section className="home-info card">
        <h2>
          За овој речник
        </h2>

        <p>
          Речникот е дигитален ресурс што
          овозможува брзо пребарување на
          збороформи, леми и морфолошки
          ознаки на македонскиот јазик.
        </p>

        <ul>
          <li>
            <strong>
              Почетна
            </strong>
            {' '}
            — пребарување, азбучен индекс
            и случаен збор.
          </li>

          <li>
            <strong>
              Македонски јазик
            </strong>
            {' '}
            — основни информации за
            македонскиот јазик.
          </li>

          <li>
            <strong>
              Скратеници
            </strong>
            {' '}
            — групи на скратеници и
            нивните значења.
          </li>

          <li>
            <strong>
              Омилени
            </strong>
            {' '}
            — локално зачувани омилени
            зборови.
          </li>
        </ul>

        <p className="home-author">
          Автор:{' '}
          <strong>
            Никола Сарафимов
          </strong>
        </p>
      </section>

      <section className="home-alpha-section card">
        <div className="card-header">
          <h2>
            Азбучен индекс
          </h2>

          <p className="card-subtitle">
            Одберете буква за да ги
            прегледате зборовите што
            започнуваат со неа.
          </p>
        </div>

        <LetterNav
          selectedLetter={
            selectedLetter
          }
          onLetterClick={
            onLetterClick
          }
          disabled={
            isDbBusy
          }
        />
      </section>
    </div>
  )
}


function ListPage({
  words,
  onSelect,
  searchTerm,
}) {
  const {
    letter,
  } = useParams()

  if (!letter && !searchTerm) {
    return (
      <Navigate
        to="/home"
        replace
      />
    )
  }

  const label =
    letter || searchTerm

  if (
    letter
    && words.length === 0
    && !searchTerm
  ) {
    return (
      <section className="list-page card">
        <h2>
          Азбучен индекс
        </h2>

        <p>
          За „
          <strong>
            {letter}
          </strong>
          “ нема резултати.
        </p>
      </section>
    )
  }

  if (
    searchTerm
    && words.length === 0
  ) {
    return (
      <Navigate
        to={
          buildNotFoundPath(
            searchTerm,
          )
        }
        replace
      />
    )
  }

  return (
    <div className="list-page-container">
      <section className="results-card">
        <div className="results-header">
          <h2 className="results-title">
            Резултати за:{' '}
            <span className="results-term">
              „{label}“
            </span>
          </h2>

          <span className="results-badge">
            {words.length.toLocaleString(
              'mk-MK',
            )}
            {' '}
            форми
          </span>
        </div>

        <div className="results-list-wrapper">
          <WordList
            words={words}
            onSelect={onSelect}
          />
        </div>
      </section>
    </div>
  )
}


function DetailsByParam({
  onSearch,
}) {
  const {
    form,
  } = useParams()

  const navigate =
    useNavigate()

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
  ] = useState(form || '')

  const [
    detailSuggestions,
    setDetailSuggestions,
  ] = useState([])

  useEffect(() => {
    setDetailSearchInput(
      form || '',
    )
    setDetailSuggestions([])
  }, [form])

  useEffect(() => {
    let cancelled = false

    async function loadWord() {
      setLoading(true)
      setWord(null)
      setSimilar([])
      setError('')

      try {
        const main =
          await getWordByForm(
            form || '',
          )

        if (cancelled) {
          return
        }

        if (!main) {
          setWord(null)
          return
        }

        setWord(main)

        if (main.lemma) {
          const similarForms =
            await getSimilarForms(
              main.lemma,
              main.form,
            )

          if (!cancelled) {
            setSimilar(
              similarForms,
            )
          }
        }
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
  }, [form])

  useEffect(() => {
    const query =
      detailSearchInput.trim()

    if (!query) {
      setDetailSuggestions([])
      return undefined
    }

    if (query === form) {
      setDetailSuggestions([])
      return undefined
    }

    let cancelled = false

    const timer =
      setTimeout(
        async () => {
          try {
            const suggestions =
              await getSearchSuggestions(
                query,
              )

            if (!cancelled) {
              setDetailSuggestions(
                suggestions,
              )
            }
          } catch {
            if (!cancelled) {
              setDetailSuggestions([])
            }
          }
        },
        180,
      )

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [
    detailSearchInput,
    form,
  ])

  const submitDetailSearch =
    (value) => {
      const query =
        value.trim()

      if (!query) {
        return
      }

      onSearch(query)
    }

  const selectDetailSuggestion =
    (value) => {
      setDetailSearchInput(
        value,
      )

      setDetailSuggestions([])

      onSearch(value)
    }

  if (loading) {
    return (
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        style={{
          height: '150px',
        }}
        role="status"
        aria-label="Вчитување на зборот"
      />
    )
  }

  if (error) {
    return (
      <motion.section
        className="details-page card not-found"
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        role="alert"
      >
        <h2>
          Грешка при вчитување
        </h2>

        <p>
          {error}
        </p>
      </motion.section>
    )
  }

  if (!word) {
    return (
      <motion.section
        className="details-page card not-found"
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >
        <h2>
          Поимот не е пронајден
        </h2>

        <p>
          Поимот „
          <strong>
            {form}
          </strong>
          “ не е пронајден во речникот.
        </p>
      </motion.section>
    )
  }

  return (
    <div className="details-layout">
      <motion.div
        className="details-search-wrapper"
        initial={{
          opacity: 0,
          y: -12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.28,
        }}
      >
        <SearchBar
          term={
            detailSearchInput
          }
          onTermChange={
            setDetailSearchInput
          }
          onSearch={
            submitDetailSearch
          }
          suggestions={
            detailSuggestions
          }
          onSuggestionSelect={
            selectDetailSuggestion
          }
        />
      </motion.div>

      <motion.article
        className="card word-details-card"
        initial={{
          opacity: 0,
          y: 22,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.35,
          ease: 'easeOut',
        }}
      >
        <WordDetails
          word={word}
        />

        {similar.length > 0 && (
          <section className="similar-words">
            <h3>
              Слични форми
            </h3>

            <div className="similar-grid">
              {similar.map(
                (similarForm) => (
                  <button
                    key={
                      similarForm
                    }
                    type="button"
                    className="similar-badge"
                    onClick={() =>
                      navigate(
                        buildDetailsPath(
                          similarForm,
                        ),
                      )
                    }
                  >
                    {similarForm}
                  </button>
                ),
              )}
            </div>
          </section>
        )}
      </motion.article>
    </div>
  )
}


export default function App() {
  const [
    totalWords,
    setTotalWords,
  ] = useState(null)

  const [
    filteredWords,
    setFilteredWords,
  ] = useState([])

  const [
    selectedLetter,
    setSelectedLetter,
  ] = useState(null)

  const [
    searchInput,
    setSearchInput,
  ] = useState('')

  const [
    searchTerm,
    setSearchTerm,
  ] = useState('')

  const [
    isDbBusy,
    setIsDbBusy,
  ] = useState(false)

  const [
    suggestions,
    setSuggestions,
  ] = useState([])

  const [
    dbError,
    setDbError,
  ] = useState('')

  const navigate =
    useNavigate()

  const location =
    useLocation()

  const pathname =
    location.pathname


  useEffect(() => {
    const query =
      searchInput.trim()

    if (!query) {
      setSuggestions([])
      return undefined
    }

    let cancelled = false

    const timer =
      setTimeout(
        async () => {
          try {
            const results =
              await getSearchSuggestions(
                query,
              )

            if (!cancelled) {
              setSuggestions(
                results,
              )
            }
          } catch {
            if (!cancelled) {
              setSuggestions([])
            }
          }
        },
        180,
      )

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [searchInput])


  useEffect(() => {
    if (
      !pathname.startsWith('/home')
      || totalWords !== null
    ) {
      return undefined
    }

    let cancelled = false

    async function loadCount() {
      setIsDbBusy(true)
      setDbError('')

      try {
        const count =
          await getTotalForms()

        if (!cancelled) {
          setTotalWords(
            Number(count) || 0,
          )
        }
      } catch {
        if (!cancelled) {
          setDbError(
            'Речникот не може да се вчита. Освежете ја страницата и обидете се повторно.',
          )
        }
      } finally {
        if (!cancelled) {
          setIsDbBusy(false)
        }
      }
    }

    loadCount()

    return () => {
      cancelled = true
    }
  }, [
    pathname,
    totalWords,
  ])


  useEffect(() => {
    const match =
      pathname.match(
        /^\/list\/([^/]+)$/,
      )

    if (!match) {
      return undefined
    }

    let letter

    try {
      letter =
        decodeURIComponent(
          match[1],
        )
    } catch {
      navigate(
        '/home',
        {
          replace: true,
        },
      )

      return undefined
    }

    let cancelled = false

    async function loadLetter() {
      setSelectedLetter(
        letter,
      )

      setSearchInput('')
      setSearchTerm('')
      setSuggestions([])
      setFilteredWords([])
      setIsDbBusy(true)
      setDbError('')

      try {
        const rows =
          await getWordsByLetter(
            letter,
          )

        if (!cancelled) {
          setFilteredWords(
            rows,
          )
        }
      } catch {
        if (!cancelled) {
          setDbError(
            'Зборовите за избраната буква не можеа да се вчитаат.',
          )
        }
      } finally {
        if (!cancelled) {
          setIsDbBusy(false)
        }
      }
    }

    loadLetter()

    return () => {
      cancelled = true
    }
  }, [
    pathname,
    navigate,
  ])


  const performSearch =
    useCallback(
      async (value) => {
        const query =
          String(value).trim()

        if (!query) {
          return
        }

        setSearchInput(
          query,
        )

        setSearchTerm(
          query,
        )

        setSelectedLetter(
          null,
        )

        setSuggestions([])
        setFilteredWords([])
        setIsDbBusy(true)
        setDbError('')

        try {
          const exact =
            await getWordByForm(
              query,
            )

          if (exact) {
            navigate(
              buildDetailsPath(
                exact.form,
              ),
            )

            return
          }

          const rows =
            await searchForms(
              query,
            )

          setFilteredWords(
            rows,
          )

          if (rows.length > 0) {
            navigate(
              '/list',
            )
          } else {
            navigate(
              buildNotFoundPath(
                query,
              ),
            )
          }
        } catch {
          setDbError(
            'Пребарувањето не можеше да се изврши. Обидете се повторно.',
          )
        } finally {
          setIsDbBusy(false)
        }
      },
      [
        navigate,
      ],
    )


  const handleNavSelect =
    (key) => {
      if (key === 'home') {
        setSelectedLetter(
          null,
        )

        setSearchInput('')
        setSearchTerm('')
        setSuggestions([])
        setFilteredWords([])
        setDbError('')

        navigate('/home')

        return
      }

      setDbError('')

      navigate(
        `/${key}`,
      )
    }


  const handleSearchInputChange =
    (value) => {
      setSearchInput(
        value,
      )

      setSelectedLetter(
        null,
      )
    }


  const handleLetterClick =
    (letter) => {
      setSearchInput('')
      setSearchTerm('')
      setSuggestions([])
      setFilteredWords([])
      setDbError('')

      navigate(
        buildLetterPath(
          letter,
        ),
      )
    }


  const handleRandom =
    async () => {
      setIsDbBusy(true)
      setDbError('')

      try {
        const form =
          await getRandomForm()

        if (form) {
          navigate(
            buildDetailsPath(
              form,
            ),
          )
        }
      } catch {
        setDbError(
          'Случаен збор не можеше да се избере. Обидете се повторно.',
        )
      } finally {
        setIsDbBusy(false)
      }
    }


  const handleSuggestionSelect =
    (word) => {
      setSearchInput(
        word,
      )

      setSuggestions([])

      performSearch(
        word,
      )
    }


  const navKey =
    pathname.startsWith('/home')
      ? 'home'
      : pathname.split('/')[1]
        || 'home'


  return (
    <div className="app-shell">
      <NavBar
        selected={navKey}
        onSelect={
          handleNavSelect
        }
      />

      <main className="app-main">
        {isDbBusy && (
          <LoadingOverlay />
        )}

        {dbError && (
          <section
            className="card"
            role="alert"
          >
            <p>
              {dbError}
            </p>
          </section>
        )}

        <AnimatePresence mode="wait">
          <Routes
            location={location}
            key={location.pathname}
          >
            <Route
              path="/"
              element={
                <Navigate
                  to="/home"
                  replace
                />
              }
            />

            <Route
              path="/home"
              element={
                <motion.div
                  {...pageTransition}
                >
                  <Home
                    searchInput={
                      searchInput
                    }
                    onSearchInputChange={
                      handleSearchInputChange
                    }
                    onSearchSubmit={
                      performSearch
                    }
                    selectedLetter={
                      selectedLetter
                    }
                    onLetterClick={
                      handleLetterClick
                    }
                    onRandom={
                      handleRandom
                    }
                    totalWords={
                      totalWords
                    }
                    isDbBusy={
                      isDbBusy
                    }
                    suggestions={
                      suggestions
                    }
                    onSuggestionSelect={
                      handleSuggestionSelect
                    }
                  />
                </motion.div>
              }
            />

            <Route
              path="/list/:letter?"
              element={
                <motion.div
                  {...pageTransition}
                >
                  <ListPage
                    words={
                      filteredWords
                    }
                    searchTerm={
                      searchTerm
                    }
                    onSelect={
                      (word) =>
                        navigate(
                          buildDetailsPath(
                            word.form,
                          ),
                        )
                    }
                  />
                </motion.div>
              }
            />

            <Route
              path="/details/:form"
              element={
                <motion.div
                  {...pageTransition}
                >
                  <DetailsByParam
                    onSearch={
                      performSearch
                    }
                  />
                </motion.div>
              }
            />

            <Route
              path="/language"
              element={
                <motion.div
                  {...pageTransition}
                >
                  <LanguageInfo />
                </motion.div>
              }
            />

            <Route
              path="/abbr/:group?"
              element={
                <motion.div
                  {...pageTransition}
                >
                  <Abbreviations />
                </motion.div>
              }
            />

            <Route
              path="/not-found/:term"
              element={
                <motion.div
                  {...pageTransition}
                >
                  <NotFoundPage />
                </motion.div>
              }
            />

            <Route
              path="/favorites"
              element={
                <motion.div
                  {...pageTransition}
                >
                  <Favorites />
                </motion.div>
              }
            />

            <Route
              path="*"
              element={
                <Navigate
                  to="/home"
                  replace
                />
              }
            />
          </Routes>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  )
}