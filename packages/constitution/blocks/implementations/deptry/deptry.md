---
id: deptry
summary: deptry checks the dependencies a Python package declares and imports.
requires: [python]
extends: null
abstract: false
languages: [python]
dictionary: [deptry]
governs: []
---

# deptry

> Compares what a package's `src/` imports with what its `pyproject.toml` declares. It fails on a dependency declared and never imported, one imported and never declared, and a tool of the `dev` group the program imports. `[tool.deptry]` of `pyproject.toml` starts from the template `templates/project/python/pyproject.toml` of the constitution's release archive, which copies the part `presets/python/deptry/core.toml`, and `presets/python/deptry/bindings.yaml` says which setting holds which rule.
