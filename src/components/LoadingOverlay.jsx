import { createPortal } from 'react-dom'

export default function LoadingOverlay() {
  return createPortal(
    <div
      className="loading-overlay"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Вчитување на речникот"
    >
      <div className="loading-box">
        <div
          className="spinner"
          aria-hidden="true"
        />

        <p>
          Вчитување на речникот…
        </p>

        <span className="loading-sub">
          Ве молиме почекајте.
        </span>
      </div>
    </div>,
    document.body,
  )
}