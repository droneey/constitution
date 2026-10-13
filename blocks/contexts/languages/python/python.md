---
id: python
summary: Python's modules, types, async code, specs and dependencies.
requires: []
extends: null
abstract: false
languages: []
dictionary: [Python, .py, .pyi, __init__.py, __main__.py, main.py, py.typed, pyproject.toml, PEP 695]
governs: ["**/*.py", "**/*.pyi", pyproject.toml]
---

# Python

> Code written in Python: its modules and import packages, the annotations a type checker reads, its asynchronous code, and the specs that prove it.

## Code

### path-handled-by-pathlib · SHOULD
A file-system path is a `pathlib.Path`, joined with `/` and read through its methods, never a string built with `os.path`.

| Why | Tags |
|---|---|
| one object joins, resolves and reads a path, where a string path is joined by hand and a separator or a `..` slips through. | [] |

## Names

### names-cased-as-pep-8 → name-case-by-kind · SHOULD
A class, a type alias, a type parameter and an exception are PascalCase, an exception's name ending in `Error`; a module, a function, a method, a variable and a parameter are snake_case; a module-level constant and an enumeration's member are UPPER_SNAKE_CASE; a name kept to its module or class opens with one underscore.

| Why | Tags |
|---|---|
| every Python reader and library uses these cases, so the case alone tells a class from a function and a constant from a variable before the declaration is read. | [] |

### named-constant-annotated-final → literal-with-a-meaning-is-named · SHOULD
A named constant is a module-level UPPER_SNAKE_CASE name annotated `Final`: `MAX_PAGE_SIZE: Final = 100`.

| Why | Tags |
|---|---|
| the case only asks a reader not to rebind the name, while `Final` makes a rebinding fail the type check. | [] |

## Functions

### parameter-past-the-third-keyword-only → function-takes-at-most-three-positions · SHOULD
A parameter past the third positional one is keyword-only, declared after a bare `*`.

| Why | Tags |
|---|---|
| a keyword-only parameter is named at every call, so no caller has to remember its position. | [] |

### boolean-parameter-keyword-only → function-takes-no-boolean-position · SHOULD
A boolean parameter is keyword-only, declared after a bare `*`.

| Why | Tags |
|---|---|
| the call then reads `save(user, notify=True)`, never `save(user, True)`. | [] |

## Relations

### overrides-marked-by-decorator → override-marked-where-declared · MUST
A method that overrides one of a base class is decorated `@typing.override`; `__init__`, `__new__`, `__init_subclass__` and `__post_init__` aside.

| Why | Tags |
|---|---|
| a marked method whose base renamed or dropped its counterpart then fails the type check, and the methods aside are hooks of the language that no mark would make clearer. | [] |

### module-level-state-never-mutable → state-never-global-and-mutable · MUST
No code uses the `global` statement, and no module-level name holds a list, a dict, a set or another container the code changes after import.

| Why | Tags |
|---|---|
| a module is imported once per process, so its state is shared by every caller and leaks from one test into the next. | [] |

### parameter-default-never-mutable → state-never-global-and-mutable · MUST
A parameter's default is an immutable value — `None`, a number, a string, a tuple, a frozen value — never a list, a dict, a set or a call that builds a mutable value.

| Why | Tags |
|---|---|
| a default is evaluated once, when the function is defined, so a mutable one is a single object every call shares and changes. | [] |

### implementation-never-inherits-its-contract → behaviour-composed-not-inherited · SHOULD
An implementation meets its contract by its shape and never inherits it; an abstract base class is no contract.

| Why | Tags |
|---|---|
| an implementation that inherits its contract inherits code and a hierarchy with it, while a protocol lets a fake or an adapter keep the contract without importing anything of the other. | [] |

### import-never-a-wildcard · MUST
An import names each name it takes; `from <module> import *` is never written.

| Why | Tags |
|---|---|
| a wildcard hides where a name comes from, and a name the other module adds later silently shadows one of the importer's. | [] |

### sys-path-never-touched · MUST
No code reads or changes `sys.path`.

