import {
  FiShuffle,
} from 'react-icons/fi'


export default function RandomWordButton({
  onRandom,
  disabled = false,
}) {
  const handleClick = () => {
    if (
      disabled
      || typeof onRandom
        !== 'function'
    ) {
      return
    }

    onRandom()
  }


  return (
    <button
      type="button"
      className="random-word-button"
      disabled={disabled}
      aria-label="Прикажи случаен збор"
      onClick={handleClick}
    >
      <FiShuffle
        aria-hidden="true"
      />

      <span>
        Случаен збор
      </span>
    </button>
  )
}