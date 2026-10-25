---
id: bun
summary: Bun as runtime, package manager and script runner.
requires: [toml]
extends: _js-runtime
abstract: false
languages: []
governs: ["bunfig.toml", "package.json"]
---

# Bun

> **Bun** runs the program, installs its dependencies and runs its scripts.

The **`bun`** command runs a script, and **`bunx`** a package's binary. **`bunfig.toml`** holds its settings, **`bun.lock`** the versions it installed, and **`trustedDependencies`** of `package.json` the dependencies whose install scripts may run.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `workspace-tool-links-units-from-the-working-tree` | `workspace:*` resolves a unit from the working tree | yes |
| `publishing-tool-supports-run-identity-and-provenance` | `bun publish` has no provenance and no trusted publishing, so npm publishes (`units-published-by-npm`) | no |
