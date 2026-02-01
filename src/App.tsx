import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import tokenData from './tokens.json'

type Theme = 'light' | 'dark'
type Motion = 'full' | 'reduced'

type TokenItem = {
  name: string
  value: string
  description: string
  usedBy?: string[]
}

type ComponentItem = {
  title: string
  description: string
  tag: string
  snippet: string
}

const baseTokens = tokenData as TokenItem[]

const components: ComponentItem[] = [
  {
    title: 'Float Card',
    description: 'Content container with liquid depth + hover lift.',
    tag: 'CARD',
    snippet: `<div class="glass-card">
  <p class="card-eyebrow">Prototype</p>
  <h3>Floating panels</h3>
  <p>Layered glass surfaces that hold content.</p>
</div>`,
  },
  {
    title: 'Iced Button',
    description: 'Primary CTA with glow and frosted fill.',
    tag: 'BUTTON',
    snippet: `<button class="glass-button" type="button">
  Iced Button
</button>`,
  },
  {
    title: 'Halo Input',
    description: 'Form field with subtle inner glow.',
    tag: 'INPUT',
    snippet: `<label class="glass-input">
  <span class="sr-only">Search styles</span>
  <input type="text" placeholder="Search styles" />
</label>`,
  },
  {
    title: 'Context Pill',
    description: 'Status pill for tags and filters.',
    tag: 'PILL',
    snippet: `<span class="glass-pill">Blur 24</span>`,
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

function toTokenJson(token: TokenItem) {
  return `${JSON.stringify(token, null, 2)}\n`
}

function toTokenRowText(token: TokenItem) {
  const usedBy = (token.usedBy ?? []).join('; ')
  return `${token.name}\t${token.value}\t${token.description}\t${usedBy}\n`
}

type TokenEditsFile = {
  version?: unknown
  overrides?: unknown
}

type ImportEditsResult = {
  overrides: Record<string, Partial<TokenItem>>
  ignoredCount: number
  errors: string[]
}

function parseTokenEditsJson(jsonText: string, allowedTokenNames: Set<string>): ImportEditsResult {
  const trimmed = jsonText.trim()
  if (!trimmed) {
    return { overrides: {}, ignoredCount: 0, errors: ['Paste edits JSON to import.'] }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
  } catch {
    return { overrides: {}, ignoredCount: 0, errors: ['Invalid JSON.'] }
  }

  if (!parsed || typeof parsed !== 'object') {
    return { overrides: {}, ignoredCount: 0, errors: ['Invalid edits JSON.'] }
  }

  const { overrides } = parsed as TokenEditsFile
  if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides)) {
    return { overrides: {}, ignoredCount: 0, errors: ['Missing "overrides" object.'] }
  }

  const nextOverrides: Record<string, Partial<TokenItem>> = {}
  let ignoredCount = 0

  for (const [name, override] of Object.entries(overrides as Record<string, unknown>)) {
    if (!allowedTokenNames.has(name)) {
      ignoredCount += 1
      continue
    }
    if (!override || typeof override !== 'object' || Array.isArray(override)) {
      ignoredCount += 1
      continue
    }

    const candidate = override as Partial<TokenItem>
    const cleaned: Partial<TokenItem> = {}

    if (typeof candidate.value === 'string') cleaned.value = candidate.value
    if (typeof candidate.description === 'string') cleaned.description = candidate.description
    if (
      Array.isArray(candidate.usedBy) &&
      candidate.usedBy.every((entry) => typeof entry === 'string' && entry.trim().length > 0)
    ) {
      cleaned.usedBy = candidate.usedBy
    }

    if (Object.keys(cleaned).length > 0) {
      nextOverrides[name] = cleaned
    } else {
      ignoredCount += 1
    }
  }

  const errors: string[] = []
  if (Object.keys(nextOverrides).length === 0) {
    errors.push('No valid overrides found.')
  }

  return { overrides: nextOverrides, ignoredCount, errors }
}

type Rgba = { r: number; g: number; b: number; a: number }

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value))
}

