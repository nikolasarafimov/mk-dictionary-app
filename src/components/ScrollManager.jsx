import {
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react'

import {
  useLocation,
  useNavigationType,
} from 'react-router-dom'


const STORAGE_KEY =
  'mk-dictionary-scroll-positions'

const HASH_RETRY_DELAY = 120
const MAX_HASH_RETRIES = 4


function readPositions() {
  if (
    typeof window === 'undefined'
  ) {
    return {}
  }


  try {
    const raw =
      window.sessionStorage
        .getItem(
          STORAGE_KEY,
        )


    if (!raw) {
      return {}
    }


    const parsed =
      JSON.parse(
        raw,
      )


    if (
      !parsed
      || typeof parsed
        !== 'object'
      || Array.isArray(
        parsed,
      )
    ) {
      return {}
    }


    return parsed
  } catch {
    return {}
  }
}


function savePositions(
  positions,
) {
  if (
    typeof window === 'undefined'
  ) {
    return
  }


  try {
    window.sessionStorage
      .setItem(
        STORAGE_KEY,
        JSON.stringify(
          positions,
        ),
      )
  } catch {
    return
  }
}


function getHashId(
  hash,
) {
  if (!hash) {
    return ''
  }


  try {
    return decodeURIComponent(
      hash.replace(
        /^#/,
        '',
      ),
    ).trim()
  } catch {
    return ''
  }
}


function scrollToHash(
  hash,
) {
  if (
    typeof document === 'undefined'
  ) {
    return false
  }


  const id =
    getHashId(
      hash,
    )


  if (!id) {
    return false
  }


  const element =
    document.getElementById(
      id,
    )


  if (!element) {
    return false
  }


  element.scrollIntoView({
    block: 'start',
    behavior: 'auto',
  })


  return true
}


export default function ScrollManager() {
  const location =
    useLocation()

  const navigationType =
    useNavigationType()


  const positionsRef =
    useRef(
      readPositions(),
    )

  const previousLocationRef =
    useRef(
      location,
    )


  useEffect(() => {
    if (
      typeof window === 'undefined'
      || !(
        'scrollRestoration'
        in window.history
      )
    ) {
      return undefined
    }


    const previousValue =
      window.history
        .scrollRestoration


    window.history
      .scrollRestoration =
        'manual'


    return () => {
      window.history
        .scrollRestoration =
          previousValue
    }
  }, [])


  useEffect(() => {
    const handlePageHide =
      () => {
        const key =
          previousLocationRef
            .current
            ?.key


        if (!key) {
          return
        }


        positionsRef.current = {
          ...positionsRef.current,

          [key]: {
            x:
              window.scrollX,

            y:
              window.scrollY,
          },
        }


        savePositions(
          positionsRef.current,
        )
      }


    window.addEventListener(
      'pagehide',
      handlePageHide,
    )


    return () => {
      window.removeEventListener(
        'pagehide',
        handlePageHide,
      )
    }
  }, [])


  useLayoutEffect(() => {
    const previousLocation =
      previousLocationRef
        .current


    if (
      previousLocation
      && previousLocation.key
        !== location.key
    ) {
      positionsRef.current = {
        ...positionsRef.current,

        [previousLocation.key]: {
          x:
            window.scrollX,

          y:
            window.scrollY,
        },
      }


      savePositions(
        positionsRef.current,
      )
    }


    previousLocationRef.current =
      location


    let cancelled = false
    let frameOne = null
    let frameTwo = null
    let retryTimer = null


    const restoreHash =
      (attempt = 0) => {
        if (
          cancelled
          || !location.hash
        ) {
          return
        }


        if (
          scrollToHash(
            location.hash,
          )
        ) {
          return
        }


        if (
          attempt
          >= MAX_HASH_RETRIES
        ) {
          return
        }


        retryTimer =
          window.setTimeout(
            () => {
              restoreHash(
                attempt + 1,
              )
            },
            HASH_RETRY_DELAY,
          )
      }


    const restore =
      () => {
        if (cancelled) {
          return
        }


        if (location.hash) {
          restoreHash()

          return
        }


        if (
          navigationType === 'POP'
        ) {
          const stored =
            positionsRef.current[
              location.key
            ]


          if (stored) {
            window.scrollTo({
              left:
                Number.isFinite(
                  stored.x,
                )
                  ? stored.x
                  : 0,

              top:
                Number.isFinite(
                  stored.y,
                )
                  ? stored.y
                  : 0,

              behavior: 'auto',
            })


            return
          }
        }


        window.scrollTo({
          left: 0,
          top: 0,
          behavior: 'auto',
        })
      }


    frameOne =
      window.requestAnimationFrame(
        () => {
          frameTwo =
            window.requestAnimationFrame(
              restore,
            )
        },
      )


    return () => {
      cancelled = true


      if (
        frameOne !== null
      ) {
        window.cancelAnimationFrame(
          frameOne,
        )
      }


      if (
        frameTwo !== null
      ) {
        window.cancelAnimationFrame(
          frameTwo,
        )
      }


      if (
        retryTimer !== null
      ) {
        window.clearTimeout(
          retryTimer,
        )
      }
    }
  }, [
    location,
    navigationType,
  ])


  return null
}