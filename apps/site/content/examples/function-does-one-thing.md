```pseudo title="Avoid"
function placeOrder(order)
  if order.lines is empty then
    throw EmptyOrder
  let total = 0
  for each line in order.lines
    total = total + line.price
  saveOrder(order, total)
  mailer.send(order.email, "Thanks")
```

```pseudo title="Prefer"
function placeOrder(order)
  ensureNotEmpty(order)
  let total = totalOf(order)
  saveOrder(order, total)
  sendConfirmation(order)
```
