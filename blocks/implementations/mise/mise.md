---
id: mise
summary: Pins the developer and CI toolchain to exact, locked versions.
requires: []
extends: null
abstract: false
checks: []
dictionary: [mise, mise.toml, mise.lock, mise.local.toml, mise-action, .constitution]
governs: ["mise.toml", "mise.lock"]
---

# mise

> Pins the tools outside the package manager. A newcomer runs `mise trust && mise install`.
