import {
  useCallback,
  useMemo,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  FixedSizeList,
} from 'react-window'

import {
  FiArrowRight,
} from 'react-icons/fi'

import {
  decodeTag,
} from '../utils/tagDecoder'

import {
  buildDetailsPath,
} from '../utils/routes'


const ROW_HEIGHT = 82
const MAX_LIST_HEIGHT = 650


const MATCH_LABELS = {
  'exact-form':
    'Точно совпаѓање',

  'prefix-form':
    'Почеток на збор',

  'exact-lemma':
    'Точна лема',

  'prefix-lemma':
    'По лема',

  'contains-form':
    'Дел од збор',

  'contains-lemma':
    'Дел од лема',
}


function normalize(
  value,
) {
  return String(
    value ?? '',
  )
}


function HighlightText({
  text,
  term,
}) {
  const source =
    normalize(
      text,
    )

  const query =
    normalize(
      term,
    ).trim()


  if (!query) {
    return source
  }


  const sourceLower =
    source.toLocaleLowerCase(
      'mk-MK',
    )

  const queryLower =
    query.toLocaleLowerCase(
      'mk-MK',
    )


  const index =
    sourceLower.indexOf(
      queryLower,
    )


  if (index < 0) {
    return source
  }


  const before =
    source.slice(
      0,
      index,
    )

  const match =
    source.slice(
      index,
      index + query.length,
    )

  const after =
    source.slice(
      index + query.length,
    )


  return (
    <>
      {before}

      <mark>
        {match}
      </mark>

      {after}
    </>
  )
}


function getMorphology(
  tag,
) {
  if (!tag) {
    return ''
  }


  try {
    const decoded =
      decodeTag(
        tag,
      )


    if (
      typeof decoded !== 'string'
      || !decoded.trim()
    ) {
      return ''
    }


    return decoded.trim()
  } catch {
    return ''
  }
}


function WordRow({
  index,
  style,
  data,
}) {
  const {
    words,
    onOpen,
    highlightTerm,
    showMatchType,
  } = data


  const word =
    words[index]


  if (!word) {
    return null
  }


  const form =
    normalize(
      word.form,
    ).trim()

  const lemma =
    normalize(
      word.lemma,
    ).trim()

  const tag =
    normalize(
      word.tag,
    ).trim()

  const matchType =
    normalize(
      word.matchType,
    ).trim()

  const morphology =
    getMorphology(
      tag,
    )

  const matchLabel =
    MATCH_LABELS[
      matchType
    ] || ''


  const showLemma =
    Boolean(
      lemma,
    )
    && lemma.toLocaleLowerCase(
      'mk-MK',
    )
      !== form.toLocaleLowerCase(
        'mk-MK',
      )


  const matchClass =
    matchType.includes(
      'lemma',
    )
      ? 'lemma'
      : 'form'


  return (
    <div
      style={style}
      className="word-index-row-shell"
    >
      <button
        type="button"
        className="word-index-row"
        aria-label={
          `Отвори го зборот „${form}“`
        }
        onClick={() =>
          onOpen(
            form,
          )
        }
      >
        <span className="word-index-number">
          {String(
            index + 1,
          ).padStart(
            2,
            '0',
          )}
        </span>


        <span className="word-index-entry">
          <span className="word-index-title-line">
            <strong>
              <HighlightText
                text={
                  form
                }
                term={
                  highlightTerm
                }
              />
            </strong>


            {showMatchType
              && matchLabel
              && (
                <span
                  className={
                    `word-index-match ${matchClass}`
                  }
                >
                  {matchLabel}
                </span>
              )}
          </span>


          <span className="word-index-meta">
            {showLemma && (
              <span className="word-index-lemma">
                <span>
                  лема
                </span>

                <strong>
                  <HighlightText
                    text={
                      lemma
                    }
                    term={
                      highlightTerm
                    }
                  />
                </strong>
              </span>
            )}


            {showLemma
              && morphology
              && (
                <span
                  className="word-index-dot"
                  aria-hidden="true"
                />
              )}


            {morphology && (
              <span className="word-index-morphology">
                {morphology}
              </span>
            )}
          </span>
        </span>


        <span className="word-index-tag">
          {tag || '—'}
        </span>


        <span
          className="word-index-arrow"
          aria-hidden="true"
        >
          <FiArrowRight />
        </span>
      </button>
    </div>
  )
}


export default function WordList({
  words = [],
  highlightTerm = '',
  showMatchType = false,
}) {
  const navigate =
    useNavigate()


  const safeWords =
    useMemo(
      () => {
        if (
          !Array.isArray(
            words,
          )
        ) {
          return []
        }


        return words.filter(
          (word) =>
            word
            && typeof word
              === 'object'
            && normalize(
              word.form,
            ).trim(),
        )
      },
      [
        words,
      ],
    )


  const onOpen =
    useCallback(
      (form) => {
        const normalizedForm =
          normalize(
            form,
          ).trim()


        if (!normalizedForm) {
          return
        }


        navigate(
          buildDetailsPath(
            normalizedForm,
          ),
        )
      },
      [
        navigate,
      ],
    )


  const itemData =
    useMemo(
      () => ({
        words:
          safeWords,

        onOpen,

        highlightTerm:
          normalize(
            highlightTerm,
          ),

        showMatchType:
          Boolean(
            showMatchType,
          ),
      }),
      [
        safeWords,
        onOpen,
        highlightTerm,
        showMatchType,
      ],
    )


  if (
    safeWords.length === 0
  ) {
    return null
  }


  const height =
    Math.min(
      safeWords.length
        * ROW_HEIGHT,
      MAX_LIST_HEIGHT,
    )


  return (
    <section
      className="word-index"
      aria-label="Речнички резултати"
    >
      <header
        className="word-index-header"
        aria-hidden="true"
      >
        <span>
          #
        </span>

        <span>
          Збороформа
        </span>

        <span>
          Ознака
        </span>

        <span />
      </header>


      <FixedSizeList
        className="word-index-virtual-list"
        height={height}
        width="100%"
        itemCount={
          safeWords.length
        }
        itemSize={
          ROW_HEIGHT
        }
        itemData={
          itemData
        }
        overscanCount={8}
        itemKey={
          (
            index,
            data,
          ) => {
            const word =
              data.words[
                index
              ]


            return [
              normalize(
                word?.form,
              ),
              normalize(
                word?.lemma,
              ),
              normalize(
                word?.tag,
              ),
              index,
            ].join(
              '\u0000',
            )
          }
        }
      >
        {WordRow}
      </FixedSizeList>


      <footer className="word-index-footer">
        <span>
          {safeWords.length
            .toLocaleString(
              'mk-MK',
            )}
        </span>

        <span>
          прикажани записи
        </span>
      </footer>
    </section>
  )
}