| Why | Tags |
|---|---|
| a module then resolves only as a member of an installed package, the project's own included, so it imports the same way in the program, the specs and every tool. | [] |

## Types

### absence-spelled-none → absence-shown-by-the-type · MUST
Absence is `None`, typed `T | None`, and no other value stands for it. Where `None` is itself a value a caller passes — a patch that clears a field — “not given” is one sentinel declared once: the built-in `sentinel` from Python 3.15, and below it a one-member enumeration.

| Why | Tags |
|---|---|
| a second spelling of absence needs a second check, and a sentinel the type names keeps “not given” apart from “cleared” without an object the checker cannot see through. | [] |

### typing-any-never-written → unchecked-type-never-used · MUST
`Any` is written nowhere — not in an annotation, a `cast` or a generic's arguments such as `dict[str, Any]` — and no parameter, return or generic argument is left unannotated, which reads as `Any`.

| Why | Tags |
|---|---|
| `Any` passes every check in both directions, so one unannotated parameter spreads unchecked values into every caller and callee. | [] |

### boundary-values-object-until-parsed → outside-value-untyped-until-parsed · MUST
A value from outside the program — `json.loads`'s result included — is typed `object` until a model parses it or `isinstance` and `in` checks narrow it; a `cast` narrows nothing.

| Why | Tags |
|---|---|
| the type checker refuses every use of an `object` value until a check narrows it, where `Any` would allow them all. | [] |

### narrowing-function-returns-typeis → narrowing-proves-all-it-claims · MUST
A function that narrows its argument returns `TypeIs[T]`, never `TypeGuard[T]`, unless `T` is no subtype of the argument's type.

| Why | Tags |
|---|---|
| `TypeIs` narrows the false branch by the same check, while `TypeGuard` narrows only the true one and lets a function claim a type unrelated to what it was given. | [] |

### staged-value-is-a-union-of-dataclasses → illegal-state-unrepresentable · MUST
A value with distinct stages is a union of dataclasses, one per stage, each holding only its stage's fields, and code tells the stages apart by `match` on their classes.

| Why | Tags |
|---|---|
| the class is the stage's key, so no stage carries a field another stage needs, and each `case` sees only the fields its stage has. | [] |

### closed-set-match-ends-in-assert-never → closed-set-branched-exhaustively · MUST
A `match` or an `if` chain over a closed set — an enumeration, a union of classes or of literals — names every member in a branch and ends in `assert_never(value)`, with no other default branch.

| Why | Tags |
|---|---|
| `assert_never` fails the type check wherever a member added to the set is not handled, and raises if one arrives at run time. | [] |

### enumeration-is-a-unique-str-enum · SHOULD
An enumeration of values the program owns is an `enum.StrEnum` marked `@unique`, each member's value written out as the string the program stores and sends, never `auto()`.

| Why | Tags |
|---|---|
| a value written out survives a member's rename, which `auto()` would carry into every stored record and message, and `@unique` refuses two names for one value. | [] |

### outside-number-set-is-an-int-enum · SHOULD
A set of numbers another system defines — exit statuses, HTTP statuses — is an `enum.IntEnum` with every member's value written, or the standard library's own such as `http.HTTPStatus`.

| Why | Tags |
|---|---|
| the numbers are fixed by the other system, so the members carry its values, and a string enumeration would hold a copy that the other side never reads. | [] |

### identifier-is-a-new-type → identifier-branded-by-entity · SHOULD
An entity's identifier is a `NewType` over its primitive: `OrderId = NewType('OrderId', UUID)`.

| Why | Tags |
|---|---|
| the type checker refuses an `OrderId` where a `CustomerId` is expected, and at run time the value is the primitive itself, at no cost. | [] |

### generics-in-pep-695-form · MUST
A generic class, function or type alias declares its type parameters in its own header — `class Box[T]`, `def first[T](items: Sequence[T]) -> T`, `type Orders = list[Order]` — never through `TypeVar`, `Generic` or `TypeAlias`.

