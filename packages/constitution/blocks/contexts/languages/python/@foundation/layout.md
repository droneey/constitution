# Layout

> Governs a Python file or folder: the source root, its packages, and the names of modules and test files.

## Vocabulary

A Python module is a **`.py`**{#python-module} file, and its stub a **`.pyi`**{#python-stub} file of its annotations alone.

A package's **import package** is the folder of its modules that code imports the package by.

A program's entry file is **`main.py`**{#entry}.

The **`__init__.py`**{#surface} of a folder of the import package is the folder's surface, where the folder has one.

Python joins a kind's mark to a module's name by an underscore, since it reads a dot in a name as a package boundary: a spec is **`test_<name>.py`**{#spec-file}, a fake **`<contract>_fake.py`**{#fake-file}, a contract suite **`<contract>_suite.py`**{#contract-suite-file}, fixtures **`<name>_fixtures.py`**{#fixtures-file}, a generated module **`<name>_gen.py`**{#generated-file} and a generated package **`<name>_gen/`**{#generated-folder}.

An integration spec's mark is the folder **`tests/integration/`**{#integration-spec-file} it sits under, and an end-to-end spec's the folder **`tests/e2e/`**{#end-to-end-spec-file}, since the `test_` prefix leaves a spec's name no room for its kind.

## Names

### module-named-in-snake-case → file-name-in-its-owners-case · MUST

Every module, stub and folder of the import package or of `tests/` is named in snake_case. A folder of `tests/` takes it though it is no package. Exempt: the `__pycache__/` folders and `.pyc` files the interpreter writes, which keep the names it gives them.

#### Why

A module's name is the name it is imported by, and a module named with a hyphen cannot be imported at all, since the language allows none in a name, while a folder of specs named in another case than the modules it mirrors is not found from them.

#### Examples

```text title="Avoid"
src/shop/
├── __init__.py
├── order-totals.py         cannot be imported
└── PaymentGateway/
    ├── __init__.py
    └── stripeAdapter.py
```

```text title="Prefer"
src/shop/
├── __init__.py
├── order_totals.py
└── payment_gateway/
    ├── __init__.py
    └── stripe_adapter.py
```

## Folders

### source-root-is-src-import-package → package-part-sits-in-its-named-folder · MUST

Every package's code sits in its import package, `src/<import name>/`, and no module of it sits beside `src/`.

#### Why

Code beside `src/` is importable from the working folder without being installed, so the specs pass against files the built package may not ship.

#### Examples

```text title="Avoid"
shop/
├── pyproject.toml
├── shop/                   importable from the working folder uninstalled
│   ├── __init__.py
│   └── order_totals.py
└── tests/
    └── test_order_totals.py
```

```text title="Prefer"
shop/
├── pyproject.toml
├── src/
│   └── shop/
│       ├── __init__.py
│       └── order_totals.py
└── tests/
    └── test_order_totals.py
```

### source-folder-is-a-regular-package · MUST

Every folder of an import package that holds a module, at any depth, holds an `__init__.py`.

#### Why

A folder without one is a namespace package, which another installed distribution can merge into, and whose files nothing imports go unmeasured by coverage.

#### Examples

```text title="Avoid"
src/shop/
├── __init__.py
└── features/               no __init__.py: a namespace package
    └── orders/
        ├── __init__.py
        └── order_totals.py
```

```text title="Prefer"
src/shop/
├── __init__.py
└── features/
    ├── __init__.py
    └── orders/
        ├── __init__.py
        └── order_totals.py
```
