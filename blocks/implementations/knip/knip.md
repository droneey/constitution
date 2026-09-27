---
id: knip
kind: implementation
summary: Finds unused files, dependencies and exports.
chapters: []
requires: [typescript]
extends: null
abstract: false
checks: [unused]
owns: [knip, knip.json]
governs: ["knip.json"]
status: stable
---

# knip

> Finds what nothing uses. `knip.json` names as entries the entry, each entrypoint's entry file, the configuration files and every surface `index.ts`, so an export a surface offers is never reported, while an unused file, dependency, export, type or enum member is. Unused locals and parameters are held by the compiler, unreachable branches by the coverage gate: no dead code is held by the three together.

## unused-check-in-production-mode · MUST
The check runs knip twice: over everything, and in production mode (`--production`), so code and dependencies that only specs reach count as unused.
**Why:** code kept alive only by its tests is dead in production, and the full run alone cannot see it.
**Check:** tool — unused
**Tags:** architecture
**Implements:** `no-dead-code`