| Why | Tags |
|---|---|
| the parameters are declared where they are used and reach nothing outside the declaration, and every Python the language block supports has the syntax. | [] |

### annotation-written-unquoted · SHOULD
Where the floor is Python 3.14 or later, an annotation is written unquoted, and no module imports `from __future__ import annotations`.

| Why | Tags |
|---|---|
| the language then evaluates annotations lazily by itself, and code that reads them at run time — a parser, a framework's injection — resolves them as written, which the future import's strings do not always allow. | [] |

### business-types-frozen-dataclasses → value-immutable-by-default · SHOULD
A type of the program's business data is a dataclass with `frozen=True, slots=True, kw_only=True`, its sequences tuples and its maps a `frozendict` where the floor is Python 3.15, typed `Mapping` below it.

| Why | Tags |
|---|---|
| the runtime then refuses a mutation the business never meant, each field is set by its name, and a `frozendict` keeps the value hashable where a `dict` behind `Mapping` does not. | [] |

### invariant-value-is-a-frozen-dataclass → invariant-value-is-plain-immutable-data · MUST
A value that keeps an invariant is a dataclass with `frozen=True, slots=True`, whose every field is immutable — a `str`, an `int`, a `Decimal`, a `tuple`, a `frozenset`, a `frozendict` where the floor is Python 3.15, or another such value — and never a `NamedTuple` or a parsing library's model.

| Why | Tags |
|---|---|
| the generated `__eq__` and `__hash__` then compare and hash it by its data, while a `NamedTuple` equals any tuple of the same items and a parsing library's model carries the library's behaviour beside the data. | [] |

### invariant-checked-in-post-init → invariant-checked-at-construction · MUST
A dataclass that keeps an invariant checks it in `__post_init__` and raises an expected failure of the program's own when it fails.

| Why | Tags |
|---|---|
| every way of building the value — the constructor, `replace`, a parser — passes through `__post_init__`, so a value that exists is valid. | [] |

### instant-is-an-aware-datetime → instant-is-an-exact-time · MUST
A `datetime` carries its time zone: `now` and `fromtimestamp` are given one, the constructor and `strptime` produce one, and `utcnow`, `utcfromtimestamp` and `today` are never called.

| Why | Tags |
|---|---|
| a naive `datetime` is read in the machine's zone by one function and in UTC by the next, and the two compare as if they were the same instant. | [data] |

### duration-measured-by-time-monotonic → duration-measured-on-a-monotonic-clock · MUST
A duration is measured by `time.monotonic()` or `time.perf_counter()`, never as a difference of `time.time()` or of two `datetime.now()`.

| Why | Tags |
|---|---|
| the wall clock jumps when it is corrected, and a duration measured across the jump is wrong or negative. | [data] |

### exact-quantity-is-an-int-or-a-decimal → exact-quantity-never-binary-float · MUST
An exact decimal quantity is an `int` of its smallest unit or a `decimal.Decimal` built from a string or an `int`, never from a `float`.

| Why | Tags |
|---|---|
| `Decimal(0.1)` keeps the binary error of the float it was given, while `Decimal('0.1')` is exact. | [data] |

### text-opened-with-utf-8-named → text-encoded-as-utf-8 · MUST
Every call that opens or decodes text — `open`, `Path.open`, `Path.read_text`, `Path.write_text`, a `subprocess` call with `text=True` — names `encoding='utf-8'`.

| Why | Tags |
|---|---|
| below Python 3.15 these calls default to the machine's locale, and from 3.15 a host's `PYTHONUTF8=0` brings it back, so the same file reads as different text on two machines. | [] |

## Errors

### except-clause-names-what-it-handles → catch-handles-only-what-it-recognises · MUST
An `except` clause names the exception types it handles; a bare `except:`, or one that catches `Exception` or `BaseException`, stands only in a handler of last resort or at the boundary of an optional part.

| Why | Tags |
|---|---|
| a broad clause catches the defects and the cancellation it never meant to handle along with the failure it did. | [] |

