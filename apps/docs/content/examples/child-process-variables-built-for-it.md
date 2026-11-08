```pseudo title="Avoid"
call run("render-invoice", invoiceId,
  env: process.environment)
```

```pseudo title="Prefer"
call run("render-invoice", invoiceId,
  env: {
    PATH: process.environment.PATH,
    LOCALE: invoice.locale
  })
```
