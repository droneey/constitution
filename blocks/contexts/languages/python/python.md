---
id: python
summary: How Python is written, resolved, typed and packaged.
requires: []
extends: null
abstract: false
checks: []
languages: []
roles: [format, lint, types, imports, names, unused, versions, tests, coverage, mutation, secrets, audit, commits]
dictionary: [Python, .py, .pyi, __init__.py, __main__.py, main.py, py.typed, pyproject.toml, PEP 695]
governs: ["**/*.py", "**/*.pyi", "pyproject.toml"]
---

# Python

> The form core's rules take in Python. The source root is the `src/<import name>/` of each package or application, its specs sit in `tests/` beside `src/`, and its entry is `main.py`.
