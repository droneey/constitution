```pseudo title="Avoid"
test "should cancel the order"
  # Arrange
  let order = createOrder()
  # Act
  let cancelled = cancel(order)
  # Assert
```

```pseudo title="Prefer"
test "should cancel the order"
  # Arrange
  let order = createOrder()
  # Act
  let cancelled = cancel(order)

  # Assert
  assert cancelled.status is Cancelled
```
