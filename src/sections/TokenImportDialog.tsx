import type { ImportEditsResult } from '../utils/tokenEdits'

type Props = {
  isOpen: boolean
  importJson: string
  isDragActive: boolean
  importPreview: ImportEditsResult
  onApply: () => void
  onCancel: () => void
  onClose: () => void
  onDragActiveChange: (next: boolean) => void
  onFileSelected: (file: File) => void
  onImportJsonChange: (next: string) => void
}

function TokenImportDialog({
  isOpen,
  importJson,
  isDragActive,
  importPreview,
  onApply,
  onCancel,
  onClose,
  onDragActiveChange,
  onFileSelected,
  onImportJsonChange,
}: Props) {
  if (!isOpen) {
    return null
  }

  return (
    <div
      className={`token-import ${isDragActive ? 'token-import--active' : ''}`}
      role="dialog"
      aria-label="Import token edits"
      onDragOver={(event) => {
        event.preventDefault()
        onDragActiveChange(true)
      }}
      onDragLeave={() => onDragActiveChange(false)}
      onDrop={(event) => {
        event.preventDefault()
        onDragActiveChange(false)
        const [file] = Array.from(event.dataTransfer.files)
        if (file) {
          onFileSelected(file)
        }
      }}
    >
      <div className="token-import-header">
        <div className="token-import-title">Import edits</div>
        <button
          className="token-copy token-copy--sm subtle"
          type="button"
          onClick={onClose}
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
            onChange={(event) => {
              const [file] = Array.from(event.target.files ?? [])
              if (file) {
                onFileSelected(file)
              }
              event.currentTarget.value = ''
            }}
          />
          Choose file
        </label>
      </div>
      <div className="token-import-format" aria-label="Edits JSON format">
        Format:{' '}
        <code>{'{ version: 1, overrides: { [tokenName]: { value?, description?, usedBy? } } }'}</code>
      </div>
      <div className="token-import-format">
        Schema:{' '}
        <a href="/schemas/liquid-glass-token-edits.v1.schema.json">
          liquid-glass-token-edits.v1.schema.json
        </a>
      </div>
      <textarea
        className="token-table-textarea"
        value={importJson}
        onChange={(event) => onImportJsonChange(event.target.value)}
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
          {importPreview.ignoredCount > 0 ? ` (ignored ${importPreview.ignoredCount})` : ''}.
        </div>
      )}
      <div className="token-import-actions">
        <button
          className="token-copy token-copy--sm"
          type="button"
          onClick={onApply}
          aria-label="Apply imported edits"
          disabled={importPreview.errors.length > 0}
        >
          Apply
        </button>
        <button
          className="token-copy token-copy--sm subtle"
          type="button"
          onClick={onCancel}
          aria-label="Cancel import"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export { TokenImportDialog }
