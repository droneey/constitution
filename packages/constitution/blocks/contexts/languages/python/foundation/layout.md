# Layout

> Governs a Python file or folder: the source root, its packages, and the names of modules and test files.

## Kinds

### test-folder-files-in-python-forms → file-named-for-its-kind · MUST

A `.py` file in `tests/` is a spec `test_<name>.py`, a fake `<contract>_fake.py`, a contract suite `<contract>_suite.py`, fixtures `<name>_fixtures.py`, or a file whose name the test runner fixes.

| Why |
|---|
| a spec is found by its `test_` prefix, so a spec named otherwise never runs, and a helper named like one would. |

### spec-kind-named-by-its-folder → file-named-for-its-kind · MUST

An integration spec sits in `tests/integration/`, an end-to-end spec in `tests/e2e/`, each in a tree under it that mirrors the import package, and a unit spec elsewhere in `tests/`.

| Why |
|---|
| the `test_` prefix leaves the name no room for the kind, so the folder carries it, and each kind runs as a step of its own. |

## Names

### module-named-in-snake-case → file-name-in-its-owners-case · MUST

A module is a snake_case **`.py`**{#python-module} file and its stub a **`.pyi`**{#python-stub}; a folder of the import package is a snake_case package — `order_lines/` — a generated module `<name>_gen.py` and a generated package `<name>_gen/`, a module of messages `<name>_messages.py`; a folder of `tests/` is a snake_case folder that is no package; the interpreter's `__pycache__/` and `.pyc` files keep the names it gives them.

| Why |
|---|
| a module's name is the name it is imported by, and the language allows no hyphen in it; outside the import tree, core's case holds. |

## Folders

### source-root-is-src-import-package · MUST

A package's code sits in `src/<import name>/`, its import package, and no module of it sits beside `src/`.

| Why |
|---|
| the code is then importable only once the package is installed, so the specs run against the package as it ships rather than the working folder by accident. |

### source-folder-is-a-regular-package · MUST

Every folder of an import package that holds modules holds an **`__init__.py`**, and its import tree has no namespace package; a package of data alone, which holds no module, is a namespace package.

| Why |
|---|
| a folder without one is a namespace package, which another installed distribution can merge into, and whose files nothing imports go unmeasured by coverage. |
