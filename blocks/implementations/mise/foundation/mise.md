# mise

## toolchain-pinned-and-locked → dependencies-pinned-by-lockfile
Every tool outside the package manager — the runtime, the package manager itself, other languages' linters — is pinned exactly in `mise.toml`, with `mise.lock` committed and `locked = true` under `[settings]`. Personal overrides live in the ignored `mise.local.toml`.

| Why | Check | Tags |
|---|---|---|
| everyone, and CI, then runs the same tools, and a tool's download is verified against the lock. | review | [] |
