import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import {
  motion,
} from 'framer-motion'

import {
  FiBookOpen,
  FiChevronRight,
  FiHash,
  FiSearch,
  FiX,
} from 'react-icons/fi'

import {
  ABBREVIATION_COUNT,
  ABBREVIATION_GROUPS,
} from '../data/abbreviations'


const LOCALE = 'mk-MK'
const DEFAULT_GROUP =
  ABBREVIATION_GROUPS[0]


function normalizeSearchValue(
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


function parseGroupId(
  value,
) {
  if (
    typeof value !== 'string'
    || !/^\d+$/.test(
      value,
    )
  ) {
    return null
  }

  const parsed =
    Number.parseInt(
      value,
      10,
    )

  return Number.isInteger(
    parsed,
  )
    ? parsed
    : null
}


export default function Abbreviations() {
  const {
    group,
  } = useParams()

  const navigate =
    useNavigate()

  const [
    searchQuery,
    setSearchQuery,
  ] = useState('')


  const parsedGroup =
    parseGroupId(
      group,
    )


  const activeGroup =
    ABBREVIATION_GROUPS.find(
      (item) =>
        item.id === parsedGroup,
    )
    || DEFAULT_GROUP


  useEffect(() => {
    if (
      !group
      || !DEFAULT_GROUP
    ) {
      return
    }


    const isValidGroup =
      parsedGroup !== null
      && ABBREVIATION_GROUPS.some(
        (item) =>
          item.id === parsedGroup,
      )


    if (isValidGroup) {
      return
    }


    navigate(
      `/abbr/${DEFAULT_GROUP.id}`,
      {
        replace: true,
      },
    )
  }, [
    group,
    parsedGroup,
    navigate,
  ])


  const normalizedQuery =
    normalizeSearchValue(
      searchQuery,
    )


  const searchResults =
    useMemo(
      () => {
        if (!normalizedQuery) {
          return []
        }


        return ABBREVIATION_GROUPS.flatMap(
          (groupItem) =>
            groupItem.items
              .filter(
                (item) => {
                  const abbreviation =
                    normalizeSearchValue(
                      item.abbreviation,
                    )

                  const meaning =
                    normalizeSearchValue(
                      item.meaning,
                    )


                  return (
                    abbreviation.includes(
                      normalizedQuery,
                    )
                    || meaning.includes(
                      normalizedQuery,
                    )
                  )
                },
              )
              .map(
                (item) => ({
                  ...item,
                  groupId:
                    groupItem.id,
                  groupName:
                    groupItem.name,
                }),
              ),
        )
      },
      [
        normalizedQuery,
      ],
    )


  if (!DEFAULT_GROUP) {
    return null
  }


  const displayedItems =
    normalizedQuery
      ? searchResults
      : activeGroup.items


  const handleGroupSelect =
    (groupId) => {
      setSearchQuery('')

      navigate(
        `/abbr/${groupId}`,
      )
    }


  const handleClearSearch =
    () => {
      setSearchQuery('')
    }


  return (
    <motion.main
      className="abbr-reference"
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
      <header className="abbr-reference-hero">
        <div className="abbr-reference-overline">
          <span>
            Референтен водич
          </span>

          <span
            aria-hidden="true"
          />

          <span>
            Македонски јазик
          </span>
        </div>


        <div className="abbr-reference-title-grid">
          <div>
            <h1>
              Македонски

              <em>
                скратеници.
              </em>
            </h1>

            <p>
              Скратениците во
              македонскиот јазик се
              добиваат со скратување
              на зборови или спојување
              на почетни букви во
              сложени називи.
            </p>
          </div>


          <div className="abbr-reference-stat">
            <span>
              Референтна база
            </span>

            <strong>
              {ABBREVIATION_COUNT}
            </strong>

            <small>
              записи ·{' '}
              {
                ABBREVIATION_GROUPS
                  .length
              }{' '}
              групи
            </small>
          </div>
        </div>


        <div className="abbr-global-search">
          <div className="abbr-global-search-label">
            <FiSearch
              aria-hidden="true"
            />

            <span>
              Пребарај скратеница
            </span>

            <small>
              низ сите групи
            </small>
          </div>


          <label className="abbr-search-field">
            <FiSearch
              aria-hidden="true"
            />

            <input
              type="search"
              value={
                searchQuery
              }
              placeholder="Пример: проф., именка, метар, МАНУ..."
              aria-label="Пребарај скратеници"
              autoComplete="off"
              spellCheck={false}
              onChange={
                (event) =>
                  setSearchQuery(
                    event.target.value,
                  )
              }
              onKeyDown={
                (event) => {
                  if (
                    event.key
                    === 'Escape'
                  ) {
                    handleClearSearch()
                  }
                }
              }
            />


            {searchQuery && (
              <button
                type="button"
                aria-label="Исчисти пребарување"
                onClick={
                  handleClearSearch
                }
              >
                <FiX
                  aria-hidden="true"
                />
              </button>
            )}
          </label>
        </div>
      </header>


      <div className="abbr-reference-layout">
        <aside className="abbr-reference-sidebar">
          <div className="abbr-sidebar-sticky">
            <span className="abbr-sidebar-label">
              Групи
            </span>


            <nav
              className="abbr-group-list"
              aria-label="Групи на скратеници"
            >
              {ABBREVIATION_GROUPS.map(
                (groupItem) => {
                  const isActive =
                    !normalizedQuery
                    && groupItem.id
                      === activeGroup.id


                  return (
                    <button
                      key={
                        groupItem.id
                      }
                      type="button"
                      className={
                        `abbr-group-button ${
                          isActive
                            ? 'active'
                            : ''
                        }`
                      }
                      aria-current={
                        isActive
                          ? 'page'
                          : undefined
                      }
                      onClick={() =>
                        handleGroupSelect(
                          groupItem.id,
                        )
                      }
                    >
                      <span className="abbr-group-number">
                        {
                          groupItem
                            .shortName
                        }
                      </span>

                      <span className="abbr-group-copy">
                        <strong>
                          {
                            groupItem
                              .name
                          }
                        </strong>

                        <small>
                          {
                            groupItem
                              .items
                              .length
                          }{' '}
                          записи
                        </small>
                      </span>

                      <FiChevronRight
                        aria-hidden="true"
                      />
                    </button>
                  )
                },
              )}
            </nav>
          </div>
        </aside>


        <section className="abbr-reference-content">
          <header className="abbr-content-header">
            <div>
              <span className="abbr-content-index">
                {normalizedQuery
                  ? '⌕'
                  : activeGroup
                    .shortName}
              </span>

              <div>
                <small>
                  {normalizedQuery
                    ? 'Резултати од пребарување'
                    : 'Категорија'}
                </small>

                <h2>
                  {normalizedQuery
                    ? `„${searchQuery.trim()}“`
                    : activeGroup.name}
                </h2>
              </div>
            </div>


            <span className="abbr-content-count">
              {
                displayedItems
                  .length
              }{' '}
              {displayedItems.length
                === 1
                ? 'запис'
                : 'записи'}
            </span>
          </header>


          {!normalizedQuery && (
            <p className="abbr-description">
              {
                activeGroup
                  .description
              }
            </p>
          )}


          {normalizedQuery && (
            <div className="abbr-search-summary">
              <FiSearch
                aria-hidden="true"
              />

              <p>
                Пребарувањето ги
                проверува и
                скратениците и нивните
                значења во сите групи.
              </p>
            </div>
          )}


          {displayedItems.length > 0 ? (
            <div className="abbr-entry-list">
              {displayedItems.map(
                (
                  item,
                  index,
                ) => {
                  const itemGroupId =
                    normalizedQuery
                      ? item.groupId
                      : activeGroup.id


                  return (
                    <article
                      key={
                        `${itemGroupId}-${item.abbreviation}-${item.meaning || ''}-${index}`
                      }
                      className="abbr-entry"
                    >
                      <span className="abbr-entry-index">
                        {String(
                          index + 1,
                        ).padStart(
                          2,
                          '0',
                        )}
                      </span>


                      <div className="abbr-entry-term">
                        <strong>
                          {
                            item.abbreviation
                          }
                        </strong>


                        {normalizedQuery && (
                          <button
                            type="button"
                            onClick={() =>
                              handleGroupSelect(
                                item.groupId,
                              )
                            }
                          >
                            {
                              item.groupName
                            }
                          </button>
                        )}
                      </div>


                      <div className="abbr-entry-meaning">
                        {item.meaning ? (
                          <p>
                            {
                              item.meaning
                            }
                          </p>
                        ) : (
                          <p className="abbr-entry-muted">
                            Сложени
                            меѓународни
                            скратеници
                          </p>
                        )}
                      </div>
                    </article>
                  )
                },
              )}
            </div>
          ) : (
            <div className="abbr-empty">
              <span
                aria-hidden="true"
              >
                0
              </span>

              <div>
                <strong>
                  Нема пронајдени
                  скратеници
                </strong>

                <p>
                  Променете го
                  пребарувањето или
                  изберете една од
                  достапните групи.
                </p>

                <button
                  type="button"
                  onClick={
                    handleClearSearch
                  }
                >
                  Исчисти пребарување
                </button>
              </div>
            </div>
          )}


          <footer className="abbr-reference-footer">
            <FiBookOpen
              aria-hidden="true"
            />

            <div>
              <span>
                Референтна секција
              </span>

              <strong>
                Скратеници на
                македонскиот јазик
              </strong>
            </div>

            <FiHash
              aria-hidden="true"
            />
          </footer>
        </section>
      </div>
    </motion.main>
  )
}