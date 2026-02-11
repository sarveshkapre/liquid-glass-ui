# Clone Feature Tracker

## Context Sources
- README and docs
- TODO/FIXME markers in code
- Test and build failures
- Gaps found during codebase exploration
- GitHub issue list (open issues by `sarveshkapre`/trusted bots: none)
- GitHub Actions runs #21899096304, #21899096298, #21899096289 (all green for commit `a6ec9c6`)
- Bounded market scan (untrusted): Apple HIG accessibility settings, Microsoft Fluent acrylic/material guidance, DTCG format + Style Dictionary workflow

## Candidate Features To Do
- [ ] [P1] Add Playwright coverage for Ctrl/Cmd+Enter save from description textarea.
  Score: impact 3, effort 2, strategic fit 4, differentiation 2, risk 2, confidence 4.
- [ ] [P2] Add a lightweight bundle-size budget check in CI for regression visibility.
  Score: impact 3, effort 2, strategic fit 3, differentiation 2, risk 2, confidence 3.
- [ ] [P2] Add token-table URL state (query/group/used-by) for shareable filtered views.
  Score: impact 3, effort 3, strategic fit 4, differentiation 3, risk 2, confidence 3.
- [ ] [P2] Split token table rows/actions into focused child components to reduce `TokensSection` complexity.
  Score: impact 3, effort 3, strategic fit 4, differentiation 1, risk 2, confidence 3.
- [ ] [P3] Add reduced-motion/reduced-transparency smoke assertions in Playwright.
  Score: impact 2, effort 2, strategic fit 3, differentiation 2, risk 2, confidence 3.
- [ ] [P3] Extract token-row action handlers into reusable helpers to cut duplication in table/card views.
  Score: impact 2, effort 3, strategic fit 4, differentiation 1, risk 2, confidence 3.
- [ ] [P3] Add optional token alias metadata support (`$extensions`) for broader DTCG compatibility.
  Score: impact 2, effort 4, strategic fit 3, differentiation 3, risk 3, confidence 2.
- [ ] [P3] Add docs page for token-edit file lifecycle and migration strategy (`v1 -> v2`).
  Score: impact 2, effort 2, strategic fit 3, differentiation 1, risk 1, confidence 4.

## Implemented
- [x] 2026-02-11: Persisted local token overrides to browser storage with safe hydration/filtering and cleanup on reset.
  Evidence: `src/hooks/useTokenOverrides.ts`, `src/hooks/useTokenOverrides.test.tsx`, `src/test/setup.ts`, `src/sections/TokensSection.tsx` (commit `a6ec9c6`)
- [x] 2026-02-11: Expanded keyboard editing UX with explicit save/cancel shortcuts and an in-UI keyboard guide.
  Evidence: `src/sections/TokensSection.tsx`, `src/App.css`, `src/App.test.tsx`, `tests/e2e/token-table-smoke.spec.ts` (commit `a6ec9c6`)
- [x] 2026-02-11: Extracted token import dialog into a dedicated component and added a schema link in the import UI.
  Evidence: `src/sections/TokenImportDialog.tsx`, `src/sections/TokensSection.tsx`, `src/App.test.tsx` (commit `a6ec9c6`)
- [x] 2026-02-11: Replaced footer GitHub placeholder URL with repository-specific link.
  Evidence: `src/App.tsx` (commit `a6ec9c6`)
- [x] 2026-02-10: Extracted token export/import helpers into `src/utils` (CSV builder, versioned edits JSON serializer/parser, safe download helper) with unit coverage.
  Evidence: `src/utils/tokensCsv.ts`, `src/utils/tokenEdits.ts`, `src/utils/download.ts` (commit `3de8f11`)
- [x] 2026-02-10: Added a versioned JSON schema artifact for token-edits import/export.
  Evidence: `public/schemas/liquid-glass-token-edits.v1.schema.json` (commit `5de813b`)
- [x] 2026-02-10: Fixed CI Playwright ui-smoke failure by stabilizing token-table keyboard undo/redo (focus summary without toggling `<details>` open/closed state).
  Evidence: `tests/e2e/token-table-smoke.spec.ts`, GitHub Actions run `21862290540` (commit `4c09e05`)
- [x] 2026-02-10: Validated token-edits import JSON `version === 1` and added `aria-keyshortcuts` + a visible shortcuts hint for undo/redo.
  Evidence: `src/sections/TokensSection.tsx`, `src/App.test.tsx` (commit `dc5f11d`)
- [x] 2026-02-10: Added `useTokenOverrides` unit coverage for redo-stack clearing and history cap behavior.
  Evidence: `src/hooks/useTokenOverrides.test.tsx` (commit `5b4d71b`)
- [x] 2026-02-10: Added `prefers-contrast: more` support for stronger glass borders and focus outlines.
  Evidence: `src/index.css` (commits `e27bb5c`, `288c6fd`)
- [x] 2026-02-09: Added Playwright browser smoke test for token edit, undo/redo, import, and export flows.
  Evidence: `playwright.config.ts`, `tests/e2e/token-table-smoke.spec.ts`, `package.json`, `.gitignore`
