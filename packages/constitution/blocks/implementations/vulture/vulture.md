---
id: vulture
summary: vulture finds the Python code nothing uses.
requires: [python, toml, _task-runner]
extends: null
abstract: false
languages: [python]
governs: ["pyproject.toml"]
---

# vulture

> **`vulture`** finds the functions, classes, variables and imports nothing uses.

It reads only its table of `pyproject.toml`, into which the program writes its settings. They read `src/` alone, so code only the specs reach counts as unused, and report from a confidence of 60, the level at which vulture reports an unused function or class. A name is used when the program names it, `__all__` included. Unused locals and parameters are held by the linter as well, unreachable branches by the coverage gate.
