---
id: complexipy
summary: complexipy holds the cognitive complexity of Python's functions.
requires: [python]
extends: null
abstract: false
languages: [python]
dictionary: [complexipy, .complexipy_cache]
governs: []
---

# complexipy

> Measures each function's cognitive complexity, which the linter does not: it measures only the cyclomatic one, which counts branches and not how deep they nest. `[tool.complexipy]` of `pyproject.toml` starts from the template `templates/project/python/pyproject.toml` of the constitution's release archive, which copies the part `presets/python/complexipy/core.toml`, and `presets/python/complexipy/bindings.yaml` says which setting holds which rule. It keeps a cache in `.complexipy_cache/`, which is ignored.

### complexity-snapshot-never-kept → function-within-its-limits · MUST

No snapshot of the functions over the limit is kept to let them pass.

| Why | Tags |
|---|---|
| a snapshot lets every function already over the limit stay as it is, so the check fails only on new ones. | [] |
