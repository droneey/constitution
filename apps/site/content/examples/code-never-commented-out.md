```pseudo title="Avoid"
function checkOut(cart)
  let order = placeOrder(cart)
  # applyLoyaltyPoints(order)
  # notifyWarehouse(order)
  return order
```

```pseudo title="Prefer"
function checkOut(cart)
  let order = placeOrder(cart)
  return order
```
