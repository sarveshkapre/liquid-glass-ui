# Liquid Glass UI

Apple-inspired glassmorphism component showcase with tokens, a11y guidance, and dark mode. Built as a lightweight reference for design systems that want frosted surfaces without losing clarity.

## Features
- Token-first glass language (blur, opacity, stroke, depth, accents).
- Responsive component gallery with live previews.
- Dark/light mode toggle with persistent preference.
- Reduced-transparency toggle (system-aware) for accessibility and performance.
- Accessibility guardrails baked into the UI.
- Browser smoke coverage for token edit/import/export flows.
- CI bundle-size budget check for built JS/CSS assets.
- Versioned token-edits JSON schema served from `public/schemas/`.
- Local token overrides persist in browser storage (resettable in-app).
- Token table keyboard guide with save/cancel shortcuts for inline edits.
- Token table filters can be shared via URL query state.
- Token table filters stay in sync with browser back/forward navigation.
- Token table surfaces active filter chips with one-click clear actions.
- Token table empty states include a clear-filters recovery action.
- Token-edits parser/persistence supports optional `$extensions` metadata fields.

## Quickstart
Requires Node.js `>=20.19`.

```bash
make setup
make dev
```

## Build
```bash
make build
```

## Quality Gate
```bash
make check
```

## Browser Smoke Test
```bash
make test-e2e
# or: npm run test:e2e
```

## Bundle Budget Check
```bash
make build
make size-check
# or: npm run size:check
```

## Docker
```bash
docker build -t liquid-glass-ui .
docker run --rm -p 8080:80 liquid-glass-ui
```

## Docs
All project docs live in `docs/`.
- Token-edit lifecycle and migration guide: `docs/TOKEN_EDITS.md`.
- Self-hosted GitHub Actions runner setup and prerequisites: `docs/PROJECT.md` (`GitHub Actions (Self-Hosted Runner)` section).
