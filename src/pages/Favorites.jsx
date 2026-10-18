import {
  useCallback,
  useEffect,
  useMemo,
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
  FiHeart,
  FiSearch,
  FiTrash2,
  FiX,
} from 'react-icons/fi'

import {
  FAVORITES_CHANGED_EVENT,
  clearFavorites,
  getFavorites,
  removeFavorite,
} from '../utils/favoriteManager'

import {
  clearRecentWords,
  getRecentWords,
} from '../utils/recentManager'

import {
  buildDetailsPath,
} from '../utils/routes'


const TABS = {
  FAVORITES: 'favorites',
  RECENT: 'recent',
}

const LOCALE = 'mk-MK'


function normalizeWord(
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
      tag: '',
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

    tag:
      String(
        value.tag ?? '',
      ).trim(),
  }
}


function normalizeWords(
  values,
) {
  if (
    !Array.isArray(
      values,
    )
  ) {
    return []
  }


  return values
    .map(
      normalizeWord,
    )
    .filter(Boolean)
}


export default function Favorites() {
  const [
    activeTab,
    setActiveTab,
  ] = useState(
    TABS.FAVORITES,
  )

  const [
    favorites,
    setFavorites,
  ] = useState([])

  const [
    recentWords,
    setRecentWords,
  ] = useState([])

  const [
    filter,
    setFilter,
  ] = useState('')


  const refreshFavorites =
    useCallback(
      () => {
        setFavorites(
          normalizeWords(
            getFavorites(),
          ),
        )
      },
      [],
    )


  const refreshRecent =
    useCallback(
      () => {
        setRecentWords(
          normalizeWords(
            getRecentWords(),
          ),
        )
      },
      [],
    )


  useEffect(() => {
    refreshFavorites()
    refreshRecent()


    const handleStorage =
      () => {
        refreshFavorites()
        refreshRecent()
      }


    window.addEventListener(
      FAVORITES_CHANGED_EVENT,
      refreshFavorites,
    )

    window.addEventListener(
      'storage',
      handleStorage,
    )


    return () => {
      window.removeEventListener(
        FAVORITES_CHANGED_EVENT,
        refreshFavorites,
      )

      window.removeEventListener(
        'storage',
        handleStorage,
      )
    }
  }, [
    refreshFavorites,
    refreshRecent,
  ])


  useEffect(() => {
    setFilter('')
  }, [
    activeTab,
  ])


  const isFavorites =
    activeTab
    === TABS.FAVORITES


  const sourceItems =
    isFavorites
      ? favorites
      : recentWords


  const filteredItems =
    useMemo(
      () => {
        const query =
          filter
            .trim()
            .toLocaleLowerCase(
              LOCALE,
            )


        if (!query) {
          return sourceItems
        }


        return sourceItems.filter(
          (word) => {
            const form =
              word.form
                .toLocaleLowerCase(
                  LOCALE,
                )

            const lemma =
              word.lemma
                .toLocaleLowerCase(
                  LOCALE,
                )

            const tag =
              word.tag
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
              || tag.includes(
                query,
              )
            )
          },
        )
      },
      [
        sourceItems,
        filter,
      ],
    )


  const handleRemoveFavorite =
    (form) => {
      if (!form) {
        return
      }


      removeFavorite(
        form,
      )

      refreshFavorites()
    }


  const handleClear =
    () => {
      setFilter('')


      if (isFavorites) {
        clearFavorites()
        refreshFavorites()

        return
      }


      clearRecentWords()
      refreshRecent()
    }


  const handleTabChange =
    (tab) => {
      setActiveTab(
        tab,
      )
    }


  return (
    <motion.main
      className="library-page"
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
      <header className="library-hero">
        <span className="library-eyebrow">
          Лична библиотека
        </span>


        <div className="library-title-row">
          <div>
            <h1>
              Зачувани

              <em>
                зборови.
              </em>
            </h1>

            <p>
              Брз пристап до омилените
              и неодамна прегледаните
              речнички единици.
            </p>
          </div>


          <div className="library-total">
            <span>
              Вкупно зачувани
            </span>

            <strong>
              {favorites.length}
            </strong>

            <small>
              омилени зборови
            </small>
          </div>
        </div>
      </header>


      <section className="library-controls">
        <div
          className="library-tabs"
          role="tablist"
          aria-label="Лична библиотека"
        >
          <button
            id="library-tab-favorites"
            type="button"
            role="tab"
            aria-selected={
              isFavorites
            }
            aria-controls="library-panel"
            tabIndex={
              isFavorites
                ? 0
                : -1
            }
            className={
              `library-tab ${
                isFavorites
                  ? 'active'
                  : ''
              }`
            }
            onClick={() =>
              handleTabChange(
                TABS.FAVORITES,
              )
            }
          >
            <FiHeart
              aria-hidden="true"
            />

            <span>
              Омилени
            </span>

            <strong>
              {favorites.length}
            </strong>
          </button>


          <button
            id="library-tab-recent"
            type="button"
            role="tab"
            aria-selected={
              !isFavorites
            }
            aria-controls="library-panel"
            tabIndex={
              !isFavorites
                ? 0
                : -1
            }
            className={
              `library-tab ${
                !isFavorites
                  ? 'active'
                  : ''
              }`
            }
            onClick={() =>
              handleTabChange(
                TABS.RECENT,
              )
            }
          >
            <FiClock
              aria-hidden="true"
            />

            <span>
              Неодамнешни
            </span>

            <strong>
              {recentWords.length}
            </strong>
          </button>
        </div>


        <div className="library-toolbar">
          <label className="library-filter">
            <FiSearch
              aria-hidden="true"
            />

            <input
              type="search"
              value={filter}
              placeholder={
                isFavorites
                  ? 'Пребарај во омилените…'
                  : 'Пребарај во неодамнешните…'
              }
              aria-label={
                isFavorites
                  ? 'Пребарај во омилените зборови'
                  : 'Пребарај во неодамнешните зборови'
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
                    setFilter('')
                  }
                }
              }
            />


            {filter && (
              <button
                type="button"
                aria-label="Исчисти пребарување"
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


          {sourceItems.length > 0 && (
            <button
              type="button"
              className="library-clear-button"
              onClick={
                handleClear
              }
            >
              <FiTrash2
                aria-hidden="true"
              />

              <span>
                Исчисти
              </span>
            </button>
          )}
        </div>
      </section>


      <section
        id="library-panel"
        className="library-content"
        role="tabpanel"
        aria-labelledby={
          isFavorites
            ? 'library-tab-favorites'
            : 'library-tab-recent'
        }
      >
        <header className="library-list-header">
          <div>
            <span>
              {isFavorites
                ? 'Зачувани единици'
                : 'Историја'}
            </span>

            <strong>
              {filter
                ? `${filteredItems.length} од ${sourceItems.length}`
                : `${sourceItems.length} ${
                    sourceItems.length === 1
                      ? 'збор'
                      : 'зборови'
                  }`}
            </strong>
          </div>

          <span>
            {isFavorites
              ? 'Омилени'
              : 'Последно прегледани'}
          </span>
        </header>


        {filteredItems.length > 0 ? (
          <div className="library-word-list">
            {filteredItems.map(
              (
                word,
                index,
              ) => (
                <article
                  key={
                    `${word.form}-${word.lemma}-${word.tag}-${index}`
                  }
                  className="library-word-row"
                >
                  <Link
                    to={
                      buildDetailsPath(
                        word.form,
                      )
                    }
                    className="library-word-main"
                    aria-label={
                      `Отвори го зборот „${word.form}“`
                    }
                  >
                    <span className="library-word-index">
                      {String(
                        index + 1,
                      ).padStart(
                        2,
                        '0',
                      )}
                    </span>

                    <span className="library-word-copy">
                      <strong>
                        {word.form}
                      </strong>

                      <span>
                        {word.lemma ? (
                          <>
                            <small>
                              Лема
                            </small>

                            {
                              word.lemma
                            }
                          </>
                        ) : (
                          'Речничка единица'
                        )}
                      </span>
                    </span>

                    {word.tag && (
                      <code className="library-word-tag">
                        {word.tag}
                      </code>
                    )}

                    <span
                      className="library-open-word"
                      aria-hidden="true"
                    >
                      <FiArrowRight />
                    </span>
                  </Link>


                  {isFavorites && (
                    <button
                      type="button"
                      className="library-remove-word"
                      aria-label={
                        `Отстрани го „${word.form}“ од омилени`
                      }
                      title="Отстрани од омилени"
                      onClick={() =>
                        handleRemoveFavorite(
                          word.form,
                        )
                      }
                    >
                      <FiTrash2
                        aria-hidden="true"
                      />
                    </button>
                  )}
                </article>
              ),
            )}
          </div>
        ) : (
          <div className="library-empty">
            <span
              className="library-empty-symbol"
              aria-hidden="true"
            >
              {filter
                ? '0'
                : isFavorites
                  ? '♡'
                  : '↶'}
            </span>

            <div>
              <span className="library-eyebrow">
                {filter
                  ? 'Нема совпаѓање'
                  : isFavorites
                    ? 'Омилени'
                    : 'Историја'}
              </span>

              <h2>
                {filter
                  ? 'Нема зборови за овој поим.'
                  : isFavorites
                    ? 'Сè уште немате зачувани зборови.'
                    : 'Сè уште нема неодамна прегледани зборови.'}
              </h2>

              <p>
                {filter
                  ? 'Променете го филтерот или исчистете го пребарувањето.'
                  : isFavorites
                    ? 'Отворете речничка единица и изберете „Додај во омилени“ за да ја зачувате тука.'
                    : 'Отворените речнички единици автоматски ќе се појавуваат во оваа листа.'}
              </p>


              {filter ? (
                <button
                  type="button"
                  className="library-primary-link"
                  onClick={() =>
                    setFilter('')
                  }
                >
                  <FiSearch
                    aria-hidden="true"
                  />

                  Исчисти пребарување
                </button>
              ) : (
                <Link
                  to="/home"
                  className="library-primary-link"
                >
                  <FiBookOpen
                    aria-hidden="true"
                  />

                  Истражи го речникот

                  <FiArrowRight
                    aria-hidden="true"
                  />
                </Link>
              )}
            </div>
          </div>
        )}
      </section>
    </motion.main>
  )
}