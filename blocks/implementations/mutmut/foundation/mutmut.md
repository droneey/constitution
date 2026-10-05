# mutmut

## equivalent-mutant-marked-by-pragma → suppression-silences-one-finding
An equivalent mutant is marked on its line — `# pragma: no mutate -- <reason>` — never by the pragma's `block`, `start` and `end`, `function` or `class` forms, and never by `do_not_mutate` over a file of logic.

| Why | Check | Tags |
|---|---|---|
| the pragma names no mutator, so its line is the narrowest mark mutmut has, and its other forms reach a whole block, function, class or file. | review | [] |

## mutants-run-without-the-gates → mutants-all-killed
mutmut runs pytest with `pytest_add_cli_args = ["-p", "no:randomly"]`, and `addopts` holds no `--cov`.

| Why | Check | Tags |
|---|---|---|
| a run per mutant must stop at its first failing case, which a coverage gate over one mutant's specs fails first and a shuffled order makes differ from one mutant to the next. | review | [] |

## spec-finds-files-by-searching-up → mutants-all-killed
A spec reaches a file outside `tests/` by searching up from its own file for the folder that holds it, never by a fixed count of `Path(__file__).parents`.

| Why | Check | Tags |
|---|---|---|
| mutmut copies `src/` and `tests/` into `mutants/` and runs the specs there, a folder deeper, so a fixed count misses the file and the specs fail before any mutant runs. | review | [] |
