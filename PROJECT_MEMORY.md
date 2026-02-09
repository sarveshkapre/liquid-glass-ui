# Project Memory

## Entry 2026-02-09 / Cycle 2
- Decision: Add browser-level smoke coverage with Playwright for token editing flows, and run it in CI after the matrix quality gate.
- Why: Critical token operations (edit, undo/redo, import, export) were only validated in unit tests and could regress in real browser behavior.
- Evidence:
  - `tests/e2e/token-table-smoke.spec.ts`
  - `playwright.config.ts`
  - `.github/workflows/ci.yml`
  - Local: `npm run test:e2e` (pass)
  - Remote: `ci` run `21810261615` (pass)
- Commit: `e0b4479`
- Confidence: high
- Trust label: verified-local-and-ci
- Follow-ups:
  - Add drag-and-drop import coverage in Playwright.
  - Add component extraction from `App.tsx` now that behavior is smoke-tested.

## Entry 2026-02-09 / Cycle 2
- Decision: Extract token override state/history logic and contrast color math from `src/App.tsx` into dedicated modules.
- Why: `src/App.tsx` had become a maintenance hotspot (~1.4k LOC); concentrated logic increased regression risk and made review/testing harder.
- Evidence:
  - `src/hooks/useTokenOverrides.ts`
  - `src/utils/contrast.ts`
  - `src/utils/contrast.test.ts`
  - `src/App.tsx`
  - Local: `npm run test` (pass, 26 tests)
- Commit: `e0b4479`
- Confidence: high
- Trust label: verified-local
- Follow-ups:
  - Continue splitting view sections into component files.
  - Add hook-level unit tests for history limit behavior.
