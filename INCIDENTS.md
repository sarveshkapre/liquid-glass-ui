# Incidents

## 2026-02-09: Vitest accidentally executed dependency test suites
- Status: resolved
- Impact: local `npm run test` failed and ran hundreds of unintended tests from `node_modules`, adding noise and masking project-level signal.
- Detection:
  - Command: `npm run test`
  - Symptom: dependency suites (for example `zod`, `jest-dom`) were collected and executed.
- Root cause:
  - `vite.config.ts` set `test.exclude` to only `tests/e2e/**`, which replaced Vitest defaults rather than extending them.
- Fix:
  - Updated `vite.config.ts` to use `exclude: [...configDefaults.exclude, 'tests/e2e/**']`.
- Prevention rules:
  - When customizing Vitest include/exclude, always start from `configDefaults`.
  - Re-run `npm run test` immediately after config edits and confirm only repository tests are collected.
- Evidence:
  - `vite.config.ts`
  - Local: `npm run test` (pass, only `src/*.test.tsx` and `src/utils/contrast.test.ts`)
