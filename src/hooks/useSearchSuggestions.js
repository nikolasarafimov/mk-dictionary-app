import {
  useEffect,
  useState,
} from 'react'

import {
  getSearchSuggestionRows,
} from '../db/client'


const LOCALE = 'mk-MK'
const DEFAULT_DELAY = 160
const DEFAULT_LIMIT = 10
const MAX_LIMIT = 50


function normalizeValue(
  value,
) {
  return String(
    value ?? '',
  ).trim()
}


function normalizeComparableValue(
  value,
) {
  return normalizeValue(
    value,
  ).toLocaleLowerCase(
    LOCALE,
  )
}


function normalizeDelay(
  value,
) {
  const parsed =
    Number(
      value,
    )


  if (
    !Number.isFinite(
      parsed,
    )
  ) {
    return DEFAULT_DELAY
  }


  return Math.max(
    0,
    parsed,
  )
}


function normalizeLimit(
  value,
) {
  const parsed =
    Number.parseInt(
      value,
      10,
    )


  if (
    !Number.isFinite(
      parsed,
    )
  ) {
    return DEFAULT_LIMIT
  }


  return Math.min(
    MAX_LIMIT,
    Math.max(
      1,
      parsed,
    ),
  )
}


export default function useSearchSuggestions(
  value,
  {
    delay = DEFAULT_DELAY,
    disabled = false,
    ignoreValue = '',
    limit = DEFAULT_LIMIT,
  } = {},
) {
  const [
    suggestions,
    setSuggestions,
  ] = useState([])

  const [
    isLoading,
    setIsLoading,
  ] = useState(false)


  useEffect(() => {
    const query =
      normalizeValue(
        value,
      )

    const ignored =
      normalizeComparableValue(
        ignoreValue,
      )

    const comparableQuery =
      normalizeComparableValue(
        query,
      )


    if (
      disabled
      || !query
      || (
        ignored
        && comparableQuery
          === ignored
      )
    ) {
      setSuggestions([])
      setIsLoading(false)

      return undefined
    }


    const requestDelay =
      normalizeDelay(
        delay,
      )

    const requestLimit =
      normalizeLimit(
        limit,
      )


    let cancelled = false


    setIsLoading(false)


    const timer =
      window.setTimeout(
        async () => {
          if (cancelled) {
            return
          }


          setIsLoading(true)


          try {
            const results =
              await getSearchSuggestionRows(
                query,
                requestLimit,
              )


            if (cancelled) {
              return
            }


            setSuggestions(
              Array.isArray(
                results,
              )
                ? results
                : [],
            )
          } catch {
            if (!cancelled) {
              setSuggestions([])
            }
          } finally {
            if (!cancelled) {
              setIsLoading(false)
            }
          }
        },
        requestDelay,
      )


    return () => {
      cancelled = true

      window.clearTimeout(
        timer,
      )
    }
  }, [
    value,
    delay,
    disabled,
    ignoreValue,
    limit,
  ])


  return {
    suggestions,
    setSuggestions,
    isLoading,
  }
}