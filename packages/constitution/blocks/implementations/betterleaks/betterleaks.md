---
id: betterleaks
summary: Scans changes and history for committed secrets.
requires: [git, task-runner]
languages: []
governs: [".betterleaks.toml", ".betterleaksignore"]
---

# Betterleaks

> Betterleaks, the `betterleaks` command, finds secrets in the repository history and in the changes not yet committed.

It reads its settings from `.betterleaks.toml` and the fingerprints of the findings allowed from `.betterleaksignore`. Its default rules find such secrets as cloud keys, forge tokens, private keys, JWTs and credentials in connection strings. The settings and commands here are those of its 1.x releases.
