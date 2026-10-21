---
id: bun
summary: Bun as runtime, package manager and script runner.
requires: [toml]
extends: _js-runtime
abstract: false
languages: []
dictionary: [Bun, bun, bunx, bun.lock, bunfig.toml, trustedDependencies]
governs: ["bunfig.toml", "package.json"]
---

# Bun

> Runs the program, installs its dependencies and runs its scripts.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `workspace-tool-links-units-from-the-working-tree` | `workspace:*` resolves a unit from the working tree | yes |
| `publishing-tool-supports-run-identity-and-provenance` | `bun publish` has no provenance and no trusted publishing, so npm publishes (`units-published-by-npm`) | no |
