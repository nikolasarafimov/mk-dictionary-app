
import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
} from 'framer-motion'

import CommandPalette from './components/CommandPalette'
import Footer from './components/Footer'
import LoadingOverlay from './components/LoadingOverlay'
import NavBar from './components/NavBar'
import ScrollManager from './components/ScrollManager'

import Abbreviations from './pages/Abbreviations'
import Favorites from './pages/Favorites'
import Home from './pages/Home'
import LanguageInfo from './pages/LanguageInfo'
import ListPage from './pages/ListPage'
import NotFoundPage from './pages/NotFoundPage'
import SearchResults from './pages/SearchResults'
import WordPage from './pages/WordPage'

import {
  getRandomForm,
  getTotalForms,
} from './db/client'

import useSearchSuggestions from './hooks/useSearchSuggestions'

import {
  addRecentSearch,
} from './utils/searchHistoryManager'

import {
  buildDetailsPath,
  buildLetterPath,
  buildSearchPath,
} from './utils/routes'

const PAGE_TRANSITION = {
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
    ease: [0.2, 0, 0, 1],
  },
}

const REDUCED_PAGE_TRANSITION = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
  transition: {
    duration: 0.12,
  },
}

export default function App() {
  const [totalWords, setTotalWords] = useState(null)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [isCountLoading, setIsCountLoading] = useState(false)
  const [isRandomLoading, setIsRandomLoading] = useState(false)
  const [dbError, setDbError] = useState('')

  const randomRequestRef = useRef(false)

  const navigate = useNavigate()
  const location = useLocation()
  const prefersReducedMotion = useReducedMotion()

  const pathname = location.pathname
  const isDbBusy = isCountLoading || isRandomLoading

  const pageTransition = prefersReducedMotion
    ? REDUCED_PAGE_TRANSITION
    : PAGE_TRANSITION

  const {
    suggestions,
    setSuggestions,
  } = useSearchSuggestions(searchInput, {
    disabled: pathname !== '/home',
    delay: 160,
    limit: 10,
  })

  useEffect(() => {
    setCommandPaletteOpen(false)
    setDbError('')
    setSuggestions([])
  }, [pathname, setSuggestions])

  useEffect(() => {
    if (pathname !== '/home' || totalWords !== null) {
      return undefined
    }

    let active = true

    async function loadTotalWords() {
      setIsCountLoading(true)
      setDbError('')

      try {
        const count = await getTotalForms()

        if (active) {
          setTotalWords(Number(count) || 0)
        }
      } catch {
        if (active) {
          setDbError(
            'Речникот не може да се вчита. Освежете ја страницата и обидете се повторно.',
          )
        }
      } finally {
        if (active) {
          setIsCountLoading(false)
        }
      }
    }

    loadTotalWords()

    return () => {
      active = false
      setIsCountLoading(false)
    }
  }, [pathname, totalWords])

  const performSearch = (value) => {
    const query = String(value ?? '').trim()

    if (!query) {
      return
    }

    setSearchInput(query)
    setSuggestions([])
    setDbError('')

    addRecentSearch(query)

    navigate(buildSearchPath(query))
  }

  const handleSearchInputChange = (value) => {
    setSearchInput(value)
  }

  const handleSuggestionSelect = (value) => {
    const form = String(value ?? '').trim()

    if (!form) {
      return
    }

    setSearchInput(form)
    setSuggestions([])
    setDbError('')

    addRecentSearch(form)

    navigate(buildDetailsPath(form))
  }

  const handleLetterClick = (letter) => {
    const value = String(letter ?? '').trim()

    if (!value) {
      return
    }

    setSearchInput('')
    setSuggestions([])
    setDbError('')

    navigate(buildLetterPath(value))
  }

  const handleRandom = async () => {
    if (isDbBusy || randomRequestRef.current) {
      return
    }

    randomRequestRef.current = true

    setIsRandomLoading(true)
    setDbError('')

    try {
      const form = await getRandomForm()

      if (!form) {
        setDbError(
          'Во речникот не беше пронајден случаен збор.',
        )
        return
      }

      navigate(buildDetailsPath(form))
    } catch {
      setDbError(
        'Случаен збор не можеше да се избере. Обидете се повторно.',
      )
    } finally {
      randomRequestRef.current = false
      setIsRandomLoading(false)
    }
  }

  const openCommandPalette = () => {
    setCommandPaletteOpen(true)
  }

  const closeCommandPalette = () => {
    setCommandPaletteOpen(false)
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="app-shell">
        <ScrollManager />

        <NavBar
          onOpenCommandPalette={openCommandPalette}
        />

        <CommandPalette
          open={commandPaletteOpen}
          onOpen={openCommandPalette}
          onClose={closeCommandPalette}
        />

        <main className="app-main">
          {isDbBusy && <LoadingOverlay />}

          {dbError && (
            <section className="card" role="alert">
              <p>{dbError}</p>
            </section>
          )}

          <AnimatePresence
            mode="wait"
            initial={false}
          >
            <motion.div
              key={pathname}
              {...pageTransition}
            >
              <Routes location={location}>
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
                    <Home
                      searchInput={searchInput}
                      onSearchInputChange={handleSearchInputChange}
                      onSearchSubmit={performSearch}
                      onLetterClick={handleLetterClick}
                      onRandom={handleRandom}
                      totalWords={totalWords}
                      isDbBusy={isDbBusy}
                      suggestions={suggestions}
                      onSuggestionSelect={handleSuggestionSelect}
                    />
                  }
                />

                <Route
                  path="/list/:letter"
                  element={<ListPage />}
                />

                <Route
                  path="/search/:term"
                  element={<SearchResults />}
                />

                <Route
                  path="/details/:form"
                  element={<WordPage />}
                />

                <Route
                  path="/language"
                  element={<LanguageInfo />}
                />

                <Route
                  path="/abbr/:group?"
                  element={<Abbreviations />}
                />

                <Route
                  path="/favorites"
                  element={<Favorites />}
                />

                <Route
                  path="/not-found/:term"
                  element={<NotFoundPage />}
                />

                <Route
                  path="*"
                  element={<NotFoundPage />}
                />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>

        <Footer />
      </div>
    </MotionConfig>
  )
}
