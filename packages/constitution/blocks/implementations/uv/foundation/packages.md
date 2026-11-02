# Packages

> Governs Python's packages and installs: the lockfile, the cooldown, sources, builds and the interpreter.

## General

### uv-is-the-only-python-package-manager → dependencies-locked-by-one-lockfile · MUST

`uv.lock` is the only lockfile of the repository's Python. No `requirements.txt` and no lockfile of pip, Poetry or Pipenv is kept.

| Why |
|---|
| two package managers resolve differently, and a second lockfile is a second truth about what is installed — a single source of truth. |

## Installs

### exclude-newer-sets-the-cooldown → new-release-adopted-after-a-cooldown · MUST

`exclude-newer = "3 days"` under `[tool.uv]` sets the cooldown for new releases, and `exclude-newer-package` holds the exemptions.

| Why |
|---|
| a cooldown held only where updates are proposed lets a day-old release in through every lock a person runs by hand, while the resolver holds it on every lock. |

### sources-stay-in-the-repository-or-an-index → dependency-installed-only-from-a-registry · MUST

A Python dependency comes only from an index or from the repository. It is named by its name and range alone, never by an address, `name @ <url>`, and `[tool.uv.sources]` gives it only `{ workspace = true }`, `{ path = "<a wheel or archive inside the repository>" }` or `{ index = "<name>" }` of an index marked `explicit = true`.

| Why |
|---|
| a wheel named by its address installs with no release date for the cooldown to hold, and `no-build = true` refuses a source tree from a repository or a path, so a path names a built archive the repository holds. |

### sdists-never-built → install-scripts-run-only-for-listed-dependencies · MUST

uv builds no source distribution. `no-build = true` under `[tool.uv]` makes it install wheels only.

| Why |
|---|
| building a source distribution runs its build code with the developer's rights before anyone has read it, while a wheel is only unpacked. |

### python-never-downloaded-by-uv → tool-pinned-exactly-by-the-repository · MUST

uv runs the interpreter the repository's toolchain pins, never one it downloads. `python-downloads = "never"` and `python-preference = "only-system"` are set under `[tool.uv]`.

| Why |
|---|
| uv otherwise downloads an interpreter of its own, or picks another it finds, which the toolchain neither pinned nor verified. |

## Builds

### packages-built-by-uv-build · SHOULD

A Python package builds with uv's own backend. Its `[build-system]` requires `uv_build` and names it as its `build-backend`.

| Why |
|---|
| what a package ships is set in `uv_build`'s settings, `[tool.uv.build-backend]`, which another backend ignores, so a package it builds ships the files those settings leave out. |
