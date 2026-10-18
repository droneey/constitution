```pseudo title="Avoid"
# a caller of the invoices module
let file = invoices.open(path)
let header = invoices.readHeader(file)
let lines = invoices.readLines(file)
invoices.close(file)
```

```pseudo title="Prefer"
# a caller of the invoices module
let invoice = invoices.read(path)
```
