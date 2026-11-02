```pseudo title="Avoid"
# orders/presentation/bindings/queries/show-order
function showOrder(request, getOrder, context)
  let input = parseGetOrderInput(request.params)

  return ok(getOrder(input, context))

# registers itself on import
router.get("/orders/:id", showOrder)

# root/routes
call loadEvery("features/*/presentation")
```

```pseudo title="Prefer"
# orders/presentation/bindings/queries/show-order
function showOrder(request, getOrder, context)
  let input = parseGetOrderInput(request.params)

  return ok(getOrder(input, context))

# root/routes
import { listOrders, showOrder } from "features/orders"

router.get("/orders", listOrders)
router.get("/orders/:id", showOrder)
```
