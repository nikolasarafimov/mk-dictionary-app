import React from 'react';

const letters = ['А','Б','В','Г','Д','Ѓ','Е','Ж','З','Ѕ','И','Ј','К','Л','Љ','М','Н','Њ','О','П','Р','С','Т','Ќ','У','Ф','Х','Ц','Ч','Џ','Ш'];

export default function LetterNav({ selectedLetter, onLetterClick }) {
  return (
    <div className="letter-nav">
      {letters.map(l => (
        <button key={l} className={selectedLetter === l ? 'active' : ''} onClick={() => onLetterClick(l)}>
          {l}
        </button>
      ))}
    </div>
  );
}