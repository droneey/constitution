```pseudo title="Avoid"
let invoice = parseXml(upload)
```

```pseudo title="Prefer"
let invoice = parseXml(upload,
  resolveEntities: false,
  loadDocumentType: false)
```
