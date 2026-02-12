type TokenItem = {
  name: string
  value: string
  description: string
  usedBy?: string[]
}

type Props = {
  token: TokenItem
  isEditing: boolean
  editValue: string
  editDescription: string
  editUsedBy: string
  tokenShortcutsGuideId: string
  onEditValueChange: (value: string) => void
  onEditDescriptionChange: (value: string) => void
  onEditUsedByChange: (value: string) => void
  onCopyValue: () => void
  onCopyCss: () => void
  onCopyJson: () => void
  onCopyRow: () => void
  onSave: () => void
  onCancel: () => void
  onStartEdit: () => void
}

function TokenTableRow({
  token,
  isEditing,
  editValue,
  editDescription,
  editUsedBy,
  tokenShortcutsGuideId,
  onEditValueChange,
  onEditDescriptionChange,
  onEditUsedByChange,
  onCopyValue,
  onCopyCss,
  onCopyJson,
  onCopyRow,
  onSave,
  onCancel,
  onStartEdit,
}: Props) {
  return (
    <tr>
      <th scope="row">{token.name}</th>
      <td className="mono">
        {isEditing ? (
          <input
            className="token-table-input"
            value={editValue}
            onChange={(e) => onEditValueChange(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                onSave()
              }
              if (event.key === 'Escape') {
                event.preventDefault()
                onCancel()
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
        {isEditing ? (
          <div className="token-table-edit">
            <textarea
              className="token-table-textarea"
              value={editDescription}
              onChange={(e) => onEditDescriptionChange(e.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault()
                  onCancel()
                }
                if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                  event.preventDefault()
                  onSave()
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
        {isEditing ? (
          <input
            className="token-table-input"
            value={editUsedBy}
            onChange={(e) => onEditUsedByChange(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                onSave()
              }
              if (event.key === 'Escape') {
                event.preventDefault()
                onCancel()
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
          onClick={onCopyValue}
        >
          Copy value
        </button>
        <button
          className="token-copy token-copy--sm subtle"
          type="button"
          aria-label={`Copy CSS snippet for ${token.name} (table)`}
          onClick={onCopyCss}
        >
          Copy CSS
        </button>
        <button
          className="token-copy token-copy--sm subtle"
          type="button"
          aria-label={`Copy JSON for ${token.name} (table)`}
          onClick={onCopyJson}
        >
          Copy JSON
        </button>
        <button
          className="token-copy token-copy--sm subtle"
          type="button"
          aria-label={`Copy row for ${token.name} (table)`}
          onClick={onCopyRow}
        >
          Copy row
        </button>
        {isEditing ? (
          <>
            <button
              className="token-copy token-copy--sm"
              type="button"
              aria-label={`Save edits for ${token.name}`}
              onClick={onSave}
            >
              Save
            </button>
            <button
              className="token-copy token-copy--sm subtle"
              type="button"
              aria-label={`Cancel edits for ${token.name}`}
              onClick={onCancel}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            className="token-copy token-copy--sm subtle"
            type="button"
            aria-label={`Edit ${token.name} (table)`}
            onClick={onStartEdit}
          >
            Edit
          </button>
        )}
      </td>
    </tr>
  )
}

export { TokenTableRow }
export type { TokenItem }
