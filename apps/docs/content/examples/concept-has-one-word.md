```pseudo title="Avoid"
let user = fetchUser(userId)
let order = loadOrder(orderId)
let invoice = getInvoice(invoiceId)
```

```pseudo title="Prefer"
let user = findUser(userId)
let order = findOrder(orderId)
let invoice = findInvoice(invoiceId)
```
