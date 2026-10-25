---
id: renovate
summary: Dependency updates proposed by a bot.
requires: [git, json]
extends: null
abstract: false
languages: []
governs: ["renovate.json"]
---

# Renovate

> **Renovate**, the bot that proposes dependency updates.

Of the files it reads its settings from — **`renovate.json`**, **`renovate.json5`** and **`.renovaterc`** — the fleet uses the first.
