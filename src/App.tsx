import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { ComponentsSection } from './sections/ComponentsSection'
import { GuidelinesSection } from './sections/GuidelinesSection'
import { TokensSection } from './sections/TokensSection'

type Theme = 'light' | 'dark'
type Motion = 'full' | 'reduced'
type Transparency = 'full' | 'reduced'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'dark'
  }
  const stored = window.localStorage.getItem('lg-theme')
  if (stored === 'light' || stored === 'dark') {
    return stored
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getInitialMotion(): Motion {
  if (typeof window === 'undefined') {
    return 'full'
  }

  const stored = window.localStorage.getItem('lg-motion')
  if (stored === 'full' || stored === 'reduced') {
    return stored
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'full'
}

function getInitialTransparency(): Transparency {
  if (typeof window === 'undefined') {
    return 'full'
  }

  const stored = window.localStorage.getItem('lg-transparency')
  if (stored === 'full' || stored === 'reduced') {
    return stored
  }

  return window.matchMedia('(prefers-reduced-transparency: reduce)').matches ? 'reduced' : 'full'
}

function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [motion, setMotion] = useState<Motion>(getInitialMotion)
  const [transparency, setTransparency] = useState<Transparency>(getInitialTransparency)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('lg-theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.dataset.motion = motion
    window.localStorage.setItem('lg-motion', motion)
  }, [motion])

  useEffect(() => {
    document.documentElement.dataset.transparency = transparency
    window.localStorage.setItem('lg-transparency', transparency)
  }, [transparency])

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        window.clearTimeout(toastTimer.current)
      }
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT')
      ) {
        return
      }

      if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault()
        searchInputRef.current?.focus()
        return
      }

      if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const toggleThemeLabel = useMemo(
    () => (theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'),
    [theme],
  )

  const toggleMotionLabel = useMemo(
    () => (motion === 'reduced' ? 'Switch to full motion' : 'Switch to reduced motion'),
    [motion],
  )

  const toggleTransparencyLabel = useMemo(
    () =>
      transparency === 'reduced'
        ? 'Switch to full transparency'
        : 'Switch to reduced transparency',
    [transparency],
  )

  const announce = (message: string) => {
    setToast(message)
    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current)
    }
    toastTimer.current = window.setTimeout(() => {
      setToast(null)
    }, 2200)
  }

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            ◐
          </span>
          Liquid Glass UI
        </div>
        <nav className="topbar-actions">
          <a href="#tokens">Tokens</a>
          <a href="#components">Components</a>
          <a href="#guidelines">A11y</a>
          <button
            className="theme-toggle"
            type="button"
            aria-pressed={theme === 'dark'}
            aria-label={toggleThemeLabel}
            onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
          >
            {theme === 'dark' ? 'Dark' : 'Light'}
          </button>
          <button
            className="theme-toggle"
            type="button"
            aria-pressed={motion === 'reduced'}
            aria-label={toggleMotionLabel}
            onClick={() => setMotion((current) => (current === 'reduced' ? 'full' : 'reduced'))}
          >
            {motion === 'reduced' ? 'Reduced' : 'Motion'}
          </button>
          <button
            className="theme-toggle"
            type="button"
            aria-pressed={transparency === 'reduced'}
            aria-label={toggleTransparencyLabel}
            onClick={() =>
              setTransparency((current) => (current === 'reduced' ? 'full' : 'reduced'))
            }
          >
            {transparency === 'reduced' ? 'Solid' : 'Glass'}
          </button>
        </nav>
      </header>

      <main id="main">
        <section className="hero" id="top">
          <div className="hero-copy">
            <p className="eyebrow">Liquid Glass System</p>
            <h1>Design tokens + glass components inspired by Apple.</h1>
            <p className="lede">
              A reference UI kit that blends frosted depth, responsive gradients, and accessible
              interaction states. Built for modern design systems with a tiny footprint.
            </p>
            <div className="hero-actions">
              <a className="primary-cta" href="#tokens">
                Explore tokens
              </a>
              <a className="secondary-cta" href="#components">
                View components
              </a>
            </div>
            <div className="hero-meta">
              <div>
                <span className="meta-label">Mode</span>
                <span className="meta-value">Dark + light</span>
              </div>
              <div>
                <span className="meta-label">Focus</span>
                <span className="meta-value">Glass primitives</span>
              </div>
              <div>
                <span className="meta-label">Format</span>
                <span className="meta-value">Tokens + examples</span>
              </div>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="orb orb-one" />
            <div className="orb orb-two" />
            <div className="glass-stack">
              <div className="glass-card large">
                <p className="card-eyebrow">Prototype</p>
                <h3>Floating panels</h3>
                <p>
                  Layered glass surfaces that hold content without dominating the background.
                </p>
              </div>
              <div className="glass-card mini">
                <p className="card-eyebrow">Live</p>
                <p>Subtle depth, airy strokes, and calm glow.</p>
              </div>
            </div>
          </div>
        </section>

        <TokensSection announce={announce} />
        <ComponentsSection announce={announce} searchInputRef={searchInputRef} />
        <GuidelinesSection theme={theme} />
      </main>

      <footer className="footer">
        <div>Built as a reference library for design systems. No tracking, no auth.</div>
        <div className="footer-links">
          <a href="https://github.com" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <span aria-hidden="true">•</span>
          <a href="#top">Back to top</a>
        </div>
      </footer>

      <div className="toast" role="status" aria-live="polite">
        {toast}
      </div>
    </div>
  )
}

export default App
