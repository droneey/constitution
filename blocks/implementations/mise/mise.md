---
id: mise
summary: Pins the developer and CI toolchain to exact, locked versions.
requires: []
extends: null
abstract: false
languages: []
dictionary: [mise, mise.toml, mise.lock, mise.local.toml, mise-action]
governs: ["mise.toml", "mise.lock"]
---

# mise

> Pins the tools outside the package manager.

### toolchain-pinned-in-mise-toml → tool-pinned-exactly-by-the-repository
Every tool outside the package manager — the runtime, the package manager itself, other languages' linters — is pinned exactly in `mise.toml`. Personal overrides live in `mise.local.toml`.

| Why | Tags |
|---|---|
| everyone, and CI, then runs the same tools. | [] |

### toolchain-downloads-verified-by-the-lock → download-pinned-by-version-and-checksum
`mise.lock`, kept in the repository, holds the checksum of every tool's download, and `locked = true` under `[tool_config]` makes mise install only what the lock names, which binds the repository's own tools and leaves a developer's global ones alone.

| Why | Tags |
|---|---|
| a tool's download is then verified against the lock, and a tool the lock does not name fails instead of being fetched unverified. | [security] |

### shared-configuration-archive-installed-by-mise · SHOULD
An archive of shared tool configuration — presets, starter files, built tools — is a mise tool through its `github` backend, pinned by version, with `asset_pattern` naming the archive and `strip_components = 0` so it keeps its folders; `mise.lock` holds the checksum GitHub publishes for it. A `postinstall` hook links it where the configuration reads it.

| Why | Tags |
|---|---|
| the configuration then arrives pinned and verified like the tool itself, in a repository of any language, and an update bumps it like any other tool. | [security] |
