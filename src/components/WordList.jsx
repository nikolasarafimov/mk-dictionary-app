import React, { memo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';

function WordListBase({ words, onSelect }) {
  const ROW_HEIGHT = 40;

  const Row = useCallback(
    ({ index, style }) => (
      <div
        style={{
          ...style,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer'
        }}
        className="word-row"
        onClick={() => onSelect(words[index])}
      >
        {words[index].form}
      </div>
    ),
    [words, onSelect]
  );

  return (
    <div className="word-list-wrapper">
      <List
        className="word-list"
        height={500}
        itemCount={words.length}
        itemSize={ROW_HEIGHT}
        width="100%"
      >
        {Row}
      </List>
    </div>
  );
}

export default memo(WordListBase);