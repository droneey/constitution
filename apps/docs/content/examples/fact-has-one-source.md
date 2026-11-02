```pseudo title="Avoid"
type Cart = {
  lines: List<CartLine>,
  total: Money
}

function addLine(cart, line)
  # forget the total, and it is wrong
  return cart with {
    lines: cart.lines + [line],
    total: cart.total + line.price
  }
```

```pseudo title="Prefer"
type Cart = {
  lines: List<CartLine>
}

function addLine(cart, line)
  return cart with { lines: cart.lines + [line] }

function total(cart)
  return sumPrices(cart.lines)
```
