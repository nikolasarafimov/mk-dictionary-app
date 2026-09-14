export default function RandomWordButton({
  onRandom,
  disabled,
}) {
  return (
    <button
      type="button"
      className="random-word"
      onClick={onRandom}
      disabled={disabled}
      aria-label="Прикажи случаен збор"
    >
      Случаен збор
    </button>
  )
}