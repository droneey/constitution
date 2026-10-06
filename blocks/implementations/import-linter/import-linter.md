---
id: import-linter
summary: import-linter holds the import rules between Python's modules.
requires: [python]
extends: null
abstract: false
checks: [imports]
languages: [python]
roles: []
dictionary: [import-linter, lint-imports, .import_linter_cache]
governs: []
---

# import-linter

> Holds the imports of the program's package, each rule as a contract. import-linter has no `extends` and needs the package by name, so `[tool.importlinter]` of `pyproject.toml` starts from the template `templates/project/python/pyproject.toml` of the constitution's release archive: `root_packages` names the import package, and the contracts name folders by wildcard — `*.kernel`, `*.features.*` — so they hold in any package and match nothing a project lacks. On foundation a contract refuses a cycle among the siblings of every folder. It keeps a cache in `.import_linter_cache/`, which is ignored.
