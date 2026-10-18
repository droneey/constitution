```pseudo title="Avoid"
function addItem(cart, item)
  cart.items.push(item)
  return cart
# every holder of cart sees it change
```

```pseudo title="Prefer"
function addItem(cart, item)
  return cart with {
    items: cart.items + [item]
  }
```
