---
id: mutmut
summary: mutmut measures Python's specs by the mutants they kill.
requires: [pytest]
extends: null
abstract: false
languages: [python]
governs: ["pyproject.toml"]
---

# mutmut

> **`mutmut`** runs mutation testing.

mutmut sets no threshold and keeps its results in **`mutants/`**, so the gate is the archive's `tools/mutmut-check/dist/mutmut-check.pyz`, which the project's interpreter runs and which fails on every mutant not killed: one that survives, one no spec reaches, one that times out. `[tool.mutmut]` starts from the template of a Python project's `pyproject.toml` in the Constitution's release archive: it mutates `src`, leaves out core's exclusions by `do_not_mutate` and the log calls by `do_not_mutate_patterns`, and drops a mutant the type checker refuses before any spec runs. mutmut mutates only the code inside functions and methods, and runs only on POSIX systems.
