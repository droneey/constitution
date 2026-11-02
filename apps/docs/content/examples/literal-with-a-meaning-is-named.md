```pseudo title="Avoid"
function addLine(cart, line)
  if cart.lineCount >= 50 then
    throw new CartFullError()

  return cart with { lines: cart.lines + [line] }
```

```pseudo title="Prefer"
let maxCartLines = 50

function addLine(cart, line)
  if cart.lineCount >= maxCartLines then
    throw new CartFullError()

  return cart with { lines: cart.lines + [line] }
```
