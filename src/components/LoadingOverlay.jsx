import {
  createPortal,
} from 'react-dom'

import {
  FiBookOpen,
} from 'react-icons/fi'


export default function LoadingOverlay() {
  if (
    typeof document
      === 'undefined'
  ) {
    return null
  }


  return createPortal(
    <div
      className="loading-overlay"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-busy="true"
      aria-label="Вчитување на речникот"
    >
      <div
        className="loading-backdrop"
        aria-hidden="true"
      />

      <div className="loading-box">
        <div
          className="loading-brand-icon"
          aria-hidden="true"
        >
          <FiBookOpen />
        </div>

        <div
          className="loading-spinner"
          aria-hidden="true"
        >
          <span />
        </div>

        <div className="loading-copy">
          <strong>
            Македонски речник
          </strong>

          <p>
            Се вчитуваат јазичните
            податоци…
          </p>
        </div>

        <div
          className="loading-progress"
          aria-hidden="true"
        >
          <span />
        </div>
      </div>
    </div>,
    document.body,
  )
}