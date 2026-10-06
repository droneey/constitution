---
id: vulture
summary: vulture finds the Python code nothing uses.
requires: [python]
extends: null
abstract: false
languages: [python]
dictionary: [vulture]
governs: []
---

# vulture

> Finds the functions, classes, variables and imports nothing uses. `[tool.vulture]` of `pyproject.toml` starts from the template `templates/project/python/pyproject.toml` of the constitution's release archive: it reads `src` alone, so code only the specs reach counts as unused, and reports from a confidence of 60, the level at which it reports an unused function or class. A name is used when the program names it, `__all__` included. Unused locals and parameters are held by the linter as well, unreachable branches by the coverage gate.

### unused-code-reported-from-sixty → no-dead-code
`vulture` fails on a definition or import that nothing in `src/` uses, at a confidence of 60 or more.

| Why | Tags |
|---|---|
| vulture rates an unused function or class at 60, so at 80 it reports none, and code kept alive only by its specs is dead in production. | [] |

### ignored-names-state-their-reasons → suppression-states-its-reason
A name only a framework or an entry reaches — a route, a tool function, a console script — is listed in `ignore_names` or `ignore_decorators` of `[tool.vulture]`, each with its reason in a comment beside it.

| Why | Tags |
|---|---|
| these lists are where vulture is silenced, so each entry must say why the name is in use. | [] |
