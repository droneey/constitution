---
id: mutmut
summary: mutmut measures Python's specs by the mutants they kill.
requires: [pytest]
extends: null
abstract: false
languages: [python]
dictionary: [mutmut, mutants/]
governs: []
---

# mutmut

> Mutation testing. mutmut sets no threshold and keeps its results in `mutants/`, so the gate is the archive's `tools/mutmut-check/dist/mutmut-check.pyz`, which the project's interpreter runs and which fails on every mutant not killed: one that survives, one no spec reaches, one that times out. `[tool.mutmut]` starts from the template `templates/project/python/pyproject.toml` of the constitution's release archive: it mutates `src`, leaves out core's exclusions by `do_not_mutate`, and drops a mutant the type checker refuses before any spec runs. mutmut mutates only the code inside functions and methods, and runs only on POSIX systems.

### equivalent-mutant-marked-by-pragma → suppression-silences-one-finding
An equivalent mutant is marked on its line — `# pragma: no mutate -- <reason>` — never by the pragma's `block`, `start` and `end`, `function` or `class` forms, and never by `do_not_mutate` over a file of logic.

| Why | Tags |
|---|---|
| the pragma names no mutator, so its line is the narrowest mark mutmut has, and its other forms reach a whole block, function, class or file. | [] |

### mutants-run-without-the-gates → mutants-all-killed
mutmut runs pytest with `pytest_add_cli_args = ["-p", "no:randomly"]`, and `addopts` holds no `--cov`.

| Why | Tags |
|---|---|
| a run per mutant must stop at its first failing case, which a coverage gate over one mutant's specs fails first and a shuffled order makes differ from one mutant to the next. | [] |

### spec-finds-files-by-searching-up → mutants-all-killed
A spec reaches a file outside `tests/` by searching up from its own file for the folder that holds it, never by a fixed count of `Path(__file__).parents`.

| Why | Tags |
|---|---|
| mutmut copies `src/` and `tests/` into `mutants/` and runs the specs there, a folder deeper, so a fixed count misses the file and the specs fail before any mutant runs. | [] |
