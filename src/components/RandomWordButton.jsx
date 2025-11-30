import React from 'react';

export default function RandomWordButton({ onRandom, disabled }) {
  return (
    <button
      className="random-word"
      onClick={disabled ? undefined : onRandom}
      disabled={disabled}
    >
      Случаен збор
    </button>
  );
}