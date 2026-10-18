import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  createPortal,
} from 'react-dom'

import {
  useNavigate,
} from 'react-router-dom'

import {
  AnimatePresence,
  motion,
} from 'framer-motion'

import {
  FiArrowUpRight,
  FiBookOpen,
  FiClock,
  FiCommand,
  FiCornerDownLeft,
  FiGrid,
  FiHeart,
  FiHome,
  FiSearch,
  FiTrash2,
  FiX,
} from 'react-icons/fi'

import useSearchSuggestions
  from '../hooks/useSearchSuggestions'

import {
  decodeTag,
} from '../utils/tagDecoder'

import {
  getRecentWords,
} from '../utils/recentManager'

import {
  addRecentSearch,
  clearRecentSearches,
  getRecentSearches,
  SEARCH_HISTORY_CHANGED_EVENT,
} from '../utils/searchHistoryManager'

import {
  buildDetailsPath,
  buildSearchPath,
} from '../utils/routes'


const MAX_RECENT_WORDS = 4
const MAX_RECENT_SEARCHES = 5


const MATCH_LABELS = {
  'exact-form': 'точно',
  'prefix-form': 'почеток на збор',
  'exact-lemma': 'точна лема',
  'prefix-lemma': 'по лема',
  'contains-form': 'дел од збор',
  'contains-lemma': 'дел од лема',
}


const QUICK_LINKS = [
  {
    type: 'navigation',
    label: 'Почетна',
    description:
      'Пребарување и азбучен индекс',
    path: '/home',
    icon: FiHome,
  },
  {
    type: 'navigation',
    label: 'За јазикот',
    description:
      'Јазик, писмо, граматика и историја',
    path: '/language',
    icon: FiBookOpen,
  },
  {
    type: 'navigation',
    label: 'Скратеници',
    description:
      'Референтен водич низ скратениците',
    path: '/abbr',
    icon: FiGrid,
  },
  {
    type: 'navigation',
    label: 'Омилени',
    description:
      'Зачувани и неодамнешни зборови',
    path: '/favorites',
    icon: FiHeart,
  },
]


function getShortcutLabel() {
  if (
    typeof navigator === 'undefined'
  ) {
    return 'Ctrl K'
  }


  const platform =
    navigator.userAgentData
      ?.platform
    || navigator.platform
    || ''


  return /Mac|iPhone|iPad/i.test(
    platform,
  )
    ? '⌘ K'
    : 'Ctrl K'
}


function getMorphologySummary(
  tag,
) {
  if (!tag) {
    return ''
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
      return ''
    }


    return decoded
      .split(',')
      .map(
        (part) =>
          part.trim(),
      )
      .filter(Boolean)
      .slice(
        0,
        2,
      )
      .join(', ')
  } catch {
    return ''
  }
}


function normalizeSuggestion(
  suggestion,
) {
  if (
    typeof suggestion === 'string'
  ) {
    const form =
      suggestion.trim()


    if (!form) {
      return null
    }


    return {
      form,
      lemma: '',
      tag: '',
      matchType: '',
    }
  }


  if (
    !suggestion
    || typeof suggestion
      !== 'object'
  ) {
    return null
  }


  const form =
    String(
      suggestion.form || '',
    ).trim()


  if (!form) {
    return null
  }


  return {
    form,

    lemma:
      String(
        suggestion.lemma || '',
      ).trim(),

    tag:
      String(
        suggestion.tag || '',
      ).trim(),

    matchType:
      String(
        suggestion.matchType || '',
      ).trim(),
  }
}


function buildWordDescription(
  suggestion,
) {
  const parts = []

  const lemma =
    String(
      suggestion.lemma || '',
    ).trim()

  const form =
    String(
      suggestion.form || '',
    ).trim()

  const morphology =
    getMorphologySummary(
      suggestion.tag,
    )


  if (
    lemma
    && lemma.toLocaleLowerCase(
      'mk-MK',
    )
      !== form.toLocaleLowerCase(
        'mk-MK',
      )
  ) {
    parts.push(
      `лема: ${lemma}`,
    )
  }


  if (morphology) {
    parts.push(
      morphology,
    )
  }


  return (
    parts.join(' · ')
    || 'Речничка единица'
  )
}