function parseHexColor(input: string): Rgba | null {
  const hex = input.replace('#', '').trim()
  if (hex.length === 3) {
    const r = Number.parseInt(hex[0] + hex[0], 16)
    const g = Number.parseInt(hex[1] + hex[1], 16)
    const b = Number.parseInt(hex[2] + hex[2], 16)
    return { r, g, b, a: 1 }
  }
  if (hex.length === 6) {
    const r = Number.parseInt(hex.slice(0, 2), 16)
    const g = Number.parseInt(hex.slice(2, 4), 16)
    const b = Number.parseInt(hex.slice(4, 6), 16)
    return { r, g, b, a: 1 }
  }
  return null
}

function parseRgbColor(input: string): Rgba | null {
  const match = input
    .trim()
    .match(/^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*([0-9.]+)\s*)?\)$/i)
  if (!match) return null
  const r = Number(match[1])
  const g = Number(match[2])
  const b = Number(match[3])
  const a = match[4] === undefined ? 1 : clamp01(Number(match[4]))
  if (![r, g, b, a].every((n) => Number.isFinite(n))) return null
  return { r, g, b, a }
}

function parseColor(input: string): Rgba | null {
  if (input.trim().startsWith('#')) return parseHexColor(input)
  if (input.trim().startsWith('rgb')) return parseRgbColor(input)
  return null
}

function compositeOver(base: Rgba, overlay: Rgba): Rgba {
  const a = overlay.a + base.a * (1 - overlay.a)
  if (a <= 0) return { r: 0, g: 0, b: 0, a: 0 }
  const r = (overlay.r * overlay.a + base.r * base.a * (1 - overlay.a)) / a
  const g = (overlay.g * overlay.a + base.g * base.a * (1 - overlay.a)) / a
  const b = (overlay.b * overlay.a + base.b * base.a * (1 - overlay.a)) / a
  return { r, g, b, a }
}

