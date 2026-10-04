# Hypothesis

## property-written-with-given → property-tests-where-they-pay
A property test is a case of its unit's spec decorated with `@given`, its inputs drawn by strategies built from the types and the invariant it proves.

| Why | Check | Tags |
|---|---|---|
| a property beside the unit's other cases runs and fails with them, and a strategy built from the invariant draws the inputs that can break it. | review | [testing] |

## counterexample-kept-by-example → property-counterexample-kept-as-case
A counterexample Hypothesis finds is kept as an `@example(...)` on its property.

| Why | Check | Tags |
|---|---|---|
| an explicit example runs first on every run, whatever the strategies draw. | review | [testing] |

## ci-profile-left-to-hypothesis → specs-independent-of-order
Under `CI`, Hypothesis's own profile `ci` runs — `derandomize=True`, `database=None` — and the project registers no profile of that name and loads no other.

| Why | Check | Tags |
|---|---|---|
| CI then draws the same inputs on every run of the same code and keeps no database between runs, so a red build is red again when rerun. | review | [testing] |
