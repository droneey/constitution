# Toolchain

> Governs how the tools and the shared configuration are pinned, verified and installed.

## General

### toolchain-pinned-in-mise-toml → tool-pinned-exactly-by-the-repository · MUST

Every tool outside the package manager is pinned exactly in `mise.toml`. Such tools include the runtime, the package manager itself and other languages' linters.

| Why |
|---|
| a tool installed another way runs in another version on each machine and in CI, so the check passes on one and fails on another. |

### toolchain-downloads-verified-by-the-lock → download-pinned-by-version-and-checksum · MUST

`mise.lock` holds the checksum of every tool's download, and mise installs only what it names. The lock is kept in the repository, and `locked = true` under `[tool_config]` makes mise install only what the lock names, which binds the repository's own tools and leaves a developer's global ones alone.

| Why |
|---|
| a download with no checksum runs whatever its address serves that day, and without `locked = true` a tool the lock does not name is fetched unverified — fail-safe defaults. |

### shared-configuration-distribution-installed-by-mise · SHOULD

A distribution of shared tool configuration is a mise tool, pinned and verified like any other. Such a distribution — presets, starter files, built tools — is installed through mise's `github` backend, pinned by version, with `asset_pattern` naming the distribution, under `platforms.<os>-<arch>` for one built for each platform, `strip_components = 0` so it keeps its folders, and `bin_path` naming its folder of executables where it holds one; `mise.lock` holds the checksum GitHub publishes for it. A `postinstall` hook links it where the configuration reads it.

| Why |
|---|
| configuration fetched some other way arrives unpinned and unverified, differs between languages, and is updated by hand while the tools around it are bumped. |
