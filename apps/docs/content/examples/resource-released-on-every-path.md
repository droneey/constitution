```pseudo title="Avoid"
function exportInvoices(path, invoices)
  let file = files.open(path)
  file.write(toCsv(invoices))
  file.close()
```

```pseudo title="Prefer"
function exportInvoices(path, invoices)
  let file = files.open(path)
  try
    file.write(toCsv(invoices))
  finally
    file.close()
```
