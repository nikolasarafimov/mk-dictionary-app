import {
  memo,
  useCallback,
} from 'react'

import {
  FixedSizeList as List,
} from 'react-window'

const ROW_HEIGHT = 40
const LIST_HEIGHT = 500

function WordListBase({
  words = [],
  onSelect,
}) {
  const Row = useCallback(
    ({
      index,
      style,
    }) => {
      const word =
        words[index]

      if (!word) {
        return null
      }

      const handleSelect = () => {
        onSelect?.(word)
      }

      const handleKeyDown = (event) => {
        if (
          event.key === 'Enter'
          || event.key === ' '
        ) {
          event.preventDefault()
          handleSelect()
        }
      }

      return (
        <div
          style={{
            ...style,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
          }}
          className="word-row"
          role="button"
          tabIndex={0}
          aria-label={`Отвори го зборот ${word.form}`}
          onClick={handleSelect}
          onKeyDown={handleKeyDown}
        >
          {word.form}
        </div>
      )
    },
    [
      words,
      onSelect,
    ],
  )

  if (words.length === 0) {
    return (
      <div className="word-list-wrapper">
        <p className="word-list-empty">
          Нема зборови за прикажување.
        </p>
      </div>
    )
  }

  return (
    <div className="word-list-wrapper">
      <List
        className="word-list"
        height={LIST_HEIGHT}
        itemCount={words.length}
        itemSize={ROW_HEIGHT}
        width="100%"
      >
        {Row}
      </List>
    </div>
  )
}

export default memo(WordListBase)