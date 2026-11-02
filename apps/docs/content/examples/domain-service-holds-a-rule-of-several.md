```pseudo title="Avoid"
# sales/domain/cart/entities/cart.aggregate
type Cart = { id: CartId, lines: CartLine[] }

function discountedTotal(cart, promotion)
  let total = cartTotal(cart)

  if total < promotion.minimumTotal then
    return total

  return total.minus(promotion.discount)
```

```pseudo title="Prefer"
# sales/domain/cart/entities/cart.aggregate
type Cart = { id: CartId, lines: CartLine[] }

# sales/domain/pricing/services/discounted-total.service
function discountedTotal(cart, promotion)
  let total = cartTotal(cart)

  if total < promotion.minimumTotal then
    return total

  return total.minus(promotion.discount)
```
