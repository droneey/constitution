---
id: betterleaks
summary: Scans changes and history for committed secrets.
requires: [git]
extends: null
abstract: false
languages: []
dictionary: [Betterleaks, betterleaks, .betterleaks.toml, .betterleaksignore, "betterleaks:allow"]
governs: [".betterleaks.toml", ".betterleaksignore"]
---

# Betterleaks

> Finds secrets in changes and history. `.betterleaks.toml` extends `presets/common/betterleaks/foundation/core.toml` of the constitution's release archive — betterleaks' default rules: cloud keys, forge tokens, private keys, JWTs, credentials in connection strings — and holds every active rule on committed secrets.
