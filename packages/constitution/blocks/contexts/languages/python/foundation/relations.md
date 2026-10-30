# Relations

> Governs overrides, module-level state, parameter defaults and imports.

## Modules

### import-never-a-wildcard · MUST

An import names each name it takes; `from <module> import *` is never written.

| Why |
|---|
| a wildcard hides where a name comes from, and a name the other module adds later silently shadows one of the importer's. |

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

### parameter-default-never-mutable → state-never-global-and-mutable · MUST

A parameter's default is an immutable value — `None`, a number, a string, a tuple, a frozen value — never a list, a dict, a set or a call that builds a mutable value.

| Why |
|---|
| a default is evaluated once, when the function is defined, so a mutable one is a single object every call shares and changes. |

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
