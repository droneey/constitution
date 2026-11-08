---
id: uv
summary: uv as Python's package manager, resolver and build backend.
requires: [python]
languages: []
governs: ["pyproject.toml", "uv.lock"]
---

# uv

> Installs the dependencies, resolves one version of each for the whole workspace into `uv.lock`, runs the tools of the `dev` group and builds packages with its own backend.

The `uv` command runs a tool of the environment, and `uvx` one in an environment of its own. Its settings are `[tool.uv]` of the root `pyproject.toml`, into which `constitution` writes them.
