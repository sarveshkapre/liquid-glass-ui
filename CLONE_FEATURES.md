# Clone Feature Tracker

## Context Sources
- README and docs
- TODO/FIXME markers in code
- Test and build failures
- Gaps found during codebase exploration
- GitHub Actions runs #21558224112, #21558198761, #21558179763, #21558151396, #21558109692

## Candidate Features To Do
- [ ] P1: Add a Playwright smoke test for token edit/import/export flows and wire it into CI.
- [ ] P1: Split `src/App.tsx` into focused components/hooks (token table, contrast helper, imports) to reduce maintenance risk.
- [ ] P2: Expand keyboard demos to include table navigation patterns and reduced-motion behavior examples.
- [ ] P2: Add a CI Node matrix (20.19 + 22.x) to catch future engine drift earlier.

## Implemented
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
  `npm run check` (pass: lint + typecheck + test + build + audit)
  `npm run dev -- --host 127.0.0.1 --port 4173` + `curl -I http://127.0.0.1:4173` (HTTP 200)
- [x] 2026-02-09: Remote verification completed for pushed commits.
  Evidence:
  `ci` success for run `21807759327` (commit `7a58275`) and run `21807771616` (commit `5347990`)
  `gitleaks` success for run `21807771607`
  `codeql` success for run `21807771624`

## Insights
- Pinning CI Node below dependency engine requirements can silently install packages but still fail at runtime during tests.
- Token-edit undo/redo should avoid closure-captured state and should have bounded history to keep long sessions safe.
- GitHub annotation showed `codeql-action@v3` deprecates in Dec 2026, so proactive workflow upgrades reduce surprise maintenance work.
- Maintaining explicit evidence in this file makes automation cycles auditable and easier to continue.

## Notes
- This file is maintained by the autonomous clone loop.
