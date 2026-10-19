---
id: ruff
summary: Formats and lints Python, with its rule families chosen by name.
requires: [python]
extends: null
abstract: false
languages: [python]
dictionary: [Ruff, ruff, ruff.toml, .ruff_cache]
governs: ["pyproject.toml", "ruff.toml"]
---

# Ruff

> Formats and lints.

`extend` names one file, so the parts form a chain, each extending the one before, and a project extends the last. A project adds its own codes with `extend-select` and its own ignores with `extend-per-file-ignores`, which keep the parts'. A ban of its own goes in an `extend-banned-api` that repeats the bans of the last part it extends, since that table replaces the part's; a `select`, `banned-api` or `per-file-ignores` of its own would replace the parts' too.
