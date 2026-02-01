# Update (2026-02-01)

## Shipped
- Token cards: “Copy value” + “Copy CSS” actions with a11y-friendly toast feedback.
- Test hygiene: explicit Testing Library cleanup per test; clipboard mocked in setup.

## Verify
- `make dev`
- `make check`

## PR
If you have GitHub CLI (`gh`) authenticated:
- `git push -u origin HEAD`
- `gh pr create --fill`

Otherwise:
- Push your branch, then open a PR in GitHub targeting `main`.
