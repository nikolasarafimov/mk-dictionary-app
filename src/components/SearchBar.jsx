import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'

export default function SearchBar({
  term,
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

  const containerRef =
    useRef(null)

  const listboxId =
    useId()

  const normalizedSuggestions =
    useMemo(
      () => {
        if (!Array.isArray(suggestions)) {
          return []
        }

        return [
          ...new Set(
            suggestions.filter(
              (suggestion) =>
                typeof suggestion === 'string'
                && suggestion.trim(),
            ),
          ),
        ]
      },
      [
        suggestions,
      ],
    )

  useEffect(() => {
    setOpen(
      normalizedSuggestions.length > 0,
    )

    setHighlighted(-1)
  }, [normalizedSuggestions])

  useEffect(() => {
    const handleClickOutside =
      (event) => {
        if (
          containerRef.current
          && !containerRef.current.contains(
            event.target,
          )
        ) {
          setOpen(false)
          setHighlighted(-1)
        }
      }

    document.addEventListener(
      'mousedown',
      handleClickOutside,
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside,
      )
    }
  }, [])

  const handleInput = (event) => {
    onTermChange(
      event.target.value,
    )
  }

  const handleSelect = (value) => {
    onSuggestionSelect(value)

    setOpen(false)
    setHighlighted(-1)
  }

  const handleKeyDown = (event) => {
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
      || normalizedSuggestions.length === 0
    ) {
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()

      setHighlighted(
        (previousIndex) =>
          previousIndex
          < normalizedSuggestions.length - 1
            ? previousIndex + 1
            : 0,
      )

      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()

      setHighlighted(
        (previousIndex) =>
          previousIndex > 0
            ? previousIndex - 1
            : normalizedSuggestions.length - 1,
      )

      return
    }

    if (
      event.key === 'Enter'
      && highlighted >= 0
      && highlighted
        < normalizedSuggestions.length
    ) {
      event.preventDefault()

      handleSelect(
        normalizedSuggestions[
          highlighted
        ],
      )
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (disabled) {
      return
    }

    onSearch(term)

    setOpen(false)
    setHighlighted(-1)
  }

  const activeDescendant =
    highlighted >= 0
      ? `${listboxId}-option-${highlighted}`
      : undefined

  return (
    <div
      className="searchbar-container"
      ref={containerRef}
    >
      <form
        className="search-bar"
        role="search"
        onSubmit={handleSubmit}
      >
        <input
          type="search"
          value={term}
          placeholder="Пребарувајте збор..."
          aria-label="Пребарување во речникот"
          aria-autocomplete="list"
          aria-controls={
            open
              ? listboxId
              : undefined
          }
          aria-expanded={open}
          aria-activedescendant={
            activeDescendant
          }
          autoComplete="off"
          disabled={disabled}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (
              normalizedSuggestions.length > 0
            ) {
              setOpen(true)
            }
          }}
        />

        <button
          type="submit"
          disabled={disabled}
          aria-label="Пребарај"
          title="Пребарај"
        >
          <span aria-hidden="true">
            🔍
          </span>
        </button>
      </form>

      {open
        && normalizedSuggestions.length > 0
        && (
          <ul
            id={listboxId}
            className="suggestion-dropdown"
            role="listbox"
            aria-label="Предлози за пребарување"
          >
            {normalizedSuggestions.map(
              (suggestion, index) => {
                const isHighlighted =
                  index === highlighted

                return (
                  <li
                    id={
                      `${listboxId}-option-${index}`
                    }
                    key={suggestion}
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
                      setHighlighted(index)
                    }
                    onMouseDown={
                      (event) => {
                        event.preventDefault()

                        handleSelect(
                          suggestion,
                        )
                      }
                    }
                  >
                    {suggestion}
                  </li>
                )
              },
            )}
          </ul>
        )}
    </div>
  )
}