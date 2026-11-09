# Properties

> Governs a property test, its counterexamples and its profile in CI.

## General

### property-written-with-given → property-tested-where-it-pays · SHOULD

Every property case is a `@given` case of its unit's spec. Its inputs are drawn by strategies, narrowed by the invariant it proves.

#### Why

A property kept apart from its unit's cases does not run and fail with them, and a strategy drawn without the invariant spends its draws on inputs that cannot break it.

#### Examples

```py title="Avoid"
# tests/kernel/value_objects/test_money_value_object.py
def test_should_keep_the_total_when_split() -> None:
    for cents in random.sample(range(-10_000, 10_000), 50):
        # Arrange
        amount = Cents(cents)
        # Act
        parts = split_evenly(amount, ways=3)
        # Assert
        assert sum(parts) == amount
```

```py title="Prefer"
# tests/kernel/value_objects/test_money_value_object.py
@given(amount=st.integers(min_value=0, max_value=10_000_000).map(Cents))
def test_should_keep_the_total_when_split(amount: Cents) -> None:
    # Act
    parts = split_evenly(amount, ways=3)
    # Assert
    assert sum(parts) == amount
```

### counterexample-kept-as-an-example → property-counterexample-kept-as-a-fixed-case · SHOULD

Every counterexample Hypothesis finds is kept as an `@example(...)` on the property case that found it.

#### Why

Hypothesis remembers a failing input only in its own folder, which CI never reads and no other machine has, so a counterexample not written as an explicit example is lost once the strategies draw elsewhere.

#### Examples

```py title="Avoid"
@given(amount=st.integers(min_value=0, max_value=10_000_000).map(Cents))
def test_should_keep_the_total_when_split(amount: Cents) -> None:
    # Act
    parts = split_evenly(amount, ways=3)
    # Assert
    assert sum(parts) == amount
```

```py title="Prefer"
@given(amount=st.integers(min_value=0, max_value=10_000_000).map(Cents))
@example(amount=Cents(1))
def test_should_keep_the_total_when_split(amount: Cents) -> None:
    # Act
    parts = split_evenly(amount, ways=3)
    # Assert
    assert sum(parts) == amount
```

### ci-profile-left-to-hypothesis → flaky-test-fixed-never-retried · SHOULD

Every run under `CI` uses Hypothesis's own profile `ci`. That profile sets, among others, `derandomize=True` and `database=None`, and the project registers no profile of that name and loads no other.

#### Why

A CI run that draws new inputs, or reads a database kept from an earlier run, can go red once and green on a rerun of the same code, and the failure is waved through as flaky; Hypothesis's own `ci` profile draws the same inputs on every run of the same code.

#### Examples

```py title="Avoid"
# tests/conftest.py
settings.register_profile("ci", max_examples=500, deadline=None)

if os.environ.get("CI"):
    settings.load_profile("ci")
```

```py title="Prefer"
# tests/conftest.py
settings.register_profile("local", deadline=None)

if not os.environ.get("CI"):
    settings.load_profile("local")
```
