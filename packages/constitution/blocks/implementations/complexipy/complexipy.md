---
id: complexipy
summary: complexipy holds the cognitive complexity of Python's functions.
requires: [python, toml]
extends: null
abstract: false
languages: [python]
governs: ["pyproject.toml"]
---

# complexipy

> **`complexipy`** measures each function's cognitive complexity, which the linter does not: it measures only the cyclomatic one, which counts branches and not how deep they nest.

It reads only its table of `pyproject.toml`, so the parts are copied into it. complexipy keeps a cache in **`.complexipy_cache/`**{#complexipy-cache}, which is ignored.
