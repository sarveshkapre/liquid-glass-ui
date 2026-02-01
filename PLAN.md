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
- 2026-02-01: Keyboard UX polish (skip link + focus-visible rings) and component usage snippets.
- 2026-02-01: Component cards include copyable usage snippets.
- 2026-02-01: Export core tokens as downloadable `tokens.json` + `tokens.css`.
- 2026-02-01: Copy-to-clipboard for tokens (value + CSS snippet) with a11y-safe toast feedback.
- 2026-02-01: Baseline landing page with tokens, components, a11y notes, theme toggle, and tests.

## Next
- Add keyboard interaction demos (focus, disclosure, and reduced-motion states).
