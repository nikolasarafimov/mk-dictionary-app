import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import {
  motion,
} from 'framer-motion'

import {
  FiBookOpen,
  FiCheck,
  FiCompass,
  FiGlobe,
  FiHash,
} from 'react-icons/fi'


const SECTIONS = [
  {
    id: 'classification',
    number: '01',
    title:
      'Позиција и класификација',
  },
  {
    id: 'distribution',
    number: '02',
    title:
      'Употреба и статус',
  },
  {
    id: 'dialects',
    number: '03',
    title:
      'Дијалектна разгранетост',
  },
  {
    id: 'alphabet',
    number: '04',
    title:
      'Азбука и гласовен систем',
  },
  {
    id: 'features',
    number: '05',
    title:
      'Особини на јазикот',
  },
  {
    id: 'history',
    number: '06',
    title:
      'Историски развој',
  },
]


const ALPHABET =
  'А Б В Г Д Ѓ Е Ж З Ѕ И Ј К Л Љ М Н Њ О П Р С Т Ќ У Ф Х Ц Ч Џ Ш'
    .split(' ')


function getHashSection() {
  if (
    typeof window === 'undefined'
  ) {
    return ''
  }


  const hash =
    window.location.hash
      .replace(
        /^#/,
        '',
      )


  if (!hash) {
    return ''
  }


  try {
    const decoded =
      decodeURIComponent(
        hash,
      )


    return SECTIONS.some(
      (section) =>
        section.id === decoded,
    )
      ? decoded
      : ''
  } catch {
    return ''
  }
}


