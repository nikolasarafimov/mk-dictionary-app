
import { Link } from 'react-router-dom'
import {
  FiBookOpen,
  FiCode,
  FiHash,
  FiHeart,
  FiInfo,
} from 'react-icons/fi'

const LOGO_URL = `${import.meta.env.BASE_URL}logo.png`

const FOOTER_LINKS = [
  {
    label: 'Речник',
    to: '/home',
    Icon: FiBookOpen,
  },
  {
    label: 'За јазикот',
    to: '/language',
    Icon: FiInfo,
  },
  {
    label: 'Скратеници',
    to: '/abbr',
    Icon: FiHash,
  },
  {
    label: 'Омилени',
    to: '/favorites',
    Icon: FiHeart,
  },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <Link
          to="/home"
          className="footer-brand"
          aria-label="Македонски речник — почетна"
        >
          <span className="footer-brand-mark">
            <img
              src={LOGO_URL}
              alt=""
              width="40"
              height="40"
              loading="lazy"
            />
          </span>

          <span className="footer-brand-copy">
            <strong>Македонски речник</strong>
            <span>
              Дигитален јазичен ресурс за пребарување
              и истражување на македонскиот јазик.
            </span>
          </span>
        </Link>

        <nav
          className="footer-links"
          aria-label="Навигација во подножјето"
        >
          {FOOTER_LINKS.map(({ label, to, Icon }) => (
            <Link key={to} to={to}>
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <a
          className="footer-creator"
          href="https://nikolasarafimov.github.io"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Веб-страница на Никола Сарафимов"
        >
          <span className="footer-creator-icon">
            <FiCode aria-hidden="true" />
          </span>

          <span className="footer-creator-copy">
            <span className="footer-creator-label">
              Креирано и развиено од
            </span>
            <strong className="footer-creator-name">
              Никола Сарафимов
            </strong>
          </span>
        </a>
      </div>

      <div className="footer-bottom">
        <span>© {year} Македонски речник</span>
        <span className="footer-bottom-dot" aria-hidden="true">
          •
        </span>
        <span>Дигитален проект за македонскиот јазик</span>
      </div>
    </footer>
  )
}
