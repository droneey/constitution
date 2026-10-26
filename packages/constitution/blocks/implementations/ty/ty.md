---
id: ty
summary: ty checks the types of Python.
requires: [python, toml, _task-runner]
extends: null
abstract: false
languages: [python]
governs: ["pyproject.toml"]
---

# ty

> The type checker, **`ty`**, checks the types of the program and its specs.

ty reads `[tool.ty]` of `pyproject.toml`, into which `constitution` writes its settings. ty is in beta: a release may add rules, and the settings make each an error at once.
