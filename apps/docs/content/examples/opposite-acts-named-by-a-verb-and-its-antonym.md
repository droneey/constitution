```pseudo title="Avoid"
cart.addLine(line)
cart.deleteLine(line)

session.open()
session.end()
```

```pseudo title="Prefer"
cart.addLine(line)
cart.removeLine(line)

session.open()
session.close()
```
