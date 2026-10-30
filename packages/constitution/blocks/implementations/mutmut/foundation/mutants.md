# Mutants

> Governs the mutation run — what it leaves out, how it runs pytest and how specs find files — and how an equivalent mutant is marked.

## General

### text-for-a-person-left-out-by-configuration → every-mutant-killed · MUST

Text only a person reads is left out by mutmut's configuration where a line or a file holds nothing else: the calls to the module's logger by `do_not_mutate_patterns`, and the modules of messages by `do_not_mutate`.

| Why |
|---|
| a log call's level and text and a module of messages, text and the templates that fill it with no branch, are no behaviour a caller relies on, and mutmut leaves out no kind of mutant narrower than a file or a line. |

### mutants-run-without-the-gates → every-mutant-killed · MUST

mutmut runs pytest with `pytest_add_cli_args = ["-p", "no:randomly", "-o", "norecursedirs=.* e2e"]`, and `addopts` holds no `--cov`.

| Why |
|---|
| a run per mutant must stop at its first failing case, which a coverage gate over one mutant's specs fails first and a shuffled order makes differ from one mutant to the next; `norecursedirs` without `integration` lets each mutant's run collect the integration specs, as the gate's run does. |

### spec-finds-files-by-searching-up → every-mutant-killed · MUST

A spec reaches a file outside `tests/` by searching up from its own file for the folder that holds it, never by a fixed count of `Path(__file__).parents`.

| Why |
|---|
| mutmut copies `src/` and `tests/` into `mutants/` and runs the specs there, a folder deeper, so a fixed count misses the file and the specs fail before any mutant runs. |

### equivalent-mutant-marked-by-pragma → suppression-silences-one-finding · MUST

An equivalent mutant, and one in text only a person reads that the configuration does not leave out, an error's message among them, is marked on its line — `# pragma: no mutate -- <reason>` — never by the pragma's `block`, `start` and `end`, `function` or `class` forms, and never by `do_not_mutate` over a file of logic.

| Why |
|---|
| the pragma names no mutator, so its line is the narrowest mark mutmut has, and its other forms reach a whole block, function, class or file; an error's text has no line a pattern can tell, since the linter has it assigned to a variable before the `raise`, a pattern over `raise` would leave out the error's other arguments too, and one over `super().__init__(` the arguments a framework's base takes as behaviour. |
