# Relations

> Governs how a Python unit is built, holds state and depends on or extends another: the import path, module-level state, overrides and deprecation.

## Modules

### sys-path-never-touched · MUST

No code reads or changes `sys.path`.

| Why |
|---|
| a module then resolves only as a member of an installed package, the project's own included, so it imports the same way in the program, the specs and every tool. |

## Construction and state

### module-level-state-never-mutable → state-never-global-and-mutable · MUST

No code uses the `global` statement; no module-level name or class attribute holds a value whose state changes after import — a container, an object whose attributes change, a cache of `functools.cache` or `lru_cache` — save the diagnostics facades configured once at start and a spec's setup that its hooks set for each case.

| Why |
|---|
| a module is imported once per process, so its state is shared by every caller and leaks from one test into the next. |

## Inheritance and patterns

### overrides-marked-by-decorator → override-marked-where-declared · MUST

A method that overrides one of a base class is decorated `@typing.override`; `__init__`, `__new__`, `__init_subclass__` and `__post_init__` aside.

| Why |
|---|
| a marked method whose base renamed or dropped its counterpart then fails the type check, and the methods aside are hooks of the language that no mark would make clearer. |

## Deprecation

### deprecated-by-decorator → retired-code-marked-deprecated · SHOULD

Code kept only for its old callers is decorated `@warnings.deprecated` with a message that names its replacement.

| Why |
|---|
| the mark warns at every call at run time and flags every call where it is written, both with the message, which a docstring never does. |
