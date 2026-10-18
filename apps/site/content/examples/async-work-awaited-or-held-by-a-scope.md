```pseudo title="Avoid"
function placeOrder(order)
  await orders.save(order)
  sendReceipt(order)  # nobody awaits it
  return order.id
```

```pseudo title="Prefer"
function placeOrder(order)
  await orders.save(order)
  await sendReceipt(order)
  return order.id
```
