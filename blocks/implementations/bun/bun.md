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
| `workspace-packages-linked-locally` | `workspace:*` resolves a package from the working tree | yes |
| `publishing-with-provenance-supported` | Bun does not publish; npm publishes, through trusted publishing | partly |
