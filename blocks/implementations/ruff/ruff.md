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

> Formats and lints. `extend` names one file, so the parts of the constitution's release archive form a chain, each extending the one before: `presets/python/ruff/self.toml`, Ruff's formatter — two spaces, single quotes, lines of at most 100 — and the rule families of its own; `core.toml`, the families that hold rules of core; `python.toml`, those that hold the language's. `[tool.ruff]` of `pyproject.toml` extends the last part, and `presets/python/ruff/bindings.yaml` says which code holds which rule. A project adds its own codes with `extend-select`, its own bans with `extend-banned-api` and its own ignores with `extend-per-file-ignores`, which keep the parts'; a `select`, `banned-api` or `per-file-ignores` of its own would replace them.

### ruff-format-is-the-formatter → one-formatter-per-language
Ruff formats every Python file: two spaces, single quotes, docstrings in double quotes, lines of at most 100.

| Why | Tags |
|---|---|
| one formatter for Python ends every argument about its layout. | [] |

### rule-families-selected-by-name · MUST
The rules are selected by family or code, never with `ALL`.

| Why | Tags |
|---|---|
| `ALL` turns on every rule a new release adds, so an update fails the check with rules nobody chose, some of which contradict others. | [] |

### preview-rules-only-by-code · SHOULD
A preview rule is selected only by its exact code, with `explicit-preview-rules = true`, never through a family.

| Why | Tags |
|---|---|
| a family in preview grows with each release; a code names one rule someone read. | [] |

### noqa-names-its-codes → suppression-silences-one-finding
A `# noqa` names its codes and silences a finding Ruff would report.

| Why | Tags |
|---|---|
| a blanket suppression silences rules nobody meant to, and one that silences nothing stays after the finding it was for is gone. | [] |
