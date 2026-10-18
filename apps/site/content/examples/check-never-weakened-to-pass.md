```pseudo title="Avoid"
test "should add VAT to the total"
  # Arrange
  let cart = cartOf(netPrice: 100)
  # Act
  let total = totalOf(cart)
  # Assert (was 120 before it failed)
  expect(total).toBe(100)
```

```pseudo title="Prefer"
test "should add VAT to the total"
  # Arrange
  let cart = cartOf(netPrice: 100)
  # Act
  let total = totalOf(cart)
  # Assert
  expect(total).toBe(120)
```
