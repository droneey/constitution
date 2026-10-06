---
id: bun
summary: Bun as runtime, package manager and script runner.
requires: [typescript]
extends: null
abstract: false
checks: []
languages: []
roles: []
dictionary: [Bun, bun, bunx, bun.lock, bunfig.toml, trustedDependencies]
governs: ["bunfig.toml", "package.json"]
---

# Bun

> Runs the program, installs its dependencies and runs its scripts.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `units-linked-from-the-working-tree` | `workspace:*` resolves a unit from the working tree | yes |
| `publishing-with-provenance-supported` | `bun publish` has no provenance and no trusted publishing, so npm publishes (`units-published-by-npm`) | no |
