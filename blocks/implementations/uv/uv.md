---
id: uv
summary: uv as Python's package manager, resolver and build backend.
requires: [python]
extends: null
abstract: false
languages: []
dictionary: [uv, uvx, uv.lock, uv_build]
governs: ["pyproject.toml", "uv.lock"]
---

# uv

> Installs the dependencies, resolves one version of each for the whole workspace into `uv.lock`, runs the tools of the `dev` group and builds packages with its own backend. Its settings are `[tool.uv]` of the root `pyproject.toml`, which starts from the template `templates/project/python/pyproject.toml` of the constitution's release archive.

## Packages and installs

### uv-is-the-only-python-package-manager → dependencies-locked-by-one-lockfile · MUST
`uv.lock` is the only lockfile of the repository's Python; no `requirements.txt` and no lockfile of pip, Poetry or Pipenv is kept.

| Why | Tags |
|---|---|
| two package managers resolve differently, and a second lockfile is a second truth about what is installed. | [] |

### uv-build-backend-capped · SHOULD
A package builds with `uv_build`, required in `[build-system]` with a floor and a cap below the next minor: `uv_build>=0.12,<0.13`.

| Why | Tags |
|---|---|
| a new minor of the backend may build a different package from the same files; the cap makes that an update someone reviews. | [] |

### exclude-newer-sets-the-cooldown → new-release-adopted-after-a-cooldown · SHOULD
`exclude-newer = "3 days"` under `[tool.uv]` sets the cooldown for new releases, and `exclude-newer-package` holds the exemptions.

| Why | Tags |
|---|---|
| the resolver then holds the cooldown on every lock, not only the bot. | [] |

### sdists-never-built → install-scripts-run-only-for-listed-dependencies · MUST
`no-build = true` under `[tool.uv]`: uv installs wheels only and builds no source distribution.

| Why | Tags |
|---|---|
| building a source distribution runs its build code with the developer's rights; a wheel is only unpacked. | [] |

### python-never-downloaded-by-uv → tool-pinned-exactly-by-the-repository · MUST
`python-downloads = "never"` and `python-preference = "only-system"` under `[tool.uv]`, so uv runs the interpreter the repository's toolchain pins.

| Why | Tags |
|---|---|
| uv otherwise downloads an interpreter of its own, or picks another it finds, which the toolchain neither pinned nor verified. | [] |

## Requirements

| Requirement | How | Met |
|---|---|---|
| `workspace-tool-links-units-from-the-working-tree` | a package names another in `[tool.uv.sources]` with `{ workspace = true }`, and uv installs it from the working tree | yes |
| `publishing-tool-supports-run-identity-and-provenance` | `uv publish` takes the registry's trusted publishing in CI, without a stored token, and uploads the attestations it finds beside the distributions but makes none (`distribution-uploaded-with-its-attestation`) | partly |
