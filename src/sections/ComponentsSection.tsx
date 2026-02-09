import type { RefObject } from 'react'
import { copyToClipboard } from '../utils/clipboard'

type ComponentItem = {
  title: string
  description: string
  tag: string
  snippet: string
}

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

type Props = {
  announce: (message: string) => void
  searchInputRef: RefObject<HTMLInputElement | null>
}

function ComponentsSection({ announce, searchInputRef }: Props) {
  return (
    <section className="section" id="components">
      <div className="section-header">
        <h2>Component surfaces</h2>
        <p>
          Mix and match with your design system. These components are built from the same
          token palette to stay visually consistent.
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
            <p>Compose buttons, input fields, and tags using the same frosted-layer rules.</p>
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
  )
}

export { ComponentsSection }
