const LETTERS = [
  'А',
  'Б',
  'В',
  'Г',
  'Д',
  'Ѓ',
  'Е',
  'Ж',
  'З',
  'Ѕ',
  'И',
  'Ј',
  'К',
  'Л',
  'Љ',
  'М',
  'Н',
  'Њ',
  'О',
  'П',
  'Р',
  'С',
  'Т',
  'Ќ',
  'У',
  'Ф',
  'Х',
  'Ц',
  'Ч',
  'Џ',
  'Ш',
]

export default function LetterNav({
  selectedLetter,
  onLetterClick,
  disabled,
}) {
  return (
    <nav
      className="letter-nav"
      aria-label="Пребарување по почетна буква"
    >
      {LETTERS.map(
        (letter) => {
          const isActive =
            selectedLetter === letter

          return (
            <button
              key={letter}
              type="button"
              className={
                isActive
                  ? 'active'
                  : ''
              }
              aria-pressed={
                isActive
              }
              disabled={
                disabled
              }
              onClick={() =>
                onLetterClick(letter)
              }
            >
              {letter}
            </button>
          )
        },
      )}
    </nav>
  )
}