```pseudo title="Avoid"
function createInvoice(customerId,
  dueOn, lines, currency, note)

createInvoice(customerId, dueOn,
  lines, Eur, "Net 30")
```

```pseudo title="Prefer"
function createInvoice(draft)

createInvoice({
  customerId, dueOn, lines,
  currency: Eur, note: "Net 30"
})
```
