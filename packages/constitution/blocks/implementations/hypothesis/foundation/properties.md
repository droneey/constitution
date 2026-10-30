# Properties

> Governs a property test, its counterexamples and its profile in CI.

## General

### property-written-with-given → property-tested-where-it-pays · SHOULD

A property test is a case of its unit's spec decorated with `@given`, its inputs drawn by strategies built on the unit's fixture, narrowed by the invariant it proves, and a counterexample Hypothesis finds is kept as an `@example(...)` on it.

| Why |
|---|
| a property beside the unit's other cases runs and fails with them, a strategy built from the invariant draws the inputs that can break it, and an explicit example runs first on every run, whatever the strategies draw. |

### ci-profile-left-to-hypothesis → flaky-test-fixed-never-retried · SHOULD

Under `CI`, Hypothesis's own profile `ci` runs — `derandomize=True`, `database=None` — and the project registers no profile of that name and loads no other.

| Why |
|---|
| CI then draws the same inputs on every run of the same code and keeps no database between runs, so a red build is red again when rerun. |
