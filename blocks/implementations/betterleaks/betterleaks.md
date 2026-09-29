---
id: betterleaks
summary: Scans changes and history for committed secrets.
requires: [git]
extends: null
abstract: false
checks: [secrets]
dictionary: [Betterleaks, betterleaks, .betterleaks.toml, .betterleaksignore, "betterleaks:allow"]
governs: [".betterleaks.toml", ".betterleaksignore"]
---

# Betterleaks

> Finds secrets in changes and history. `.betterleaks.toml` extends `presets/betterleaks/foundation/core.toml` of the constitution's release archive — betterleaks' default rules: cloud keys, forge tokens, private keys, JWTs, credentials in connection strings — and holds every active rule whose check is `tool — secrets`. The check runs `betterleaks git`, never `betterleaks dir`, which also reads ignored files such as a local `.env`.
