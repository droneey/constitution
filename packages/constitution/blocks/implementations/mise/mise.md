---
id: mise
summary: Pins the developer and CI toolchain to exact, locked versions.
requires: []
languages: []
governs: ["mise.toml", "mise.lock"]
---

# mise

> mise, the `mise` command, pins and installs the tools outside the package manager.

`mise.toml` names each tool's version and mise's settings, `mise.lock` each download's checksum, `mise.local.toml` a developer's own overrides, and `mise-action` installs the tools in CI.

The shared-configuration distribution is installed through mise's `github` backend: pinned by version, with `asset_pattern` naming its archive, under `platforms.<os>-<arch>` for one built for each platform, `strip_components = 0` so it keeps its folders, and `bin_path` naming its folder of executables where it holds one. `mise.lock` holds the checksum its release publishes, and a `postinstall` hook links it where the configuration reads it.
