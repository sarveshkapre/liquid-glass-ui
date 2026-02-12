# PLAN

## Product pitch
Apple-inspired “liquid glass” UI reference: design tokens + component surfaces with dark mode and accessibility guardrails.

## Features
- Token-first glass language (blur, opacity, stroke, depth, accents)
- Responsive component showcase with live preview panel
- Dark/light theme toggle with persistent preference
- A11y guardrails and reduced-motion support

## Top risks / unknowns
- Glass layers can reduce contrast as tokens evolve (needs ongoing a11y checks)
- Heavy blur/shadows can regress performance on low-end devices
- Theme + token drift (docs/examples must stay in sync)

## Commands
See `docs/PROJECT.md` for the full list. Common:
- Setup: `make setup`
- Dev: `make dev`
- Quality gate: `make check`

## Shipped (most recent first)
- 2026-02-12: Added URL-synced token-table filters (`tokenQuery`, `tokenGroup`, `tokenUsedBy`) for shareable filtered views.
- 2026-02-12: Added `size:check` JS/CSS bundle budget checks and wired them into CI.
- 2026-02-12: Playwright smoke now verifies Ctrl/Cmd+Enter description-save in token table editing.
- 2026-02-11: Token overrides now persist in browser storage and hydrate safely on reload.
- 2026-02-11: Token table editing adds keyboard guide and save/cancel shortcuts (Enter/Escape/Ctrl+Enter).
- 2026-02-11: Token import dialog was extracted into `TokenImportDialog` with a schema link.
- 2026-02-11: Footer GitHub link now points to the repository URL.
- 2026-02-09: CodeQL workflow upgraded to `github/codeql-action@v4` before v3 deprecation.
- 2026-02-08: Token table adds a live edits footer (override count + undo/redo depth).
- 2026-02-08: Token override history is now bounded with deterministic undo/redo snapshots.
- 2026-02-08: CI and project runtime baseline aligned to Node.js `20.19.0` / `>=20.19`.
- 2026-02-01: Token table supports `Ctrl/Cmd+Z` undo and `Ctrl/Cmd+Shift+Z` redo.
- 2026-02-01: Redo support for token edits (multi-step).
- 2026-02-01: Undo for token edits (one-step history).
- 2026-02-01: Import UX now includes inline validation and a schema hint.
- 2026-02-01: Drag-and-drop / file picker support for importing edits JSON.
- 2026-02-01: Import token edits JSON to rehydrate local overrides.
- 2026-02-01: Export local token edits as JSON (shareable overrides).
- 2026-02-01: Token table supports copy-row + local inline edits (with reset).
- 2026-02-01: Copy JSON actions for tokens (cards + table).
- 2026-02-01: Token table adds group filtering and CSV export.
- 2026-02-01: Token table view with search + “used by” filtering.
- 2026-02-01: Token cards show “Used by” chips sourced from tokens metadata.
- 2026-02-01: Contrast helper widget for quick WCAG checks on token pairs.
- 2026-02-01: Motion toggle (reduced/full) plus reduced-motion hover behavior (no lift).
- 2026-02-01: Keyboard demo — focus the preview search with `/` or `Ctrl+K`.
- 2026-02-01: Keyboard UX polish (skip link + focus-visible rings) and component usage snippets.
- 2026-02-01: Component cards include copyable usage snippets.
- 2026-02-01: Export core tokens as downloadable `tokens.json` + `tokens.css`.
- 2026-02-01: Copy-to-clipboard for tokens (value + CSS snippet) with a11y-safe toast feedback.
- 2026-02-01: Baseline landing page with tokens, components, a11y notes, theme toggle, and tests.

## Next
- Split `src/sections/TokensSection.tsx` table rows/actions into smaller components.
- Expand Playwright coverage for reduced-transparency/motion toggles.
