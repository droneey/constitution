---
id: ty
summary: ty checks the types of Python.
requires: [python]
extends: null
abstract: false
languages: [python]
governs: []
---

# ty

> The type checker, **`ty`**, checks the types of the program and its specs.

ty takes its configuration file on the command line, beside which it reads no `[tool.ty]` of `pyproject.toml`, so the part is taken whole. ty is in beta: a release may add rules, and the part makes each an error at once.
