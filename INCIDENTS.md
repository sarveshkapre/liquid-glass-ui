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

## 2026-02-10: CI lint failure after pushing without running the local quality gate
- Status: resolved
- Impact: `ci` failed on `main` until a follow-up fix landed; Playwright ui-smoke was skipped due to quality gate failure.
- Detection:
  - Remote: GitHub Actions `ci` runs for commits `dc5f11d` and `e27bb5c` failed with ESLint `no-useless-escape`.
- Root cause:
  - Automation workflow drift: commits were pushed before running `npm run check`.
- Fix:
  - Removed unnecessary regex escapes in `src/App.test.tsx` and re-pushed (commit `4c09e05`).
- Prevention rules:
  - Run `npm run check` before pushing, or batch multiple small commits locally and push only after the gate is green.
- Evidence:
  - Local: `npm run check` (pass)
  - Remote: `ci` run `21862290540` (success)

### 2026-02-12T20:00:49Z | Codex execution failure
- Date: 2026-02-12T20:00:49Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-liquid-glass-ui-cycle-2.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:04:17Z | Codex execution failure
- Date: 2026-02-12T20:04:17Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-liquid-glass-ui-cycle-3.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:07:45Z | Codex execution failure
- Date: 2026-02-12T20:07:45Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-liquid-glass-ui-cycle-4.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:11:15Z | Codex execution failure
- Date: 2026-02-12T20:11:15Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-liquid-glass-ui-cycle-5.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:14:45Z | Codex execution failure
- Date: 2026-02-12T20:14:45Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-liquid-glass-ui-cycle-6.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:18:14Z | Codex execution failure
- Date: 2026-02-12T20:18:14Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-liquid-glass-ui-cycle-7.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:21:41Z | Codex execution failure
- Date: 2026-02-12T20:21:41Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-liquid-glass-ui-cycle-8.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:25:07Z | Codex execution failure
- Date: 2026-02-12T20:25:07Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-liquid-glass-ui-cycle-9.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:28:48Z | Codex execution failure
- Date: 2026-02-12T20:28:48Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-liquid-glass-ui-cycle-10.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:32:19Z | Codex execution failure
- Date: 2026-02-12T20:32:19Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-liquid-glass-ui-cycle-11.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:35:48Z | Codex execution failure
- Date: 2026-02-12T20:35:48Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-liquid-glass-ui-cycle-12.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:39:14Z | Codex execution failure
- Date: 2026-02-12T20:39:14Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-liquid-glass-ui-cycle-13.log
- Commit: pending
- Confidence: medium
