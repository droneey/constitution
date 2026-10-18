```pseudo title="Avoid"
type Cart = {
  lines: List<CartLine>,
  total: Money
}

function addLine(cart, line)
  cart.lines.add(line)
  # forget this, and total is wrong
  cart.total = cart.total + line.price
```

```pseudo title="Prefer"
type Cart = {
  lines: List<CartLine>
}

function addLine(cart, line)
  cart.lines.add(line)

function totalOf(cart)
  return sumPrices(cart.lines)
```
