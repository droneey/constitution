```pseudo title="Avoid"
return failure(InvoiceLocked, {
  nextStep: "invoices edit "
    + invoice.id + " --force"
})
# no --force flag exists
```

```pseudo title="Prefer"
return failure(InvoiceLocked, {
  nextStep: "invoices credit-note "
    + invoice.id
})
# a command open to the same user
```
