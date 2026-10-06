---
id: renovate
summary: Dependency updates proposed by a bot.
requires: [git]
extends: null
abstract: false
languages: []
dictionary: [Renovate, renovate.json, renovate.json5, .renovaterc]
governs: ["renovate.json"]
---

# Renovate

> The bot that proposes dependency updates.

### update-cooldown-configured → new-release-adopted-after-a-cooldown
A minimum release age of some days holds back every update. Renovate proposes a fix for a known vulnerability at once, past that age, so the update it proposes carries the package manager's exemption for the package, with its advisory.

| Why | Tags |
|---|---|
| most hijacked releases are found and pulled within days, and the package manager refuses the fix until its cooldown names the package as exempt. | [] |
