---
id: knip
kind: implementation
summary: Finds unused files, dependencies and exports.
chapters: []
requires: [typescript]
extends: null
abstract: false
checks: [unused]
owns: [knip, knip.config.ts]
governs: ["knip.config.ts"]
status: stable
---

# knip

> Finds what nothing uses. knip has no `extends`: `knip.config.ts` re-exports the constitution's `presets/knip/base.mjs`, adding the project's own ignores. The preset names as entries the entry, each entrypoint's entry file and every surface `index.ts`, and knip's plugins add the configuration files, so an export a surface offers is never reported, while an unused file, dependency, export, type or enum member is. Production mode leaves out `__tests__/` and `tests/`, and the binaries of tools installed outside the package manager count as no missing dependency. Unused locals and parameters are held by the compiler, unreachable branches by the coverage gate: no dead code is held by the three together.

## unused-check-in-production-mode · MUST
The check runs knip twice: over everything, and in production mode (`--production`), so code and dependencies that only specs reach count as unused.
**Why:** code kept alive only by its tests is dead in production, and the full run alone cannot see it.
**Check:** tool — unused
**Tags:** architecture
**Implements:** `no-dead-code`
