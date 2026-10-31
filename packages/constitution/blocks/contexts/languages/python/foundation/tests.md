# Tests

> Governs specs and cases in Python: where specs live and how their cases are named.

## How a case is written

### specs-in-a-tests-tree-beside-src → spec-found-from-its-units-path · SHOULD

A package's specs sit in `tests/` beside `src/`, never inside the import package, in folders that mirror the import package's.

| Why |
|---|
| the import package then ships no spec, and a unit's spec is found at the same path under `tests/` as the unit under `src/`. |

### case-named-test-should → case-named-should-when · SHOULD

A case is a function `test_should_<behaviour>`, followed by `_when_<condition>` where the behaviour depends on one.

| Why |
|---|
| a case is a function found by its `test_` prefix, so core's words follow the prefix and a failing case still names its behaviour and condition. |
