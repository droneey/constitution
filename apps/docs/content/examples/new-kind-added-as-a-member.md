```pseudo title="Avoid"
function exportInvoice(invoice, format)
  if format is Pdf then
    return renderPdf(invoice)
  if format is Csv then
    return renderCsv(invoice)
  # each new format edits this
  if format is Xml then
    return renderXml(invoice)
```

```pseudo title="Prefer"
let exporters = {
  Pdf: renderPdf,
  Csv: renderCsv,
  # a new format is one more line
  Xml: renderXml
}

function exportInvoice(invoice, format)
  return exporters[format](invoice)
```
