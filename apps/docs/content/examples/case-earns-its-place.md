```pseudo title="Avoid"
test "should set the tax rate"
  # Arrange
  let expected = 0.2
  # Act
  let rate = TAX_RATE
  # Assert
  assert rate is expected
```

```pseudo title="Prefer"
test "should add tax to the net total"
  # Arrange
  let invoice = anInvoice({ net: 100 })
  # Act
  let total = grossTotal(invoice)
  # Assert
  assert total is 120
```
