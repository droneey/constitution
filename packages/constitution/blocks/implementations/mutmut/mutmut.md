---
id: mutmut
summary: mutmut measures Python's specs by the mutants they kill.
requires: [pytest, task-runner]
languages: [python]
governs: ["pyproject.toml"]
---

# mutmut

> The `mutmut` command runs mutation testing over the specs pytest runs.

mutmut sets no threshold and keeps its results in `mutants/`, which is ignored, so the gate is `tools/mutmut-check/dist/mutmut-check.pyz` of the Constitution's distribution, which the project's interpreter runs and which fails on every mutant not killed: one that survives, one no spec reaches, one that times out. `constitution` writes `[tool.mutmut]`: it mutates `src/`, leaves out the files the coverage gate's `omit` leaves out, the modules of messages by `do_not_mutate` and the log calls by `do_not_mutate_patterns`, and drops a mutant the type checker refuses before any spec runs. mutmut runs pytest with `-x` and turns pytest-randomly off in each run itself, mutates only the code inside functions and methods, and runs only on POSIX systems.
