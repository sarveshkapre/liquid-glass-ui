import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

type Theme = 'light' | 'dark'

type TokenItem = {
  name: string
  value: string
  description: string
}

type ComponentItem = {
  title: string
  description: string
  tag: string
}

const tokens: TokenItem[] = [
  {
    name: 'glass.blur.24',
    value: 'blur(24px)',
    description: 'Backplate blur for panels and cards.',
  },
  {
    name: 'glass.opacity.65',
    value: '0.65',
    description: 'Material density for light surfaces.',
  },
  {
    name: 'glass.stroke.10',
    value: '1px solid rgba(255,255,255,0.16)',
    description: 'Hairline highlight for edge definition.',
  },
  {
    name: 'shadow.depth.40',
    value: '0 40px 80px rgba(11, 24, 35, 0.35)',
    description: 'Ambient depth in dark mode.',
  },
  {
    name: 'accent.aqua',
    value: '#7ee5ff',
    description: 'Primary action + focus highlight.',
  },
  {
    name: 'accent.coral',
    value: '#ff9f7a',
    description: 'Secondary accent for warmth.',
  },
]

const components: ComponentItem[] = [
  {
    title: 'Float Card',
    description: 'Content container with liquid depth + hover lift.',
    tag: 'CARD',
  },
  {
    title: 'Iced Button',
    description: 'Primary CTA with glow and frosted fill.',
    tag: 'BUTTON',
  },
  {
    title: 'Halo Input',
    description: 'Form field with subtle inner glow.',
    tag: 'INPUT',
  },
  {
    title: 'Context Pill',
    description: 'Status pill for tags and filters.',
    tag: 'PILL',
  },
]

const a11yChecklist = [
  'Contrast ratio ≥ 4.5 for text on frosted layers.',
  'Reduced-motion mode swaps lifts for opacity changes.',
  'Keyboard focus uses a high-chroma ring.',
  'Interactive elements are at least 44px tall.',
]

function toCssVarName(tokenName: string) {
  return `--lg-${tokenName.replaceAll('.', '-')}`
}

async function copyToClipboard(text: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', 'true')
  textarea.style.position = 'fixed'
  textarea.style.top = '-9999px'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)

  textarea.select()
  document.execCommand('copy')

  document.body.removeChild(textarea)
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'dark'
  }
  const stored = window.localStorage.getItem('lg-theme')
  if (stored === 'light' || stored === 'dark') {
    return stored
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | null>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('lg-theme', theme)
  }, [theme])

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        window.clearTimeout(toastTimer.current)
      }
    }
  }, [])

  const toggleThemeLabel = useMemo(
    () => (theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'),
    [theme],
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
            onClick={() =>
              setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
            }
          >
            {theme === 'dark' ? 'Dark' : 'Light'}
          </button>
        </nav>
      </header>

      <main>
        <section className="hero" id="top">
          <div className="hero-copy">
            <p className="eyebrow">Liquid Glass System</p>
            <h1>Design tokens + glass components inspired by Apple.</h1>
            <p className="lede">
              A reference UI kit that blends frosted depth, responsive gradients,
              and accessible interaction states. Built for modern design systems
              with a tiny footprint.
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
                  Layered glass surfaces that hold content without dominating the
                  background.
                </p>
              </div>
              <div className="glass-card mini">
                <p className="card-eyebrow">Live</p>
                <p>Subtle depth, airy strokes, and calm glow.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="tokens">
          <div className="section-header">
            <h2>Core tokens</h2>
            <p>
              Build your own liquid-glass language by composing these primitives.
              Export as CSS variables, JSON, or Figma tokens.
            </p>
          </div>
          <div className="token-grid">
            {tokens.map((token) => (
              <article className="token-card" key={token.name}>
                <div className="token-name">{token.name}</div>
                <div className="token-value">{token.value}</div>
                <div className="token-actions">
                  <button
                    className="token-copy"
                    type="button"
                    aria-label={`Copy value for ${token.name}`}
                    onClick={async () => {
                      await copyToClipboard(token.value)
                      announce(`Copied ${token.name} value`)
                    }}
                  >
                    Copy value
                  </button>
                  <button
                    className="token-copy subtle"
                    type="button"
                    aria-label={`Copy CSS snippet for ${token.name}`}
                    onClick={async () => {
                      const css = `${toCssVarName(token.name)}: ${token.value};`
                      await copyToClipboard(css)
                      announce(`Copied ${token.name} CSS`)
                    }}
                  >
                    Copy CSS
                  </button>
                </div>
                <p className="token-description">{token.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="components">
          <div className="section-header">
            <h2>Component surfaces</h2>
            <p>
              Mix and match with your design system. These components are built
              from the same token palette to stay visually consistent.
            </p>
          </div>
          <div className="component-grid">
            {components.map((component) => (
              <article className="glass-card component" key={component.title}>
                <span className="component-tag">{component.tag}</span>
                <h3>{component.title}</h3>
                <p>{component.description}</p>
                <button className="glass-button" type="button">
                  Preview style
                </button>
              </article>
            ))}
          </div>
          <div className="component-demo">
            <div className="glass-card demo-panel">
              <div>
                <p className="card-eyebrow">Live preview</p>
                <h3>Liquid Glass Console</h3>
                <p>
                  Compose buttons, input fields, and tags using the same
                  frosted-layer rules.
                </p>
              </div>
              <div className="demo-controls">
                <button className="glass-button" type="button">
                  Create panel
                </button>
                <button className="glass-button ghost" type="button">
                  Duplicate
                </button>
                <label className="glass-input">
                  <span className="sr-only">Search styles</span>
                  <input type="text" placeholder="Search styles" />
                </label>
                <div className="pill-row">
                  <span className="glass-pill">Blur 24</span>
                  <span className="glass-pill">Glow on</span>
                  <span className="glass-pill">Dark</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="guidelines">
          <div className="section-header">
            <h2>Accessibility guardrails</h2>
            <p>
              Glass effects should never reduce clarity. These defaults keep
              text legible and interaction discoverable.
            </p>
          </div>
          <div className="glass-card checklist">
            <ul>
              {a11yChecklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div>
          Built as a reference library for design systems. No tracking, no auth.
        </div>
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
