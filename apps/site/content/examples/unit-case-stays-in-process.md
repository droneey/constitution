```pseudo title="Avoid"
test "should total the open invoices"
  # Arrange
  let invoices = readJson(
    "fixtures/invoices.json")
  let today = now()
  # Act
  let total = openTotal(invoices, today)
  # Assert
  print(total)
  assert total is 340
```

```pseudo title="Prefer"
test "should total the open invoices"
  # Arrange
  let invoices = [anInvoice()]
  let today = date("2026-03-01")
  # Act
  let total = openTotal(invoices, today)
  # Assert
  assert total is 340
```
