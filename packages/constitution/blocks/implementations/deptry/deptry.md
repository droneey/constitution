---
id: deptry
summary: deptry checks the dependencies a Python package declares and imports.
requires: [python, toml]
extends: null
abstract: false
languages: [python]
dictionary: [deptry]
governs: ["pyproject.toml"]
---

# deptry

> Compares what a package's `src/` imports with what its `pyproject.toml` declares.

deptry fails on a dependency declared and never imported, one imported and never declared, and a tool of the `dev` group the program imports. It reads only its table of `pyproject.toml`, so the parts are copied into it.
