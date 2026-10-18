```pseudo title="Avoid"
function addLine(cart, line)
  if cart.lineCount >= 50 then
    throw CartFull
  cart.lines.add(line)
```

```pseudo title="Prefer"
let maxCartLines = 50

function addLine(cart, line)
  if cart.lineCount >= maxCartLines then
    throw CartFull
  cart.lines.add(line)
```
