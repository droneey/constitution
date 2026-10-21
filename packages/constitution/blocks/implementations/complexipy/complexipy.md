---
id: complexipy
summary: complexipy holds the cognitive complexity of Python's functions.
requires: [python, toml]
extends: null
abstract: false
languages: [python]
dictionary: [complexipy, .complexipy_cache]
governs: ["pyproject.toml"]
---

# complexipy

> Measures each function's cognitive complexity, which the linter does not: it measures only the cyclomatic one, which counts branches and not how deep they nest.

It reads only its table of `pyproject.toml`, so the parts are copied into it. It keeps a cache in `.complexipy_cache/`, which is ignored.
