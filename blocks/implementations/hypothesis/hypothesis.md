---
id: hypothesis
summary: Hypothesis writes Python's property tests.
requires: [python]
extends: null
abstract: false
languages: []
dictionary: [Hypothesis, .hypothesis]
governs: []
---

# Hypothesis

> Draws the inputs of a property test and shrinks a failing one to its smallest form. Outside CI it remembers the inputs that failed in `.hypothesis/`, which is ignored; under `CI` it loads its own profile `ci`.

### property-written-with-given → property-tested-where-it-pays
A property test is a case of its unit's spec decorated with `@given`, its inputs drawn by strategies built from the types and the invariant it proves.

| Why | Tags |
|---|---|
| a property beside the unit's other cases runs and fails with them, and a strategy built from the invariant draws the inputs that can break it. | [testing] |

### counterexample-kept-by-example → property-tested-where-it-pays
A counterexample Hypothesis finds is kept as an `@example(...)` on its property.

| Why | Tags |
|---|---|
| an explicit example runs first on every run, whatever the strategies draw. | [testing] |

### ci-profile-left-to-hypothesis → flaky-test-fixed-never-retried
Under `CI`, Hypothesis's own profile `ci` runs — `derandomize=True`, `database=None` — and the project registers no profile of that name and loads no other.

| Why | Tags |
|---|---|
| CI then draws the same inputs on every run of the same code and keeps no database between runs, so a red build is red again when rerun. | [testing] |
