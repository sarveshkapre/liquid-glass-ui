# Token Edits Lifecycle

This document describes how local token edits move through the app today (`v1`) and how we should migrate safely to a future `v2` format.

## Current Format (`v1`)

- Canonical schema: `public/schemas/liquid-glass-token-edits.v1.schema.json`
- Required root fields:
  - `version` (must be `1`)
  - `overrides` (map of token names to override values)
- Optional override fields:
  - `value`, `description`, `usedBy`
  - `$extensions` (object for metadata such as alias/context hints)

Minimal example:

```json
{
  "version": 1,
  "overrides": {
    "accent.coral": {
      "value": "#2364ff",
      "description": "Optional override description",
      "usedBy": ["Optional", "labels"],
      "$extensions": {
        "dtcg": {
          "alias": "accent.primary"
        }
      }
    }
  }
}
```

## Runtime Lifecycle

1. User edits token rows in-app (value/description/used-by).
2. Overrides are applied in memory and tracked with undo/redo history.
3. Overrides persist to browser storage for reload continuity.
4. Export writes a `v1` JSON file (`liquid-glass-token-edits.json`).
5. Import accepts JSON text or dropped `.json` files.
6. Parser validates:
   - JSON syntax
   - `version === 1`
   - known token names only
7. Valid overrides merge into local state; invalid inputs surface import errors.

## Versioning Policy

- Export always writes the latest supported schema version.
- Import must reject unknown major versions with a clear error.
- Parsers should remain deterministic and side-effect free.
- Schema files are immutable once published; new versions get new schema files.

## Planned `v1 -> v2` Migration Strategy

`v2` is not implemented yet. When introduced, use this rollout path:

1. Dual-read phase:
   - Import parser accepts both `v1` and `v2`.
   - Export continues writing `v1` for one release to avoid breaking shared files.
2. Upgrade tooling phase:
   - Add a pure converter (`v1` input -> `v2` output).
   - Add tests with fixture pairs for conversion correctness.
3. Default-write phase:
   - Export switches to `v2`.
   - UI adds a note that import supports legacy `v1` files.
4. Legacy sunset phase:
   - Keep `v1` import for a documented deprecation window.
   - Remove only after at least one stable release cycle with migration guidance.

## `v2` Design Guardrails (Planned)

- Backward-compatible token name handling.
- Explicit metadata namespace for optional extensions.
- Strict schema validation with actionable error messages.
- No silent coercion of malformed values.

## Implementation Checklist For `v2`

- Add `public/schemas/liquid-glass-token-edits.v2.schema.json`.
- Extend parser to branch on `version`.
- Add upgrade helper + unit tests.
- Add changelog entry + import UI note.
- Update this document with exact `v2` field definitions.
