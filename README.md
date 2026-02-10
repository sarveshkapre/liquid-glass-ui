# Liquid Glass UI

Apple-inspired glassmorphism component showcase with tokens, a11y guidance, and dark mode. Built as a lightweight reference for design systems that want frosted surfaces without losing clarity.

## Features
- Token-first glass language (blur, opacity, stroke, depth, accents).
- Responsive component gallery with live previews.
- Dark/light mode toggle with persistent preference.
- Reduced-transparency toggle (system-aware) for accessibility and performance.
- Accessibility guardrails baked into the UI.
- Browser smoke coverage for token edit/import/export flows.
- Versioned token-edits JSON schema served from `public/schemas/`.

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

## Docker
```bash
docker build -t liquid-glass-ui .
docker run --rm -p 8080:80 liquid-glass-ui
```

## Docs
All project docs live in `docs/`.
