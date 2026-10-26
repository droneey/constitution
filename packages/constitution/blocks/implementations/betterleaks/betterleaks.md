---
id: betterleaks
summary: Scans changes and history for committed secrets.
requires: [git, toml]
extends: null
abstract: false
languages: []
governs: [".betterleaks.toml", ".betterleaksignore"]
---

# Betterleaks

> **Betterleaks** finds secrets in changes and history.

The **`betterleaks`** command reads its settings from **`.betterleaks.toml`**{#betterleaks-settings}.

Its default rules — cloud keys, forge tokens, private keys, JWTs, credentials in connection strings — hold every active rule on committed secrets.
