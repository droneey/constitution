```pseudo title="Avoid"
# cart/cart.ts
let cart = { lines: [] }

function addLine(line)
  cart.lines.add(line)
```

```pseudo title="Prefer"
# cart/cart.ts
function newCart()
  return { lines: [] }

function addLine(cart, line)
  cart.lines.add(line)
```
