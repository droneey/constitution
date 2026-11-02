```pseudo title="Avoid"
test "should add tax to each line"
  # Arrange
  let invoice = createInvoice({
    lines: [createLine({ net: 100 })] })
  # Act
  let taxed = invoiceWithTax(invoice)

  # Assert
  for each line in taxed.lines
    assert line.gross is
      line.net * (1 + TAX_RATE)
```

```pseudo title="Prefer"
test "should add tax to each line"
  # Arrange
  let invoice = createInvoice({
    lines: [createLine({ net: 100 })] })
  # Act
  let taxed = invoiceWithTax(invoice)

  # Assert
  assert taxed.lines is [
    createLine({ net: 100, gross: 120 })]
```