export default function CommandPalette({
  open,
  onOpen,
  onClose,
}) {
  const navigate =
    useNavigate()

  const paletteRef =
    useRef(null)

  const inputRef =
    useRef(null)

  const previousFocusRef =
    useRef(null)


  const [
    query,
    setQuery,
  ] = useState('')

  const [
    highlightedIndex,
    setHighlightedIndex,
  ] = useState(0)

  const [
    recentSearches,
    setRecentSearches,
  ] = useState([])

  const [
    recentWords,
    setRecentWords,
  ] = useState([])


  const normalizedQuery =
    query.trim()


  const {
    suggestions,
    setSuggestions,
    isLoading:
      suggestionsLoading,
  } = useSearchSuggestions(
    query,
    {
      delay: 120,

      disabled:
        !open
        || !normalizedQuery,

      limit: 8,
    },
  )


  const shortcutLabel =
    useMemo(
      getShortcutLabel,
      [],
    )


  const refreshHistory =
    useCallback(
      () => {
        setRecentSearches(
          getRecentSearches(),
        )

        setRecentWords(
          getRecentWords(),
        )
      },
      [],
    )


  const closePalette =
    useCallback(
      () => {
        setQuery('')
        setSuggestions([])
        setHighlightedIndex(0)

        onClose?.()
      },
      [
        onClose,
        setSuggestions,
      ],
    )


  const clearSearch =
    useCallback(
      () => {
        setQuery('')
        setSuggestions([])
        setHighlightedIndex(0)

        window.requestAnimationFrame(
          () => {
            inputRef.current
              ?.focus()
          },
        )
      },
      [
        setSuggestions,
      ],
    )


  useEffect(() => {
    const handleShortcut =
      (event) => {
        const key =
          String(
            event.key || '',
          ).toLocaleLowerCase()


        if (
          (
            event.ctrlKey
            || event.metaKey
          )
          && key === 'k'
        ) {
          event.preventDefault()

          if (open) {
            closePalette()
          } else {
            onOpen?.()
          }

          return
        }


        if (
          open
          && event.key === 'Escape'
        ) {
          event.preventDefault()

          closePalette()
        }
      }


    window.addEventListener(
      'keydown',
      handleShortcut,
    )


    return () => {
      window.removeEventListener(
        'keydown',
        handleShortcut,
      )
    }
  }, [
    open,
    onOpen,
    closePalette,
  ])


  useEffect(() => {
    if (!open) {
      return undefined
    }


    previousFocusRef.current =
      document.activeElement


    refreshHistory()

    setQuery('')
    setSuggestions([])
    setHighlightedIndex(0)


    const previousOverflow =
      document.body.style
        .overflow


    document.body.style
      .overflow = 'hidden'


    const focusFrame =
      window.requestAnimationFrame(
        () => {
          inputRef.current
            ?.focus()
        },
      )


    return () => {
      window.cancelAnimationFrame(
        focusFrame,
      )

      document.body.style
        .overflow =
          previousOverflow


      const previousFocus =
        previousFocusRef.current


      if (
        previousFocus
        && document.contains(
          previousFocus,
        )
      ) {
        previousFocus.focus?.()
      }
    }
  }, [
    open,
    refreshHistory,
    setSuggestions,
  ])


  useEffect(() => {
    const handleHistoryChange =
      () => {
        refreshHistory()
      }


    window.addEventListener(
      SEARCH_HISTORY_CHANGED_EVENT,
      handleHistoryChange,
    )

    window.addEventListener(
      'storage',
      handleHistoryChange,
    )


    return () => {
      window.removeEventListener(
        SEARCH_HISTORY_CHANGED_EVENT,
        handleHistoryChange,
      )

      window.removeEventListener(
        'storage',
        handleHistoryChange,
      )
    }
  }, [
    refreshHistory,
  ])


  const normalizedSuggestions =
    useMemo(
      () =>
        suggestions
          .map(
            normalizeSuggestion,
          )
          .filter(Boolean),
      [
        suggestions,
      ],
    )


  const sections =
    useMemo(
      () => {
        if (normalizedQuery) {
          const suggestionItems =
            normalizedSuggestions.map(
              (suggestion) => ({
                type: 'word',

                label:
                  suggestion.form,

                description:
                  buildWordDescription(
                    suggestion,
                  ),

                value:
                  suggestion.form,

                lemma:
                  suggestion.lemma,

                tag:
                  suggestion.tag,

                matchType:
                  suggestion.matchType,

                icon:
                  FiBookOpen,
              }),
            )


          return [
            {
              key: 'suggestions',

              label:
                'Предлози од речникот',

              items:
                suggestionItems,
            },

            {
              key: 'full-search',

              label:
                'Целосно пребарување',

              items: [
                {
                  type: 'search',

                  label:
                    `Пребарај „${normalizedQuery}“`,

                  description:
                    'Прикажи ги сите совпаѓања по збороформа и лема',

                  value:
                    normalizedQuery,

                  icon:
                    FiSearch,
                },
              ],
            },
          ].filter(
            (section) =>
              section.items.length
              > 0,
          )
        }


        const searchItems =
          recentSearches
            .filter(
              (value) =>
                typeof value
                  === 'string'
                && value.trim(),
            )
            .slice(
              0,
              MAX_RECENT_SEARCHES,
            )
            .map(
              (value) => ({
                type:
                  'recent-search',

                label:
                  value,

                description:
                  'Повтори пребарување',

                value,

                icon:
                  FiClock,
              }),
            )


        const wordItems =
          recentWords
            .filter(
              (word) =>
                word
                && typeof word.form
                  === 'string'
                && word.form.trim(),
            )
            .slice(
              0,
              MAX_RECENT_WORDS,
            )
            .map(
              (word) => ({
                type:
                  'recent-word',

                label:
                  word.form,

                description:
                  word.lemma
                    ? `лема: ${word.lemma}`
                    : 'Неодамна прегледан збор',

                value:
                  word.form,

                icon:
                  FiBookOpen,
              }),
            )


        return [
          {
            key:
              'recent-searches',

            label:
              'Неодамнешни пребарувања',

            items:
              searchItems,
          },

          {
            key:
              'recent-words',

            label:
              'Неодамна прегледани',

            items:
              wordItems,
          },

          {
            key:
              'navigation',

            label:
              'Брз пристап',

            items:
              QUICK_LINKS,
          },
        ].filter(
          (section) =>
            section.items.length
            > 0,
        )
      },
      [
        normalizedQuery,
        normalizedSuggestions,
        recentSearches,
        recentWords,
      ],
    )


  const indexedSections =
    useMemo(
      () => {
        let index = 0


        return sections.map(
          (section) => ({
            ...section,

            items:
              section.items.map(
                (item) => ({
                  ...item,

                  paletteIndex:
                    index++,
                }),
              ),
          }),
        )
      },
      [
        sections,
      ],
    )


  const flatItems =
    useMemo(
      () =>
        indexedSections.flatMap(
          (section) =>
            section.items,
        ),
      [
        indexedSections,
      ],
    )


  useEffect(() => {
    if (
      flatItems.length === 0
    ) {
      setHighlightedIndex(-1)

      return
    }


    setHighlightedIndex(0)
  }, [
    normalizedQuery,
    normalizedSuggestions,
    flatItems.length,
    open,
  ])


  useEffect(() => {
    if (
      !open
      || highlightedIndex < 0
    ) {
      return
    }


    document
      .getElementById(
        `command-item-${highlightedIndex}`,
      )
      ?.scrollIntoView({
        block: 'nearest',
      })
  }, [
    highlightedIndex,
    open,
  ])


  const navigateTo =
    (path) => {
      closePalette()

      navigate(
        path,
      )
    }


  const executeItem =
    (item) => {
      if (!item) {
        return
      }


      switch (item.type) {
        case 'word':
        case 'recent-word':
          addRecentSearch(
            item.value,
          )

          navigateTo(
            buildDetailsPath(
              item.value,
            ),
          )

          break

        case 'search':
        case 'recent-search':
          addRecentSearch(
            item.value,
          )

          navigateTo(
            buildSearchPath(
              item.value,
            ),
          )

          break

        case 'navigation':
          navigateTo(
            item.path,
          )

          break

        default:
          break
      }
    }


  const submitQuery =
    () => {
      if (!normalizedQuery) {
        return
      }


      addRecentSearch(
        normalizedQuery,
      )


      navigateTo(
        buildSearchPath(
          normalizedQuery,
        ),
      )
    }


  const handleInputKeyDown =
    (event) => {
      if (
        event.key === 'ArrowDown'
      ) {
        event.preventDefault()


        if (
          flatItems.length === 0
        ) {
          return
        }


        setHighlightedIndex(
          (current) =>
            current
              >= flatItems.length - 1
              ? 0
              : current + 1,
        )

        return
      }


      if (
        event.key === 'ArrowUp'
      ) {
        event.preventDefault()


        if (
          flatItems.length === 0
        ) {
          return
        }


        setHighlightedIndex(
          (current) =>
            current <= 0
              ? flatItems.length - 1
              : current - 1,
        )

        return
      }


      if (
        event.key === 'Enter'
      ) {
        event.preventDefault()


        const activeItem =
          flatItems[
            highlightedIndex
          ]


        if (activeItem) {
          executeItem(
            activeItem,
          )

          return
        }


        submitQuery()
      }
    }


  const handleDialogKeyDown =
    (event) => {
      if (
        event.key !== 'Tab'
      ) {
        return
      }


      const palette =
        paletteRef.current


      if (!palette) {
        return
      }


      const focusable =
        Array.from(
          palette.querySelectorAll(
            [
              'input:not([disabled])',
              'button:not([disabled])',
              'a[href]',
              '[tabindex]:not([tabindex="-1"])',
            ].join(','),
          ),
        ).filter(
          (element) =>
            element.offsetParent
            !== null,
        )


      if (
        focusable.length === 0
      ) {
        event.preventDefault()

        return
      }


      const first =
        focusable[0]

      const last =
        focusable[
          focusable.length - 1
        ]


      if (
        event.shiftKey
        && document.activeElement
          === first
      ) {
        event.preventDefault()

        last.focus()

        return
      }


      if (
        !event.shiftKey
        && document.activeElement
          === last
      ) {
        event.preventDefault()

        first.focus()
      }
    }


  const handleClearHistory =
    () => {
      clearRecentSearches()

      setRecentSearches([])
    }


  if (
    typeof document
      === 'undefined'
  ) {
    return null
  }


  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="command-palette-layer"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            duration: 0.16,
          }}
          onPointerDown={
            (event) => {
              if (
                event.target
                === event.currentTarget
              ) {
                closePalette()
              }
            }
          }
        >
          <motion.section
            ref={paletteRef}
            className="command-palette"
            role="dialog"
            aria-modal="true"
            aria-labelledby="command-palette-title"
            onKeyDown={
              handleDialogKeyDown
            }
            initial={{
              opacity: 0,
              y: -18,
              scale: 0.985,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -12,
              scale: 0.99,
            }}
            transition={{
              duration: 0.2,

              ease: [
                0.2,
                0,
                0,
                1,
              ],
            }}
          >
            <header className="command-palette-search">
              <FiSearch
                aria-hidden="true"
              />

              <input
                ref={inputRef}
                type="search"
                value={query}
                placeholder="Пребарај збор, форма или лема..."
                aria-label="Пребарај во речникот"
                autoComplete="off"
                spellCheck="false"
                onChange={
                  (event) =>
                    setQuery(
                      event.target.value,
                    )
                }
                onKeyDown={
                  handleInputKeyDown
                }
              />

              {query ? (
                <button
                  type="button"
                  className="command-palette-clear"
                  aria-label="Исчисти пребарување"
                  onClick={
                    clearSearch
                  }
                >
                  <FiX
                    aria-hidden="true"
                  />
                </button>
              ) : (
                <kbd className="command-palette-shortcut">
                  {shortcutLabel}
                </kbd>
              )}
            </header>


            <div
              id="command-palette-results"
              className="command-palette-results"
              aria-live="polite"
            >
              {!normalizedQuery && (
                <div className="command-palette-intro">
                  <FiCommand
                    aria-hidden="true"
                  />

                  <p
                    id="command-palette-title"
                  >
                    Брзо пребарување и
                    навигација низ целиот
                    Македонски речник.
                  </p>
                </div>
              )}


              {normalizedQuery && (
                <span
                  id="command-palette-title"
                  className="sr-only"
                >
                  Пребарување во
                  Македонскиот речник
                </span>
              )}


              {normalizedQuery
                && suggestionsLoading
                && normalizedSuggestions
                  .length === 0
                && (
                  <div
                    className="command-palette-loading"
                    role="status"
                  >
                    <span
                      aria-hidden="true"
                    />

                    <p>
                      Се пребарува речникот…
                    </p>
                  </div>
                )}


              {indexedSections.map(
                (section) => (
                  <section
                    key={
                      section.key
                    }
                    className="command-section"
                  >
                    <header className="command-section-header">
                      <span>
                        {section.label}
                      </span>


                      {section.key
                        === 'recent-searches'
                        && (
                          <button
                            type="button"
                            onClick={
                              handleClearHistory
                            }
                          >
                            <FiTrash2
                              aria-hidden="true"
                            />

                            Исчисти
                          </button>
                        )}
                    </header>


                    <div className="command-section-items">
                      {section.items.map(
                        (item) => {
                          const Icon =
                            item.icon

                          const isActive =
                            item.paletteIndex
                            === highlightedIndex

                          const matchLabel =
                            MATCH_LABELS[
                              item.matchType
                            ] || ''


                          return (
                            <button
                              key={
                                `${section.key}-${item.paletteIndex}-${item.label}`
                              }
                              id={
                                `command-item-${item.paletteIndex}`
                              }
                              type="button"
                              className={
                                `command-item ${
                                  isActive
                                    ? 'active'
                                    : ''
                                }`
                              }
                              onMouseEnter={() =>
                                setHighlightedIndex(
                                  item.paletteIndex,
                                )
                              }
                              onFocus={() =>
                                setHighlightedIndex(
                                  item.paletteIndex,
                                )
                              }
                              onClick={() =>
                                executeItem(
                                  item,
                                )
                              }
                            >
                              <span className="command-item-icon">
                                <Icon
                                  aria-hidden="true"
                                />
                              </span>


                              <span className="command-item-copy">
                                <span className="command-item-title-line">
                                  <strong>
                                    {
                                      item.label
                                    }
                                  </strong>

                                  {matchLabel && (
                                    <small className="command-item-match">
                                      {
                                        matchLabel
                                      }
                                    </small>
                                  )}
                                </span>

                                <small className="command-item-description">
                                  {
                                    item.description
                                  }
                                </small>
                              </span>


                              <span className="command-item-action">
                                {isActive ? (
                                  <FiCornerDownLeft
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <FiArrowUpRight
                                    aria-hidden="true"
                                  />
                                )}
                              </span>
                            </button>
                          )
                        },
                      )}
                    </div>
                  </section>
                ),
              )}
            </div>


            <footer className="command-palette-footer">
              <div>
                <span>
                  <kbd>↑</kbd>
                  <kbd>↓</kbd>

                  избор
                </span>

                <span>
                  <kbd>Enter</kbd>

                  отвори
                </span>

                <span>
                  <kbd>Esc</kbd>

                  затвори
                </span>
              </div>

              <span>
                Македонски речник
              </span>
            </footer>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}