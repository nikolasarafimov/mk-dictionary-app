import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  createPortal,
} from 'react-dom'

import {
  FiArrowUpRight,
  FiBookOpen,
  FiSearch,
} from 'react-icons/fi'

import {
  decodeTag,
} from '../utils/tagDecoder'


const DROPDOWN_GAP = 8
const DROPDOWN_MAX_HEIGHT = 340
const VIEWPORT_GUTTER = 12


const MATCH_LABELS = {
  'exact-form':
    'точно совпаѓање',

  'prefix-form':
    'почеток на збор',

  'exact-lemma':
    'точна лема',

  'prefix-lemma':
    'совпаѓање по лема',

  'contains-form':
    'дел од збор',

  'contains-lemma':
    'дел од лема',
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


function SuggestionMeta({
  suggestion,
}) {
  const morphology =
    getMorphologySummary(
      suggestion.tag,
    )


  const form =
    suggestion.form
      .toLocaleLowerCase(
        'mk-MK',
      )


  const lemma =
    suggestion.lemma
      .toLocaleLowerCase(
        'mk-MK',
      )


  const showLemma =
    Boolean(
      suggestion.lemma,
    )
    && lemma !== form


  if (
    !showLemma
    && !morphology
  ) {
    return null
  }


  return (
    <span className="suggestion-meta">
      {showLemma && (
        <span className="suggestion-lemma">
          <span>
            лема
          </span>

          <strong>
            {suggestion.lemma}
          </strong>
        </span>
      )}


      {showLemma
        && morphology
        && (
          <span
            className="suggestion-meta-dot"
            aria-hidden="true"
          />
        )}


      {morphology && (
        <span className="suggestion-morphology">
          {morphology}
        </span>
      )}
    </span>
  )
}


export default function SearchBar({
  term = '',
  onTermChange,
  onSearch,
  suggestions = [],
  onSuggestionSelect,
  disabled = false,
}) {
  const [
    open,
    setOpen,
  ] = useState(false)

  const [
    highlighted,
    setHighlighted,
  ] = useState(-1)

  const [
    dropdownPosition,
    setDropdownPosition,
  ] = useState(null)


  const containerRef =
    useRef(null)

  const formRef =
    useRef(null)

  const dropdownRef =
    useRef(null)


  const listboxId =
    useId()


  const inputValue =
    typeof term === 'string'
      ? term
      : String(
        term ?? '',
      )


  const normalizedSuggestions =
    useMemo(
      () => {
        if (
          !Array.isArray(
            suggestions,
          )
        ) {
          return []
        }


        const seen =
          new Set()

        const result = []


        for (
          const suggestion
          of suggestions
        ) {
          const normalized =
            normalizeSuggestion(
              suggestion,
            )


          if (!normalized) {
            continue
          }


          const key =
            normalized.form
              .toLocaleLowerCase(
                'mk-MK',
              )


          if (
            seen.has(
              key,
            )
          ) {
            continue
          }


          seen.add(
            key,
          )

          result.push(
            normalized,
          )
        }


        return result
      },
      [
        suggestions,
      ],
    )


  const hasSuggestions =
    normalizedSuggestions.length
    > 0


  useEffect(() => {
    if (
      disabled
      || !hasSuggestions
    ) {
      setOpen(false)
      setHighlighted(-1)

      return
    }


    setOpen(true)
    setHighlighted(-1)
  }, [
    disabled,
    hasSuggestions,
    normalizedSuggestions,
  ])


  useEffect(() => {
    const handlePointerDown =
      (event) => {
        const target =
          event.target


        const clickedInsideSearch =
          Boolean(
            containerRef.current
            ?.contains(
              target,
            ),
          )


        const clickedInsideDropdown =
          Boolean(
            dropdownRef.current
            ?.contains(
              target,
            ),
          )


        if (
          !clickedInsideSearch
          && !clickedInsideDropdown
        ) {
          setOpen(false)
          setHighlighted(-1)
        }
      }


    document.addEventListener(
      'pointerdown',
      handlePointerDown,
    )


    return () => {
      document.removeEventListener(
        'pointerdown',
        handlePointerDown,
      )
    }
  }, [])


  const updateDropdownPosition =
    useCallback(
      () => {
        if (
          !formRef.current
          || typeof window
            === 'undefined'
        ) {
          return
        }


        const rect =
          formRef.current
            .getBoundingClientRect()


        const viewportWidth =
          window.visualViewport
            ?.width
          || window.innerWidth

        const viewportHeight =
          window.visualViewport
            ?.height
          || window.innerHeight


        const maximumWidth =
          Math.max(
            0,
            viewportWidth
            - VIEWPORT_GUTTER * 2,
          )


        const width =
          Math.min(
            rect.width,
            maximumWidth,
          )


        const left =
          Math.max(
            VIEWPORT_GUTTER,

            Math.min(
              rect.left,
              viewportWidth
              - width
              - VIEWPORT_GUTTER,
            ),
          )


        const availableBelow =
          viewportHeight
          - rect.bottom
          - DROPDOWN_GAP
          - VIEWPORT_GUTTER


        const availableAbove =
          rect.top
          - DROPDOWN_GAP
          - VIEWPORT_GUTTER


        const openAbove =
          availableBelow < 180
          && availableAbove
            > availableBelow


        const availableSpace =
          openAbove
            ? availableAbove
            : availableBelow


        const maxHeight =
          Math.max(
            110,

            Math.min(
              DROPDOWN_MAX_HEIGHT,
              availableSpace,
            ),
          )


        if (openAbove) {
          setDropdownPosition({
            placement:
              'above',

            left,
            width,

            bottom:
              viewportHeight
              - rect.top
              + DROPDOWN_GAP,

            top:
              undefined,

            maxHeight,
          })

          return
        }


        setDropdownPosition({
          placement:
            'below',

          left,
          width,

          top:
            rect.bottom
            + DROPDOWN_GAP,

          bottom:
            undefined,

          maxHeight,
        })
      },
      [],
    )


  useLayoutEffect(() => {
    if (
      !open
      || !hasSuggestions
    ) {
      setDropdownPosition(
        null,
      )

      return undefined
    }


    updateDropdownPosition()


    const handleViewportChange =
      () => {
        updateDropdownPosition()
      }


    window.addEventListener(
      'resize',
      handleViewportChange,
    )

    window.addEventListener(
      'scroll',
      handleViewportChange,
      true,
    )


    window.visualViewport
      ?.addEventListener(
        'resize',
        handleViewportChange,
      )

    window.visualViewport
      ?.addEventListener(
        'scroll',
        handleViewportChange,
      )


    const observer =
      typeof ResizeObserver
        !== 'undefined'
        && formRef.current
        ? new ResizeObserver(
          handleViewportChange,
        )
        : null


    if (
      observer
      && formRef.current
    ) {
      observer.observe(
        formRef.current,
      )
    }


    return () => {
      window.removeEventListener(
        'resize',
        handleViewportChange,
      )

      window.removeEventListener(
        'scroll',
        handleViewportChange,
        true,
      )


      window.visualViewport
        ?.removeEventListener(
          'resize',
          handleViewportChange,
        )

      window.visualViewport
        ?.removeEventListener(
          'scroll',
          handleViewportChange,
        )


      observer?.disconnect()
    }
  }, [
    open,
    hasSuggestions,
    normalizedSuggestions,
    updateDropdownPosition,
  ])


  useEffect(() => {
    if (
      !open
      || highlighted < 0
    ) {
      return
    }


    document
      .getElementById(
        `${listboxId}-option-${highlighted}`,
      )
      ?.scrollIntoView({
        block: 'nearest',
      })
  }, [
    open,
    highlighted,
    listboxId,
  ])


  const handleInput =
    (event) => {
      onTermChange?.(
        event.target.value,
      )
    }


  const handleSelect =
    (suggestion) => {
      if (
        disabled
        || !suggestion
      ) {
        return
      }


      const value =
        typeof suggestion
          === 'string'
          ? suggestion
          : suggestion.form


      if (!value) {
        return
      }


      onSuggestionSelect?.(
        value,
        suggestion,
      )


      setOpen(false)
      setHighlighted(-1)
    }


  const handleKeyDown =
    (event) => {
      if (
        event.key === 'Escape'
        && open
      ) {
        event.preventDefault()

        setOpen(false)
        setHighlighted(-1)

        return
      }


      if (
        !open
        || !hasSuggestions
      ) {
        return
      }


      if (
        event.key
        === 'ArrowDown'
      ) {
        event.preventDefault()


        setHighlighted(
          (previousIndex) =>
            previousIndex
              < normalizedSuggestions
                .length - 1
              ? previousIndex + 1
              : 0,
        )

        return
      }


      if (
        event.key
        === 'ArrowUp'
      ) {
        event.preventDefault()


        setHighlighted(
          (previousIndex) =>
            previousIndex > 0
              ? previousIndex - 1
              : normalizedSuggestions
                  .length - 1,
        )

        return
      }


      if (
        event.key === 'Enter'
        && highlighted >= 0
        && highlighted
          < normalizedSuggestions
            .length
      ) {
        event.preventDefault()


        handleSelect(
          normalizedSuggestions[
            highlighted
          ],
        )
      }
    }


  const handleSubmit =
    (event) => {
      event.preventDefault()


      if (disabled) {
        return
      }


      onSearch?.(
        inputValue,
      )


      setOpen(false)
      setHighlighted(-1)
    }


  const handleFocus =
    () => {
      if (
        !disabled
        && hasSuggestions
      ) {
        setOpen(true)
      }
    }


  const activeDescendant =
    open
    && highlighted >= 0
      ? `${listboxId}-option-${highlighted}`
      : undefined


  const dropdownVisible =
    open
    && hasSuggestions
    && dropdownPosition
    && typeof document
      !== 'undefined'


  const dropdown =
    dropdownVisible
      ? createPortal(
        <ul
          ref={dropdownRef}
          id={listboxId}
          className={
            `suggestion-dropdown suggestion-dropdown-portal ${
              dropdownPosition
                .placement
                === 'above'
                ? 'opens-above'
                : 'opens-below'
            }`
          }
          role="listbox"
          aria-label="Предлози за пребарување"
          style={{
            left:
              dropdownPosition
                .left,

            width:
              dropdownPosition
                .width,

            maxHeight:
              dropdownPosition
                .maxHeight,

            top:
              dropdownPosition
                .top,

            bottom:
              dropdownPosition
                .bottom,
          }}
        >
          {normalizedSuggestions.map(
            (
              suggestion,
              index,
            ) => {
              const isHighlighted =
                index
                === highlighted


              const matchLabel =
                MATCH_LABELS[
                  suggestion
                    .matchType
                ] || ''


              return (
                <li
                  id={
                    `${listboxId}-option-${index}`
                  }
                  key={
                    suggestion.form
                  }
                  className={
                    `suggestion-item ${
                      isHighlighted
                        ? 'highlighted'
                        : ''
                    }`
                  }
                  role="option"
                  aria-selected={
                    isHighlighted
                  }
                  onMouseEnter={() =>
                    setHighlighted(
                      index,
                    )
                  }
                  onPointerDown={
                    (event) => {
                      event.preventDefault()

                      handleSelect(
                        suggestion,
                      )
                    }
                  }
                >
                  <span className="suggestion-leading-icon">
                    <FiBookOpen
                      aria-hidden="true"
                    />
                  </span>


                  <span className="suggestion-copy">
                    <span className="suggestion-main-line">
                      <strong className="suggestion-form">
                        {
                          suggestion.form
                        }
                      </strong>


                      {matchLabel && (
                        <small className="suggestion-match-label">
                          {matchLabel}
                        </small>
                      )}
                    </span>


                    <SuggestionMeta
                      suggestion={
                        suggestion
                      }
                    />
                  </span>


                  <span className="suggestion-open-icon">
                    <FiArrowUpRight
                      aria-hidden="true"
                    />
                  </span>
                </li>
              )
            },
          )}
        </ul>,
        document.body,
      )
      : null


  return (
    <>
      <div
        ref={containerRef}
        className="searchbar-container"
      >
        <form
          ref={formRef}
          className="search-bar"
          role="search"
          onSubmit={
            handleSubmit
          }
        >
          <input
            type="search"
            value={inputValue}
            placeholder="Пребарај збор, форма или лема..."
            aria-label="Пребарување во речникот"
            aria-autocomplete="list"
            aria-haspopup="listbox"
            aria-controls={
              open
              && hasSuggestions
                ? listboxId
                : undefined
            }
            aria-expanded={
              open
              && hasSuggestions
            }
            aria-activedescendant={
              activeDescendant
            }
            autoComplete="off"
            spellCheck={false}
            disabled={disabled}
            onChange={
              handleInput
            }
            onKeyDown={
              handleKeyDown
            }
            onFocus={
              handleFocus
            }
          />


          <button
            type="submit"
            disabled={disabled}
            aria-label="Пребарај"
            title="Пребарај"
          >
            <FiSearch
              aria-hidden="true"
            />
          </button>
        </form>
      </div>


      {dropdown}
    </>
  )
}