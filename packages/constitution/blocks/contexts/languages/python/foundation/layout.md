# Layout

> Governs a Python file or folder: the source root, its packages, and the names of modules and test files.

## Kinds

### test-folder-files-in-python-forms → file-named-for-its-kind · MUST

A `.py` file in `tests/` takes Python's spelling of its kind. A spec is `test_<name>.py`, a fake `<contract>_fake.py`, a contract suite `<contract>_suite.py` and fixtures `<name>_fixtures.py`; any other `.py` file there is one whose name the test runner fixes.

| Why |
|---|
| a spec is found by its `test_` prefix, so a spec named otherwise never runs, and a helper named like one would. |

### spec-kind-named-by-its-folder → file-named-for-its-kind · MUST

A spec's kind is named by its folder. An integration spec sits in `tests/integration/` and an end-to-end spec in `tests/e2e/`, each in a tree under it that mirrors the import package, and a unit spec elsewhere in `tests/`; these folders are Python's spelling of core's kinds of spec.

| Why |
|---|
| the `test_` prefix leaves a spec's name no room for its kind, so a spec outside its kind's folder runs in another kind's step: a slow integration spec in the fast unit run, or a spec out of the run that starts its engine. |

### generated-and-message-files-spelled-in-python-forms → file-named-for-its-kind · MUST

A generated module, a generated package and a module of messages take Python's spellings of their kinds. They are `<name>_gen.py`, `<name>_gen/` and `<name>_messages.py` in turn.

| Why |
|---|
| core's spellings put a dot in a module's name, which Python reads as a package boundary, so a generated module or a module of messages named core's way cannot be imported, and one named some other way is told apart from hand-written code by no reader and no tool. |

## Names

### module-named-in-snake-case → file-name-in-its-owners-case · MUST

A module is named in snake_case. It is a snake_case **`.py`**{#python-module} file and its stub a **`.pyi`**{#python-stub}; a folder of the import package is a snake_case package; a folder of `tests/` is a snake_case folder that is no package; the interpreter's `__pycache__/` and `.pyc` files keep the names it gives them.

| Why |
|---|
| a module's name is the name it is imported by, and a module named with a hyphen cannot be imported at all, since the language allows none in a name; outside the import tree, core's case holds. |

## Folders

### source-root-is-src-import-package · MUST

A package's code sits in `src/<import name>/`, its import package, and no module of it sits beside `src/`.

| Why |
|---|
| code beside `src/` is importable from the working folder without being installed, so the specs pass against files the built package may not ship. |

### source-folder-is-a-regular-package · MUST

Every folder of an import package that holds modules holds an `__init__.py`. That **`__init__.py`**{#surface} is its surface, and the import tree has no namespace package; a package of data alone, which holds no module, is a namespace package.

| Why |
|---|
| a folder without one is a namespace package, which another installed distribution can merge into, and whose files nothing imports go unmeasured by coverage. |
