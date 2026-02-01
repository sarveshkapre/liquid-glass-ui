# CHANGELOG

## Unreleased
- Initial Liquid Glass UI landing page with tokens, components, and a11y notes.
- Token cards now support copy-to-clipboard (value + CSS snippet) with toast feedback.
- Export core tokens as downloadable `tokens.json` and `tokens.css`.
- Component cards include copyable usage snippets.
- Keyboard UX polish: skip-to-content link + consistent focus-visible rings.
- Keyboard demo: focus the preview search input with `/` or `Ctrl+K`.
- Motion: toggle reduced/full motion; reduced motion removes hover “lift”.
- Added an in-app contrast helper for quick WCAG checks on common token pairs.
- Token cards now show “Used by” chips to keep examples and tokens in sync.
- Added a token table view with search and “used by” filtering.
- Token table now supports group filtering and CSV export.
- Token cards/table now support “Copy JSON”.
- Token table now supports “Copy row” and local inline edits (not persisted).
- Token table now supports exporting local edits as JSON.
- Token table now supports importing edits JSON.
- Import supports drag-and-drop and a file picker.
- Import dialog now includes inline validation and a schema hint.
- Token table now supports undo for local edits/imports.
- Token table now supports redo for local edits/imports.
- Token table now supports `Ctrl/Cmd+Z` undo and `Ctrl/Cmd+Shift+Z` redo shortcuts.
