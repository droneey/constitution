---
id: uv
summary: uv as Python's package manager, resolver and build backend.
requires: [python, toml]
extends: null
abstract: false
languages: []
governs: ["pyproject.toml", "uv.lock"]
---

# uv

> Installs the dependencies, resolves one version of each for the whole workspace into **`uv.lock`**, runs the tools of the `dev` group and builds packages with its own backend.

**`uv`** runs a tool of the environment, and **`uvx`** one in an environment of its own. Its settings are `[tool.uv]` of the root `pyproject.toml`, which starts from the template of a Python project's `pyproject.toml` in the Constitution's release archive.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `workspace-tool-links-units-from-the-working-tree` | a package names another in `[tool.uv.sources]` with `{ workspace = true }`, and uv installs it from the working tree | yes |
| `publishing-tool-supports-run-identity-and-provenance` | `uv publish` takes the registry's trusted publishing in CI, without a stored token, and uploads the attestations it finds beside the distributions but makes none (`distribution-uploaded-with-its-attestation`) | partly |
