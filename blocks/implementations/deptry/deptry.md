---
id: deptry
summary: deptry checks the dependencies a Python package declares and imports.
requires: [python]
extends: null
abstract: false
languages: [python]
dictionary: [deptry]
governs: []
---

# deptry

> Compares what a package's `src/` imports with what its `pyproject.toml` declares. It fails on a dependency declared and never imported, one imported and never declared, and a tool of the `dev` group the program imports.

### unused-dependency-fails → dead-code-deleted · MUST
deptry fails on a dependency of `[project]` that nothing in `src/` imports (`DEP002`).

| Why | Tags |
|---|---|
| a dependency only the specs import, or none, still installs with the program. | [security] |

### dev-tool-never-imported-by-the-program → tools-in-the-dev-group · MUST
deptry fails when code in `src/` imports a package of the `dev` group (`DEP004`).

| Why | Tags |
|---|---|
| the program then breaks wherever it is installed without the tools. | [] |

### spec-modules-unreachable-from-src → test-code-never-reached-from-production · MUST
deptry fails when code in `src/` imports a module of `tests/`, which is neither the package's own nor a declared dependency (`DEP001`).

| Why | Tags |
|---|---|
| the specs' folder is on the import path only while the specs run, so such an import passes them and fails wherever the program is installed. | [] |
