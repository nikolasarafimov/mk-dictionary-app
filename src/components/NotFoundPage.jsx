import { useParams } from 'react-router-dom'

export default function NotFoundPage() {
  const {
    term,
  } = useParams()

  const displayTerm =
    term?.trim() || 'Бараниот поим'

  return (
    <section
      className="list-page not-found"
      aria-live="polite"
    >
      <h2>
        Поимот не е пронајден
      </h2>

      <p>
        „
        <strong>
          {displayTerm}
        </strong>
        “ не е пронајден во речникот.
      </p>

      <p>
        Проверете го правописот или обидете се
        со друг збор.
      </p>
    </section>
  )
}