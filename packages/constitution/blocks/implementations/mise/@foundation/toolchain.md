# Toolchain

> Governs how the tools and the shared configuration are pinned, verified and installed.

## Vocabulary

A **shared-configuration distribution**{#shared-configuration-distribution} is a versioned release, outside every package manager, of the presets, starter files or built tools that several repositories install for their tools.

## General

### toolchain-pinned-in-mise-toml → tool-pinned-exactly-by-the-repository · MUST

Every tool outside the package manager is pinned exactly in `mise.toml`. Such tools include the runtime, the package manager itself and other languages' linters.

#### Why

A tool installed another way runs in another version on each machine and in CI, so the check passes on one and fails on another.

#### Examples

```toml title="Avoid"
#:schema https://mise.jdx.dev/schema/mise.json
# mise.toml
[tools]
bun = "latest"
python = "3.14"
```

```toml title="Prefer"
#:schema https://mise.jdx.dev/schema/mise.json
# mise.toml
[tools]
bun = "1.4.4"
python = "3.14.8"
shellcheck = "0.11.0"
```

### shared-configuration-distribution-installed-by-mise → tool-pinned-exactly-by-the-repository · MUST

Every shared-configuration distribution is a tool of `mise.toml`, pinned exactly like the tools it configures.

#### Why

Configuration fetched some other way arrives unpinned and unverified, differs between languages, and is updated by hand while the tools around it are bumped.

#### Examples

```toml title="Avoid"
#:schema https://mise.jdx.dev/schema/mise.json
# mise.toml
[hooks]
postinstall = "curl -sL https://github.com/shop/presets/releases/latest/download/presets.tar.gz | tar -xz -C .presets"
```

```toml title="Prefer"
#:schema https://mise.jdx.dev/schema/mise.json
# mise.toml
[tools."github:shop/presets"]
version = "3.2.0"
asset_pattern = "presets-3.2.0.tar.gz"
strip_components = 0
postinstall = 'ln -sfn "$MISE_TOOL_INSTALL_PATH" .presets'
```

## Downloads

### tool-download-checksum-held-by-the-lock → download-checked-against-its-digest · MUST

Every download mise makes for a tool is checked against the checksum `mise.lock` holds for it.

#### Why

A download with no checksum runs whatever its address serves that day, the version it names included.

#### Examples

```toml title="Avoid"
#:schema https://mise.jdx.dev/schema/mise.json
# mise.toml
[settings]
lockfile = false
```

```toml title="Prefer"
# mise.lock
lockfile_version = 3

[[tools.shellcheck]]
version = "0.11.0"
backend = "aqua:koalaman/shellcheck"
specifiers = ["0.11.0"]

[tools.shellcheck."platforms.linux-x64"]
checksum = "sha256:8c3be12b05d5c177a04c29e3c78ce89ac86f1595681cab149b65b97c4e227198"
```

### install-limited-to-the-lock → download-checked-against-its-digest · MUST

Every tool mise installs for the repository is one `mise.lock` names. The setting `locked = true` under `[tool_config]` makes it so, and leaves a developer's global tools outside.

#### Why

Without `locked = true` a tool the lock does not name is fetched unverified, so one added to `mise.toml` without its checksum runs whatever its address serves — fail-safe defaults.

#### Examples

```toml title="Avoid"
#:schema https://mise.jdx.dev/schema/mise.json
# mise.toml
[settings]
lockfile = true
```

```toml title="Prefer"
#:schema https://mise.jdx.dev/schema/mise.json
# mise.toml
[settings]
lockfile = true

[tool_config]
locked = true
```

## Releases

### mise-minimum-release-age-set → new-release-adopted-after-a-cooldown · MUST

Every version mise resolves waits out `minimum_release_age` under `[settings]` of `mise.toml`, set to the cooldown or longer. Such versions include one for `latest` and one for a dependency of an `npm:` or `pypi:` tool. `minimum_release_age_excludes` holds the exemptions.

#### Why

A person who runs `mise use` or `mise upgrade --bump` gets no cooldown from a bot, and mise's built-in 24 hours are shorter than the cooldown; an exact version is held back by no setting, so a bump to one is held to the cooldown by `new-release-adopted-after-a-cooldown` alone.

#### Examples

```toml title="Avoid"
#:schema https://mise.jdx.dev/schema/mise.json
# mise.toml
[settings]
lockfile = true
```

```toml title="Prefer"
#:schema https://mise.jdx.dev/schema/mise.json
# mise.toml
[settings]
lockfile = true
minimum_release_age = "3d"
```
