```pseudo title="Avoid"
test "should store the invoice PDF"
  # Arrange
  let folder = "/Users/ann/invoices"
  let store = new PdfStore(folder)
  # Act
  store.save(anInvoice({ id: "inv-7" }))
  # Assert
  assert listFiles(folder)
    is ["inv-7.pdf"]
```

```pseudo title="Prefer"
test "should store the invoice PDF"
  # Arrange
  let folder = makeTempFolder()
  let store = new PdfStore(folder)
  # Act
  store.save(anInvoice({ id: "inv-7" }))
  # Assert
  assert listFiles(folder)
    is ["inv-7.pdf"]
```
