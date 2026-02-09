# Clone Feature Tracker

## Context Sources
- README and docs
- TODO/FIXME markers in code
- Test and build failures
- Gaps found during codebase exploration
- GitHub issue list (open issues by `sarveshkapre`/trusted bots: none)
- GitHub Actions runs #21558224112, #21810261615, #21810261616, #21810261623

## Candidate Features To Do
- [ ] P1: Split `src/App.tsx` view sections into smaller components (`TokensSection`, `ComponentsSection`, `GuidelinesSection`) now that shared logic is extracted.
- [ ] P2: Expand keyboard demos with explicit table-navigation/editing patterns and reduced-motion variants.
- [ ] P2: Extend Playwright coverage for drag-and-drop import and keyboard shortcut undo/redo paths.
- [ ] P2: Add focused hook tests for `useTokenOverrides` history limit and stack transitions.

## Implemented
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

## Insights
- Pinning CI Node below dependency engine requirements can silently install packages but still fail at runtime during tests.
- Token-edit undo/redo should avoid closure-captured state and should have bounded history to keep long sessions safe.
- GitHub annotation showed `codeql-action@v3` deprecates in Dec 2026, so proactive workflow upgrades reduce surprise maintenance work.
- Vitest `exclude` configuration should extend `configDefaults.exclude`, otherwise dependency tests from `node_modules` may run.
- Maintaining explicit evidence in this file makes automation cycles auditable and easier to continue.

## Notes
- This file is maintained by the autonomous clone loop.
