---
id: import-linter
summary: import-linter holds the import rules between Python's modules.
requires: [python, task-runner]
languages: [python]
governs: ["pyproject.toml"]
---

# import-linter

> Holds the imports of the program's package, each rule as a contract.

The `import-linter` package, run as `lint-imports`, reads `[tool.importlinter]` of `pyproject.toml`, unless a `setup.cfg` or a `.importlinter` beside it holds an `[importlinter]` section, which then wins. It needs the package by name, so that table names the import package in `root_packages`, and `constitution` writes each block's contracts after it with the package named. A rule several contracts hold gives each an `id` of its own. The contracts name folders by wildcard, such as `*.kernel` or `*.features.*`, so they hold in any package and match nothing a project lacks. It keeps a cache in `.import_linter_cache/`, which is ignored.

On the architecture axis, the preset's contracts hold the import rules of core's layers by the folders of core's tree, and keep a part of the standard library out of the layers outside the edge, naming it through `include_external_packages`.
