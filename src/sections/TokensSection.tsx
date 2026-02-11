import { useMemo, useState } from 'react'
import { useTokenOverrides } from '../hooks/useTokenOverrides'
import { TokenImportDialog } from './TokenImportDialog'
import tokenData from '../tokens.json'
import { copyToClipboard } from '../utils/clipboard'
import { tryDownloadTextFile } from '../utils/download'
import type { ImportEditsResult } from '../utils/tokenEdits'
import { parseTokenEditsJson, serializeTokenEditsFileV1 } from '../utils/tokenEdits'
import { buildTokensCsv } from '../utils/tokensCsv'

type TokenItem = {
  name: string
  value: string
  description: string
  usedBy?: string[]
}

const baseTokens = tokenData as TokenItem[]
const allowedTokenNames = new Set(baseTokens.map((token) => token.name))
const tokenShortcutsGuideId = 'token-table-shortcuts-guide'

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

type Props = {
  announce: (message: string) => void
}

function TokensSection({ announce }: Props) {
  const {
    applyTokenOverrides,
    redoTokenOverride,
    tokenOverrideCount,
    tokenOverrideRedoStack,
    tokenOverrideUndoStack,
    tokenOverrides,
    undoTokenOverride,
  } = useTokenOverrides({ allowedTokenNames })

  const [tokenQuery, setTokenQuery] = useState('')
  const [tokenUsedBy, setTokenUsedBy] = useState('all')
  const [tokenGroup, setTokenGroup] = useState('all')
  const [editingTokenName, setEditingTokenName] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editUsedBy, setEditUsedBy] = useState('')
  const [importOpen, setImportOpen] = useState(false)
  const [importJson, setImportJson] = useState('')
  const [isImportDragActive, setIsImportDragActive] = useState(false)

  const tokens = useMemo(() => {
    return baseTokens.map((token) => {
      const override = tokenOverrides[token.name]
      return override ? { ...token, ...override } : token
    })
  }, [tokenOverrides])

  const handleUndoTokenOverride = () => {
    if (tokenOverrideUndoStack.length === 0) return
    undoTokenOverride()
    setEditingTokenName(null)
    announce('Undo')
  }

  const handleRedoTokenOverride = () => {
    if (tokenOverrideRedoStack.length === 0) return
    redoTokenOverride()
    setEditingTokenName(null)
    announce('Redo')
  }

  const saveTokenEdit = (tokenName: string) => {
    const usedBy = editUsedBy
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)

    applyTokenOverrides((current) => ({
      ...current,
      [tokenName]: {
        value: editValue,
        description: editDescription,
        usedBy: usedBy.length > 0 ? usedBy : undefined,
      },
    }))
    setEditingTokenName(null)
    announce(`Saved local edits for ${tokenName}`)
  }

  const cancelTokenEdit = () => {
    setEditingTokenName(null)
    announce('Canceled token edit')
  }

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
    const csv = buildTokensCsv(filteredTokens)

    if (
      tryDownloadTextFile({
        filename: 'liquid-glass-tokens.csv',
        mimeType: 'text/csv;charset=utf-8',
        text: csv,
      })
    ) {
      announce('Downloaded token CSV')
      return
    }

    await copyToClipboard(csv)
    announce('Copied token CSV')
  }

  const downloadTokenEdits = async () => {
    const json = serializeTokenEditsFileV1(tokenOverrides)

    if (
      tryDownloadTextFile({
        filename: 'liquid-glass-token-edits.json',
        mimeType: 'application/json;charset=utf-8',
        text: json,
      })
    ) {
      announce('Downloaded token edits JSON')
      return
    }

    await copyToClipboard(json)
    announce('Copied token edits JSON')
  }

  const importPreview = useMemo(() => {
    return parseTokenEditsJson(importJson, allowedTokenNames)
  }, [importJson])

  const importTokenEdits = (result: ImportEditsResult) => {
    if (result.errors.length > 0) {
      announce(result.errors[0] ?? 'Invalid edits JSON')
      return
    }
    applyTokenOverrides((current) => ({ ...current, ...result.overrides }))
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
    <section className="section" id="tokens">
      <div className="section-header">
        <h2>Core tokens</h2>
        <p>
          Build your own liquid-glass language by composing these primitives. Export as CSS
          variables, JSON, or Figma tokens.
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

      <details
        className="token-table"
        open
        onKeyDownCapture={(event) => {
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

          if (!(event.ctrlKey || event.metaKey) || event.altKey) return
          if (event.key.toLowerCase() !== 'z') return

          event.preventDefault()
          if (event.shiftKey) {
            handleRedoTokenOverride()
          } else {
            handleUndoTokenOverride()
          }
        }}
      >
        <summary aria-keyshortcuts="Control+Z Meta+Z Control+Shift+Z Meta+Shift+Z">
          Token table
        </summary>
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
              {tokenOverrideCount > 0 ? (
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
                      applyTokenOverrides(() => ({}))
                      setEditingTokenName(null)
                      announce('Reset local token edits')
                    }}
                    aria-label="Reset local token edits"
                  >
                    Reset edits
                  </button>
                </>
              ) : null}
              {tokenOverrideUndoStack.length > 0 ? (
                <button
                  className="token-copy token-copy--sm subtle"
                  type="button"
                  onClick={handleUndoTokenOverride}
                  aria-label="Undo last token edit"
                  aria-keyshortcuts="Control+Z Meta+Z"
                >
                  Undo
                </button>
              ) : null}
              {tokenOverrideRedoStack.length > 0 ? (
                <button
                  className="token-copy token-copy--sm subtle"
                  type="button"
                  onClick={handleRedoTokenOverride}
                  aria-label="Redo last token edit"
                  aria-keyshortcuts="Control+Shift+Z Meta+Shift+Z"
                >
                  Redo
                </button>
              ) : null}
              <button
                className="token-copy token-copy--sm subtle"
                type="button"
                onClick={() => {
                  setImportOpen(true)
                }}
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
          <div className="token-table-note-row">
            <div className="token-table-note">
              Local edits stay in this browser (not exported to <code>public/tokens.json</code>).
              Shortcuts: Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z redo.
            </div>
            <div className="token-table-edits-status" role="status" aria-live="polite">
              Edits status: {tokenOverrideCount} overrides | undo depth{' '}
              {tokenOverrideUndoStack.length} | redo depth {tokenOverrideRedoStack.length}
            </div>
          </div>
          <details className="token-table-shortcuts" id={tokenShortcutsGuideId}>
            <summary>Keyboard guide</summary>
            <ul>
              <li>Global table shortcuts: Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z redo.</li>
              <li>While editing value/used-by: Enter saves, Escape cancels.</li>
              <li>While editing description: Ctrl/Cmd+Enter saves, Escape cancels.</li>
            </ul>
          </details>

          <TokenImportDialog
            isOpen={importOpen}
            importJson={importJson}
            isDragActive={isImportDragActive}
            importPreview={importPreview}
            onApply={() => importTokenEdits(importPreview)}
            onCancel={() => {
              setImportJson('')
              setImportOpen(false)
              setIsImportDragActive(false)
            }}
            onClose={() => {
              setImportOpen(false)
              setIsImportDragActive(false)
            }}
            onDragActiveChange={setIsImportDragActive}
            onFileSelected={(file) => {
              void loadImportFile(file)
            }}
            onImportJsonChange={setImportJson}
          />

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
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault()
                              saveTokenEdit(token.name)
                            }
                            if (event.key === 'Escape') {
                              event.preventDefault()
                              cancelTokenEdit()
                            }
                          }}
                          aria-describedby={tokenShortcutsGuideId}
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
                            onKeyDown={(event) => {
                              if (event.key === 'Escape') {
                                event.preventDefault()
                                cancelTokenEdit()
                              }
                              if (
                                event.key === 'Enter' &&
                                (event.ctrlKey || event.metaKey)
                              ) {
                                event.preventDefault()
                                saveTokenEdit(token.name)
                              }
                            }}
                            aria-describedby={tokenShortcutsGuideId}
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
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault()
                              saveTokenEdit(token.name)
                            }
                            if (event.key === 'Escape') {
                              event.preventDefault()
                              cancelTokenEdit()
                            }
                          }}
                          aria-describedby={tokenShortcutsGuideId}
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
                            onClick={() => saveTokenEdit(token.name)}
                          >
                            Save
                          </button>
                          <button
                            className="token-copy token-copy--sm subtle"
                            type="button"
                            aria-label={`Cancel edits for ${token.name}`}
                            onClick={cancelTokenEdit}
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
  )
}

export { TokensSection }
