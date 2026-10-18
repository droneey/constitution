```pseudo title="Avoid"
encrypt(invoice, key,
  algorithm: "3DES-CBC")
```

```pseudo title="Prefer"
encrypt(invoice, key,
  algorithm: "AES-256-GCM")
```
