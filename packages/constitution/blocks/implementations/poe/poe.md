---
id: poe
summary: Poe the Poet runs a Python project's tasks and its one check.
requires: [python, toml]
extends: null
abstract: false
languages: []
governs: ["pyproject.toml"]
---

# Poe the Poet

> Runs the tasks a Python project declares in `pyproject.toml`, each in the environment the package manager entered, and the check that runs every other one.

**Poe the Poet**, the package **`poethepoet`**, is pinned in the `dev` group. Its settings are `[tool.poe]` of the root `pyproject.toml`, which starts from Poe the Poet's template of `pyproject.toml` in the Constitution's release archive: the executor `simple`, and a task `check` whose sequence holds every other task the tools' fragments give, in order.
