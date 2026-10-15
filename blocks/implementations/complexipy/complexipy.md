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

> Measures each function's cognitive complexity. `[tool.complexipy]` of `pyproject.toml` starts from the template `templates/project/python/pyproject.toml` of the constitution's release archive, and it keeps a cache in `.complexipy_cache/`, which is ignored.

### cognitive-complexity-held-at-fifteen → function-within-its-limits · MUST
complexipy fails on a function whose cognitive complexity passes 15, with `max-complexity-allowed = 15`, and no snapshot of the functions over the limit is kept to let them pass.

| Why | Tags |
|---|---|
| the linter measures only the cyclomatic complexity, which counts branches and not how deep they nest. | [] |
