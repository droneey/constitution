---
id: complexipy
summary: complexipy holds the cognitive complexity of Python's functions.
requires: [python]
extends: null
abstract: false
checks: [lint]
languages: [python]
roles: []
dictionary: [complexipy, .complexipy_cache]
governs: []
---

# complexipy

> Measures each function's cognitive complexity. `[tool.complexipy]` of `pyproject.toml` starts from the template `templates/project/python/pyproject.toml` of the constitution's release archive; the check runs it over `src` and `tests`, and it keeps a cache in `.complexipy_cache/`, which is ignored.
