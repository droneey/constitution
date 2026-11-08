# Relations

> Governs how a Python unit is built, holds state and depends on or extends another: the import path, module-level state, the process's environment variables, overrides and deprecation.

## Modules

### sys-path-never-changed · MUST

No code changes `sys.path`.

| Why |
|---|
| code that changes `sys.path` makes a module import one way in the program and another in the specs or a tool, or shadows an installed package with a file of the working folder. |

## Construction and state

### module-or-class-level-value-never-changed → state-never-global-and-mutable · MUST

No module-level or class-level value changes after import. No code uses the `global` statement, and no module-level name or class attribute holds a value that code changes after import, such as a list it appends to, an object whose attributes it sets or a cache of `functools.cache` or `lru_cache`. Exempt: the diagnostic handles, configured once at start, and a spec's setup that its hooks make anew for each case.

| Why |
|---|
| a module is imported once per process, so its state is shared by every caller and leaks from one test into the next. |

### os-environ-never-changed → state-never-global-and-mutable · MUST

No code changes the process's environment variables. It assigns to no key of `os.environ` or `os.environb` and calls no `os.putenv` or `os.unsetenv`. Exempt: a spec's setup that its hooks make anew for each case.

| Why |
|---|
| the environment variables are one mapping shared by every module of the process and by every child it starts, so a change made by one caller reaches all the others in an order no signature shows. |

## Inheritance and patterns

### overrides-marked-by-decorator → override-marked-where-declared · MUST

Every method that overrides one of a base class is decorated `@typing.override`. Exempt: `__init__`, `__new__` and `__init_subclass__`.

| Why |
|---|
| an unmarked override stops overriding unseen when its base renames or drops its counterpart, while a marked one then fails the type check. |

## Deprecation

### deprecated-by-decorator → retired-code-marked-deprecated · SHOULD

All code kept only for its old callers is decorated `@warnings.deprecated`.

| Why |
|---|
| a deprecation said only in a docstring is never seen where the code is called, so new callers keep coming, while the decorator warns at every call at run time and flags every call where it is written. |
