import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  FiBookOpen,
  FiGrid,
  FiHeart,
  FiHome,
  FiMenu,
  FiSearch,
  FiX,
} from 'react-icons/fi'

const NAV_LINKS = [
  { key: 'home', label: 'Речник', path: '/home', icon: FiHome },
  { key: 'language', label: 'За јазикот', path: '/language', icon: FiBookOpen },
  { key: 'abbr', label: 'Скратеници', path: '/abbr', icon: FiGrid },
  { key: 'favorites', label: 'Омилени', path: '/favorites', icon: FiHeart },
]

const LOGO_URL = `${import.meta.env.BASE_URL}recnikLogo.png`

function matchesRoute(pathname, route) {
  return pathname === route || pathname.startsWith(`${route}/`)
}

function getActiveKey(pathname) {
  if (
    pathname === '/' ||
    matchesRoute(pathname, '/home') ||
    matchesRoute(pathname, '/list') ||
    matchesRoute(pathname, '/search') ||
    matchesRoute(pathname, '/details') ||
    matchesRoute(pathname, '/not-found')
  ) {
    return 'home'
  }

  if (matchesRoute(pathname, '/language')) return 'language'
  if (matchesRoute(pathname, '/abbr')) return 'abbr'
  if (matchesRoute(pathname, '/favorites')) return 'favorites'

  return ''
}

function getShortcutLabel() {
  if (typeof navigator === 'undefined') return 'Ctrl K'

  const platform = navigator.userAgentData?.platform || navigator.platform || ''
  return /Mac|iPhone|iPad/i.test(platform) ? '⌘ K' : 'Ctrl K'
}

export default function NavBar({ onOpenCommandPalette }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const reducedMotion = useReducedMotion()
  const activeKey = getActiveKey(pathname)
  const shortcutLabel = useMemo(getShortcutLabel, [])

  const closeMenu = useCallback(() => {
    setMenuOpen(false)
  }, [])

  const toggleMenu = useCallback(() => {
    setMenuOpen((current) => !current)
  }, [])

  const openSearch = useCallback(() => {
    setMenuOpen(false)
    onOpenCommandPalette?.()
  }, [onOpenCommandPalette])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  return (
    <header className="premium-header">
      <div className="premium-header-inner">
        <Link
          to="/home"
          className="premium-brand"
          aria-label="Македонски речник — почетна страница"
          onClick={closeMenu}
        >
          <img
            src={LOGO_URL}
            alt=""
            className="premium-brand-logo"
            aria-hidden="true"
          />
        </Link>

        <nav className="premium-desktop-nav" aria-label="Главна навигација">
          {NAV_LINKS.map(({ key, label, path }) => {
            const isActive = activeKey === key

            return (
              <Link
                key={key}
                to={path}
                className={`premium-nav-link ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="premium-header-actions">
          <button
            type="button"
            className="premium-search-trigger"
            aria-label="Отвори глобално пребарување"
            title="Глобално пребарување"
            onClick={openSearch}
          >
            <FiSearch aria-hidden="true" />
            <span className="premium-search-trigger-copy">Пребарај</span>
            <kbd aria-hidden="true">{shortcutLabel}</kbd>
          </button>

          <button
            type="button"
            className="premium-menu-button"
            aria-label={menuOpen ? 'Затвори мени' : 'Отвори мени'}
            aria-expanded={menuOpen}
            aria-controls="premium-mobile-menu"
            onClick={toggleMenu}
          >
            {menuOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {menuOpen && (
          <motion.div
            id="premium-mobile-menu"
            className="premium-mobile-shell"
            initial={reducedMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : { duration: 0.22, ease: [0.2, 0, 0, 1] }
            }
          >
            <div className="premium-mobile-menu">
              <div className="premium-mobile-intro">
                <span>Навигација</span>
                <p>Македонски дигитален речник</p>
              </div>

              <button
                type="button"
                className="premium-mobile-search"
                onClick={openSearch}
              >
                <span className="premium-mobile-search-icon">
                  <FiSearch aria-hidden="true" />
                </span>
                <span>
                  <strong>Пребарај во речникот</strong>
                  <small>Збор, форма или лема</small>
                </span>
                <span aria-hidden="true">→</span>
              </button>

              <nav className="premium-mobile-links" aria-label="Мобилна навигација">
                {NAV_LINKS.map(({ key, label, path, icon: Icon }) => {
                  const isActive = activeKey === key

                  return (
                    <Link
                      key={key}
                      to={path}
                      className={`premium-mobile-link ${isActive ? 'active' : ''}`}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={closeMenu}
                    >
                      <span className="premium-mobile-link-icon">
                        <Icon aria-hidden="true" />
                      </span>
                      <span>{label}</span>
                      <span className="premium-mobile-arrow" aria-hidden="true">→</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
