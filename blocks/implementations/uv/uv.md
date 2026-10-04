---
id: uv
summary: uv as Python's package manager, resolver and build backend.
requires: [python]
extends: null
abstract: false
checks: []
languages: []
roles: []
dictionary: [uv, uvx, uv.lock, uv_build]
governs: ["pyproject.toml", "uv.lock"]
---

# uv

> Installs the dependencies, resolves one version of each for the whole workspace into `uv.lock`, runs the tools of the `dev` group and builds packages with its own backend. Its settings are `[tool.uv]` of the root `pyproject.toml`, which starts from the template `templates/project/python/pyproject.toml` of the constitution's release archive.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `workspace-packages-linked-locally` | a member names another in `[tool.uv.sources]` with `{ workspace = true }`, and uv installs it from the working tree | yes |
| `publishing-with-provenance-supported` | `uv publish` takes the registry's trusted publishing in CI, without a stored token, and uploads the attestations it finds beside the distributions, which another step makes | partly |
