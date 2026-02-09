# ROADMAP

## Next
- Add keyboard interaction demos (focus navigation + reduced-motion variants).
- Split `src/App.tsx` view sections into smaller components after hook/util extraction.
- Expand Playwright coverage for drag-and-drop import and keyboard shortcut paths.

## Shipped
- Playwright smoke test now covers token edit, undo/redo, import, and export flows.
- CI now runs Node matrix checks (`20.19.0`, `22.x`) and a dedicated Playwright UI smoke job.
- Extracted token override history logic into `src/hooks/useTokenOverrides.ts`.
- Extracted contrast parsing/compositing math into `src/utils/contrast.ts` with unit tests.
- CodeQL workflow upgraded to `github/codeql-action@v4` ahead of v3 deprecation.
- Token table now shows edits status (override count + undo/redo depth).
- Token edit history is now bounded and uses deterministic undo/redo snapshots.
- CI Node runtime now targets `20.19.0`; project baseline is `>=20.19`.
- Exported core tokens as downloadable JSON and CSS files.
- Component usage snippets with copy-to-clipboard.
- Keyboard UX polish: skip link + focus-visible rings.
- Keyboard demo: focus preview search with `/` or `Ctrl+K`.
- Motion: reduced/full toggle and reduced-motion hover behavior.
- A11y: in-app contrast helper for quick WCAG checks.
- Tokens: “Used by” chips on token cards.
- Tokens: token table view with search and filtering.
- Tokens: group filtering and CSV export.
- Tokens: copy-row and local inline edits in the token table.
- Tokens: exported local token edits as JSON.
- Tokens: imported local token edits from JSON.
- Tokens: drag-and-drop + file picker import for edits JSON.
- Tokens: inline validation and schema hint for edits import.
- Tokens: undo support for local edits/imports.
- Tokens: redo support for local edits/imports.
- Tokens: keyboard shortcuts for undo/redo in the token table.
