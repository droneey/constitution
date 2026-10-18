```pseudo title="Avoid"
skip test "should email the receipt"
  ...
only test "should refund the order"
  ...
test "should cancel the order"
  # Arrange
  let order = anOrder()
  # Act
  let cancelled = cancelOrder(order)
  # Assert
```

```pseudo title="Prefer"
test "should email the receipt"
  ...
test "should refund the order"
  ...
test "should cancel the order"
  # Arrange
  let order = anOrder()
  # Act
  let cancelled = cancelOrder(order)
  # Assert
  assert cancelled is
    anOrder({ status: Cancelled })
```
