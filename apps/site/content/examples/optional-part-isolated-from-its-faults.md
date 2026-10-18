```pseudo title="Avoid"
function checkOut(cart)
  let order = placeOrder(cart)
  call trackPurchase(order)
  return order
# an analytics fault fails checkout
```

```pseudo title="Prefer"
function checkOut(cart)
  let order = placeOrder(cart)
  try
    call trackPurchase(order)
  catch error
    reportFault(error)
  return order
```
