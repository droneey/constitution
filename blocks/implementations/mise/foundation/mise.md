# mise

## toolchain-pinned-and-locked → tools-pinned-exactly-by-the-repository
Every tool outside the package manager — the runtime, the package manager itself, other languages' linters — is pinned exactly in `mise.toml`. Personal overrides live in `mise.local.toml`.

| Why | Check | Tags |
|---|---|---|
| everyone, and CI, then runs the same tools. | review | [] |

## toolchain-downloads-verified-by-the-lock → downloads-pinned-by-version-and-checksum
`mise.lock`, kept in the repository, holds the checksum of every tool's download, and `locked = true` under `[tool_config]` makes mise install only what the lock names, which binds the repository's own tools and leaves a developer's global ones alone.

| Why | Check | Tags |
|---|---|---|
| a tool's download is then verified against the lock, and a tool the lock does not name fails instead of being fetched unverified. | review | [security] |
