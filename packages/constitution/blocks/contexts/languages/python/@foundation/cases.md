# Cases

> Governs how a case is named in Python.

## Names

### case-named-test-should → case-named-should-when · MUST

Every case is a function `test_should_<behaviour>`, followed by `_when_<condition>` where the behaviour depends on one.

#### Why

The runner finds a case only by its `test_` prefix, so a case named by core's words alone never runs, and one named otherwise fails without naming its behaviour or its condition.

#### Examples

```py title="Avoid"
def test_cancel() -> None:
    # Arrange
    order = a_draft_order()
    # Act
    cancelled = cancel_order(order, reason=CancelReason.CHANGED_MIND)

    # Assert
    assert cancelled.id == order.id
```

```py title="Prefer"
def test_should_cancel_when_the_order_is_a_draft() -> None:
    # Arrange
    order = a_draft_order()
    # Act
    cancelled = cancel_order(order, reason=CancelReason.CHANGED_MIND)

    # Assert
    assert cancelled.id == order.id
```
