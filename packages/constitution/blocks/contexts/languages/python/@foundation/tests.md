# Tests

> Governs where specs live in Python.

## Where specs live

### specs-in-a-tests-tree-beside-src → spec-found-from-its-units-path · MUST

Every package's specs sit in `tests/` beside `src/`, never inside the import package, in folders that mirror the import package's.

#### Why

A spec inside the import package ships to every consumer of the package, and one away from its unit's mirrored path is not found from the unit, nor moved or deleted with it.

#### Examples

```text title="Avoid"
orders/
├── pyproject.toml
└── src/orders/
    ├── __init__.py
    ├── checkout/
    │   ├── __init__.py
    │   └── pricing.py
    └── tests/
        └── test_pricing.py
```

```text title="Prefer"
orders/
├── pyproject.toml
├── src/orders/
│   ├── __init__.py
│   └── checkout/
│       ├── __init__.py
│       └── pricing.py
└── tests/
    └── checkout/
        └── test_pricing.py
```
