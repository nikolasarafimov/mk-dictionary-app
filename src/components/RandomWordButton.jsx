import React from 'react';

export default function RandomWordButton({ onRandom }) {
  return (
    <button className="random-word" onClick={onRandom}>
      Случаен збор
    </button>
  );
}