const DEFAULT_RESULTS_ROWS = 7
const DEFAULT_LIST_ROWS = 8
const MAX_SKELETON_ROWS = 12


function normalizeRowCount(
  value,
  fallback,
) {
  const parsed =
    Number.parseInt(
      value,
      10,
    )

  if (
    !Number.isInteger(parsed)
    || parsed <= 0
  ) {
    return fallback
  }

  return Math.min(
    parsed,
    MAX_SKELETON_ROWS,
  )
}


function SkeletonLine({
  className = '',
}) {
  const classes = [
    'skeleton-block',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span
      className={classes}
      aria-hidden="true"
    />
  )
}


function SkeletonResultRows({
  rows,
}) {
  return (
    <div className="skeleton-result-list">
      {Array.from(
        {
          length: rows,
        },
        (_, index) => (
          <div
            key={index}
            className="skeleton-result-row"
            aria-hidden="true"
          >
            <SkeletonLine className="skeleton-result-number" />

            <div className="skeleton-result-copy">
              <SkeletonLine className="skeleton-result-word" />

              <SkeletonLine className="skeleton-result-meta" />
            </div>

            <SkeletonLine className="skeleton-result-tag" />
          </div>
        ),
      )}
    </div>
  )
}


export function WordDetailsSkeleton() {
  return (
    <section
      className="skeleton-page skeleton-details"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Се вчитува зборот"
    >
      <div className="skeleton-details-top">
        <SkeletonLine className="skeleton-eyebrow" />

        <SkeletonLine className="skeleton-word-title" />

        <div
          className="skeleton-actions"
          aria-hidden="true"
        >
          <SkeletonLine />
          <SkeletonLine />
          <SkeletonLine />
        </div>
      </div>

      <div className="skeleton-detail-table">
        {Array.from(
          {
            length: 3,
          },
          (_, index) => (
            <div
              key={index}
              className="skeleton-detail-row"
              aria-hidden="true"
            >
              <SkeletonLine className="skeleton-detail-label" />

              <SkeletonLine className="skeleton-detail-value" />
            </div>
          ),
        )}
      </div>
    </section>
  )
}


export function ResultsSkeleton({
  rows = DEFAULT_RESULTS_ROWS,
}) {
  const rowCount =
    normalizeRowCount(
      rows,
      DEFAULT_RESULTS_ROWS,
    )

  return (
    <section
      className="skeleton-page skeleton-results"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Се вчитуваат резултатите"
    >
      <div className="skeleton-results-heading">
        <SkeletonLine className="skeleton-results-kicker" />

        <SkeletonLine className="skeleton-results-title" />

        <SkeletonLine className="skeleton-results-description" />
      </div>

      <div
        className="skeleton-toolbar"
        aria-hidden="true"
      >
        <SkeletonLine />
        <SkeletonLine />
      </div>

      <SkeletonResultRows
        rows={rowCount}
      />
    </section>
  )
}


export function ListSkeleton({
  rows = DEFAULT_LIST_ROWS,
}) {
  const rowCount =
    normalizeRowCount(
      rows,
      DEFAULT_LIST_ROWS,
    )

  return (
    <section
      className="skeleton-page skeleton-list"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Се вчитува азбучниот список"
    >
      <div className="skeleton-list-header">
        <SkeletonLine className="skeleton-list-letter" />

        <div>
          <SkeletonLine className="skeleton-results-kicker" />

          <SkeletonLine className="skeleton-list-title" />
        </div>
      </div>

      <SkeletonResultRows
        rows={rowCount}
      />
    </section>
  )
}