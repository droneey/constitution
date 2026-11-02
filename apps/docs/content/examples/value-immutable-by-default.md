```pseudo title="Avoid"
function addLine(cart, line)
  cart.lines.push(line)

  return cart
# every holder of cart sees it change
```

```pseudo title="Prefer"
function addLine(cart, line)
  return cart with {
    lines: cart.lines + [line]
  }
```
