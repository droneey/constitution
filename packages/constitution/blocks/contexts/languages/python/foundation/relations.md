# Relations

> Governs how a Python unit is built, holds state and depends on or extends another: the import path, module-level state, overrides and deprecation.

## Modules

### sys-path-never-touched · MUST

No code reads or changes `sys.path`.

| Why |
|---|
| code that changes `sys.path` makes a module import one way in the program and another in the specs or a tool, or shadows an installed package with a file of the working folder. |

## Construction and state

### module-level-state-never-mutable → state-never-global-and-mutable · MUST

No module-level state changes after import. No code uses the `global` statement, and no module-level name or class attribute holds a value whose state changes after import — a container, an object whose attributes change, a cache of `functools.cache` or `lru_cache` — save the diagnostics facades configured once at start and a spec's setup that its hooks set for each case.

| Why |
|---|
| a module is imported once per process, so its state is shared by every caller and leaks from one test into the next. |

## Inheritance and patterns

### overrides-marked-by-decorator → override-marked-where-declared · MUST

A method that overrides one of a base class is decorated `@typing.override`. `__init__`, `__new__`, `__init_subclass__` and `__post_init__` are exempt.

| Why |
|---|
| an unmarked override stops overriding unseen when its base renames or drops its counterpart, while a marked one then fails the type check. |

## Deprecation

### deprecated-by-decorator → retired-code-marked-deprecated · SHOULD

Code kept only for its old callers is decorated `@warnings.deprecated` with a message that names its replacement.

| Why |
|---|
| a deprecation said only in a docstring is never seen where the code is called, so new callers keep coming, while the decorator warns at every call at run time and flags every call where it is written, each time with the message that names the replacement. |