- [x] 2026-02-09: Wired browser smoke coverage into CI and added Node matrix checks (`20.19.0`, `22.x`).
  Evidence: `.github/workflows/ci.yml`
- [x] 2026-02-09: Refactored token override history state into `useTokenOverrides` hook.
  Evidence: `src/hooks/useTokenOverrides.ts`, `src/App.tsx`
- [x] 2026-02-09: Extracted contrast parsing/math utilities and added dedicated unit tests.
  Evidence: `src/utils/contrast.ts`, `src/utils/contrast.test.ts`, `src/App.tsx`
- [x] 2026-02-09: Added structured project memory and incident tracking docs.
  Evidence: `PROJECT_MEMORY.md`, `INCIDENTS.md`
- [x] 2026-02-09: Fixed CI runtime mismatch by updating `.github/workflows/ci.yml` to Node `20.19.0` (root cause from failing runs: jsdom/vite engine mismatch and Vitest `ERR_REQUIRE_ESM`).
  Evidence: `.github/workflows/ci.yml`
- [x] 2026-02-09: Aligned project runtime baseline to Node `>=20.19`.
  Evidence: `.nvmrc`, `package.json`, `README.md`, `docs/PROJECT.md`, `docs/CHANGELOG.md`
- [x] 2026-02-09: Hardened token override history handling with bounded snapshots and deterministic undo/redo state reads.
  Evidence: `src/App.tsx`
- [x] 2026-02-09: Added token-table edits status footer showing override count and undo/redo depth.
  Evidence: `src/App.tsx`, `src/App.css`, `docs/CHANGELOG.md`, `docs/ROADMAP.md`, `PLAN.md`
- [x] 2026-02-09: Extended tests for edits status transitions and reset behavior.
  Evidence: `src/App.test.tsx` (23 passing tests)
- [x] 2026-02-09: Upgraded CodeQL workflow from `github/codeql-action@v3` to `@v4` after deprecation warning.
  Evidence: `.github/workflows/codeql.yml`, `docs/CHANGELOG.md`
- [x] 2026-02-09: Local verification completed.
  Evidence:
  `npm run test` (pass)
  `npm run test:e2e` (pass)
  `npm run check` (pass: lint + typecheck + test + build + audit)
  `npm run dev -- --host 127.0.0.1 --port 4173` + `curl -I http://127.0.0.1:4173` (HTTP 200)
- [x] 2026-02-09: Remote verification completed for pushed commits.
  Evidence:
  `ci` success for run `21807759327` (commit `7a58275`) and run `21807771616` (commit `5347990`)
  `gitleaks` success for run `21807771607`
  `codeql` success for run `21807771624`
  `ci` success for run `21807807031` (commit `e82f0f1`)
  `gitleaks` success for run `21807807035`
  `codeql` success for run `21807807066`
  `ci` success for run `21810261615` (commit `e0b4479`)
  `gitleaks` success for run `21810261623`
  `codeql` success for run `21810261616`
  `ci` success for run `21810334282` (commit `9a25fca`)
  `gitleaks` success for run `21810334296`
  `codeql` success for run `21810334292`
  `ci` success for run `21810367108` (commit `228c273`)
  `gitleaks` success for run `21810367099`
  `codeql` success for run `21810367101`

## Insights
- Pinning CI Node below dependency engine requirements can silently install packages but still fail at runtime during tests.
- Token-edit undo/redo should avoid closure-captured state and should have bounded history to keep long sessions safe.
- GitHub annotation showed `codeql-action@v3` deprecates in Dec 2026, so proactive workflow upgrades reduce surprise maintenance work.
- Vitest `exclude` configuration should extend `configDefaults.exclude`, otherwise dependency tests from `node_modules` may run.
- Maintaining explicit evidence in this file makes automation cycles auditable and easier to continue.
- Market scan notes (untrusted): major platform guidance encourages respecting reduced transparency and increased contrast user prefs.
  - Apple Support: OS-level Reduce Transparency and Increase Contrast settings influence app UI expectations.
    https://support.apple.com/en-vn/guide/mac-help/unac089/mac
  - Microsoft Fluent 2 materials guidance: layered materials should preserve clarity and hierarchy.
    https://fluent2.microsoft.design/materials/
  - WAI-ARIA APG grid patterns: editable data grids should provide explicit keyboard conventions.
    https://www.w3.org/WAI/ARIA/apg/patterns/grid/
  - Design Tokens Community Group format: interoperable token formats are becoming baseline expectations.
    https://www.designtokens.org/tr/drafts/format/
  - Style Dictionary docs: multi-platform token pipelines are table-stakes in token systems.
    https://styledictionary.com/getting-started/installation/

## Gap Map (2026-02-11)
- Missing:
  - Shareable URL state for token table filters (query/group/used-by).
- Weak:
  - `TokensSection` still centralizes table row rendering and action wiring in one large file.
- Parity:
- Token export/import flows (JSON + drag/drop + schema link), keyboard edit shortcuts, and accessibility preference support (reduced motion/transparency, prefers-contrast).
- Differentiator:
- Token-table edit history with undo/redo depth surfaced in UI + persisted local overrides + browser smoke coverage in CI.

## Notes
- This file is maintained by the autonomous clone loop.
