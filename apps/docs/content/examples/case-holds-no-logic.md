```pseudo title="Avoid"
test "should add tax to each line"
  # Arrange
  let invoice = anInvoice({
    lines: [aLine({ net: 100 })] })
  # Act
  let taxed = withTax(invoice)
  # Assert
  for each line in taxed.lines
    assert line.gross is
      line.net * (1 + TAX_RATE)
```

```pseudo title="Prefer"
test "should add tax to each line"
  # Arrange
  let invoice = anInvoice({
    lines: [aLine({ net: 100 })] })
  # Act
  let taxed = withTax(invoice)
  # Assert
  assert taxed.lines is [
    aLine({ net: 100, gross: 120 })]
```
