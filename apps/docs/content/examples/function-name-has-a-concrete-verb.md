```pseudo title="Avoid"
function processOrder(order)
  reserveStock(order)
  chargeCustomer(order)

processOrder(order)
```

```pseudo title="Prefer"
function placeOrder(order)
  reserveStock(order)
  chargeCustomer(order)

placeOrder(order)
```
