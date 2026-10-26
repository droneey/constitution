---
id: poe
summary: Poe the Poet, the task runner of a Python project.
requires: [python, toml]
extends: _task-runner
abstract: false
languages: []
governs: ["pyproject.toml"]
---

# Poe the Poet

> Runs the tasks a Python project declares in `pyproject.toml`, each in the environment the package manager entered, and the tasks that run every task of one action: `check`, `test`, `fix`.

**Poe the Poet**, the package **`poethepoet`**, is pinned in the `dev` group. Its settings are `[tool.poe]` of the root `pyproject.toml`, into which `constitution` writes the executor `simple`, the tasks each tool's block gives and those that run them by their action.
