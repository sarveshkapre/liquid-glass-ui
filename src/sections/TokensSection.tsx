import { useEffect, useMemo, useState } from 'react'
import { useTokenOverrides } from '../hooks/useTokenOverrides'
import { TokenImportDialog } from './TokenImportDialog'
import { TokenTableRow } from './TokenTableRow'
import type { TokenItem } from './TokenTableRow'
import tokenData from '../tokens.json'
import { copyToClipboard } from '../utils/clipboard'
import { tryDownloadTextFile } from '../utils/download'
import type { ImportEditsResult } from '../utils/tokenEdits'
import { parseTokenEditsJson, serializeTokenEditsFileV1 } from '../utils/tokenEdits'
import { buildTokensCsv } from '../utils/tokensCsv'

const baseTokens = tokenData as TokenItem[]
const allowedTokenNames = new Set(baseTokens.map((token) => token.name))
const tokenShortcutsGuideId = 'token-table-shortcuts-guide'
const tokenQueryParamKey = 'tokenQuery'
const tokenGroupParamKey = 'tokenGroup'
const tokenUsedByParamKey = 'tokenUsedBy'

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

function readTokenTableFiltersFromUrl() {
  if (typeof window === 'undefined') {
    return { tokenQuery: '', tokenGroup: 'all', tokenUsedBy: 'all' }
  }

  const params = new URLSearchParams(window.location.search)
  return {
    tokenQuery: params.get(tokenQueryParamKey) ?? '',
    tokenGroup: params.get(tokenGroupParamKey) ?? 'all',
    tokenUsedBy: params.get(tokenUsedByParamKey) ?? 'all',
  }
}

function writeTokenTableFiltersToUrl(filters: {
  tokenQuery: string
  tokenGroup: string
  tokenUsedBy: string
}) {
  if (typeof window === 'undefined') return

  const url = new URL(window.location.href)

  if (filters.tokenQuery) {
    url.searchParams.set(tokenQueryParamKey, filters.tokenQuery)
  } else {
    url.searchParams.delete(tokenQueryParamKey)
  }

  if (filters.tokenGroup !== 'all') {
    url.searchParams.set(tokenGroupParamKey, filters.tokenGroup)
  } else {
    url.searchParams.delete(tokenGroupParamKey)
  }

  if (filters.tokenUsedBy !== 'all') {
    url.searchParams.set(tokenUsedByParamKey, filters.tokenUsedBy)
  } else {
    url.searchParams.delete(tokenUsedByParamKey)
  }

  const nextSearch = url.searchParams.toString()
  const nextPath = `${url.pathname}${nextSearch ? `?${nextSearch}` : ''}${url.hash}`
  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`
  if (nextPath !== currentPath) {
    window.history.replaceState(window.history.state, '', nextPath)
  }
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

  const initialTokenFilters = useMemo(() => readTokenTableFiltersFromUrl(), [])
  const [tokenQuery, setTokenQuery] = useState(initialTokenFilters.tokenQuery)
  const [tokenUsedBy, setTokenUsedBy] = useState(initialTokenFilters.tokenUsedBy)
  const [tokenGroup, setTokenGroup] = useState(initialTokenFilters.tokenGroup)
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

  const startTokenEdit = (token: TokenItem) => {
    setEditingTokenName(token.name)
    setEditValue(token.value)
    setEditDescription(token.description)
    setEditUsedBy((token.usedBy ?? []).join(', '))
  }

  const copyTokenValue = async (token: TokenItem) => {
    try {
      await copyToClipboard(token.value)
      announce(`Copied ${token.name} value`)
    } catch {
      announce('Copy failed. Please try again.')
    }
  }

  const copyTokenCss = async (token: TokenItem) => {
    const css = `${toCssVarName(token.name)}: ${token.value};`
    try {
      await copyToClipboard(css)
      announce(`Copied ${token.name} CSS`)
    } catch {
      announce('Copy failed. Please try again.')
    }
  }

  const copyTokenJson = async (token: TokenItem) => {
    try {
      await copyToClipboard(toTokenJson(token))
      announce(`Copied ${token.name} JSON`)
    } catch {
      announce('Copy failed. Please try again.')
    }
  }

  const copyTokenRow = async (token: TokenItem) => {
    try {
      await copyToClipboard(toTokenRowText(token))
      announce(`Copied ${token.name} row`)
    } catch {
      announce('Copy failed. Please try again.')
    }
  }

  const tokenGroupOptions = useMemo(() => {
    const groups = tokens
      .map((token) => token.name.split('.')[0] ?? '')
      .filter((group) => group.length > 0)
    return Array.from(new Set(groups)).sort((a, b) => a.localeCompare(b))
  }, [tokens])

  const tokenUsedByOptions = useMemo(() => {
    const entries = tokens.flatMap((token) => token.usedBy ?? [])
    return Array.from(new Set(entries)).sort((a, b) => a.localeCompare(b))
  }, [tokens])

  const resolvedTokenGroup =
    tokenGroup === 'all' || tokenGroupOptions.includes(tokenGroup) ? tokenGroup : 'all'
  const resolvedTokenUsedBy =
    tokenUsedBy === 'all' || tokenUsedByOptions.includes(tokenUsedBy) ? tokenUsedBy : 'all'

  useEffect(() => {
    writeTokenTableFiltersToUrl({
      tokenQuery,
      tokenGroup: resolvedTokenGroup,
      tokenUsedBy: resolvedTokenUsedBy,
    })
  }, [resolvedTokenGroup, resolvedTokenUsedBy, tokenQuery])

  const filteredTokens = useMemo(() => {
    const normalizedQuery = tokenQuery.trim().toLowerCase()
    return tokens.filter((token) => {
      const group = token.name.split('.')[0] ?? ''
      const matchesGroup = resolvedTokenGroup === 'all' || group === resolvedTokenGroup
      const matchesUsedBy =
        resolvedTokenUsedBy === 'all' || (token.usedBy ?? []).includes(resolvedTokenUsedBy)

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
  }, [resolvedTokenGroup, resolvedTokenUsedBy, tokenQuery, tokens])

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
                onClick={() => void copyTokenValue(token)}
              >
                Copy value
              </button>
              <button
                className="token-copy subtle"
                type="button"
                aria-label={`Copy CSS snippet for ${token.name}`}
                onClick={() => void copyTokenCss(token)}
              >
                Copy CSS
              </button>
              <button
                className="token-copy subtle"
                type="button"
                aria-label={`Copy JSON for ${token.name}`}
                onClick={() => void copyTokenJson(token)}
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
                value={resolvedTokenGroup}
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
                value={resolvedTokenUsedBy}
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
                  <TokenTableRow
                    key={token.name}
                    token={token}
                    isEditing={editingTokenName === token.name}
                    editValue={editValue}
                    editDescription={editDescription}
                    editUsedBy={editUsedBy}
                    tokenShortcutsGuideId={tokenShortcutsGuideId}
                    onEditValueChange={setEditValue}
                    onEditDescriptionChange={setEditDescription}
                    onEditUsedByChange={setEditUsedBy}
                    onCopyValue={() => {
                      void copyTokenValue(token)
                    }}
                    onCopyCss={() => {
                      void copyTokenCss(token)
                    }}
                    onCopyJson={() => {
                      void copyTokenJson(token)
                    }}
                    onCopyRow={() => {
                      void copyTokenRow(token)
                    }}
                    onSave={() => saveTokenEdit(token.name)}
                    onCancel={cancelTokenEdit}
                    onStartEdit={() => startTokenEdit(token)}
                  />
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
