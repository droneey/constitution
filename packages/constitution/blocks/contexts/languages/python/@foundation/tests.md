# Tests

> Governs specs and cases in Python: where specs live and how their cases are named.

## Where specs live

### specs-in-a-tests-tree-beside-src → spec-found-from-its-units-path · MUST

Every package's specs sit in `tests/` beside `src/`, never inside the import package, in folders that mirror the import package's.

| Why |
|---|
| a spec inside the import package ships to every consumer of the package, and one away from its unit's mirrored path is not found from the unit, nor moved or deleted with it. |

## How a case is written

### case-named-test-should → case-named-should-when · MUST

Every case is a function `test_should_<behaviour>`, followed by `_when_<condition>` where the behaviour depends on one.

| Why |
|---|
| the runner finds a case only by its `test_` prefix, so a case named by core's words alone never runs, and one named otherwise fails without naming its behaviour or its condition. |
