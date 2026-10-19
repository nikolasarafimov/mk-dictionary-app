import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import {
  Link,
} from 'react-router-dom'

import {
  motion,
} from 'framer-motion'

import {
  FiArrowRight,
  FiBookOpen,
  FiClock,
  FiDatabase,
  FiSearch,
  FiShuffle,
} from 'react-icons/fi'

import LetterNav
  from '../components/LetterNav'

import RandomWordButton
  from '../components/RandomWordButton'

import SearchBar
  from '../components/SearchBar'

import {
  clearRecentWords,
  getRecentWords,
} from '../utils/recentManager'

import {
  buildDetailsPath,
} from '../utils/routes'


const IS_DEMO_BUILD =
  import.meta.env.PROD && import.meta.env.VITE_DICTIONARY_BACKEND !== 'turso'


const pageAnimation = {
  hidden: {
    opacity: 0,
  },

  visible: {
    opacity: 1,

    transition: {
      staggerChildren: 0.06,
    },
  },
}


const sectionAnimation = {
  hidden: {
    opacity: 0,
    y: 14,
  },

  visible: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.42,

      ease: [
        0.2,
        0,
        0,
        1,
      ],
    },
  },
}


function normalizeRecentWord(
  value,
) {
  if (
    typeof value === 'string'
  ) {
    const form =
      value.trim()


    if (!form) {
      return null
    }


    return {
      form,
      lemma: '',
    }
  }


  if (
    !value
    || typeof value !== 'object'
  ) {
    return null
  }


  const form =
    String(
      value.form ?? '',
    ).trim()


  if (!form) {
    return null
  }


  return {
    ...value,

    form,

    lemma:
      String(
        value.lemma ?? '',
      ).trim(),
  }
}


function getSafeRecentWords() {
  const values =
    getRecentWords()


  if (
    !Array.isArray(
      values,
    )
  ) {
    return []
  }


  return values
    .map(
      normalizeRecentWord,
    )
    .filter(Boolean)
}


