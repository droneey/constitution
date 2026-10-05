---
id: mutmut
summary: mutmut measures Python's specs by the mutants they kill.
requires: [pytest]
extends: null
abstract: false
checks: [mutation]
languages: [python]
roles: []
dictionary: [mutmut, mutants/]
governs: []
---

# mutmut

> Mutation testing. mutmut sets no threshold and keeps its results in `mutants/`, so the gate is the archive's `tools/mutmut-check/dist/mutmut-check.pyz`, run with the project's interpreter from the package's folder: it clears `mutants/`, runs mutmut over the functions a change touches — every function of a new module, and of the module a changed spec is named after and each module it imports — and fails on every mutant not killed: one that survives, one no spec reaches, one that times out. A run that passes removes `mutants/`; a failed one leaves it for `mutmut show`. `mutmut-check all` mutates everything. `[tool.mutmut]` starts from the template `templates/project/python/pyproject.toml` of the constitution's release archive: it mutates `src`, leaves out core's exclusions by `do_not_mutate`, and drops a mutant the type checker refuses before any spec runs. mutmut mutates only the code inside functions and methods, and runs only on POSIX systems.
