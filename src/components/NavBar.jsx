import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiMenu,
  FiX,
} from 'react-icons/fi'

const NAV_LINKS = [
  {
    key: 'home',
    label: 'Почетна',
    path: '/home',
  },
  {
    key: 'language',
    label: 'Македонски јазик',
    path: '/language',
  },
  {
    key: 'abbr',
    label: 'Скратеници',
    path: '/abbr',
  },
  {
    key: 'favorites',
    label: 'Омилени',
    path: '/favorites',
  },
]

const LOGO_URL =
  `${import.meta.env.BASE_URL}recnikLogo.png`

export default function NavBar({
  selected,
  onSelect,
}) {
  const [
    open,
    setOpen,
  ] = useState(false)

  const handleSelect = (key) => {
    onSelect?.(key)
    setOpen(false)
  }

  const toggleMenu = () => {
    setOpen(
      (previousOpen) =>
        !previousOpen,
    )
  }

  return (
    <nav
      className="pro-nav"
      aria-label="Главна навигација"
    >
      <div className="pro-nav-inner">
        <Link
          to="/home"
          className="pro-nav-logo"
          onClick={() =>
            handleSelect('home')
          }
          aria-label="Македонски речник — почетна страница"
        >
          <img
            src={LOGO_URL}
            alt="Македонски речник"
          />
        </Link>

        <div className="pro-nav-links">
          {NAV_LINKS.map(
            ({
              key,
              label,
              path,
            }) => (
              <Link
                key={key}
                to={path}
                onClick={() =>
                  handleSelect(key)
                }
                className={
                  `pro-nav-link ${
                    selected === key
                      ? 'active'
                      : ''
                  }`
                }
                aria-current={
                  selected === key
                    ? 'page'
                    : undefined
                }
              >
                {label}
              </Link>
            ),
          )}
        </div>

        <button
          type="button"
          className="pro-nav-mobile-button"
          aria-label={
            open
              ? 'Затвори мени'
              : 'Отвори мени'
          }
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={toggleMenu}
        >
          {open ? (
            <FiX aria-hidden="true" />
          ) : (
            <FiMenu aria-hidden="true" />
          )}
        </button>
      </div>

      {open && (
        <div
          id="mobile-navigation"
          className="pro-nav-mobile-menu"
        >
          {NAV_LINKS.map(
            ({
              key,
              label,
              path,
            }) => (
              <Link
                key={key}
                to={path}
                onClick={() =>
                  handleSelect(key)
                }
                className={
                  `pro-nav-mobile-item ${
                    selected === key
                      ? 'active'
                      : ''
                  }`
                }
                aria-current={
                  selected === key
                    ? 'page'
                    : undefined
                }
              >
                {label}
              </Link>
            ),
          )}
        </div>
      )}
    </nav>
  )
}