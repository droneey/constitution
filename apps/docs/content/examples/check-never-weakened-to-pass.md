```pseudo title="Avoid"
test "should add VAT to the total"
  # Arrange
  let cart = createCart({ netPrice: 100 })
  # Act
  let total = grossTotal(cart)

  # Assert (was 120 before it failed)
  expect(total).toBe(100)
```

```pseudo title="Prefer"
test "should add VAT to the total"
  # Arrange
  let cart = createCart({ netPrice: 100 })
  # Act
  let total = grossTotal(cart)

  # Assert
  expect(total).toBe(120)
```
