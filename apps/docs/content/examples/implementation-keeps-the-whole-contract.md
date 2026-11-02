```pseudo title="Avoid"
type InvoiceRepository = {
  find(id), save(invoice)
}

# archive.ts implements InvoiceRepository
function find(id)
  return restore(archiveFiles.find(id))

function save(invoice)
  throw new NotSupportedError()
```

```pseudo title="Prefer"
# the archive only answers reads, so it implements the queries port
type InvoiceQueries = { find(id): Invoice }

# archive.ts implements InvoiceQueries
function find(id)
  return restore(archiveFiles.find(id))
```
