# Tests

> Governs where specs live, how their cases are named and what a case holds.

## How a case is written

### specs-in-a-tests-tree-beside-src → spec-found-from-its-units-path · SHOULD

A package's specs sit in `tests/` beside `src/`, never inside the import package, in folders that mirror the import package's.

| Why | Tags |
|---|---|
| the import package then ships no spec, and a unit's spec is found at the same path under `tests/` as the unit under `src/`. | [] |

### case-named-test-should → case-named-should-when · SHOULD

A case is a function `test_should_<behaviour>`, followed by `_when_<condition>` where the behaviour depends on one.

| Why | Tags |
|---|---|
| a case is a function found by its `test_` prefix, so core's words follow the prefix and a failing case still names its behaviour and condition. | [testing] |

### case-function-holds-no-branch → case-holds-no-logic · SHOULD

A `test_` function holds no `if`, `for`, `while`, `match` or conditional expression; its variants are the rows of a parametrized table.

| Why | Tags |
|---|---|
| a branch in a case is logic no case proves, and a table names each variant's condition. | [testing] |
