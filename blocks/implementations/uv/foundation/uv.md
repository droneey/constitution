# uv

## Packages and installs

## uv-is-the-only-python-package-manager → dependencies-pinned-by-lockfile
`uv.lock` is the only lockfile of the repository's Python; no `requirements.txt` and no lockfile of pip, Poetry or Pipenv is kept.

| Why | Check | Tags |
|---|---|---|
| two package managers resolve differently, and a second lockfile is a second truth about what is installed. | review | [] |

## uv-build-backend-capped · SHOULD
A package builds with `uv_build`, required in `[build-system]` with a floor and a cap below the next minor: `uv_build>=0.12,<0.13`.

| Why | Check | Tags |
|---|---|---|
| a new minor of the backend may build a different package from the same files; the cap makes that an update someone reviews. | review | [] |

## exclude-newer-sets-the-cooldown → dependency-release-cooldown
`exclude-newer = "3 days"` under `[tool.uv]` sets the cooldown for new releases, and `exclude-newer-package` holds the exemptions.

| Why | Check | Tags |
|---|---|---|
| the resolver then holds the cooldown on every lock, not only the bot. | review | [] |

## sdists-never-built → install-scripts-only-for-listed-dependencies
`no-build = true` under `[tool.uv]`: uv installs wheels only and builds no source distribution.

| Why | Check | Tags |
|---|---|---|
| building a source distribution runs its build code with the developer's rights; a wheel is only unpacked. | review | [] |

## python-never-downloaded-by-uv → tools-run-on-the-pinned-runtime
`python-downloads = "never"` and `python-preference = "only-system"` under `[tool.uv]`, so uv runs the interpreter the repository's toolchain pins.

| Why | Check | Tags |
|---|---|---|
| uv otherwise downloads an interpreter of its own, or picks another it finds, which the toolchain neither pinned nor verified. | review | [] |
