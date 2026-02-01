# Update (2026-02-01)

## Shipped
- Token cards: “Copy value” + “Copy CSS” actions with a11y-friendly toast feedback.
- Token export: `public/tokens.json` + `public/tokens.css` generated from `src/tokens.json` and exposed as download links.
- Component cards: usage snippets in a disclosure with copy-to-clipboard.
- Keyboard UX: skip-to-content link and consistent focus-visible rings.
- Keyboard demo: focus the preview search input with `/` or `Ctrl+K`.
- Motion: toggle reduced/full motion; reduced motion removes hover “lift”.
- Test hygiene: explicit Testing Library cleanup per test; clipboard mocked in setup.

## Verify
- `make dev`
- `make check`

## Ship (no PR)
- `git push origin main`
