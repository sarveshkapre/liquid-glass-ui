# Project Memory

## Entry 2026-02-10 / Cycle 1
- Decision: Treat Playwright ui-smoke as a CI gate and fix it immediately when it flakes/fails.
- Why: The repository’s shipped value is a production-ready “reference UI kit”; if browser smoke is red, the most user-visible flows are untrusted.
- Evidence:
  - Fix: focus token-table summary without toggling `<details>` state (`tests/e2e/token-table-smoke.spec.ts`)
  - Remote: `ci` run `21862290540` (success, commit `4c09e05`)
- Commit: `a0c5492`
- Confidence: high
- Trust label: verified-local-and-ci

## Entry 2026-02-10 / Cycle 2
- Decision: Extract token CSV + token-edits JSON export/import logic into `src/utils` with direct unit tests.
- Why: `TokensSection` was accumulating high-risk logic (parsing/serialization/download) that benefits from small pure functions and cheap deterministic tests.
- Evidence:
  - `src/utils/tokensCsv.ts`, `src/utils/tokenEdits.ts`, `src/utils/download.ts`
  - Local: `npm run check` (pass)
  - Local: `npm run test:e2e` (pass)
- Commit: `3de8f11`
- Confidence: high
- Trust label: verified-local

## Entry 2026-02-10 / Cycle 2
- Decision: Add a versioned JSON schema artifact for token-edits import/export.
- Why: A schema makes the edits format explicit, reviewable, and tooling-friendly (validation, future migrations).
- Evidence:
  - `public/schemas/liquid-glass-token-edits.v1.schema.json`
  - Local: `npm run check` (pass)
- Commit: `5de813b`
- Confidence: high
- Trust label: verified-local

## Entry 2026-02-10 / Cycle 1
- Decision: Validate token-edits import JSON format version and add explicit shortcut discoverability for undo/redo.
- Why: Schema versioning prevents future-breaking imports; `aria-keyshortcuts` plus visible hints improves keyboard UX and AT support.
- Evidence:
  - `src/sections/TokensSection.tsx`
  - `src/App.test.tsx`
  - Local: `npm run test` (pass)
- Commit: `dc5f11d`
- Confidence: high
- Trust label: verified-local

## Entry 2026-02-10 / Cycle 1
- Decision: Add direct unit tests for `useTokenOverrides` history cap and redo-clearing semantics.
- Why: Undo/redo correctness is easy to regress during refactors; hook-level tests are cheap, deterministic coverage.
- Evidence:
  - `src/hooks/useTokenOverrides.test.tsx`
  - Local: `npm run test` (pass)
- Commit: `5b4d71b`
- Confidence: high
- Trust label: verified-local

## Mistakes And Fixes (2026-02-10)
- Mistake: Pushed commits before running the full `npm run check` gate; CI caught an ESLint `no-useless-escape` failure.
- Root cause: Workflow drift (prioritized shipping fixes over running the repo’s full quality gate before every push).
- Fix: Removed unnecessary regex escapes and re-pushed; CI green.
- Prevention rule: Run `npm run check` before pushing, or batch small commits locally and only push after the gate is green.
- Evidence:
  - Fix commit: `4c09e05`
  - Remote: `ci` run `21862290540` (success)

## Verification Evidence (2026-02-10)
- `npm run check` (pass)
- `npm run test:e2e` (pass)
- `npm run dev -- --host 127.0.0.1 --port 4173` + `curl -I http://127.0.0.1:4173` (HTTP 200)
- Remote: `ci` `21862290540` (success), `gitleaks` `21862290535` (success), `codeql` `21862290531` (success)

## Verification Evidence (2026-02-10 / Cycle 2)
- `npm run check` (pass, after commit `3de8f11`)
- `npm run test:e2e` (pass, after commit `3de8f11`)
- `npm run check` (pass, after commit `5de813b`)
- `npm run check` (pass, after commit `0ea88d1`)

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
