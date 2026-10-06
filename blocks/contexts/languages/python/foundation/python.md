# Python

## Modules and files

## python-file-forms → kebab-case-file-names
Python sets the case of its import tree: a module is a snake_case `.py` file — `order_status.py`, `__init__.py` — and its stub a `.pyi`, and the folders of the source root `src/` are snake_case packages, imported by their folders' names, while those of `tests/` are snake_case folders and no packages. The bytecode the interpreter writes keeps the names it gives it: `__pycache__/`, `<module>.cpython-314.pyc`. Every other file and folder is kebab-case.

| Why | Check | Tags |
|---|---|---|
| a module's name is the name it is imported by, and the language allows no hyphen in it; outside the import tree, core's case holds. | tool/names | [] |

## test-folder-files-in-python-forms → test-files-named-by-role
A `.py` file in `tests/` is a spec `test_<name>.py`, a fake `<contract>_fake.py`, fixtures `<name>_fixtures.py`, or the file the test runner reads for the fixtures the specs of its folder share.

| Why | Check | Tags |
|---|---|---|
| the runner collects a spec by its `test_` prefix, so a spec named otherwise never runs, and a helper named like a spec would. | tool/names | [testing] |

## spec-kind-named-by-its-folder → test-files-named-by-role
A unit spec sits in `tests/`, an integration spec in `tests/integration/` and an end-to-end spec in `tests/e2e/`, each named `test_<name>.py`.

| Why | Check | Tags |
|---|---|---|
| the `test_` prefix leaves no room for the kind in the name, so the folder carries it, and each kind runs as its own step. | review | [testing] |

## sys-path-never-touched · MUST
No code reads or changes `sys.path`.

| Why | Check | Tags |
|---|---|---|
| a module then resolves only as a member of an installed package, the project's own included, so it imports the same way in the program, the specs and every tool. | tool/lint | [] |

## Names and values

## none-is-the-only-absence → absence-has-one-value
Code spells absence as `None`, typed `T | None`; no sentinel object of the code's own stands for it.

| Why | Check | Tags |
|---|---|---|
| a second spelling of absence needs a second check, and an annotation that names `None` makes the type checker ask for the first. | review | [] |

## no-any-annotation → no-any-type
No `Any`: not in an annotation, a `cast` or a generic's arguments — `dict[str, Any]`. An unannotated parameter or return is `Any` as well, and so is the argument a generic is written without.

| Why | Check | Tags |
|---|---|---|
| these are the places `Any` enters a Python program, the last two without the word written. | review | [] |

## signatures-annotated-without-any → no-any-annotation
Every parameter and return of a function is annotated, and never as `Any`.

| Why | Check | Tags |
|---|---|---|
| a parameter without an annotation is `Any` to the type checker, so an annotated signature is where `Any` stops entering. | tool/lint | [] |

## generics-written-with-their-arguments → no-any-annotation
A generic class in an annotation takes its type arguments: `list[Order]`, never `list`.

| Why | Check | Tags |
|---|---|---|
| a generic written without its arguments is a generic of `Any`. | tool/types | [] |

## boundary-values-object-until-parsed → outside-values-untyped-until-parsed
A value from outside the program — `json.loads`'s result included — is `object`, and its plain checks are `isinstance` and `in`; `cast` is no check.

| Why | Check | Tags |
|---|---|---|
| the type checker refuses every use of an `object` value until a check narrows it, where `Any` would allow them all. | review | [] |

## generics-in-pep-695-form · SHOULD
A generic class, function or alias is declared in the form of PEP 695 — `class Box[T]`, `def first[T](items: list[T]) -> T`, `type Orders = list[Order]` — never through `TypeVar`, `Generic` or `TypeAlias`.

| Why | Check | Tags |
|---|---|---|
| the parameters are declared where they are used, and nothing outside the declaration can reach them. | tool/lint | [] |

## aware-datetimes-only → instants-carry-their-zone
A `datetime` carries its time zone: `now`, `fromtimestamp` and the constructor are given one, `strptime` reads one, and `utcnow`, `utcfromtimestamp` and `today` are never called.

| Why | Check | Tags |
|---|---|---|
| a naive `datetime` is read in the machine's zone by one function and in UTC by the next, and the two compare as if they were the same instant. | tool/lint | [data] |

## overrides-marked-by-decorator → override-marked-where-declared
A method that overrides one of a base class is marked `@override`, `__init__`, `__new__`, `__init_subclass__` and `__post_init__` aside.

| Why | Check | Tags |
|---|---|---|
| `@override` is the mark the type checker reads, and the methods aside are ones every class has, which no mark would make clearer. | tool/types | [] |

## business-types-frozen-dataclasses → immutable-by-default
A type of the program's business data is a dataclass with `frozen=True, slots=True, kw_only=True`, its sequences tuples and its maps typed `Mapping`.

| Why | Check | Tags |
|---|---|---|
| the runtime then refuses a mutation the business never meant, and each field is set by its name. | review | [] |