### except-never-only-passes → catch-handles-only-what-it-recognises · MUST
No `except` body is only `pass`, `...` or `continue`; a failure ignored on purpose is ignored by `contextlib.suppress`, with its reason in a comment beside it.

| Why | Tags |
|---|---|
| these are the bodies that swallow every failure the clause catches, while `suppress` names the one it ignores and carries the reason where a reader sees it. | [errors] |

### exception-group-caught-by-except-star → catch-handles-only-what-it-recognises · MUST
A failure out of a task group is caught by `except*` naming the types it handles, and the rest of the group propagates.

| Why | Tags |
|---|---|
| a task group raises an `ExceptionGroup`, which a plain `except` of a member type never matches, so the failure passes unhandled or is swallowed by a broad clause. | [errors] |

### mapped-error-raised-from-its-cause → error-keeps-its-cause · MUST
An exception raised inside an `except` clause to map the one caught is raised `from` it: `raise OrderNotFoundError(order_id) from error`.

| Why | Tags |
|---|---|
| `from` records the caught exception as the direct cause, so both tracebacks print together and the new one never reads as an accident during handling. | [errors] |

### finally-never-left-by-a-jump → catch-handles-only-what-it-recognises · MUST
A `finally` block is never left by `return`, `break` or `continue`.

| Why | Tags |
|---|---|
| a jump out of `finally` silently discards the exception in flight, which is why Python 3.14 warns of it. | [errors] |

### assert-statement-only-in-specs · MUST
Production code checks no input, invariant or state with an `assert` statement; it raises an error of the program's own.

| Why | Tags |
|---|---|
| an interpreter run with optimisation strips every `assert`, so a check written as one vanishes from that run. | [errors] |

## Effects

### concurrent-work-started-in-a-task-group → async-work-awaited-or-held-by-a-scope · MUST
Concurrent work starts in a task group — `asyncio.TaskGroup`, or the one of the async library the project uses — never by a bare `asyncio.create_task`, `ensure_future` or `gather`.

| Why | Tags |
|---|---|
| a task group waits for its tasks, cancels the rest on the first failure and raises every failure together, where a bare task is dropped or fails unseen. | [errors] |

### deadline-by-a-timeout-scope → outside-call-has-a-timeout · MUST
Awaited work across a process boundary that its client does not bound itself runs inside a timeout scope — `asyncio.timeout`, or the async library's own.

| Why | Tags |
|---|---|
| a scope cancels everything awaited inside it once the deadline passes and raises at its edge, so one deadline covers a whole exchange of calls. | [errors, performance] |

### cancellation-always-re-raised → async-work-awaited-or-held-by-a-scope · MUST
A clause that catches `asyncio.CancelledError`, or a base class of it, re-raises it once its cleanup is done.

| Why | Tags |
|---|---|
| a swallowed cancellation leaves the task running after its scope gave up on it, and the scope's timeout and task group stop working. | [errors] |

### async-functions-never-block · SHOULD
An `async def` function makes no blocking call — a synchronous file or network read, `time.sleep`, a synchronous client — and runs blocking work in a thread through `asyncio.to_thread` or the framework's own.

| Why | Tags |
|---|---|
| one blocking call in a coroutine stalls everything else the event loop runs. | [performance] |

### resource-held-by-with → resource-released-on-every-path · MUST
A resource — a file, a connection, a lock, a client — is acquired by `with` or `async with`, and a number of them known only at run time through `contextlib.ExitStack` or `AsyncExitStack`.

| Why | Tags |
|---|---|
| the block's exit releases it however the block is left, a failure or a cancellation included. | [] |

### thread-shared-state-guarded-by-a-lock → state-shared-by-concurrent-work-owned-or-guarded · MUST
State that threads share is owned by one thread or guarded by a `threading.Lock`, even where an operation looks atomic; no code relies on the global interpreter lock for it.

| Why | Tags |
|---|---|
| the free-threaded build runs threads truly in parallel, and even under the lock a `+=` or a check-then-set is several steps another thread can split. | [data] |

### logger-got-by-module-name → diagnostics-written-through-a-logger · MUST
A module writes its diagnostics through a logger got by `logging.getLogger(__name__)`.

