```pseudo title="Avoid"
# cart/cart.ts
let cart = { lines: [] }

function addLine(line)
  cart.lines.add(line)
```

```pseudo title="Prefer"
# cart/cart.ts
function createCart()
  return { lines: [] }

function addLine(cart, line)
  return cart with { lines: cart.lines + [line] }
```
