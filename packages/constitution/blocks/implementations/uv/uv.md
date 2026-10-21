---
id: uv
summary: uv as Python's package manager, resolver and build backend.
requires: [python, toml]
extends: null
abstract: false
languages: []
dictionary: [uv, uvx, uv.lock, uv_build]
governs: ["pyproject.toml", "uv.lock"]
---

# uv

> Installs the dependencies, resolves one version of each for the whole workspace into `uv.lock`, runs the tools of the `dev` group and builds packages with its own backend.

uv's settings are `[tool.uv]` of the root `pyproject.toml`, which starts from the template `templates/project/python/python/pyproject.toml` of the Constitution's release archive.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `workspace-tool-links-units-from-the-working-tree` | a package names another in `[tool.uv.sources]` with `{ workspace = true }`, and uv installs it from the working tree | yes |
| `publishing-tool-supports-run-identity-and-provenance` | `uv publish` takes the registry's trusted publishing in CI, without a stored token, and uploads the attestations it finds beside the distributions but makes none (`distribution-uploaded-with-its-attestation`) | partly |
