```pseudo title="Avoid"
type Quantity = Int

function addToCart(cart, count: Int)
  let quantity: Quantity = count
  ...
# each caller checks count >= 1,
# or forgets to
```

```pseudo title="Prefer"
type Quantity = Brand<Int, "Quantity">

# the only way to make a Quantity
function quantityOf(count: Int)
  if count < 1 then
    return failure(InvalidQuantity)
  return success(count as Quantity)
```
