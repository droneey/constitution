---
id: mutmut
summary: mutmut measures Python's specs by the mutants they kill.
requires: [pytest, _task-runner]
extends: null
abstract: false
languages: [python]
governs: ["pyproject.toml"]
---

# mutmut

> **`mutmut`** runs mutation testing.

mutmut sets no threshold and keeps its results in **`mutants/`**{#mutant-workspace}, so the gate is `tools/mutmut-check/dist/mutmut-check.pyz` of the Constitution's distribution, which the project's interpreter runs and which fails on every mutant not killed: one that survives, one no spec reaches, one that times out. `constitution` writes `[tool.mutmut]`: it mutates `src/`, leaves out core's exclusions and the modules of messages by `do_not_mutate` and the log calls by `do_not_mutate_patterns`, and drops a mutant the type checker refuses before any spec runs. mutmut mutates only the code inside functions and methods, and runs only on POSIX systems.
