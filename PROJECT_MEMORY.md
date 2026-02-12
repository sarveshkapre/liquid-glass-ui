# Project Memory

## Entry 2026-02-12 / Cycle 1
- Decision: Add browser smoke coverage for saving token description edits with Ctrl/Cmd+Enter.
- Why: This was the top-priority pending backlog item and closes a keyboard-editing regression gap for the table textarea workflow.
- Evidence:
  - `tests/e2e/token-table-smoke.spec.ts`
  - `CLONE_FEATURES.md`
  - `docs/ROADMAP.md`
  - `PLAN.md`
- Commit: `34c135f`
- Confidence: high
- Trust label: verified-local

## Verification Evidence (2026-02-12 / Cycle 1)
- `npm run check` (pass)
- `npm run test:e2e` (pass)

## Entry 2026-02-12 / Cycle 2
- Decision: Add a lightweight bundle-size budget gate in CI for built JS/CSS assets.
- Why: This adds fast regression visibility for front-end payload growth with low maintenance overhead.
- Evidence:
  - `scripts/check-bundle-size.mjs`
  - `.github/workflows/ci.yml`
  - `package.json`
  - `Makefile`
  - `README.md`
  - `docs/PROJECT.md`
- Commit: `51eab7f`
- Confidence: high
- Trust label: verified-local

## Verification Evidence (2026-02-12 / Cycle 2)
- `npm run check` (pass)
- `npm run size:check` (pass)

## Entry 2026-02-12 / Cycle 3
- Decision: Add URL-synced token-table filters for query, group, and used-by selections.
- Why: Shareable filtered views improve collaboration and reproducibility when discussing specific token subsets.
- Evidence:
  - `src/sections/TokensSection.tsx`
  - `src/App.test.tsx`
  - `src/test/setup.ts`
  - `CLONE_FEATURES.md`
  - `docs/ROADMAP.md`
  - `PLAN.md`
- Commit: pending
- Confidence: high
- Trust label: verified-local

## Verification Evidence (2026-02-12 / Cycle 3)
- `npm run check` (pass)
- `npm run test:e2e` (pass)

## Entry 2026-02-11 / Cycle 1
- Decision: Persist token overrides in browser storage with safe hydration/filtering and cleanup on reset.
- Why: Local token editing is a core workflow; losing edits on refresh reduced product utility and perceived reliability.
- Evidence:
  - `src/hooks/useTokenOverrides.ts`
  - `src/hooks/useTokenOverrides.test.tsx`
  - `src/sections/TokensSection.tsx`
  - `src/App.test.tsx` (`restores saved token overrides after remount`)
- Commit: `a6ec9c6`
- Confidence: high
- Trust label: trusted

## Entry 2026-02-11 / Cycle 1
- Decision: Expand keyboard editing patterns (Enter/Escape/Ctrl+Enter) and add a visible keyboard guide; extract import dialog into `TokenImportDialog`.
- Why: Roadmap parity gap was explicit keyboard editing guidance, and `TokensSection` had grown into a maintenance hotspot.
- Evidence:
  - `src/sections/TokensSection.tsx`
  - `src/sections/TokenImportDialog.tsx`
  - `tests/e2e/token-table-smoke.spec.ts`
  - `src/App.css`
- Commit: `a6ec9c6`
- Confidence: high
- Trust label: trusted

## Entry 2026-02-11 / Cycle 1
- Decision: Keep token-system direction aligned with platform/accessibility and standards guidance (bounded market scan).
- Why: Competitive baseline in this segment emphasizes accessibility settings, keyboard conventions for editable tables, and interoperable token formats.
- Evidence:
  - Apple Support accessibility settings (`Reduce transparency`, `Increase contrast`): https://support.apple.com/en-vn/guide/mac-help/unac089/mac
  - Fluent 2 materials guidance: https://fluent2.microsoft.design/materials/
  - WAI-ARIA APG grid keyboard conventions: https://www.w3.org/WAI/ARIA/apg/patterns/grid/
  - Design Tokens Community Group format: https://www.designtokens.org/tr/drafts/format/
- Commit: `a6ec9c6`
- Confidence: medium
- Trust label: untrusted

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

## Verification Evidence (2026-02-11 / Cycle 1)
- `npm run lint` (pass)
- `npm run typecheck` (pass)
- `npm run test` (pass: 44 tests)
- `npm run build` (pass)
- `npm run test:e2e` (pass: 1 Playwright spec)
- `npm run check` (pass: lint + typecheck + test + build + audit)
- `npm run dev -- --host 127.0.0.1 --port 4173` + `curl -I http://127.0.0.1:4173` (HTTP 200)
- Remote: `ci` `21899096304` (success), `gitleaks` `21899096298` (success), `codeql` `21899096289` (success) for commit `a6ec9c6`

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
