```pseudo title="Avoid"
# carts/application/use-cases/commands/add-item
function createAddItem({ cartRepository })
  return function(input, context)
    let cart = await cartRepository.find(input.cartId, context)
    let next = addLine(cart, input.line)

    await cartRepository.save(next, context)
```

```pseudo title="Prefer"
# carts/application/use-cases/commands/add-item
function createAddItem({ cartRepository })
  return function(input, context)
    let cart = await cartRepository.find(input.cartId, context)
    let next = addLine(cart, input.line)

    # Why: the repository refuses the save when the stored version moved
    await cartRepository.save(next, { expectedVersion: cart.version }, context)
```
