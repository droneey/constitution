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

`extend` names one file, so the parts of the Constitution's release archive form a chain, each extending the one before: `presets/python/ruff/foundation/self.toml`, Ruff's formatter — two spaces, single quotes, lines of at most 100 — and the rule families of its own; `core.toml`, the families that hold rules of core; `python.toml`, those that hold the language's. `[tool.ruff]` of `pyproject.toml` extends the last part, and `presets/python/ruff/foundation/bindings.yaml` says which code holds which rule. A project adds its own codes with `extend-select` and its own ignores with `extend-per-file-ignores`, which keep the parts'. A ban of its own goes in an `extend-banned-api` that repeats the bans of the last part it extends, since that table replaces the part's; a `select`, `banned-api` or `per-file-ignores` of its own would replace the parts' too.