export default function LanguageInfo() {
  const [
    activeSection,
    setActiveSection,
  ] = useState(
    () =>
      getHashSection()
      || SECTIONS[0].id,
  )


  useEffect(() => {
    const elements =
      SECTIONS
        .map(
          ({ id }) =>
            document.getElementById(
              id,
            ),
        )
        .filter(Boolean)


    if (
      elements.length === 0
    ) {
      return undefined
    }


    if (
      typeof IntersectionObserver
        === 'undefined'
    ) {
      return undefined
    }


    const observer =
      new IntersectionObserver(
        (entries) => {
          const visible =
            entries
              .filter(
                (entry) =>
                  entry.isIntersecting,
              )
              .sort(
                (
                  first,
                  second,
                ) =>
                  second
                    .intersectionRatio
                  - first
                    .intersectionRatio,
              )


          if (
            visible.length === 0
          ) {
            return
          }


          setActiveSection(
            visible[0]
              .target.id,
          )
        },
        {
          rootMargin:
            '-18% 0px -62% 0px',

          threshold: [
            0,
            0.1,
            0.25,
            0.5,
          ],
        },
      )


    elements.forEach(
      (element) => {
        observer.observe(
          element,
        )
      },
    )


    return () => {
      observer.disconnect()
    }
  }, [])


  useEffect(() => {
    const handleHashChange =
      () => {
        const section =
          getHashSection()


        if (section) {
          setActiveSection(
            section,
          )
        }
      }


    window.addEventListener(
      'hashchange',
      handleHashChange,
    )

    window.addEventListener(
      'popstate',
      handleHashChange,
    )


    return () => {
      window.removeEventListener(
        'hashchange',
        handleHashChange,
      )

      window.removeEventListener(
        'popstate',
        handleHashChange,
      )
    }
  }, [])


  const handleSectionClick =
    useCallback(
      (
        event,
        id,
      ) => {
        event.preventDefault()


        const element =
          document.getElementById(
            id,
          )


        if (!element) {
          return
        }


        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })


        const nextUrl =
          `${window.location.pathname}${window.location.search}#${encodeURIComponent(
            id,
          )}`


        window.history
          .replaceState(
            window.history.state,
            '',
            nextUrl,
          )


        setActiveSection(
          id,
        )
      },
      [],
    )


  return (
    <motion.main
      className="language-reference"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 0.3,
      }}
    >
      <header className="language-reference-hero">
        <div className="language-reference-overline">
          <span>
            Јазичен водич
          </span>

          <span
            aria-hidden="true"
          />

          <span>
            Македонски јазик
          </span>
        </div>


        <div className="language-reference-title-grid">
          <div>
            <h1>
              Македонски

              <em>
                јазик.
              </em>
            </h1>

            <p>
              Македонскиот јазик е
              стандарден јазик на
              македонскиот народ. Тој
              припаѓа на индоевропското
              јазично семејство,
              словенската јазична група
              и јужнословенската гранка.
            </p>
          </div>


          <aside className="language-reference-signature">
            <span
              className="language-signature-letter"
              aria-hidden="true"
            >
              А
            </span>

            <div>
              <span>
                Македонска азбука
              </span>

              <strong>
                {ALPHABET.length} букви
              </strong>

              <small>
                кирилично писмо
              </small>
            </div>
          </aside>
        </div>


        <div className="language-reference-meta">
          <div>
            <FiGlobe
              aria-hidden="true"
            />

            <span>
              <small>
                Семејство
              </small>

              <strong>
                Индоевропско ·
                словенско ·
                јужнословенско
              </strong>
            </span>
          </div>


          <div>
            <FiBookOpen
              aria-hidden="true"
            />

            <span>
              <small>
                Писмо
              </small>

              <strong>
                Македонска
                кирилична азбука
              </strong>
            </span>
          </div>


          <div>
            <FiCompass
              aria-hidden="true"
            />

            <span>
              <small>
                Статус
              </small>

              <strong>
                Стандарден и
                кодифициран јазик
              </strong>
            </span>
          </div>
        </div>
      </header>


      <div className="language-reference-layout">
        <aside className="language-reference-sidebar">
          <div className="language-toc">
            <span className="language-toc-label">
              Содржина
            </span>

            <nav
              aria-label="Содржина на страницата"
            >
              {SECTIONS.map(
                (section) => {
                  const isActive =
                    activeSection
                    === section.id


                  return (
                    <a
                      key={
                        section.id
                      }
                      href={
                        `#${section.id}`
                      }
                      className={
                        `language-toc-link ${
                          isActive
                            ? 'active'
                            : ''
                        }`
                      }
                      aria-current={
                        isActive
                          ? 'location'
                          : undefined
                      }
                      onClick={
                        (event) =>
                          handleSectionClick(
                            event,
                            section.id,
                          )
                      }
                    >
                      <span>
                        {
                          section.number
                        }
                      </span>

                      <strong>
                        {
                          section.title
                        }
                      </strong>
                    </a>
                  )
                },
              )}
            </nav>
          </div>
        </aside>


        <div className="language-reference-content">
          <section
            id="classification"
            className="language-article-section"
            aria-labelledby="classification-title"
          >
            <header className="language-section-heading">
              <span>
                01
              </span>

              <div>
                <small>
                  Класификација
                </small>

                <h2 id="classification-title">
                  Позиција и
                  класификација
                </h2>
              </div>
            </header>


            <div className="language-prose">
              <p className="language-prose-lead">
                Македонскиот јазик е
                дел од јужнословенските
                јазици.
              </p>

              <p>
                Во традиционалната
                јужнословенска
                класификација се
                вбројува во источната
                подгрупа на
                јужнословенските
                јазици.
              </p>

              <p>
                Истовремено,
                македонскиот е дел и
                од балканскиот јазичен
                сојуз, поради повеќе
                структурни особености
                што ги споделува со
                други јазици од
                Балканскиот Полуостров.
              </p>
            </div>


            <div className="language-taxonomy">
              <div>
                <span>
                  01
                </span>

                <strong>
                  Индоевропско
                </strong>

                <small>
                  јазично семејство
                </small>
              </div>


              <div>
                <span>
                  02
                </span>

                <strong>
                  Словенско
                </strong>

                <small>
                  јазична група
                </small>
              </div>


              <div>
                <span>
                  03
                </span>

                <strong>
                  Јужнословенско
                </strong>

                <small>
                  јазична гранка
                </small>
              </div>


              <div>
                <span>
                  04
                </span>

                <strong>
                  Балкански сојуз
                </strong>

                <small>
                  структурни врски
                </small>
              </div>
            </div>
          </section>


          <section
            id="distribution"
            className="language-article-section"
            aria-labelledby="distribution-title"
          >
            <header className="language-section-heading">
              <span>
                02
              </span>

              <div>
                <small>
                  Современа употреба
                </small>

                <h2 id="distribution-title">
                  Употреба и статус
                </h2>
              </div>
            </header>


            <div className="language-prose">
              <p className="language-prose-lead">
                Македонскиот стандарден
                јазик се употребува во
                образованието, науката,
                администрацијата,
                медиумите, литературата
                и културата.
              </p>

              <p>
                Македонскиот јазик и
                неговото кирилско писмо
                имаат службен статус во
                Република Северна
                Македонија, а јазикот се
                употребува и меѓу
                македонските заедници
                надвор од државата.
              </p>
            </div>


            <ul className="language-feature-list">
              <li>
                <FiCheck
                  aria-hidden="true"
                />

                <span>
                  Стандарден и
                  кодифициран јазик
                </span>
              </li>

              <li>
                <FiCheck
                  aria-hidden="true"
                />

                <span>
                  Службена употреба
                  во државата
                </span>
              </li>

              <li>
                <FiCheck
                  aria-hidden="true"
                />

                <span>
                  Употреба во
                  образованието,
                  науката и културата
                </span>
              </li>

              <li>
                <FiCheck
                  aria-hidden="true"
                />

                <span>
                  Присутен и меѓу
                  македонските
                  заедници во
                  странство
                </span>
              </li>
            </ul>
          </section>


          <section
            id="dialects"
            className="language-article-section"
            aria-labelledby="dialects-title"
          >
            <header className="language-section-heading">
              <span>
                03
              </span>

              <div>
                <small>
                  Дијалектологија
                </small>

                <h2 id="dialects-title">
                  Дијалектна
                  разгранетост
                </h2>
              </div>
            </header>


            <div className="language-prose">
              <p className="language-prose-lead">
                Македонскиот дијасистем
                има богата територијална
                разгранетост.
              </p>

              <p>
                Македонската
                дијалектологија
                издвојува три поголеми
                дијалектни наречја:
                западно, југоисточно
                и северно.
              </p>
            </div>


            <div className="language-dialect-list">
              <article>
                <span>
                  01
                </span>

                <h3>
                  Западно наречје
                </h3>

                <p>
                  Опфаќа голем број
                  говори од западниот
                  дел на македонскиот
                  јазичен простор.
                </p>
              </article>


              <article>
                <span>
                  02
                </span>

                <h3>
                  Северно наречје
                </h3>

                <p>
                  Ги опфаќа говорите
                  од северниот дел на
                  македонскиот јазичен
                  простор и има свои
                  посебни фонетски,
                  морфолошки и
                  акцентски
                  особености.
                </p>
              </article>


              <article>
                <span>
                  03
                </span>

                <h3>
                  Југоисточно наречје
                </h3>

                <p>
                  Опфаќа говори од
                  источниот и јужниот
                  дел на македонскиот
                  јазичен простор и
                  покажува значителна
                  внатрешна
                  разновидност.
                </p>
              </article>
            </div>


            <aside className="language-editorial-note">
              <span>
                Забелешка
              </span>

              <p>
                При кодификацијата на
                современиот стандарден
                македонски јазик како
                основа биле земени
                форми од централните
                говори, со цел
                стандардот да биде
                применлив и разбирлив
                на поширокиот
                македонски јазичен
                простор.
              </p>
            </aside>
          </section>


          <section
            id="alphabet"
            className="language-article-section"
            aria-labelledby="alphabet-title"
          >
            <header className="language-section-heading">
              <span>
                04
              </span>

              <div>
                <small>
                  Писмо
                </small>

                <h2 id="alphabet-title">
                  Азбука и
                  гласовен систем
                </h2>
              </div>
            </header>


            <div className="language-prose">
              <p className="language-prose-lead">
                Современата македонска
                азбука е кирилична и
                содржи {ALPHABET.length}
                {' '}букви.
              </p>

              <p>
                Правописниот систем во
                голема мера се заснова
                врз фонетскиот принцип,
                односно постои тесна
                врска меѓу гласовите
                и нивното писмено
                претставување.
              </p>
            </div>


            <div
              className="language-alphabet"
              aria-label="Македонска азбука"
            >
              {ALPHABET.map(
                (
                  letter,
                  index,
                ) => (
                  <span
                    key={letter}
                    title={
                      `Буква ${
                        index + 1
                      } од ${
                        ALPHABET.length
                      }`
                    }
                  >
                    {letter}
                  </span>
                ),
              )}
            </div>


            <div className="language-fact-strip">
              <div>
                <strong>
                  {ALPHABET.length}
                </strong>

                <span>
                  кирилични букви
                </span>
              </div>

              <div>
                <strong>
                  1945
                </strong>

                <span>
                  официјално усвоена
                  азбука
                </span>
              </div>

              <div>
                <strong>
                  Фонетски
                </strong>

                <span>
                  принцип во
                  правописот
                </span>
              </div>
            </div>
          </section>


          <section
            id="features"
            className="language-article-section"
            aria-labelledby="features-title"
          >
            <header className="language-section-heading">
              <span>
                05
              </span>

              <div>
                <small>
                  Јазичен систем
                </small>

                <h2 id="features-title">
                  Особини на
                  македонскиот јазик
                </h2>
              </div>
            </header>


            <div className="language-prose">
              <p>
                Современиот македонски
                стандарден јазик има
                повеќе граматички и
                фонолошки особености
                што се важни за
                неговиот систем и
                развој.
              </p>
            </div>


            <div className="language-feature-index">
              <article>
                <span>
                  01
                </span>

                <div>
                  <h3>
                    Аналитички
                    граматички систем
                  </h3>

                  <p>
                    Граматичките односи
                    кај именките во
                    голема мера се
                    изразуваат со
                    предлози и други
                    аналитички средства.
                  </p>
                </div>
              </article>


              <article>
                <span>
                  02
                </span>

                <div>
                  <h3>
                    Постпозитивен
                    определен член
                  </h3>

                  <p>
                    Членот се додава
                    на крајот од
                    именката или
                    именската група.
                  </p>
                </div>
              </article>


              <article>
                <span>
                  03
                </span>

                <div>
                  <h3>
                    Трикратен систем
                    на определување
                  </h3>

                  <p>
                    Постојат форми што
                    можат да изразуваат
                    различен степен на
                    просторна
                    определеност.
                  </p>
                </div>
              </article>


              <article>
                <span>
                  04
                </span>

                <div>
                  <h3>
                    Удвојување на
                    предметот
                  </h3>

                  <p>
                    Директниот или
                    индиректниот предмет
                    може да биде
                    придружен со кратка
                    заменска форма.
                  </p>
                </div>
              </article>


              <article>
                <span>
                  05
                </span>

                <div>
                  <h3>
                    Конструкции со
                    „има“ и „нема“
                  </h3>

                  <p>
                    На пример:
                    „имам читано“ и
                    „немам слушнато“.
                  </p>
                </div>
              </article>


              <article>
                <span>
                  06
                </span>

                <div>
                  <h3>
                    Третосложен акцент
                  </h3>

                  <p>
                    Претставува важна
                    особеност на
                    акцентскиот систем
                    на стандардниот
                    македонски јазик.
                  </p>
                </div>
              </article>
            </div>
          </section>


          <section
            id="history"
            className="language-article-section"
            aria-labelledby="history-title"
          >
            <header className="language-section-heading">
              <span>
                06
              </span>

              <div>
                <small>
                  Кодификација
                </small>

                <h2 id="history-title">
                  Историски развој
                  и кодификација
                </h2>
              </div>
            </header>


            <div className="language-prose">
              <p className="language-prose-lead">
                Историјата на
                македонската писмена
                традиција е поврзана
                со развојот на
                словенската писменост.
              </p>

              <p>
                Таа е поврзана и со
                средновековната
                ракописна традиција
                и со подоцнежниот
                развој на
                македонските народни
                говори и литературни
                пројави.
              </p>
            </div>


            <ol className="language-timeline">
              <li>
                <span>
                  I
                </span>

                <div>
                  <strong>
                    Писмена традиција
                  </strong>

                  <p>
                    Македонската
                    писмена традиција
                    има длабоки корени
                    во старословенската
                    и црковнословенската
                    писменост.
                  </p>
                </div>
              </li>


              <li>
                <span>
                  XIX–XX
                </span>

                <div>
                  <strong>
                    Литературен јазик
                  </strong>

                  <p>
                    Во 19. и почетокот
                    на 20. век се
                    засилуваат
                    процесите на
                    афирмација и
                    оформување на
                    современиот
                    литературен јазик.
                  </p>
                </div>
              </li>


              <li>
                <span>
                  1944
                </span>

                <div>
                  <strong>
                    АСНОМ
                  </strong>

                  <p>
                    На 2 август 1944
                    година АСНОМ
                    донесува решение
                    за воведување на
                    македонскиот јазик
                    како службен јазик
                    во македонската
                    држава.
                  </p>
                </div>
              </li>


              <li>
                <span>
                  05.05.45
                </span>

                <div>
                  <strong>
                    Азбука
                  </strong>

                  <p>
                    Македонската
                    азбука е
                    официјално усвоена
                    на 5 мај 1945
                    година.
                  </p>
                </div>
              </li>


              <li>
                <span>
                  07.06.45
                </span>

                <div>
                  <strong>
                    Правопис
                  </strong>

                  <p>
                    Македонскиот
                    правопис е
                    официјално усвоен
                    на 7 јуни 1945
                    година, со што се
                    заокружува
                    современата
                    кодификација на
                    стандардниот јазик.
                  </p>
                </div>
              </li>
            </ol>
          </section>


          <footer className="language-article-end">
            <FiHash
              aria-hidden="true"
            />

            <div>
              <span>
                Македонски јазик
              </span>

              <strong>
                Јазик · писмо ·
                граматика · историја
              </strong>
            </div>
          </footer>
        </div>
      </div>
    </motion.main>
  )
}