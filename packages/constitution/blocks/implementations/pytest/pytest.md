---
id: pytest
summary: pytest runs Python's specs and holds the coverage gate.
requires: [python, task-runner]
languages: [python]
governs: ["**/tests/**", "pyproject.toml"]
---

# pytest

> Runs the specs and holds the coverage gate.

`pythonpath = ["tests"]` lets a spec import its fakes and fixtures by their module names. `[tool.pytest]` and `[tool.coverage]` of `pyproject.toml` and the fixtures of the root `conftest.py` of `tests/` are written by `constitution`, the fixtures once. `pytest` runs the specs, `pytest-cov` measures lines and branches, and `addopts` leaves out `--cov`, so the gate runs only where it is asked for, never in a run of one spec or of a mutant. `pytest-timeout` fails a case that hangs for ten seconds, `pytest-randomly` shuffles the cases, and async specs run on AnyIO's plugin.

The preset's `omit` leaves out of coverage the entry files, `main.py` and `__main__.py` in any folder, and the generated files, those of the `_gen` suffix; on the architecture axis it also leaves out the composition root's folder.
