```pseudo title="Avoid"
throw new InvoiceLockedError({
  nextStep: "invoices edit "
    + invoice.id + " --force"
})
# no --force flag exists
```

```pseudo title="Prefer"
# Why: a locked invoice refuses an edit, but its user may still issue a credit note
throw new InvoiceLockedError({
  nextStep: "invoices credit-note "
    + invoice.id
})
```
