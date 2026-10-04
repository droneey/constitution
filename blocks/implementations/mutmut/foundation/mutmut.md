# mutmut

## equivalent-mutant-marked-by-pragma → mutants-all-killed
An equivalent mutant is marked on its line — `# pragma: no mutate -- <reason>` — never by the pragma's `block`, `start` and `end`, `function` or `class` forms, and never by `do_not_mutate` over a file of logic.

| Why | Check | Tags |
|---|---|---|
| a mark on one line is an argument a reviewer can check; a broad one hides real survivors. | review | [] |

## mutants-run-without-the-gates → mutants-all-killed
mutmut runs pytest with `pytest_add_cli_args = ["-p", "no:randomly"]`, and `addopts` holds no `--cov`.

| Why | Check | Tags |
|---|---|---|
| a run per mutant must stop at its first failing case, which a coverage gate over one mutant's specs fails first and a shuffled order makes differ from one mutant to the next. | review | [] |
