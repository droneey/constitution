---
id: ruff
summary: Formats and lints Python, with its rule families chosen by name.
requires: [python, task-runner]
languages: [python]
governs: ["pyproject.toml", "ruff.toml"]
---

# Ruff

> Ruff, the `ruff` command, formats and lints, by its settings in `pyproject.toml` or `ruff.toml`, and keeps a cache in `.ruff_cache/`, which is ignored.

`constitution` writes the settings of every block into `[tool.ruff]` of `pyproject.toml`, with no `extend` chain, and a project adds its own codes, bans and ignores beside them in the same tables. A `ruff.toml` beside `pyproject.toml` wins, and Ruff then ignores `[tool.ruff]`.
