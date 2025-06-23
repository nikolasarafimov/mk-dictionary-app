import React from 'react';
import { FixedSizeList as List } from 'react-window';

export default function WordList({ words, onSelect }) {
  const ROW_HEIGHT = 40;
  const LIST_WIDTH = 300; 
  const Row = ({ index, style }) => (
    <div
      style={{
        ...style,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
      }}
      className="word-row"
      onClick={() => onSelect(words[index])}
    >
      {words[index].form}
    </div>
  );

  return (
    <div className="word-list-container">
      <List
        className="word-list"
        height={Math.min(words.length * ROW_HEIGHT, 400)}
        itemCount={words.length}
        itemSize={ROW_HEIGHT}
        width={LIST_WIDTH}
      >
        {Row}
      </List>
    </div>
  );
}