| Why | Tags |
|---|---|
| the logger's name is then the module's path, so the root sets levels and sinks per package, and every record says where it came from. | [] |

## Security

### process-started-with-an-argument-list → outside-input-reaches-interpreters-as-parameters · MUST
A process is started with its arguments as a list — `subprocess.run([...])`, `asyncio.create_subprocess_exec` — never with `shell=True`, `os.system` or `os.popen`.

| Why | Tags |
|---|---|
| each item of a list reaches the program as one argument, while a shell parses the string and runs whatever a value smuggles into it. | [security] |

### interpreter-input-never-formatted-into-text → outside-input-reaches-interpreters-as-parameters · MUST
Outside input never reaches a query or markup through an f-string, `%` or `str.format`; it travels as the interpreter's parameter, or in a template string `t'…'` that the interpreter's library renders.

| Why | Tags |
|---|---|
| text formatted into a query or markup becomes code, while a parameter or a template keeps the input apart from what the library escapes or binds. | [security] |

### outside-path-confined-after-resolve → outside-path-confined-to-its-root · MUST
A path built from outside input is joined to its root, resolved with `Path.resolve()`, and refused unless `is_relative_to(root.resolve())` holds for it.

| Why | Tags |
|---|---|
| a `..` or a symbolic link otherwise walks out of the root, and a check on the unresolved string misses both. | [security] |

### child-process-given-its-own-env → child-process-environment-built-for-it · MUST
A process the program starts — through `subprocess` or `asyncio.create_subprocess_exec` — is passed `env=` a mapping built for it, never left to `env=None` and never given a copy of `os.environ`.

| Why | Tags |
|---|---|
| every one of these calls copies the program's whole environment into the child when `env` is left out or `None`, a secret among it. | [security] |

### outside-data-never-unpickled → outside-input-never-rebuilt-as-objects · MUST
Data from outside is never read by a loader that builds objects from what it names — `pickle`, `marshal`, `shelve`, `dill`, `jsonpickle`, `torch.load` without `weights_only=True`.

| Why | Tags |
|---|---|
| unpickling calls whatever the data names, so a crafted file runs code with the program's rights. | [security] |

### guarding-value-drawn-from-secrets → security-primitive-from-a-vetted-library · MUST
A token, a nonce or an identifier that guards access is drawn from the `secrets` module, never from `random`.

| Why | Tags |
|---|---|
| `random` is a predictable generator whose next values follow from the ones it gave. | [security] |

### secret-compared-by-compare-digest → security-primitive-from-a-vetted-library · MUST
A secret — a token, a signature, a key — is compared with `hmac.compare_digest`, never with `==`.

| Why | Tags |
|---|---|
| `==` stops at the first character that differs, so its timing tells an attacker how much of a guess was right. | [security] |

## Dependencies

### tools-in-the-dev-group → tool-pinned-exactly-by-the-repository · MUST
A tool PyPI publishes is pinned with `==` in the `dev` group of `[dependency-groups]` in `pyproject.toml`.

| Why | Tags |
|---|---|
| a dependency group is installed in the repository and never published with a package built from it. | [] |

### requires-python-at-the-pinned-minor · SHOULD
A unit that no registry distributes floors its `requires-python` in `[project]` at the minor of the interpreter the repository pins: `>=3.14`.

| Why | Tags |
|---|---|
| the floor is the language the code is written for, and a lower one withholds features the pinned interpreter offers while claiming a support nobody tests. | [] |

### private-name-of-a-dependency-never-imported → dependency-reached-through-its-public-entry · MUST
Code never imports, from another distribution, a module or a name whose path has a segment that opens with `_`.

| Why | Tags |
|---|---|
| a leading underscore is Python's mark of what a package keeps to itself and changes without notice. | [] |

## Tools

### suppression-names-its-code-and-reason → suppression-states-its-reason · MUST
A suppression comment gives its reason after its codes and ` -- `: `# noqa: S608 -- the table name comes from an enum`.

