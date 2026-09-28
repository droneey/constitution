---
id: bun
summary: Bun as runtime, package manager and script runner.
requires: [typescript]
extends: null
abstract: false
checks: []
dictionary: [Bun, bun, bunx, bun.lock, bunfig.toml, trustedDependencies]
governs: ["bunfig.toml", "package.json"]
---

# Bun

> Runs the program, installs its dependencies and runs its scripts.

## Requirements

| Requirement | How in bun | Status |
|---|---|---|
| `workspace-packages-linked-locally` | `workspace:*` resolves a package from the working tree | met |
| `publishing-with-provenance-supported` | Bun does not publish; the release workflow runs `npm publish` through trusted publishing | partial: publishing goes through npm |
