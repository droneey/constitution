---
id: betterleaks
summary: Scans changes and history for committed secrets.
requires: [git, toml]
extends: null
abstract: false
languages: []
dictionary: [Betterleaks, betterleaks, .betterleaks.toml, .betterleaksignore, "betterleaks:allow"]
governs: [".betterleaks.toml", ".betterleaksignore"]
---

# Betterleaks

> Finds secrets in changes and history.

Its default rules — cloud keys, forge tokens, private keys, JWTs, credentials in connection strings — hold every active rule on committed secrets.