| Why | Tags |
|---|---|
| one separator puts the reason of every suppression in the same place, whichever tool's comment it is. | [] |

## Layout

### source-root-is-src-import-package · MUST
A package's code sits in `src/<import name>/`, its import package, and no module of it sits beside `src/`.

| Why | Tags |
|---|---|
| the code is then importable only once the package is installed, so the specs run against the package as it ships rather than the working folder by accident. | [] |

### source-folder-is-a-regular-package · MUST
Every folder of the import package holds an `__init__.py`; the import tree has no namespace package.

| Why | Tags |
|---|---|
| a folder without one is a namespace package, which another installed distribution can merge into, and whose files nothing imports go unmeasured by coverage. | [] |

### module-named-in-snake-case → file-name-in-its-owners-case · MUST
A module is a snake_case `.py` file and its stub a `.pyi`; a folder of the import package is a snake_case package, and a folder of `tests/` a snake_case folder that is no package; the interpreter's `__pycache__/` and `.pyc` files keep the names it gives them. Every other file and folder is kebab-case.

| Why | Tags |
|---|---|
| a module's name is the name it is imported by, and the language allows no hyphen in it; outside the import tree, core's case holds. | [] |

### test-folder-files-in-python-forms → file-named-for-its-kind · MUST
A `.py` file in `tests/` is a spec `test_<name>.py`, a fake `<contract>_fake.py`, fixtures `<name>_fixtures.py`, or a file whose name the test runner fixes.

| Why | Tags |
|---|---|
| a spec is found by its `test_` prefix, so a spec named otherwise never runs, and a helper named like one would. | [testing] |

### spec-kind-named-by-its-folder → file-named-for-its-kind · MUST
An integration spec sits in `tests/integration/`, an end-to-end spec in `tests/e2e/`, each in a tree under it that mirrors the import package, and a unit spec elsewhere in `tests/`.

| Why | Tags |
|---|---|
| the `test_` prefix leaves the name no room for the kind, so the folder carries it, and each kind runs as a step of its own. | [testing] |

## Comments

### docstring-only-where-not-obvious → export-documented-only-where-not-obvious · SHOULD
A public module, class or function has a docstring only where its names and annotations leave something unsaid: a precondition, a unit, a failure, an effect.

| Why | Tags |
|---|---|
| a docstring that repeats a signature drifts from it, and the editor already shows the annotations. | [] |

### docstring-in-google-form · SHOULD
A docstring is in the Google form: a one-line summary on its first line, then the `Args:`, `Returns:` and `Raises:` sections it needs.

| Why | Tags |
|---|---|
| one form reads the same in every module, and the summary on the first line is what `help()` and an editor show first. | [] |

### deprecated-by-decorator → retired-code-marked-deprecated · SHOULD
Code kept only for its old callers is decorated `@warnings.deprecated`, imported from `typing_extensions` below Python 3.13, with a message that names its replacement.

| Why | Tags |
|---|---|
| the mark warns at every call at run time and flags every call where it is written, both with the message, which a docstring never does. | [] |

## Tests

### specs-in-a-tests-tree-beside-src → spec-found-from-its-units-path · SHOULD
A package's specs sit in `tests/` beside `src/`, never inside the import package, in folders that mirror the import package's.

| Why | Tags |
|---|---|
| the import package then ships no spec, and a unit's spec is found at the same path under `tests/` as the unit under `src/`. | [] |

### case-named-test-should → case-named-should-when · SHOULD
A case is a function `test_should_<behaviour>`, followed by `_when_<condition>` where the behaviour depends on one.

| Why | Tags |
|---|---|
| a case is a function found by its `test_` prefix, so core's words follow the prefix and a failing case still names its behaviour and condition. | [testing] |

### case-function-holds-no-branch → case-holds-no-logic · SHOULD
A `test_` function holds no `if`, `for`, `while`, `match` or conditional expression; its variants are the rows of a parametrized table.

| Why | Tags |
|---|---|
| a branch in a case is logic no case proves, and a table names each variant's condition. | [testing] |
