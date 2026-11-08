# Packages

> Governs Python's packages and installs: the lockfile, the cooldown, sources, builds and the interpreter.

## General

### uv-lock-is-the-only-lockfile → dependencies-locked-by-one-lockfile · MUST

`uv.lock` is the only lockfile of the repository's Python. No `requirements.txt` and no other tool's lockfile is kept.

#### Why

Two package managers resolve differently, and a second lockfile is a second truth about what is installed — a single source of truth.

#### Examples

```text title="Avoid"
apps/api/
├── pyproject.toml
├── requirements.txt
├── requirements-dev.txt
└── uv.lock
```

```text title="Prefer"
apps/api/
├── pyproject.toml
└── uv.lock
```

## Installs

### exclude-newer-sets-the-cooldown → new-release-adopted-after-a-cooldown · MUST

Every lock holds the cooldown by `exclude-newer` under `[tool.uv]`, set to the cooldown or longer, such as `"3 days"`. `exclude-newer-package` holds the exemptions.

#### Why

A cooldown held only where updates are proposed lets a day-old release in through every lock a person runs by hand, while the resolver holds it on every lock.

#### Examples

```toml title="Avoid"
[tool.uv]
no-build = true
```

```toml title="Prefer"
[tool.uv]
no-build = true
exclude-newer = "3 days"
```

### sources-stay-in-the-repository-or-an-index → dependency-installed-only-from-a-registry · MUST

Every Python dependency comes only from an index or from the repository. It is named by its name and range alone, never by an address, `name @ <url>`, and `[tool.uv.sources]` gives it only `{ workspace = true }`, `{ path = "<a wheel inside the repository>" }` or `{ index = "<name>" }` of an index marked `explicit = true`.

#### Why

A wheel named by its address installs with no release date for the cooldown to hold, and `no-build = true` refuses a source tree from a repository or a path, so a path names a wheel the repository holds.

#### Examples

```toml title="Avoid"
[project]
dependencies = [
  "payments-client @ git+https://github.com/acme/payments-client@main",
]
```

```toml title="Prefer"
[project]
dependencies = ["payments-client>=2.4,<3"]

[tool.uv.sources]
payments-client = { index = "acme" }

[[tool.uv.index]]
name = "acme"
url = "https://pypi.acme.example/simple"
explicit = true
```

### sdists-never-built → install-scripts-run-only-for-listed-dependencies · MUST

uv builds no dependency from source. `no-build = true` under `[tool.uv]` makes it install every dependency from a wheel. Exempt: the workspace's own members, which it builds.

#### Why

Building a source distribution runs its build code with the developer's rights before anyone has read it, while a wheel is only unpacked.

#### Examples

```toml title="Avoid"
[tool.uv]
exclude-newer = "3 days"
```

```toml title="Prefer"
[tool.uv]
exclude-newer = "3 days"
no-build = true
```

### python-never-downloaded-by-uv → tool-pinned-exactly-by-the-repository · MUST

uv runs a system interpreter and downloads none. `python-downloads = "never"` and `python-preference = "only-system"` are set under `[tool.uv]`.

#### Why

Uv otherwise downloads an interpreter of its own, or takes one it manages, which the toolchain neither pinned nor verified.

#### Examples

```toml title="Avoid"
[tool.uv]
python-preference = "managed"
```

```toml title="Prefer"
[tool.uv]
python-downloads = "never"
python-preference = "only-system"
```

## Builds

### packages-built-by-uv-build · MUST

Every Python package builds with uv's own backend. Its `[build-system]` requires `uv_build` and names it as its `build-backend`. Exempt: a package with an extension module, which builds with a backend that compiles it.

#### Why

What a package ships is set in `uv_build`'s settings, `[tool.uv.build-backend]`, which another backend ignores, so a package it builds ships the files those settings leave out.

#### Examples

```toml title="Avoid"
[build-system]
requires = ["hatchling==1.27.0"]
build-backend = "hatchling.build"
```

```toml title="Prefer"
[build-system]
requires = ["uv_build>=0.13,<0.14"]
build-backend = "uv_build"
```
