---
id: pytest
summary: pytest runs Python's specs and holds the coverage gate.
requires: [python, toml, _task-runner]
extends: null
abstract: false
languages: [python]
governs: ["**/tests/**", "pyproject.toml"]
---

# pytest

> Runs the specs and holds the coverage gate.

`pythonpath = ["tests"]` lets a spec import its fakes and fixtures by their module names. `[tool.pytest]` and `[tool.coverage]` of `pyproject.toml` and the fixtures of the root **`conftest.py`** of `tests/` are written by `constitution`, the fixtures once. **`pytest`** runs the specs, **`pytest-cov`** measures lines and branches, and `addopts` leaves out `--cov`, so the gate binds only where it is asked for, never a run of one spec or of a mutant. **`pytest-timeout`** fails a case that hangs for ten seconds, **`pytest-randomly`** shuffles the cases, and async specs run on **`anyio`**.

Core's exclusions from coverage are the entry file, `**/main.py` and `**/__main__.py`, and generated files, `**/*_gen.py` and `**/*_gen/**`.

On the architecture axis, core's tree adds to core's exclusions from coverage the wiring file, `**/root/wiring.py`; their `**/main.py` already leaves out the entry file of each artefact.
