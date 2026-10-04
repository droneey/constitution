# Python

## Modules and files

## python-file-forms → kebab-case-file-names
A module is a snake_case `.py` file — `order_status.py`, `__init__.py` — and its stub a `.pyi`; the folders of the source root `src/` and of `tests/` are snake_case packages, and the bytecode the interpreter writes keeps its names: `__pycache__/`, `<module>.cpython-314.pyc`. Every other file and folder is kebab-case.

| Why | Check | Tags |
|---|---|---|
| a module's name is the name it is imported by, and the language allows no hyphen in it; outside the import tree, core's case holds. | tool/names | [] |

## test-folder-files-in-python-forms → test-files-named-by-role
A `.py` file in `tests/` is a spec `test_<name>.py`, a fake `<contract>_fake.py`, fixtures `<name>_fixtures.py`, or `conftest.py`, which shares fixtures with the specs of its folder.

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

## no-any-annotation · MUST
No `Any`: not in an annotation, a `cast` or a generic's arguments — `dict[str, Any]` — in specs too. An unannotated parameter or return is `Any` as well, and so is the argument a generic is written without.

| Why | Check | Tags |
|---|---|---|
| `Any` switches the type checker off for everything it touches, and it spreads. | review | [] |

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

## generics-in-pep-695-form · SHOULD
A generic class, function or alias is declared in the form of PEP 695 — `class Box[T]`, `def first[T](items: list[T]) -> T`, `type Orders = list[Order]` — never through `TypeVar`, `Generic` or `TypeAlias`.

| Why | Check | Tags |
|---|---|---|
| the parameters are declared where they are used, and nothing outside the declaration can reach them. | tool/lint | [] |

## aware-datetimes-only · MUST
A `datetime` carries its time zone: `now`, `fromtimestamp` and the constructor are given one, `strptime` reads one, and `utcnow`, `utcfromtimestamp` and `today` are never called.

| Why | Check | Tags |
|---|---|---|
| a naive `datetime` is read in the machine's zone by one function and in UTC by the next, and the two compare as if they were the same instant. | tool/lint | [data] |

## overrides-marked-by-decorator · MUST
A method that overrides one of a base class is marked `@override`, `__init__`, `__new__`, `__init_subclass__` and `__post_init__` aside.

| Why | Check | Tags |
|---|---|---|
| the type checker then fails when an override stops overriding anything, or a new method overrides one by accident. | tool/types | [] |

## business-types-frozen-dataclasses → immutable-by-default
A type of the program's business data is a dataclass with `frozen=True, slots=True, kw_only=True`, its sequences tuples and its maps typed `Mapping`.

| Why | Check | Tags |
|---|---|---|
| the runtime then refuses a mutation the business never meant, and each field is set by its name. | review | [] |

## Functions

## keyword-only-past-three → at-most-three-positional-arguments
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

## except-never-only-passes → catch-never-empty
No `except` body is only `pass` or `continue`.

| Why | Check | Tags |
|---|---|---|
| these are the bodies that swallow every error the clause catches. | tool/lint | [errors] |

## Comments and suppressions

## docstring-only-for-non-obvious-public-entry → docs-only-for-non-obvious-public-entry
A docstring documents only a public entry whose use is not obvious, in the Google form, its summary on the first line.

| Why | Check | Tags |
|---|---|---|
| a docstring that repeats a signature drifts from it, and the editor already shows the annotations. | review | [] |

## suppression-names-its-code-and-reason → suppression-states-its-reason
A suppression comment names the code of each check it silences, never a whole check, and gives its reason after ` -- `: `# noqa: S608 -- the table name comes from an enum`.

| Why | Check | Tags |
|---|---|---|
| a suppression of one code can be judged, and its reason says whether it still holds. | review | [] |

## Dependencies

## tools-in-the-dev-group · MUST
Build, test and lint tools are pinned exactly, with `==`, in the `dev` group of `[dependency-groups]` in `pyproject.toml`, never installed globally, and production code imports none of them.

| Why | Check | Tags |
|---|---|---|
| a tool installed globally runs in another version on every machine, and one in the program's dependencies ships to every installation. | review | [security] |

## requires-python-at-the-pinned-minor · SHOULD
`requires-python` in `[project]` is a floor at the minor of the interpreter the repository pins: `>=3.14`.

| Why | Check | Tags |
|---|---|---|
| the linter and the type checker read the language's version from it, and hold the code to an older language when the floor is lower. | review | [] |

## floor-ranges-lockfile-pins · SHOULD
A dependency of the program is declared with a `>=` floor and capped only with the reason beside the cap; the lockfile pins the exact versions.

| Why | Check | Tags |
|---|---|---|
| the manifest says what is compatible, the lockfile what is installed; a cap with no reason blocks every later fix. | review | [security] |