function srgbToLinear(c: number) {
  const v = c / 255
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

function relativeLuminance(color: Rgba) {
  const r = srgbToLinear(color.r)
  const g = srgbToLinear(color.g)
  const b = srgbToLinear(color.b)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(fg: Rgba, bg: Rgba) {
  const l1 = relativeLuminance(fg)
  const l2 = relativeLuminance(bg)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
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

function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [motion, setMotion] = useState<Motion>(getInitialMotion)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const [contrastFg, setContrastFg] = useState('text')
  const [contrastBg, setContrastBg] = useState('glass-bg-soft')
  const [tokenQuery, setTokenQuery] = useState('')
  const [tokenUsedBy, setTokenUsedBy] = useState('all')
  const [tokenGroup, setTokenGroup] = useState('all')
  const [tokenOverrides, setTokenOverrides] = useState<Record<string, Partial<TokenItem>>>({})
  const [editingTokenName, setEditingTokenName] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editUsedBy, setEditUsedBy] = useState('')
  const [importOpen, setImportOpen] = useState(false)
  const [importJson, setImportJson] = useState('')
  const [isImportDragActive, setIsImportDragActive] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('lg-theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.dataset.motion = motion
    window.localStorage.setItem('lg-motion', motion)
  }, [motion])

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

      if (
        (event.ctrlKey || event.metaKey) &&
        !event.altKey &&
        event.key.toLowerCase() === 'k'
      ) {
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
    () =>
      motion === 'reduced'
        ? 'Switch to full motion'
        : 'Switch to reduced motion',
    [motion],
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

  const tokens = useMemo(() => {
    return baseTokens.map((token) => {
      const override = tokenOverrides[token.name]
      return override ? { ...token, ...override } : token
    })
  }, [tokenOverrides])

  const contrastOptions = useMemo(() => {
    const baseDefaults =
      theme === 'light'
        ? {
            bgSolid: '#e9f1f7',
            text: '#1d2936',
            textMuted: '#5f6c7d',
            accent: '#2666ff',
            accentContrast: '#f6f7ff',
            glassBg: 'rgba(255, 255, 255, 0.6)',
            glassBgSoft: 'rgba(255, 255, 255, 0.75)',
          }
        : {
            bgSolid: '#0b111a',
            text: '#f4f8fb',
            textMuted: '#b3c1d3',
            accent: '#7ee5ff',
            accentContrast: '#071722',
            glassBg: 'rgba(255, 255, 255, 0.08)',
            glassBgSoft: 'rgba(255, 255, 255, 0.12)',
          }

    const cssVar = (name: string, fallback: string) => {
      try {
        const value = window
          .getComputedStyle(document.documentElement)
          .getPropertyValue(name)
          .trim()
        return value || fallback
      } catch {
        return fallback
      }
    }

    const bgSolid = cssVar('--bg-solid', baseDefaults.bgSolid)
    const options = [
      { id: 'text', label: 'Text', value: cssVar('--text', baseDefaults.text) },
      {
        id: 'text-muted',
        label: 'Text muted',
        value: cssVar('--text-muted', baseDefaults.textMuted),
      },
      { id: 'accent', label: 'Accent', value: cssVar('--accent', baseDefaults.accent) },
      {
        id: 'accent-contrast',
        label: 'Accent contrast',
        value: cssVar('--accent-contrast', baseDefaults.accentContrast),
      },
      { id: 'glass-bg', label: 'Glass BG', value: cssVar('--glass-bg', baseDefaults.glassBg) },
      {
        id: 'glass-bg-soft',
        label: 'Glass BG soft',
        value: cssVar('--glass-bg-soft', baseDefaults.glassBgSoft),
      },
      { id: 'accent-aqua', label: 'Token accent.aqua', value: '#7ee5ff' },
      { id: 'accent-coral', label: 'Token accent.coral', value: '#ff9f7a' },
      { id: 'bg-solid', label: 'BG solid', value: bgSolid },
    ]

    return { bgSolid, options }
  }, [theme])

  const contrastResult = useMemo(() => {
    const bgSolidParsed = parseColor(contrastOptions.bgSolid)
    if (!bgSolidParsed) return null

    const get = (id: string) =>
      contrastOptions.options.find((option) => option.id === id)?.value

    const fgRaw = get(contrastFg)
    const bgRaw = get(contrastBg)
    if (!fgRaw || !bgRaw) return null

    const fgParsed = parseColor(fgRaw)
    const bgParsed = parseColor(bgRaw)
    if (!fgParsed || !bgParsed) return null

    const fg = fgParsed.a < 1 ? compositeOver(bgSolidParsed, fgParsed) : fgParsed
    const bg = bgParsed.a < 1 ? compositeOver(bgSolidParsed, bgParsed) : bgParsed
    const ratio = contrastRatio(fg, bg)

    return {
      ratio,
      ratioLabel: `${ratio.toFixed(2)}:1`,
      normalAA: ratio >= 4.5,
      normalAAA: ratio >= 7,
      largeAA: ratio >= 3,
      largeAAA: ratio >= 4.5,
      fgRaw,
      bgRaw,
    }
  }, [contrastBg, contrastFg, contrastOptions])

  const tokenUsedByOptions = useMemo(() => {
    const entries = tokens.flatMap((token) => token.usedBy ?? [])
    return Array.from(new Set(entries)).sort((a, b) => a.localeCompare(b))
  }, [tokens])

  const filteredTokens = useMemo(() => {
    const normalizedQuery = tokenQuery.trim().toLowerCase()
    return tokens.filter((token) => {
      const group = token.name.split('.')[0] ?? ''
      const matchesGroup = tokenGroup === 'all' || group === tokenGroup
      const matchesUsedBy =
        tokenUsedBy === 'all' || (token.usedBy ?? []).includes(tokenUsedBy)

      if (!matchesGroup || !matchesUsedBy) return false
      if (!normalizedQuery) return true

      const haystack = [
        token.name,
        token.value,
        token.description,
        ...(token.usedBy ?? []),
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalizedQuery)
    })
  }, [tokenGroup, tokenQuery, tokenUsedBy, tokens])

  const tokenGroupOptions = useMemo(() => {
    const groups = tokens
      .map((token) => token.name.split('.')[0] ?? '')
      .filter((group) => group.length > 0)
    return Array.from(new Set(groups)).sort((a, b) => a.localeCompare(b))
  }, [tokens])

  const downloadTokenCsv = async () => {
    const rows = filteredTokens.map((token) => ({
      name: token.name,
      value: token.value,
      description: token.description,
      usedBy: (token.usedBy ?? []).join('; '),
    }))

    const escape = (value: string) => `"${value.replaceAll('"', '""')}"`
    const header = ['name', 'value', 'description', 'usedBy'].join(',')
    const lines = rows.map((row) =>
      [row.name, row.value, row.description, row.usedBy].map(escape).join(','),
    )
    const csv = `${header}\n${lines.join('\n')}\n`

    try {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'liquid-glass-tokens.csv'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 1000)
      announce('Downloaded token CSV')
    } catch {
      await copyToClipboard(csv)
      announce('Copied token CSV')
    }
  }

  const downloadTokenEdits = async () => {
    const payload = {
      version: 1,
      generatedAt: new Date().toISOString(),
      overrides: tokenOverrides,
    }

    const json = `${JSON.stringify(payload, null, 2)}\n`

    try {
      const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'liquid-glass-token-edits.json'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 1000)
      announce('Downloaded token edits JSON')
    } catch {
      await copyToClipboard(json)
      announce('Copied token edits JSON')
    }
  }

  const importPreview = useMemo(() => {
    const allowed = new Set(baseTokens.map((token) => token.name))
    return parseTokenEditsJson(importJson, allowed)
  }, [importJson])

  const importTokenEdits = (result: ImportEditsResult) => {
    if (result.errors.length > 0) {
      announce(result.errors[0] ?? 'Invalid edits JSON')
      return
    }
    setTokenOverrides((current) => ({ ...current, ...result.overrides }))
    setEditingTokenName(null)
    announce(`Imported ${Object.keys(result.overrides).length} token edits`)
    setImportOpen(false)
  }

  const loadImportFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.json')) {
      announce('Import expects a .json file')
      return
    }
    if (file.size > 250_000) {
      announce('Import file is too large')
      return
    }
    try {
      let text = ''
      if (typeof file.text === 'function') {
        text = await file.text()
      }
      if (!text || text === '[object File]') {
        text = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result ?? ''))
          reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'))
          reader.readAsText(file)
        })
      }
      setImportJson(text)
      announce('Loaded edits JSON')
    } catch {
      announce('Failed to read file')
    }
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
            onClick={() =>
              setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
            }
          >
            {theme === 'dark' ? 'Dark' : 'Light'}
          </button>
          <button
            className="theme-toggle"
            type="button"
            aria-pressed={motion === 'reduced'}
            aria-label={toggleMotionLabel}
            onClick={() =>
              setMotion((current) => (current === 'reduced' ? 'full' : 'reduced'))
            }
          >
            {motion === 'reduced' ? 'Reduced' : 'Motion'}
          </button>
        </nav>
      </header>

      <main id="main">
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
            <div className="section-links" aria-label="Token downloads">
              <a href="/tokens.json">Download JSON</a>
              <span aria-hidden="true">•</span>
              <a href="/tokens.css">Download CSS</a>
            </div>
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
                      try {
                        await copyToClipboard(token.value)
                        announce(`Copied ${token.name} value`)
                      } catch {
                        announce('Copy failed. Please try again.')
                      }
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
                      try {
                        await copyToClipboard(css)
                        announce(`Copied ${token.name} CSS`)
                      } catch {
                        announce('Copy failed. Please try again.')
                      }
                    }}
                  >
                    Copy CSS
                  </button>
                  <button
                    className="token-copy subtle"
                    type="button"
                    aria-label={`Copy JSON for ${token.name}`}
                    onClick={async () => {
                      try {
                        await copyToClipboard(toTokenJson(token))
                        announce(`Copied ${token.name} JSON`)
                      } catch {
                        announce('Copy failed. Please try again.')
                      }
                    }}
                  >
                    Copy JSON
                  </button>
                </div>
                <p className="token-description">{token.description}</p>
                {token.usedBy && token.usedBy.length > 0 ? (
                  <div className="token-usedby" aria-label={`Used by for ${token.name}`}>
                    <span className="token-usedby-label">Used by</span>
                    <div className="token-usedby-pills">
                      {token.usedBy.map((item) => (
                        <span className="glass-pill" key={item}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </article>
            ))}
          </div>

          <details className="token-table" open>
            <summary>Token table</summary>
            <div className="token-table-body">
              <div className="token-table-controls">
                <label className="token-table-field">
                  <span>Search</span>
                  <input
                    type="search"
                    value={tokenQuery}
                    onChange={(e) => setTokenQuery(e.target.value)}
                    placeholder="Search tokens, values, or descriptions"
                    aria-label="Search tokens"
                  />
                </label>
                <label className="token-table-field">
                  <span>Group</span>
                  <select
                    value={tokenGroup}
                    onChange={(e) => setTokenGroup(e.target.value)}
                    aria-label="Filter tokens by group"
                  >
                    <option value="all">All</option>
                    {tokenGroupOptions.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="token-table-field">
                  <span>Used by</span>
                  <select
                    value={tokenUsedBy}
                    onChange={(e) => setTokenUsedBy(e.target.value)}
                    aria-label="Filter tokens by usage"
                  >
                    <option value="all">All</option>
                    {tokenUsedByOptions.map((entry) => (
                      <option key={entry} value={entry}>
                        {entry}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="token-table-meta">
                <div role="status" aria-live="polite">
                  Showing {filteredTokens.length} of {tokens.length}
                </div>
                <div className="token-table-meta-actions">
                  {Object.keys(tokenOverrides).length > 0 ? (
                    <>
                      <button
                        className="token-copy token-copy--sm subtle"
                        type="button"
                        onClick={() => void downloadTokenEdits()}
                        aria-label="Export local token edits as JSON"
                      >
                        Export edits
                      </button>
                      <button
                        className="token-copy token-copy--sm subtle"
                        type="button"
                        onClick={() => {
                          setTokenOverrides({})
                          setEditingTokenName(null)
                          announce('Reset local token edits')
                        }}
                        aria-label="Reset local token edits"
                      >
                        Reset edits
                      </button>
                    </>
                  ) : null}
                  <button
                    className="token-copy token-copy--sm subtle"
                    type="button"
                    onClick={() => setImportOpen(true)}
                    aria-label="Import token edits JSON"
                  >
                    Import edits
                  </button>
                  <button
                    className="token-copy token-copy--sm"
                    type="button"
                    onClick={() => void downloadTokenCsv()}
                    aria-label="Download filtered tokens as CSV"
                  >
                    Export CSV
                  </button>
                </div>
              </div>
              <div className="token-table-note">
                Local edits only (not saved, not exported to `public/tokens.json`).
              </div>
              {importOpen ? (
                <div
                  className={`token-import ${isImportDragActive ? 'token-import--active' : ''}`}
                  role="dialog"
                  aria-label="Import token edits"
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsImportDragActive(true)
                  }}
                  onDragLeave={() => setIsImportDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setIsImportDragActive(false)
                    const [file] = Array.from(e.dataTransfer.files)
                    if (file) {
                      void loadImportFile(file)
                    }
                  }}
                >
                  <div className="token-import-header">
                    <div className="token-import-title">Import edits</div>
                    <button
                      className="token-copy token-copy--sm subtle"
                      type="button"
                      onClick={() => setImportOpen(false)}
                      aria-label="Close import dialog"
                    >
                      Close
                    </button>
                  </div>
                  <div className="token-import-hint">
                    Drop a <code>.json</code> file here or paste below.
                    <label className="token-import-file">
                      <span className="sr-only">Choose edits JSON file</span>
                      <input
                        type="file"
                        accept="application/json,.json"
                        onChange={(e) => {
                          const [file] = Array.from(e.target.files ?? [])
                          if (file) {
                            void loadImportFile(file)
                          }
                          e.currentTarget.value = ''
                        }}
                      />
                      Choose file
                    </label>
                  </div>
                  <div className="token-import-format" aria-label="Edits JSON format">
                    Format:{' '}
                    <code>
                      {'{ version: 1, overrides: { [tokenName]: { value?, description?, usedBy? } } }'}
                    </code>
                  </div>
                  <textarea
                    className="token-table-textarea"
                    value={importJson}
                    onChange={(e) => setImportJson(e.target.value)}
                    placeholder="Paste liquid-glass-token-edits.json contents here"
                    aria-label="Edits JSON"
                  />
                  {importPreview.errors.length > 0 ? (
                    <div className="token-import-errors" role="alert">
                      {importPreview.errors.map((error) => (
                        <div key={error}>{error}</div>
                      ))}
                    </div>
                  ) : (
                    <div className="token-import-summary" role="status" aria-live="polite">
                      Ready to import {Object.keys(importPreview.overrides).length} edits
                      {importPreview.ignoredCount > 0
                        ? ` (ignored ${importPreview.ignoredCount})`
                        : ''}
                      .
                    </div>
                  )}
                  <div className="token-import-actions">
                    <button
                      className="token-copy token-copy--sm"
                      type="button"
                      onClick={() => importTokenEdits(importPreview)}
                      aria-label="Apply imported edits"
                      disabled={importPreview.errors.length > 0}
                    >
                      Apply
                    </button>
                    <button
                      className="token-copy token-copy--sm subtle"
                      type="button"
                      onClick={() => {
                        setImportJson('')
                        setImportOpen(false)
                      }}
                      aria-label="Cancel import"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="token-table-scroll">
                <table aria-label="Token table">
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Value</th>
                      <th scope="col">Description</th>
                      <th scope="col">Used by</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTokens.map((token) => (
                      <tr key={token.name}>
                        <th scope="row">{token.name}</th>
                        <td className="mono">
                          {editingTokenName === token.name ? (
                            <input
                              className="token-table-input"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              aria-label={`Edit value for ${token.name}`}
                            />
                          ) : (
                            token.value
                          )}
                        </td>
                        <td>
                          {editingTokenName === token.name ? (
                            <div className="token-table-edit">
                              <textarea
                                className="token-table-textarea"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                aria-label={`Edit description for ${token.name}`}
                              />
                            </div>
                          ) : (
                            token.description
                          )}
                        </td>
                        <td>
                          {editingTokenName === token.name ? (
                            <input
                              className="token-table-input"
                              value={editUsedBy}
                              onChange={(e) => setEditUsedBy(e.target.value)}
                              aria-label={`Edit used by for ${token.name}`}
                              placeholder="Comma-separated"
                            />
                          ) : token.usedBy && token.usedBy.length > 0 ? (
                            <div className="token-table-usedby-pills">
                              {token.usedBy.map((item) => (
                                <span className="glass-pill" key={item}>
                                  {item}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="token-table-empty">—</span>
                          )}
                        </td>
                        <td className="token-table-actions">
                          <button
                            className="token-copy token-copy--sm"
                            type="button"
                            aria-label={`Copy value for ${token.name} (table)`}
                            onClick={async () => {
                              try {
                                await copyToClipboard(token.value)
                                announce(`Copied ${token.name} value`)
                              } catch {
                                announce('Copy failed. Please try again.')
                              }
                            }}
                          >
                            Copy value
                          </button>
                          <button
                            className="token-copy token-copy--sm subtle"
                            type="button"
                            aria-label={`Copy CSS snippet for ${token.name} (table)`}
                            onClick={async () => {
                              const css = `${toCssVarName(token.name)}: ${token.value};`
                              try {
                                await copyToClipboard(css)
                                announce(`Copied ${token.name} CSS`)
                              } catch {
                                announce('Copy failed. Please try again.')
                              }
                            }}
                          >
                            Copy CSS
                          </button>
                          <button
                            className="token-copy token-copy--sm subtle"
                            type="button"
                            aria-label={`Copy JSON for ${token.name} (table)`}
                            onClick={async () => {
                              try {
                                await copyToClipboard(toTokenJson(token))
                                announce(`Copied ${token.name} JSON`)
                              } catch {
                                announce('Copy failed. Please try again.')
                              }
                            }}
                          >
                            Copy JSON
                          </button>
                          <button
                            className="token-copy token-copy--sm subtle"
                            type="button"
                            aria-label={`Copy row for ${token.name} (table)`}
                            onClick={async () => {
                              try {
                                await copyToClipboard(toTokenRowText(token))
                                announce(`Copied ${token.name} row`)
                              } catch {
                                announce('Copy failed. Please try again.')
                              }
                            }}
                          >
                            Copy row
                          </button>
                          {editingTokenName === token.name ? (
                            <>
                              <button
                                className="token-copy token-copy--sm"
                                type="button"
                                aria-label={`Save edits for ${token.name}`}
                                onClick={() => {
                                  const usedBy = editUsedBy
                                    .split(',')
                                    .map((entry) => entry.trim())
                                    .filter((entry) => entry.length > 0)
                                  setTokenOverrides((current) => ({
                                    ...current,
                                    [token.name]: {
                                      value: editValue,
                                      description: editDescription,
                                      usedBy: usedBy.length > 0 ? usedBy : undefined,
                                    },
                                  }))
                                  setEditingTokenName(null)
                                  announce(`Saved local edits for ${token.name}`)
                                }}
                              >
                                Save
                              </button>
                              <button
                                className="token-copy token-copy--sm subtle"
                                type="button"
                                aria-label={`Cancel edits for ${token.name}`}
                                onClick={() => setEditingTokenName(null)}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              className="token-copy token-copy--sm subtle"
                              type="button"
                              aria-label={`Edit ${token.name} (table)`}
                              onClick={() => {
                                setEditingTokenName(token.name)
                                setEditValue(token.value)
                                setEditDescription(token.description)
                                setEditUsedBy((token.usedBy ?? []).join(', '))
                              }}
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </details>
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
                <details className="snippet">
                  <summary>Usage</summary>
                  <div className="snippet-body">
                    <button
                      className="token-copy snippet-copy"
                      type="button"
                      aria-label={`Copy snippet for ${component.title}`}
                      onClick={async () => {
                        try {
                          await copyToClipboard(component.snippet)
                          announce(`Copied ${component.title} snippet`)
                        } catch {
                          announce('Copy failed. Please try again.')
                        }
                      }}
                    >
                      Copy snippet
                    </button>
                    <pre className="snippet-code">
                      <code>{component.snippet}</code>
                    </pre>
                  </div>
                </details>
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
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search styles"
                    aria-describedby="search-shortcuts"
                    aria-keyshortcuts="Control+K Slash"
                  />
                </label>
                <div className="demo-hint" id="search-shortcuts">
                  Shortcut: <kbd>/</kbd> or <kbd>Ctrl</kbd>+<kbd>K</kbd>
                </div>
                <button
                  className="glass-button ghost"
                  type="button"
                  onClick={() => searchInputRef.current?.focus()}
                >
                  Jump to search
                </button>
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
          <div className="glass-card contrast">
            <div className="contrast-header">
              <h3>Contrast helper</h3>
              <p className="contrast-subtitle">
                Quick WCAG contrast check for common foreground/background pairs.
              </p>
            </div>
            <div className="contrast-controls">
              <label className="contrast-field">
                <span>Foreground</span>
                <select value={contrastFg} onChange={(e) => setContrastFg(e.target.value)}>
                  {contrastOptions.options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="contrast-field">
                <span>Background</span>
                <select value={contrastBg} onChange={(e) => setContrastBg(e.target.value)}>
                  {contrastOptions.options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="contrast-preview">
              <div
                className="contrast-swatch"
                style={{ background: contrastResult?.bgRaw, color: contrastResult?.fgRaw }}
              >
                <div className="contrast-swatch-title">Aa</div>
                <div className="contrast-swatch-body">Preview text on selected background.</div>
              </div>
              <div className="contrast-metrics" role="status" aria-live="polite">
                <div className="contrast-ratio">
                  <span className="contrast-label">Ratio</span>
                  <span className="contrast-value">
                    {contrastResult ? contrastResult.ratioLabel : 'Unsupported'}
                  </span>
                </div>
                <div className="contrast-badges">
                  <span className={contrastResult?.normalAA ? 'badge ok' : 'badge'}>
                    AA (normal)
                  </span>
                  <span className={contrastResult?.normalAAA ? 'badge ok' : 'badge'}>
                    AAA (normal)
                  </span>
                  <span className={contrastResult?.largeAA ? 'badge ok' : 'badge'}>
                    AA (large)
                  </span>
                  <span className={contrastResult?.largeAAA ? 'badge ok' : 'badge'}>
                    AAA (large)
                  </span>
                </div>
              </div>
            </div>
            <p className="contrast-footnote">
              Notes: Transparent colors are composited over <code>--bg-solid</code> for a quick
              estimate. Always verify against your actual layout.
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
