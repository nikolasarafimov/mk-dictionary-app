function encodePathSegment(
  value,
) {
  return encodeURIComponent(
    String(
      value ?? '',
    ).trim(),
  )
}


export function buildDetailsPath(
  form,
) {
  return `/details/${encodePathSegment(
    form,
  )}`
}


export function buildSearchPath(
  term,
) {
  return `/search/${encodePathSegment(
    term,
  )}`
}


export function buildNotFoundPath(
  term,
) {
  return `/not-found/${encodePathSegment(
    term,
  )}`
}


export function buildLetterPath(
  letter,
) {
  return `/list/${encodePathSegment(
    letter,
  )}`
}