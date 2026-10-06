---
id: deptry
summary: deptry checks the dependencies a Python package declares and imports.
requires: [python]
extends: null
abstract: false
checks: [unused]
languages: [python]
roles: []
dictionary: [deptry]
governs: []
---

# deptry

> Compares what a package's `src/` imports with what its `pyproject.toml` declares. It fails on a dependency declared and never imported, one imported and never declared, and a tool of the `dev` group the program imports.
