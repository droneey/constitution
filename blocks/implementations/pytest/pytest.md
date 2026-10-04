---
id: pytest
summary: pytest runs Python's specs and holds the coverage gate.
requires: [python]
extends: null
abstract: false
checks: [tests, coverage]
languages: [python]
roles: []
dictionary: [pytest, pytest-cov, pytest-randomly, pytest-timeout, anyio]
governs: ["**/tests/**"]
---

# pytest

> Runs the specs and holds the coverage gate. It runs in each package from the package's folder, and `pythonpath = ["tests"]` lets a spec import its fakes and fixtures by their module names. `[tool.pytest]` and `[tool.coverage]` of `pyproject.toml` and the fixtures of `tests/conftest.py` start from the templates in `templates/project/python/` of the constitution's release archive. pytest-cov measures lines and branches; the check passes `--cov`, which `addopts` never holds, so a run of one spec and the mutation run are not gated. pytest-timeout fails a case that hangs for ten seconds.
