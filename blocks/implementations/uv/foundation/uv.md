# uv

## Packages and installs

## uv-is-the-only-python-package-manager → dependencies-pinned-by-lockfile
uv installs (`uv sync`), adds (`uv add`) and runs the tools (`uv run`); never pip, Poetry or Pipenv. `uv.lock` is the only lockfile, and no `requirements.txt` is kept.

| Why | Check | Tags |
|---|---|---|
| two package managers resolve differently, and a second lockfile is a second truth about what is installed. | review | [] |

## installs-follow-uv-lock → dependencies-pinned-by-lockfile
CI and every script install with `uv sync --locked`, which fails when `uv.lock` has drifted from the manifests.

| Why | Check | Tags |
|---|---|---|
| an install that may update the lockfile runs code nobody reviewed. | review | [] |

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
