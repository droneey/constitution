# Toolchain

> Governs how the tools and the shared configuration are pinned, verified and installed.

## Vocabulary

A **shared-configuration distribution**{#shared-configuration-distribution} is a versioned release, outside every package manager, of the presets, starter files or built tools that several repositories install for their tools.

## General

### toolchain-pinned-in-mise-toml → tool-pinned-exactly-by-the-repository · MUST

Every tool outside the package manager is pinned exactly in `mise.toml`. Such tools include the runtime, the package manager itself and other languages' linters.

| Why |
|---|
| a tool installed another way runs in another version on each machine and in CI, so the check passes on one and fails on another. |

### shared-configuration-distribution-installed-by-mise → tool-pinned-exactly-by-the-repository · MUST

Every shared-configuration distribution is a tool of `mise.toml`, pinned exactly like the tools it configures.

| Why |
|---|
| configuration fetched some other way arrives unpinned and unverified, differs between languages, and is updated by hand while the tools around it are bumped. |

## Downloads

### tool-download-checksum-held-by-the-lock → download-checked-against-its-digest · MUST

Every download mise makes for a tool is checked against the checksum `mise.lock` holds for it.

| Why |
|---|
| a download with no checksum runs whatever its address serves that day, the version it names included. |

### install-limited-to-the-lock → download-checked-against-its-digest · MUST

Every tool mise installs for the repository is one `mise.lock` names. The setting `locked = true` under `[tool_config]` makes it so, and leaves a developer's global tools outside.

| Why |
|---|
| without `locked = true` a tool the lock does not name is fetched unverified, so one added to `mise.toml` without its checksum runs whatever its address serves — fail-safe defaults. |

## Releases

### mise-minimum-release-age-set → new-release-adopted-after-a-cooldown · MUST

Every version mise resolves waits out `minimum_release_age` under `[settings]` of `mise.toml`, set to the cooldown or longer. Such versions include one for `latest` and one for a dependency of an `npm:` or `pypi:` tool. `minimum_release_age_excludes` holds the exemptions.

| Why |
|---|
| a person who runs `mise use` or `mise upgrade --bump` gets no cooldown from a bot, and mise's built-in 24 hours are shorter than the cooldown; an exact version is held back by no setting, so a bump to one is held to the cooldown by `new-release-adopted-after-a-cooldown` alone. |
