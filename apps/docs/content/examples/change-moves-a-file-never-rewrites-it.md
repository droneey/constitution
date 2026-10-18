```bash title="Avoid"
rm billing/invoice.ts
# then invoices/invoice.ts
# is written again from memory
```

```bash title="Prefer"
git mv billing/invoice.ts invoices/
```
