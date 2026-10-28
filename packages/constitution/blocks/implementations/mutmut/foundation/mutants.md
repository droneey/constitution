# Mutants

> Governs the mutation run — what it leaves out, how it runs pytest and how specs find files — and how an equivalent mutant is marked.

## General

### log-calls-left-out-by-pattern → every-mutant-killed · MUST

`do_not_mutate_patterns` leaves out the lines of a call to the module's logger, `^\s*logger\.(debug|info|warning|error|exception|critical)\(`, and nothing else.

| Why |
|---|
| a log call's level and text are no behaviour a caller relies on, and mutmut makes no mutant of a line a pattern matches, nor of the rest of a statement that starts on it. The text of an error has no line a pattern can tell: the linter has it assigned to a variable before the `raise`, a pattern over `raise` would leave out the error's other arguments too, and one over `super().__init__(` the arguments a framework's base takes as behaviour, so it takes the pragma. |

### messages-modules-left-out-by-do-not-mutate → every-mutant-killed · MUST

`do_not_mutate` holds the `_messages.py` modules beside core's exclusions.

| Why |
|---|
| a module of messages holds only text a person reads and the templates that fill it, with no branch, so none of its mutants is one a caller relies on, and mutmut leaves out no kind of mutant narrower than a file or a line. |

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

An equivalent mutant, and one in text only a person reads, is marked on its line — `# pragma: no mutate -- <reason>` — never by the pragma's `block`, `start` and `end`, `function` or `class` forms, and never by `do_not_mutate` over a file of logic.

| Why |
|---|
| the pragma names no mutator, so its line is the narrowest mark mutmut has, and its other forms reach a whole block, function, class or file. |