export default function Home({
  searchInput = '',
  onSearchInputChange,
  onSearchSubmit,
  onLetterClick,
  onRandom,
  totalWords = null,
  isDbBusy = false,
  suggestions = [],
  onSuggestionSelect,
}) {
  const [
    recentWords,
    setRecentWords,
  ] = useState([])


  const refreshRecentWords =
    useCallback(
      () => {
        setRecentWords(
          getSafeRecentWords(),
        )
      },
      [],
    )


  useEffect(() => {
    refreshRecentWords()


    const handleStorage =
      () => {
        refreshRecentWords()
      }


    window.addEventListener(
      'storage',
      handleStorage,
    )


    return () => {
      window.removeEventListener(
        'storage',
        handleStorage,
      )
    }
  }, [
    refreshRecentWords,
  ])


  const handleClearRecent =
    () => {
      clearRecentWords()
      setRecentWords([])
    }


  const formattedTotalWords =
    Number.isFinite(
      totalWords,
    )
      ? totalWords.toLocaleString(
        'mk-MK',
      )
      : '—'


  return (
    <motion.main
      className="premium-home"
      variants={pageAnimation}
      initial="hidden"
      animate="visible"
    >
      <motion.section
        className="premium-home-hero"
        variants={sectionAnimation}
      >
        <div className="premium-home-heading">
          <div className="premium-home-overline">
            <span className="premium-home-overline-mark">
              МК
            </span>

            <span>
              Дигитален речник на
              македонскиот јазик
            </span>
          </div>


          <h1>
            Зборовите на
            <br />

            <em>
              македонскиот јазик.
            </em>
          </h1>


          <p>
            Пребарувајте збороформи,
            леми и морфолошки податоци
            низ дигиталната речничка база.
          </p>
        </div>


        <div className="premium-search-area">
          <div className="premium-search-topline">
            <span>
              <FiSearch
                aria-hidden="true"
              />

              Пребарување
            </span>

            <span>
              Збор · форма · лема
            </span>
          </div>


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


          <div className="premium-search-help">
            <span>
              Започнете со внесување
              на македонски збор.
            </span>

            <span>
              Enter за пребарување
            </span>
          </div>
        </div>


        <div className="premium-home-meta">
          <div className="premium-meta-item">
            <FiDatabase
              aria-hidden="true"
            />

            <div>
              <strong>
                {formattedTotalWords}
              </strong>

              <span>
                достапни збороформи
              </span>
            </div>
          </div>


          <div
            className="premium-meta-divider"
            aria-hidden="true"
          />


          <div className="premium-meta-item">
            <FiBookOpen
              aria-hidden="true"
            />

            <div>
              <strong>
                31
              </strong>

              <span>
                буква во азбуката
              </span>
            </div>
          </div>


          <div
            className="premium-meta-divider"
            aria-hidden="true"
          />


          <div className="premium-meta-item">
            <span
              className="premium-meta-symbol"
              aria-hidden="true"
            >
              Љ
            </span>

            <div>
              <strong>
                Македонски
              </strong>

              <span>
                јазичен ресурс
              </span>
            </div>
          </div>
        </div>
      </motion.section>


      {IS_DEMO_BUILD && (
        <motion.div
          className="premium-demo-line"
          variants={sectionAnimation}
        >
          <span>
            DEMO
          </span>

          <p>
            Јавната верзија користи
            оптимизирана база за побрзо
            вчитување. Целосната база е
            дел од проектот.
          </p>
        </motion.div>
      )}


      <motion.section
        className="premium-alphabet"
        variants={sectionAnimation}
        aria-labelledby="home-alphabet-title"
      >
        <header className="premium-section-header">
          <div>
            <span className="premium-section-index">
              01
            </span>

            <div>
              <span className="premium-section-kicker">
                Азбучен индекс
              </span>

              <h2 id="home-alphabet-title">
                Истражете по буква
              </h2>
            </div>
          </div>

          <p>
            Изберете почетна буква
            за директен преглед на
            достапните збороформи.
          </p>
        </header>


        <div className="premium-alphabet-grid">
          <LetterNav
            onLetterClick={
              onLetterClick
            }
            disabled={
              isDbBusy
            }
          />
        </div>
      </motion.section>


      <motion.section
        className="premium-home-lower"
        variants={sectionAnimation}
      >
        <div className="premium-recent-section">
          <header className="premium-subsection-header">
            <div>
              <FiClock
                aria-hidden="true"
              />

              <span>
                Неодамна прегледани
              </span>
            </div>


            {recentWords.length > 0 && (
              <button
                type="button"
                className="premium-text-action"
                onClick={
                  handleClearRecent
                }
              >
                Исчисти
              </button>
            )}
          </header>


          {recentWords.length > 0 ? (
            <div className="premium-recent-list">
              {recentWords.map(
                (
                  recentWord,
                  index,
                ) => (
                  <Link
                    key={
                      `${recentWord.form}-${index}`
                    }
                    to={
                      buildDetailsPath(
                        recentWord.form,
                      )
                    }
                    className="premium-recent-item"
                  >
                    <span className="premium-recent-index">
                      {String(
                        index + 1,
                      ).padStart(
                        2,
                        '0',
                      )}
                    </span>

                    <span className="premium-recent-copy">
                      <strong>
                        {
                          recentWord.form
                        }
                      </strong>

                      {recentWord.lemma && (
                        <small>
                          Лема:{' '}
                          {
                            recentWord.lemma
                          }
                        </small>
                      )}
                    </span>

                    <FiArrowRight
                      aria-hidden="true"
                    />
                  </Link>
                ),
              )}
            </div>
          ) : (
            <div className="premium-recent-empty">
              <FiClock
                aria-hidden="true"
              />

              <div>
                <strong>
                  Нема неодамнешни зборови
                </strong>

                <p>
                  Зборовите што ќе ги
                  отворите ќе се појават
                  овде за побрз пристап.
                </p>
              </div>
            </div>
          )}
        </div>


        <aside className="premium-discovery">
          <span className="premium-section-kicker">
            Откривање
          </span>

          <h2>
            Не знаете што
            да пребарате?
          </h2>

          <p>
            Отворете случајна
            збороформа од базата и
            истражете ги нејзината
            лема и граматички податоци.
          </p>

          <div className="premium-random-action">
            <RandomWordButton
              onRandom={
                onRandom
              }
              disabled={
                isDbBusy
              }
            />
          </div>

          <FiShuffle
            className="premium-discovery-decoration"
            aria-hidden="true"
          />
        </aside>
      </motion.section>


      <motion.section
        className="premium-about-strip"
        variants={sectionAnimation}
        aria-labelledby="home-about-title"
      >
        <div>
          <span className="premium-section-kicker">
            За речникот
          </span>

          <h2 id="home-about-title">
            Дигитален пристап
            до македонската
            лексичка база.
          </h2>
        </div>


        <div className="premium-about-copy">
          <p>
            Апликацијата овозможува
            пребарување на македонски
            збороформи, нивните леми
            и морфолошки ознаки.
          </p>

          <Link
            to="/language"
            className="premium-inline-link"
          >
            За македонскиот јазик

            <FiArrowRight
              aria-hidden="true"
            />
          </Link>
        </div>
      </motion.section>
    </motion.main>
  )
}