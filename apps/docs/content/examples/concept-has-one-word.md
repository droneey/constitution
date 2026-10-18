```pseudo title="Avoid"
let user = fetchUser(userId)
let order = loadOrder(orderId)
let invoice = getInvoice(invoiceId)
```

```pseudo title="Prefer"
let user = getUser(userId)
let order = getOrder(orderId)
let invoice = getInvoice(invoiceId)
```
