---
id: poethepoet
summary: Poe the Poet runs the tasks of a Python repository.
requires: [python]
extends: null
abstract: false
checks: []
languages: []
roles: []
dictionary: [Poe the Poet, poethepoet, poe]
governs: ["pyproject.toml"]
---

# Poe the Poet

> Runs the tasks a repository declares in `[tool.poe.tasks]` of `pyproject.toml`, in the project's environment, so a repository with no JavaScript toolchain has one check command: `poe check`. The template `templates/project/python/pyproject.toml` of the constitution's release archive declares the tasks of the Python tools.
