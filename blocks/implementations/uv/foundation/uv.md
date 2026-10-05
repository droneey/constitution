# uv

## Packages and installs

## uv-is-the-only-python-package-manager → dependencies-pinned-by-lockfile
uv installs (`uv sync`), adds (`uv add`) and runs the tools (`uv run`); never pip, Poetry or Pipenv. `uv.lock` is the only lockfile, and no `requirements.txt` is committed.

| Why | Check | Tags |
|---|---|---|
| two package managers resolve differently, and a second lockfile is a second truth about what is installed. | review | [] |

## installs-follow-uv-lock → dependencies-pinned-by-lockfile
CI and every script install with `uv sync --locked`, which fails when `uv.lock` has drifted from the manifests.

| Why | Check | Tags |
|---|---|---|
| an install that may update the lockfile runs code nobody reviewed. | review | [] |

## one-lock-for-the-workspace → one-version-per-dependency
`uv.lock` resolves one version of each dependency for the root and every member of its workspace.

| Why | Check | Tags |
|---|---|---|
| uv resolves the workspace as one whole, so a second version of a dependency cannot enter while every manifest is a member. | review | [] |

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
