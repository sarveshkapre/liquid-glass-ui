# PLAN

## Goal
Ship a single-page component showcase that documents Liquid Glass tokens, sample components, and accessibility guidance with dark/light mode support.

## Stack
- Vite + React + TypeScript
- CSS variables and custom classes (no UI framework)
- Vitest + Testing Library

## Architecture
- `src/App.tsx` renders all sections with small data arrays.
- `src/index.css` holds global tokens and theme variables.
- `src/App.css` holds component/layout styling.
- Theme is stored in `localStorage` and applied via `data-theme` on `html`.

## Milestones
1. Scaffold repo + docs + CI wiring.
2. Build the Liquid Glass landing page with tokens + component examples.
3. Add tests and accessibility notes.
4. Add Docker support and security workflows.

## MVP Checklist
- [x] Hero, tokens, components, and a11y sections.
- [x] Dark + light mode toggle.
- [x] Responsive layout.
- [x] Copy tokens to clipboard (value + CSS snippet) with a11y feedback.
- [x] Export core tokens as downloadable JSON/CSS files.
- [x] Component usage snippets with copy-to-clipboard.
- [x] Skip-to-content and consistent focus-visible rings.
- [x] Tests for basic rendering + theme toggle.
- [x] Docs + Makefile + CI workflows.

## Risks
- Glass backgrounds reduce contrast if token values drift.
- Excessive blur can impact performance on low-end devices.
- Motion effects can be distracting without reduced-motion handling.
