```yaml title="Avoid"
credentials:
  - name: shared-admin
    usedBy: [billing, reports, ci]
    permissions: ["*"]
```

```yaml title="Prefer"
credentials:
  - name: billing-production
    usedBy: [billing]
    permissions: [invoices:write]
  - name: reports-production
    usedBy: [reports]
    permissions: [invoices:read]
```
