---
id: deptry
summary: deptry checks the dependencies a Python package declares and imports.
requires: [python, task-runner]
languages: [python]
governs: ["pyproject.toml"]
---

# deptry

> Compares what a package's `src/` imports with what its `pyproject.toml` declares.

The `deptry` command fails on a dependency declared and never imported, one imported and never declared, one imported only through another dependency, and a tool of the `dev` group the program imports. It reads only its table of `pyproject.toml`, into which `constitution` writes its settings.
