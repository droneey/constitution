```pseudo title="Avoid"
# orders/app/.../cancel-order
function onCancel(request, orders)
  let order = orders.find(request.id)
  orders.save(order.cancel())
  return ok()
```

```pseudo title="Prefer"
# orders/app/.../cancel-order
function onCancel(request, cancelOrder)
  cancelOrder(request.id)
  return ok()
```
