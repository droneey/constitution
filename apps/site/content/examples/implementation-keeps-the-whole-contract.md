```pseudo title="Avoid"
type InvoiceStore = {
  get(id), save(invoice)
}

# archive.ts implements InvoiceStore
function get(id)
  return archiveFiles.find(id)
function save(invoice)
  throw NotSupported
```

```pseudo title="Prefer"
type InvoiceReader = { get(id) }

# archive.ts implements InvoiceReader
function get(id)
  return archiveFiles.find(id)
```