## invariant-value-is-a-frozen-dataclass → invariant-values-are-plain-immutable-data
A value that keeps an invariant is a dataclass of the form `business-types-frozen-dataclasses` gives, whose every field is immutable — a `str`, an `int`, a `Decimal`, a `tuple`, a `frozenset` or another such value — so the generated `__eq__` and `__hash__` compare and hash it by its data. Its `__post_init__` checks the invariant and raises the kit's error. It is never a `NamedTuple` or a parsing library's model.

| Why | Check | Tags |
|---|---|---|
| a frozen dataclass of immutable fields is the language's plain immutable record, while a `NamedTuple` equals any tuple of the same items and a parsing library's model carries the library's behaviour beside the data. | review | [] |

## Functions

## keyword-only-past-three → parameters-at-most-three-wholes-as-one-object
A parameter past the third is keyword-only, after a bare `*`, and values that make one whole travel as one frozen dataclass.

| Why | Check | Tags |
|---|---|---|
| a keyword-only parameter is named at every call, so its position is no order the caller must remember. | review | [] |

## awaitable-never-dropped → async-work-awaited-or-deliberately-detached
A call that returns an awaitable is never a statement of its own: its result is awaited, or kept to be awaited.

| Why | Check | Tags |
|---|---|---|
| a coroutine nobody awaits never runs, and its failure is never seen. | tool/types | [errors] |

## concurrency-by-task-groups → structured-concurrency
Concurrent work starts in a task group — `asyncio.TaskGroup`, or the one of the async library the project uses — never by a bare `asyncio.create_task` or `ensure_future`, and a deadline is a timeout scope such as `asyncio.timeout`.

| Why | Check | Tags |
|---|---|---|
| a task group waits for its tasks, cancels them on the first failure and raises every failure together. | review | [errors] |

## async-functions-never-block · SHOULD
An `async def` function makes no blocking call: it awaits its input and output, and blocking work runs in a thread, through `asyncio.to_thread` or the framework's own.

| Why | Check | Tags |
|---|---|---|
| one blocking call in a coroutine stalls everything else the event loop runs. | review | [performance] |

## except-never-only-passes → catch-never-empty
No `except` body is only `pass` or `continue`.

| Why | Check | Tags |
|---|---|---|
| these are the bodies that swallow every error the clause catches. | tool/lint | [errors] |

## Specs

## case-named-test-should → case-reads-should-when
A case is `test_should_<behaviour>`, and `_when_<condition>` follows where it has one.

| Why | Check | Tags |
|---|---|---|
| the runner collects a case by its `test_` prefix, so the rule's words follow it; no linter of Python checks a case's name. | review | [] |

## no-branch-or-loop-in-a-test → no-branch-or-loop-in-a-case
A `test_` function holds no `if`, `for`, `while`, `match` or conditional expression; its variants are the rows of a parametrized table.

| Why | Check | Tags |
|---|---|---|
| no linter of Python flags a branch inside a case, so a reviewer holds the rule. | review | [] |

## Comments and suppressions

## docstring-only-for-non-obvious-public-entry → docs-only-for-non-obvious-public-entry
A docstring documents only a public entry whose use is not obvious, in the Google form, its summary on the first line.

| Why | Check | Tags |
|---|---|---|
| a docstring that repeats a signature drifts from it, and the editor already shows the annotations. | review | [] |

## deprecated-by-decorator → retired-code-marked-deprecated
Code kept only for its old callers is marked `@warnings.deprecated`, imported from `typing_extensions` below Python 3.13, with a message that names its replacement.

| Why | Check | Tags |
|---|---|---|
| the type checker reports every call of it and the runtime warns at each one, both with the message, which a docstring never does. | review | [] |

## suppression-names-its-code-and-reason → suppression-states-its-reason
A suppression comment gives its reason after its codes and ` -- `: `# noqa: S608 -- the table name comes from an enum`.

| Why | Check | Tags |
|---|---|---|
| one separator puts the reason of every suppression in the same place, whichever tool's comment it is. | review | [] |

## Dependencies

## tools-in-the-dev-group → tools-pinned-exactly-by-the-repository
The tools are pinned with `==` in the `dev` group of `[dependency-groups]` in `pyproject.toml`.

| Why | Check | Tags |
|---|---|---|
| a dependency group is installed in the repository and never published with a package built from it. | review | [] |

## requires-python-at-the-pinned-minor · SHOULD
A unit that no registry distributes floors its `requires-python` in `[project]` at the minor of the interpreter the repository pins: `>=3.14`.

| Why | Check | Tags |
|---|---|---|
| the linter and the type checker read the language's version from it, and hold the code to an older language when the floor is lower. | review | [] |

## floor-ranges-lockfile-pins → program-dependencies-ranged-lockfile-pins
A dependency of the program is declared with a `>=` floor, capped only with the reason beside the cap.

| Why | Check | Tags |
|---|---|---|
| a floor takes every later release, so a cap is a decision, and one with no reason blocks every later fix. | review | [] |
