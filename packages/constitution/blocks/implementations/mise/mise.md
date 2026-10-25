---
id: mise
summary: Pins the developer and CI toolchain to exact, locked versions.
requires: [toml]
extends: null
abstract: false
languages: []
governs: ["mise.toml", "mise.lock"]
---

# mise

> **`mise`** pins the tools outside the package manager.

**`mise.toml`** names each tool's version, **`mise.lock`** its checksums, **`mise.local.toml`** a developer's own overrides, and **`mise-action`** installs them in CI.
