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
  selectedLetter = '',
  onLetterClick,
  disabled = false,
}) {
  const handleLetterClick =
    (letter) => {
      if (
        disabled
        || typeof onLetterClick
          !== 'function'
      ) {
        return
      }

      onLetterClick(
        letter,
      )
    }


  return (
    <nav
      className="letter-nav"
      aria-label="Македонска азбука"
    >
      {LETTERS.map(
        (letter) => {
          const isActive =
            selectedLetter
            === letter

          return (
            <button
              key={letter}
              type="button"
              className={
                `letter-button ${
                  isActive
                    ? 'active'
                    : ''
                }`
              }
              aria-label={
                `Прикажи зборови на буквата ${letter}`
              }
              aria-current={
                isActive
                  ? 'page'
                  : undefined
              }
              title={
                `Зборови на „${letter}“`
              }
              disabled={
                disabled
              }
              onClick={() =>
                handleLetterClick(
                  letter,
                )
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