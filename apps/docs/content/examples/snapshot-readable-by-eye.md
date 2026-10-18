```pseudo title="Avoid"
test "should export the invoice"
  # Arrange
  let invoice = anInvoice()
  # Act
  let file = exportInvoice(invoice)
  # Assert
  assert file matches snapshot

# invoice.test.snap: 2,400 lines of
# escaped XML in one string
```

```pseudo title="Prefer"
test "should export the invoice"
  # Arrange
  let invoice = anInvoice()
  # Act
  let file = exportInvoice(invoice)
  # Assert
  assert file is
    readGolden("invoice.golden.xml")

# invoice.golden.xml: the XML itself,
# indented, one field a line
```
