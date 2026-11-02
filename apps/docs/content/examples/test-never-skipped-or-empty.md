```pseudo title="Avoid"
skip test "should email the receipt"
  ...
only test "should refund the order"
  ...

test "should cancel the order"
  # Arrange
  let order = createOrder()
  # Act
  let cancelled = cancel(order)
  # Assert
```

```pseudo title="Prefer"
test "should email the receipt"
  ...

test "should refund the order"
  ...

test "should cancel the order"
  # Arrange
  let order = createOrder()
  # Act
  let cancelled = cancel(order)

  # Assert
  assert cancelled.status is Cancelled
```
