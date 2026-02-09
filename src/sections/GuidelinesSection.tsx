import { useMemo, useState } from 'react'
import { compositeOver, contrastRatio, parseColor } from '../utils/contrast'

type Theme = 'light' | 'dark'

const a11yChecklist = [
  'Contrast ratio ≥ 4.5 for text on frosted layers.',
  'Reduced-motion mode swaps lifts for opacity changes.',
  'Reduced-transparency mode increases opacity and reduces blur.',
  'Keyboard focus uses a high-chroma ring.',
  'Interactive elements are at least 44px tall.',
]

type Props = {
  theme: Theme
}

function GuidelinesSection({ theme }: Props) {
  const [contrastFg, setContrastFg] = useState('text')
  const [contrastBg, setContrastBg] = useState('glass-bg-soft')

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
      { id: 'text-muted', label: 'Text muted', value: cssVar('--text-muted', baseDefaults.textMuted) },
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

    const get = (id: string) => contrastOptions.options.find((option) => option.id === id)?.value

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

  return (
    <section className="section" id="guidelines">
      <div className="section-header">
        <h2>Accessibility guardrails</h2>
        <p>Glass effects should never reduce clarity. These defaults keep text legible and interaction discoverable.</p>
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
              <span className="contrast-value">{contrastResult ? contrastResult.ratioLabel : 'Unsupported'}</span>
            </div>
            <div className="contrast-badges">
              <span className={contrastResult?.normalAA ? 'badge ok' : 'badge'}>AA (normal)</span>
              <span className={contrastResult?.normalAAA ? 'badge ok' : 'badge'}>AAA (normal)</span>
              <span className={contrastResult?.largeAA ? 'badge ok' : 'badge'}>AA (large)</span>
              <span className={contrastResult?.largeAAA ? 'badge ok' : 'badge'}>AAA (large)</span>
            </div>
          </div>
        </div>
        <p className="contrast-footnote">
          Notes: Transparent colors are composited over <code>--bg-solid</code> for a quick estimate. Always verify
          against your actual layout.
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
  )
}

export { GuidelinesSection }
