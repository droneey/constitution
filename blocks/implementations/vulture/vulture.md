---
id: vulture
summary: vulture finds the Python code nothing uses.
requires: [python]
extends: null
abstract: false
checks: [unused]
languages: [python]
roles: []
dictionary: [vulture]
governs: []
---

# vulture

> Finds the functions, classes, variables and imports nothing uses. `[tool.vulture]` of `pyproject.toml` starts from the template `templates/project/python/pyproject.toml` of the constitution's release archive: it reads `src` alone, so code only the specs reach counts as unused, and reports from a confidence of 60, the level at which it reports an unused function or class. A name is used when the program names it, `__all__` included. Unused locals and parameters are held by the linter as well, unreachable branches by the coverage gate.
