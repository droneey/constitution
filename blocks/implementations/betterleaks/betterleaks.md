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

> Finds secrets in changes and history. `.betterleaks.toml` extends `presets/common/betterleaks/core.toml` of the constitution's release archive — betterleaks' default rules: cloud keys, forge tokens, private keys, JWTs, credentials in connection strings — and holds every active rule on committed secrets.

### allowlisted-finding-states-its-reason → suppression-silences-one-finding
A false positive is allowed on its line by `betterleaks:allow` followed by its reason, or by its fingerprint in `.betterleaksignore` under a `#` line that states the reason; never by disabling a rule.

| Why | Tags |
|---|---|
| `betterleaks:allow` names no rule, so its line bounds it, and a fingerprint names one finding; a disabled rule stops finding the real secrets too. | [security] |
