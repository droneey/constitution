# mise

## toolchain-pinned-and-locked → tools-pinned-exactly-by-the-repository
Every tool outside the package manager — the runtime, the package manager itself, other languages' linters — is pinned exactly in `mise.toml`, with `mise.lock` committed and `locked = true` under `[tool_config]`, which binds the repository's own tools and leaves a developer's global ones alone. Personal overrides live in the ignored `mise.local.toml`.

| Why | Check | Tags |
|---|---|---|
| everyone, and CI, then runs the same tools, and a tool's download is verified against the lock. | review | [] |
