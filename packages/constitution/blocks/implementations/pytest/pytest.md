---
id: pytest
summary: pytest runs Python's specs and holds the coverage gate.
requires: [python]
extends: null
abstract: false
languages: [python]
dictionary: [pytest, pytest-cov, pytest-randomly, pytest-timeout, anyio, conftest.py]
governs: ["**/tests/**"]
---

# pytest

> Runs the specs and holds the coverage gate.

`pythonpath = ["tests"]` lets a spec import its fakes and fixtures by their module names. `[tool.pytest]` and `[tool.coverage]` of `pyproject.toml` and the fixtures of `tests/conftest.py` start from the templates in `templates/project/python/python/` of the Constitution's release archive. pytest-cov measures lines and branches, and the template's `addopts` leaves out `--cov`, so the gate binds only where it is asked for, never a run of one spec or of a mutant. pytest-timeout fails a case that hangs for ten seconds.

Core's exclusions from coverage are the entry file, `**/main.py` and `**/__main__.py`, and generated files, `**/*_gen.py` and `**/*_gen/**`.

On the architecture axis, core's tree adds to core's exclusions from coverage the wiring file, `**/root/wiring.py`; their `**/main.py` already leaves out the entry file of each artefact.
