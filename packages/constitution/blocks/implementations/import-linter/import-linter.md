---
id: import-linter
summary: import-linter holds the import rules between Python's modules.
requires: [python, toml, _task-runner]
extends: null
abstract: false
languages: [python]
governs: ["pyproject.toml"]
---

# import-linter

> Holds the imports of the program's package, each rule as a contract.

**`import-linter`**, run as **`lint-imports`**, reads no other file and needs the package by name, so `[tool.importlinter]` of `pyproject.toml` names the import package in `root_packages`, and `constitution` writes each block's contracts after it with the package named; a rule several contracts hold gives each an `id` of its own, and every one keeps the rule's name. The contracts name folders by wildcard — `*.kernel`, `*.features.*` — so they hold in any package and match nothing a project lacks. It keeps a cache in **`.import_linter_cache/`**{#import-linter-cache}, which is ignored.

On the architecture axis, the contracts hold core's layer matrix by the folders of core's tree: what `kernel/`, `libs/`, `shared/` and a feature's `domain/` may not import; features, modules of composition, adapters, entrypoints and integrations blind to each other; adapters kept from their callers; a binding unit kept from the ports of its domain; `root/` imported only by the entry files, and no entrypoint or integration imported at all; `composition/` imported by none of the layers below it; reads and writes apart; the effect modules of the standard library out of every layer below the edge, through a lib as well — a vendor's package a lib wraps is left to a reviewer; no layer folder's `__init__.py` imported; and a role folder of the kernel, and a module of each layer from outside it, reached only through their `__init__.py` — a contract matches its importers by wildcard, so a sibling module that reaches past another's `__init__.py`, or a file that reaches past a role folder's of its own feature, is left to a reviewer. Where a package is imported is held outside these contracts, by core's table and the homes the blocks give; a contract names a module from outside, through `include_external_packages`, only to keep a part of the standard library out of the layers below the edge. Where a file lives and how a folder is laid out no contract shows, and a reviewer holds them.
