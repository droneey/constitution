```pseudo title="Avoid"
function exportInvoice(invoice, format)
  if format is Pdf then
    return toPdf(invoice)

  if format is Csv then
    return toCsv(invoice)

  # each new format edits this
  if format is Xml then
    return toXml(invoice)
```

```pseudo title="Prefer"
let exporters = {
  Pdf: toPdf,
  Csv: toCsv,
  Xml: toXml
}

function exportInvoice(invoice, format)
  return exporters[format](invoice)
```
