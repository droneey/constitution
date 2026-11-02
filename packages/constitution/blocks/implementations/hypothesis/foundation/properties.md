# Properties

> Governs a property test, its counterexamples and its profile in CI.

## General

### property-written-with-given → property-tested-where-it-pays · SHOULD

A property test is a `@given` case of its unit's spec that keeps each counterexample as an `@example`. Its inputs are drawn by strategies built on the unit's fixture, narrowed by the invariant it proves, and a counterexample Hypothesis finds is kept as an `@example(...)` on it.

| Why |
|---|
| a property kept apart from its unit's cases does not run and fail with them, a strategy drawn without the invariant spends its draws on inputs that cannot break it, and a counterexample not kept as an explicit example is lost once the strategies draw elsewhere. |

### ci-profile-left-to-hypothesis → flaky-test-fixed-never-retried · SHOULD

Under `CI`, Hypothesis's own profile `ci` runs. That profile sets `derandomize=True` and `database=None`, and the project registers no profile of that name and loads no other.

| Why |
|---|
| a CI run that draws new inputs, or reads a database kept from an earlier run, can go red once and green on a rerun of the same code, and the failure is waved through as flaky; Hypothesis's own `ci` profile draws the same inputs on every run of the same code. |
